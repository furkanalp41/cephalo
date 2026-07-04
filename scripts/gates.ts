// scripts/gates.ts — the SHIP-BLOCKING CI gate library (§14). Each gate is a pure
// function returning an error list; thin scripts/gate-*.ts wrappers run one gate,
// scripts/ci.ts runs them all. Gates read the GENERATED bundle (public/content),
// so `pnpm build:content` must run first (ci.ts enforces order).
import { promises as fs } from 'node:fs';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { parse as parseYaml } from 'yaml';
import { TOKEN_KEYS } from '@/types/tokens';
import { TOKEN_KEYS_V2 } from '@/types/tokens.v2';
import { TOKEN_KEYS_V3 } from '@/types/tokens.v3';
import { PACKS } from '@/data/packs';
import { createSearchIndex, serializeSearchIndex, searchEngine, phaseOrderOf } from '@/engine/search';
import type { SearchSideTable } from '@/engine/search';
import type { ContentBundle } from '@/types/content';
import type { SearchDoc } from '@/types/engine';
import type { CephaloV2Bundle } from '@/types/bundle.v2';
import type { ServiceRoute } from '@/types/nmap';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT = path.join(ROOT, 'public', 'content');

function dedupeById<T extends { id: string }>(xs: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of xs) {
    if (seen.has(x.id)) continue;
    seen.add(x.id);
    out.push(x);
  }
  return out;
}

// Merge EVERY registered pack bundle into one in-memory ContentBundle, so every reused
// gate (fabrication / unverified-refs / denylist / routable-ip / placeholder / overlap /
// side-table / credmode / coverage) spans all packs (§9.0). oscp is always present; other
// packs only once authored. refs/vars/tags are shared registries → dedupe by id.
export function loadBundle(): ContentBundle {
  const bundles = PACKS.map((p) => path.join(CONTENT, `${p.id}.json`))
    .filter((f) => existsSync(f))
    .map((f) => JSON.parse(readFileSync(f, 'utf8')) as ContentBundle);
  const base = bundles[0];
  if (!base) throw new Error('loadBundle: no pack bundle found (run build:content)');
  return {
    ...base,
    sections: bundles.flatMap((b) => b.sections),
    techniques: bundles.flatMap((b) => b.techniques),
    commands: bundles.flatMap((b) => b.commands),
    mindmaps: bundles.flatMap((b) => b.mindmaps),
    bloodhound: bundles.flatMap((b) => b.bloodhound),
    references: dedupeById(bundles.flatMap((b) => b.references)),
    variables: dedupeById(bundles.flatMap((b) => b.variables)),
    tags: dedupeById(bundles.flatMap((b) => b.tags)),
    packs: PACKS,
  };
}
export function loadSide(): SearchSideTable {
  return JSON.parse(readFileSync(path.join(CONTENT, 'search-side.json'), 'utf8')) as SearchSideTable;
}
export function loadV2Bundle(): CephaloV2Bundle {
  return JSON.parse(readFileSync(path.join(CONTENT, 'cephalo-v2.json'), 'utf8')) as CephaloV2Bundle;
}
function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, ' ');
}

// ---------- Gate 3 — unverified must carry references ----------
export function gateUnverifiedRefs(): string[] {
  const b = loadBundle();
  const errs: string[] = [];
  for (const c of b.commands)
    if (c.confidence === 'unverified' && !(c.references && c.references.length))
      errs.push(`command ${c.id}: unverified with no references`);
  for (const t of b.techniques)
    if (t.confidence === 'unverified' && t.references.length === 0)
      errs.push(`technique ${t.id}: unverified with no references`);
  for (const q of b.bloodhound)
    if (q.confidence === 'unverified' && q.references.length === 0)
      errs.push(`bloodhound ${q.id}: unverified with no references`);
  return errs;
}

// ---------- Gate 4 — hard-fact gate (FULLY MECHANICAL regexes) ----------
const CVE_RE = /\bCVE-\d{4}-\d{4,}\b/;
const ADDR_RE = /\b0x[0-9a-fA-F]{4,}\b/;
const GUID_RE = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/;
const VERSION_RE = /\bv?\d+\.\d+(?:\.\d+)?\b/;

export function gateFabrication(): string[] {
  const b = loadBundle();
  const errs: string[] = [];
  const check = (
    id: string,
    field: string,
    text: string,
    confidence: string,
    refs: string[] | undefined,
  ) => {
    const hit =
      (CVE_RE.test(text) && 'CVE') ||
      (ADDR_RE.test(text) && 'offset/addr') ||
      (GUID_RE.test(text) && 'GUID/CLSID') ||
      (VERSION_RE.test(text) && 'version-literal');
    if (hit && (confidence !== 'verified' || !refs || refs.length === 0)) {
      errs.push(`${id} (${field}): hard-fact "${hit}" requires verified + references`);
    }
  };
  // PROSE fields only (NEVER command strings / templates / cypher).
  for (const t of b.techniques) {
    check(t.id, 'summary', t.summary, t.confidence, t.references);
    if (t.body) check(t.id, 'body', stripHtml(t.body), t.confidence, t.references);
  }
  for (const c of b.commands) {
    if (c.description) check(c.id, 'description', c.description, c.confidence, c.references);
    for (const n of c.notes ?? []) check(c.id, 'notes', n, c.confidence, c.references);
  }
  for (const q of b.bloodhound) {
    check(q.id, 'description', q.description, q.confidence, q.references);
    if (q.abuse) check(q.id, 'abuse', q.abuse, q.confidence, q.references);
  }
  return errs;
}

// ---------- Gate 5 — routable-IP reject ----------
const IPV4_RE = /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g;
function isAllowedIp(a: number, b: number, c: number, d: number): boolean {
  for (const x of [a, b, c, d]) if (x > 255) return false;
  // RFC5737 documentation
  if (a === 198 && b === 51 && c === 100) return true;
  if (a === 192 && b === 0 && c === 2) return true;
  if (a === 203 && b === 0 && c === 113) return true;
  // RFC1918 private
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  // loopback / link-local / unspecified / broadcast
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 0) return true;
  if (a === 255 && b === 255 && c === 255 && d === 255) return true;
  return false;
}
export function gateRoutableIp(): string[] {
  const b = loadBundle();
  const errs: string[] = [];
  const scan = (id: string, text: string) => {
    for (const m of text.matchAll(IPV4_RE)) {
      const [a, bb, c, d] = [m[1], m[2], m[3], m[4]].map(Number) as [number, number, number, number];
      if (!isAllowedIp(a, bb, c, d)) errs.push(`${id}: routable IP literal ${m[0]}`);
    }
  };
  for (const c of b.commands) {
    scan(c.id, c.template);
    for (const v of c.variants ?? []) scan(`${c.id}:${v.id}`, v.template);
  }
  for (const q of b.bloodhound) scan(q.id, q.cypher);
  for (const v of b.variables) {
    scan(`var.${v.id}.example`, v.example);
    scan(`var.${v.id}.placeholder`, v.placeholder);
    if (v.default) scan(`var.${v.id}.default`, v.default);
  }
  return errs;
}

// ---------- Gate 6 — defang placeholder shape + default whitelist ----------
const INERT_RE = /<[^>\s]+>/;
const DEFAULT_WHITELIST = new Set(['LPORT', 'INTERFACE']);
export function gatePlaceholder(): string[] {
  const b = loadBundle();
  const errs: string[] = [];
  for (const v of b.variables) {
    const hasRoutable = [...v.placeholder.matchAll(IPV4_RE)].some((m) => {
      const [a, bb, c, d] = [m[1], m[2], m[3], m[4]].map(Number) as [number, number, number, number];
      return !isAllowedIp(a, bb, c, d);
    });
    if (!INERT_RE.test(v.placeholder) || hasRoutable)
      errs.push(`var ${v.id}: placeholder "${v.placeholder}" is not inert`);
    if (v.default !== undefined && !DEFAULT_WHITELIST.has(v.id))
      errs.push(`var ${v.id}: only LPORT/INTERFACE may carry a default`);
    if (v.default !== undefined && v.sensitive) errs.push(`var ${v.id}: sensitive var has a default`);
  }
  return errs;
}

// ---------- Gate 7 — credMode variant completeness ----------
export function gateCredmode(): string[] {
  const b = loadBundle();
  const errs: string[] = [];
  const MODES = ['password', 'nthash', 'kerberos'];
  for (const c of b.commands) {
    if (!c.credMode) continue;
    const present = new Set((c.variants ?? []).map((v) => v.credMode).filter(Boolean));
    for (const m of MODES) if (!present.has(m as never)) errs.push(`command ${c.id}: missing credMode variant "${m}"`);
  }
  return errs;
}

// ---------- Gate 9 — search side-table integrity + forced-tie ----------
function searchDocIds(b: ContentBundle): string[] {
  return [
    ...b.commands.map((c) => c.id),
    ...b.techniques.map((t) => t.id),
    ...b.sections.map((s) => s.id),
    ...b.bloodhound.map((q) => q.id),
    ...b.tags.map((t) => `tag.${t.id}`),
  ];
}
export function gateSideTable(): string[] {
  const b = loadBundle();
  const side = loadSide();
  const errs: string[] = [];
  for (const id of searchDocIds(b)) if (!side[id]) errs.push(`side-table missing entry for "${id}"`);
  const techIds = new Set(b.techniques.map((t) => t.id));
  const byId = new Map(b.commands.map((c) => [c.id, c]));
  for (const c of b.commands) {
    const e = side[c.id];
    if (e && e.confidence !== c.confidence) errs.push(`side ${c.id}: confidence mismatch`);
  }
  for (const [id, e] of Object.entries(side)) {
    if (e.techniqueId && !techIds.has(e.techniqueId) && !byId.has(id))
      errs.push(`side ${id}: techniqueId "${e.techniqueId}" does not resolve`);
    if (e.phaseOrder < 0 || e.phaseOrder > 14) errs.push(`side ${id}: phaseOrder out of range`);
  }
  // forced-tie: verified must rank before unverified on equal score.
  const docs: SearchDoc[] = [
    { id: 'z.unv', type: 'command', title: 'Tiebreak', body: 'x', tags: [], os: ['ad'], ports: [], services: [], packs: ['oscp'] },
    { id: 'z.ver', type: 'command', title: 'Tiebreak', body: 'x', tags: [], os: ['ad'], ports: [], services: [], packs: ['oscp'] },
  ];
  const tSide: SearchSideTable = {
    'z.unv': { confidence: 'unverified', phaseOrder: phaseOrderOf('credential-access') },
    'z.ver': { confidence: 'verified', phaseOrder: phaseOrderOf('credential-access') },
  };
  searchEngine.load({ index: serializeSearchIndex(createSearchIndex(docs)), side: tSide });
  const ids = searchEngine.search({ query: 'tiebreak' }).map((h) => h.id);
  if (ids.indexOf('z.ver') > ids.indexOf('z.unv'))
    errs.push('forced-tie: verified did not rank before unverified');
  return errs;
}

// ---------- Gate 12 — token-key completeness ----------
export function gateTokens(): string[] {
  const css = readFileSync(path.join(ROOT, 'styles', 'theme.base.css'), 'utf8');
  const errs: string[] = [];
  const known = new Set<string>([
    ...Object.values(TOKEN_KEYS).flat(),
    ...Object.values(TOKEN_KEYS_V2).flat(),
    ...Object.values(TOKEN_KEYS_V3).flat(),
  ]);
  for (const key of known) {
    if (!new RegExp(`${key.replace(/[-]/g, '\\-')}\\s*:`).test(css))
      errs.push(`theme.base.css missing key ${key}`);
  }
  // reverse: no stray --cph-* key declared at :root that isn't a known KEY
  for (const m of css.matchAll(/(--cph-[a-z0-9-]+)\s*:/g)) {
    const k = m[1];
    if (k && !known.has(k)) errs.push(`theme.base.css declares unknown token key ${k}`);
  }
  return errs;
}

// ---------- Gate 13 — completeness + coverage ----------
export function gateCoverage(): string[] {
  const b = loadBundle();
  const errs: string[] = [];
  const techIds = new Set(b.techniques.map((t) => t.id));
  const cmdIds = new Set(b.commands.map((c) => c.id));

  // canon-map: every syllabus item maps to an existing node.
  const canon = parseYaml(readFileSync(path.join(ROOT, 'canon-map.yaml'), 'utf8')) as {
    mappings: { source: string; node: string }[];
  };
  for (const m of canon.mappings)
    if (!techIds.has(m.node)) errs.push(`canon-map: "${m.source}" -> missing node "${m.node}"`);

  // coverage manifest: every listed technique exists.
  const cov = parseYaml(readFileSync(path.join(ROOT, 'coverage.manifest.yaml'), 'utf8')) as {
    techniques: { id: string; band: string }[];
    depthV4?: { id: string; band?: string; note?: string }[];
  };
  for (const t of cov.techniques)
    if (!techIds.has(t.id)) errs.push(`coverage.manifest: technique "${t.id}" not in bundle`);

  // depth-v4 (§1 rubric): each listed node must exist AND not be "thin" —
  // it collectively offers >=2 commands OR a command with variants[].
  const cmdById = new Map(b.commands.map((c) => [c.id, c]));
  for (const d of cov.depthV4 ?? []) {
    const t = b.techniques.find((x) => x.id === d.id);
    if (!t) {
      errs.push(`depth-v4: "${d.id}" is not in the bundle`);
      continue;
    }
    const cmds = t.commands.map((c) => cmdById.get(c)).filter(Boolean);
    const hasVariants = cmds.some((c) => (c?.variants?.length ?? 0) > 0);
    if (cmds.length < 2 && !hasVariants)
      errs.push(`depth-v4: "${d.id}" is still thin (<2 commands and no variants[])`);
  }

  // every requiredForOscpReadiness leaf resolves to >=1 compiling command.
  for (const t of b.techniques)
    if (t.requiredForOscpReadiness && !t.commands.some((c) => cmdIds.has(c)))
      errs.push(`required leaf "${t.id}" has no compiling command`);

  return errs;
}

// ---------- Gate 8 — prose-only overlap guard ----------
function shingles(text: string, n = 8): Set<string> {
  const words = text.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i + n <= words.length; i++)
    out.add(createHash('sha1').update(words.slice(i, i + n).join(' ')).digest('hex').slice(0, 16));
  return out;
}
export function gateOverlap(): string[] {
  const b = loadBundle();
  const errs: string[] = [];
  const manifestPath = path.join(ROOT, 'ci', 'overlap-fingerprints.json');
  let fp: { threshold: number; fingerprints: string[] };
  try {
    fp = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch {
    errs.push('ci/overlap-fingerprints.json missing (run build:overlap-fingerprints)');
    return errs;
  }
  const refSet = new Set(fp.fingerprints);
  if (refSet.size === 0) return errs; // nothing to overlap against (all prose original)
  const threshold = fp.threshold ?? 0.25;
  const proseFields: { id: string; text: string }[] = [];
  for (const t of b.techniques) {
    proseFields.push({ id: `${t.id}.summary`, text: t.summary });
    if (t.body) proseFields.push({ id: `${t.id}.body`, text: stripHtml(t.body) });
  }
  for (const c of b.commands) {
    if (c.description) proseFields.push({ id: `${c.id}.description`, text: c.description });
    for (const n of c.notes ?? []) proseFields.push({ id: `${c.id}.notes`, text: n });
  }
  for (const f of proseFields) {
    const s = shingles(f.text);
    if (s.size === 0) continue;
    let overlap = 0;
    for (const h of s) if (refSet.has(h)) overlap++;
    const jaccard = overlap / s.size;
    if (jaccard > threshold) errs.push(`${f.id}: prose overlap ${jaccard.toFixed(2)} > ${threshold}`);
  }
  return errs;
}

// ---------- Gate 10 — no-machine-names denylist ----------
function normalizeToken(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]/g, '');
}
export function gateDenylist(): string[] {
  const errs: string[] = [];
  const manifestPath = path.join(ROOT, 'ci', 'machine-denylist.manifest.json');
  let manifest: { salt: string; denyHashes: string[]; pdfSha256: string[] };
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch {
    errs.push('ci/machine-denylist.manifest.json missing (run build:denylist-manifest)');
    return errs;
  }
  const deny = new Set(manifest.denyHashes);
  const pdf = new Set(manifest.pdfSha256);
  const salt = manifest.salt;
  const hashTok = (t: string) => createHash('sha256').update(salt + normalizeToken(t)).digest('hex');

  let files: string[] = [];
  try {
    files = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch {
    // not a git checkout — scan nothing (the manifest still validates structurally)
  }
  const scanText = (label: string, text: string) => {
    if (deny.size === 0) return;
    for (const tok of text.split(/[^A-Za-z0-9]+/)) {
      if (tok.length < 3) continue;
      if (deny.has(hashTok(tok))) errs.push(`denylisted token in ${label}`);
    }
  };
  const TEXT_EXT = /\.(ts|tsx|js|jsx|md|yaml|yml|json|css|html|txt)$/;
  for (const f of files) {
    // filename tokens
    scanText(`filename ${f}`, f);
    if (!TEXT_EXT.test(f)) continue;
    let content = '';
    try {
      content = readFileSync(path.join(ROOT, f), 'utf8');
    } catch {
      continue;
    }
    if (pdf.size) {
      const sha = createHash('sha256').update(content).digest('hex');
      if (pdf.has(sha)) errs.push(`tracked file ${f} hashes to a must-not-be-tracked artifact`);
    }
    scanText(f, content);
  }
  // commit messages / history
  try {
    const log = execSync('git log --format=%s%n%b -n 200', { cwd: ROOT, encoding: 'utf8' });
    scanText('git history', log);
  } catch {
    /* shallow/no history — skip */
  }
  return errs;
}

// ============================================================
// v2 (arsenal) gates — resolve FKs against BOTH the oscp bundle and the v2 datasets.
// ============================================================
const FETCH_NOTE = 'You fetch this yourself. Nothing is bundled or hosted by Cephalo.';

// ---------- tool-provenance ----------
export function gateToolProvenance(): string[] {
  const v2 = loadV2Bundle();
  const refIds = new Set(loadBundle().references.map((r) => r.id));
  const errs: string[] = [];
  for (const t of v2.toolBinaries) {
    if (!refIds.has(t.officialRef)) errs.push(`tool-provenance: ${t.id} officialRef "${t.officialRef}" not a known Reference`);
    if (t.releaseRef && !refIds.has(t.releaseRef)) errs.push(`tool-provenance: ${t.id} releaseRef "${t.releaseRef}" not a known Reference`);
    if (t.fetchNote !== FETCH_NOTE) errs.push(`tool-provenance: ${t.id} fetchNote is not the required literal string`);
    if (Object.prototype.hasOwnProperty.call(t, 'binaryUrl')) errs.push(`tool-provenance: ${t.id} carries a forbidden binaryUrl`);
    if (t.confidence === 'unverified' && !(t.references && t.references.length))
      errs.push(`tool-provenance: ${t.id} unverified with no references`);
  }
  try {
    const blobs = execSync('git ls-files "*.exe" "*.dll" "*.bin" "*.msi" "*.so"', { cwd: ROOT, encoding: 'utf8' }).trim();
    if (blobs) errs.push(`tool-provenance: committed binary blob(s): ${blobs.split('\n').join(', ')}`);
  } catch {
    /* no git / no matches — skip */
  }
  return errs;
}

// ---------- advisor-coverage ----------
export function gateAdvisorCoverage(): string[] {
  const v2 = loadV2Bundle();
  const b = loadBundle();
  const techIds = new Set(b.techniques.map((t) => t.id));
  const cmdIds = new Set(b.commands.map((c) => c.id));
  const toolIds = new Set(v2.toolBinaries.map((t) => t.id));
  const sigIds = new Set(v2.signals.map((s) => s.id));
  const ruleSignals = new Set(v2.rules.flatMap((r) => r.whenSignals));
  const errs: string[] = [];
  for (const s of v2.signals) if (!ruleSignals.has(s.id)) errs.push(`advisor-coverage: signal "${s.id}" has no rule`);
  for (const r of v2.rules) {
    for (const ws of r.whenSignals) if (!sigIds.has(ws)) errs.push(`advisor-coverage: rule "${r.id}" whenSignals "${ws}" unknown`);
    if (!techIds.has(r.recommendsTechniqueId)) errs.push(`advisor-coverage: rule "${r.id}" recommendsTechniqueId "${r.recommendsTechniqueId}" not a live technique`);
    if (r.commandId && !cmdIds.has(r.commandId)) errs.push(`advisor-coverage: rule "${r.id}" commandId "${r.commandId}" not a live command`);
    if (r.toolBinaryId && !toolIds.has(r.toolBinaryId)) errs.push(`advisor-coverage: rule "${r.id}" toolBinaryId "${r.toolBinaryId}" unknown`);
    if (r.confidence === 'unverified' && !(r.references && r.references.length)) errs.push(`advisor-coverage: rule "${r.id}" unverified with no references`);
  }
  return errs;
}

// ---------- intent-resolves ----------
export function gateIntentResolves(): string[] {
  const v2 = loadV2Bundle();
  const b = loadBundle();
  const techIds = new Set(b.techniques.map((t) => t.id));
  const cmdIds = new Set(b.commands.map((c) => c.id));
  const toolIds = new Set(v2.toolBinaries.map((t) => t.id));
  const sigIds = new Set(v2.signals.map((s) => s.id));
  const errs: string[] = [];
  const checkTech = (w: string, ids?: string[]) => { for (const id of ids ?? []) if (!techIds.has(id)) errs.push(`intent-resolves: ${w} techniqueId "${id}" not live`); };
  const checkCmd = (w: string, ids?: string[]) => { for (const id of ids ?? []) if (!cmdIds.has(id)) errs.push(`intent-resolves: ${w} commandId "${id}" not live`); };
  const checkTool = (w: string, ids?: string[]) => { for (const id of ids ?? []) if (!toolIds.has(id)) errs.push(`intent-resolves: ${w} toolBinaryId "${id}" unknown`); };
  for (const a of v2.intentAliases) {
    checkTech(`alias ${a.id}`, a.techniqueIds);
    checkCmd(`alias ${a.id}`, a.commandIds);
    checkTool(`alias ${a.id}`, a.toolBinaryIds);
    if (a.signalKey && !sigIds.has(a.signalKey)) errs.push(`intent-resolves: alias ${a.id} signalKey "${a.signalKey}" unknown`);
  }
  for (const p of v2.phrasebook) {
    checkTech(`phrase ${p.id}`, p.techniqueIds);
    checkCmd(`phrase ${p.id}`, p.commandIds);
    for (const s of p.requiresSignals ?? []) if (!sigIds.has(s)) errs.push(`intent-resolves: phrase ${p.id} requiresSignals "${s}" unknown`);
  }
  return errs;
}

// ---------- decision-reachability ----------
export function gateDecisionReachability(): string[] {
  const v2 = loadV2Bundle();
  const b = loadBundle();
  const techIds = new Set(b.techniques.map((t) => t.id));
  const cmdIds = new Set(b.commands.map((c) => c.id));
  const toolIds = new Set(v2.toolBinaries.map((t) => t.id));
  const errs: string[] = [];
  for (const m of v2.decisions) {
    const nodeIds = new Set(m.nodes.map((n) => n.id));
    if (!nodeIds.has(m.rootNodeId)) errs.push(`decision-reachability: ${m.id} rootNodeId "${m.rootNodeId}" missing`);
    if (!m.nodes.some((n) => n.kind === 'outcome')) errs.push(`decision-reachability: ${m.id} has no outcome node`);
    const targeted = new Set<string>();
    for (const e of m.edges) {
      if (!nodeIds.has(e.source)) errs.push(`decision-reachability: ${m.id} edge ${e.id} source "${e.source}" missing`);
      if (!nodeIds.has(e.target)) errs.push(`decision-reachability: ${m.id} edge ${e.id} target "${e.target}" missing`);
      targeted.add(e.target);
      if (e.condition.kind !== 'else') {
        const src = m.nodes.find((n) => n.id === e.source);
        const obsIds = new Set((src?.observes ?? []).map((o) => o.id));
        if (!obsIds.has(e.condition.signalId)) errs.push(`decision-reachability: ${m.id} edge ${e.id} signalId "${e.condition.signalId}" not in source node observes`);
      }
    }
    for (const n of m.nodes) {
      if (n.kind !== 'outcome') {
        const outs = m.edges.filter((e) => e.source === n.id);
        if (outs.length === 0) errs.push(`decision-reachability: ${m.id} non-outcome node "${n.id}" has no outgoing edge`);
        else if (!outs.some((e) => e.condition.kind === 'else')) errs.push(`decision-reachability: ${m.id} node "${n.id}" has no else fallback`);
      }
      if (n.checkCommandId && !cmdIds.has(n.checkCommandId)) errs.push(`decision-reachability: ${m.id} node "${n.id}" checkCommandId "${n.checkCommandId}" not live`);
      if (n.actionCommandId && !cmdIds.has(n.actionCommandId)) errs.push(`decision-reachability: ${m.id} node "${n.id}" actionCommandId "${n.actionCommandId}" not live`);
      if (n.techniqueId && !techIds.has(n.techniqueId)) errs.push(`decision-reachability: ${m.id} node "${n.id}" techniqueId "${n.techniqueId}" not live`);
      if (n.toolBinaryId && !toolIds.has(n.toolBinaryId)) errs.push(`decision-reachability: ${m.id} node "${n.id}" toolBinaryId "${n.toolBinaryId}" unknown`);
      if (n.unverified && !(n.references && n.references.length)) errs.push(`decision-reachability: ${m.id} node "${n.id}" unverified with no references`);
      if (n.id !== m.rootNodeId && !targeted.has(n.id)) errs.push(`decision-reachability: ${m.id} orphan node "${n.id}" (no incoming edge)`);
    }
  }
  return errs;
}

// ---------- nmap-route-coverage ----------
export function gateNmapRouteCoverage(): string[] {
  const v2 = loadV2Bundle();
  const techIds = new Set(loadBundle().techniques.map((t) => t.id));
  const cov = parseYaml(readFileSync(path.join(ROOT, 'coverage.manifest.yaml'), 'utf8')) as {
    'nmap-routes'?: { id: string; port: number; band: string }[];
  };
  const errs: string[] = [];
  const portRoutes = new Map<number, ServiceRoute[]>();
  for (const r of v2.nmapRoutes) {
    if (r.match.by === 'port' || r.match.by === 'portService') {
      const arr = portRoutes.get(r.match.port) ?? [];
      arr.push(r);
      portRoutes.set(r.match.port, arr);
    }
  }
  for (const entry of cov['nmap-routes'] ?? []) {
    if (!(portRoutes.get(entry.port)?.length))
      errs.push(`nmap-route-coverage: catalog port ${entry.port} (${entry.id}) has no ServiceRoute`);
  }
  for (const r of v2.nmapRoutes)
    for (const tid of r.techniqueIds)
      if (!techIds.has(tid)) errs.push(`nmap-route-coverage: route ${r.id} techniqueId "${tid}" not a live technique`);
  return errs;
}

// ---------- G21 — no ambient clock / no random in runtime logic ----------
export function gateNoAmbientClock(): string[] {
  const errs: string[] = [];
  const DENY = [/\bDate\.now\b/, /\bnew Date\(/, /\bMath\.random\b/, /\bperformance\.now\b/, /\bcrypto\.getRandomValues\b/];
  const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  for (const dir of ['src/engine', 'src/stores', 'src/store']) {
    const full = path.join(ROOT, dir);
    if (!existsSync(full)) continue;
    for (const rel of readdirSync(full, { recursive: true }) as string[]) {
      if (!/\.tsx?$/.test(rel) || /\.test\./.test(rel)) continue;
      const code = stripComments(readFileSync(path.join(full, rel), 'utf8'));
      for (const re of DENY) if (re.test(code)) errs.push(`no-ambient-clock: ${dir}/${rel} uses ${re.source} (inject now() instead)`);
    }
  }
  return errs;
}

// ---------- G15 — cve-antifab ----------
const CVE_ID_RE = /^CVE-\d{4}-\d{4,}$/;
export function gateCveAntifab(): string[] {
  const v2 = loadV2Bundle();
  const refs = new Map(loadBundle().references.map((r) => [r.id, r]));
  const errs: string[] = [];
  for (const e of v2.cve) {
    const ref = refs.get(e.ref);
    if (!ref) errs.push(`cve-antifab: ${e.id} ref "${e.ref}" not a known Reference`);
    else if (!ref.url) errs.push(`cve-antifab: ${e.id} ref "${e.ref}" has no url`);
    for (const r of e.references ?? []) {
      const rr = refs.get(r);
      if (!rr) errs.push(`cve-antifab: ${e.id} reference "${r}" not a known Reference`);
      else if (!rr.url) errs.push(`cve-antifab: ${e.id} reference "${r}" has no url`);
    }
    if (e.cveId && !CVE_ID_RE.test(e.cveId)) errs.push(`cve-antifab: ${e.id} cveId "${e.cveId}" malformed`);
    if (!e.searchsploitTerm.trim()) errs.push(`cve-antifab: ${e.id} empty searchsploitTerm`);
    const text = [e.product, e.title, e.notes ?? '', e.searchsploitTerm, ...(e.productAliases ?? [])].join(' ');
    for (const m of text.matchAll(IPV4_RE)) {
      const [a, bb, c, d] = [m[1], m[2], m[3], m[4]].map(Number) as [number, number, number, number];
      if (!isAllowedIp(a, bb, c, d)) errs.push(`cve-antifab: ${e.id} routable IP literal ${m[0]}`);
    }
    if (e.versionRange.any && e.confidence !== 'unverified')
      errs.push(`cve-antifab: ${e.id} product-wide versionRange.any must be confidence:'unverified'`);
  }
  return errs;
}

// ---------- G20 — unverified-citation (across ALL v2 record kinds) ----------
export function gateUnverifiedCitation(): string[] {
  const v2 = loadV2Bundle();
  const refIds = new Set(loadBundle().references.map((r) => r.id));
  const errs: string[] = [];
  const need = (kind: string, id: string, conf: string | undefined, references: string[] | undefined, flag?: boolean) => {
    if (!(conf === 'unverified' || flag === true)) return;
    if (!references || references.length === 0) {
      errs.push(`unverified-citation: ${kind} "${id}" unverified with no references`);
      return;
    }
    for (const r of references) if (!refIds.has(r)) errs.push(`unverified-citation: ${kind} "${id}" reference "${r}" not a known Reference`);
  };
  for (const t of v2.toolBinaries) need('toolBinary', t.id, t.confidence, t.references);
  for (const s of v2.signals) need('signal', s.id, s.confidence, s.references);
  for (const r of v2.rules) need('rule', r.id, r.confidence, r.references);
  for (const e of v2.cve) need('cve', e.id, e.confidence, e.references);
  for (const m of v2.decisions) for (const n of m.nodes) need(`decision ${m.id} node`, n.id, n.confidence, n.references, n.unverified);
  return errs;
}

// ---------- G16 — no AI / network / telemetry dependencies ----------
export function gateNoAiDeps(): string[] {
  const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const all = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})];
  const ALLOW = [/^minisearch$/, /^zustand$/, /^@xyflow\//, /^workbox/];
  const DENY: RegExp[] = [
    /^openai$/, /^@anthropic-ai\//, /^@huggingface\//, /^@xenova\/transformers$/, /^onnxruntime/, /^@tensorflow\//,
    /^langchain$/, /^llamaindex$/, /^cohere-ai$/, /^replicate$/, /^brain\.js$/, /^ml-/,
    /^axios$/, /^node-fetch$/, /^got$/, /^superagent$/, /^ws$/, /^socket\.io-client$/,
    /^firebase$/, /^@supabase\//, /^@sentry\//, /^posthog-js$/, /^mixpanel$/, /^analytics$/,
  ];
  const errs: string[] = [];
  for (const name of all) {
    if (ALLOW.some((re) => re.test(name))) continue;
    for (const re of DENY) if (re.test(name)) errs.push(`no-ai-deps: forbidden dependency "${name}" (matches ${re.source})`);
  }
  return errs;
}

// ---------- G17 — no runtime (external) network ----------
export function gateNoRuntimeNet(): string[] {
  const errs: string[] = [];
  const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  // network APIs that are never allowed at runtime:
  const DENY: [RegExp, string][] = [
    [/\bXMLHttpRequest\b/, 'XMLHttpRequest'],
    [/\bnew WebSocket\b/, 'WebSocket'],
    [/\bnavigator\.sendBeacon\b/, 'navigator.sendBeacon'],
    [/\bEventSource\b/, 'EventSource'],
    [/\bRTCPeerConnection\b/, 'RTCPeerConnection'],
    [/\bnavigator\.gpu\b/, 'navigator.gpu'],
    [/importScripts\s*\(\s*[`'"]?https?:/, 'importScripts(http…)'],
  ];
  // a fetch to an ABSOLUTE / third-party URL — the same-origin relative content fetch
  // (fetch(`${BASE}content/…`)) is the precached offline loader and is ALLOWED.
  const FETCH_ABS = /\bfetch\s*\(\s*[`'"]\s*(?:https?:|\/\/)/;
  for (const file of walkSrc('src')) {
    if (/\.test\.tsx?$/.test(file)) continue;
    const code = stripComments(readFileSync(file, 'utf8'));
    for (const [re, label] of DENY) if (re.test(code)) errs.push(`no-runtime-net: ${path.relative(ROOT, file)} uses ${label}`);
    if (FETCH_ABS.test(code)) errs.push(`no-runtime-net: ${path.relative(ROOT, file)} fetch()es an absolute/third-party URL`);
  }
  // workbox runtimeCaching (if any) must not reference a third-party origin
  const viteCfg = readFileSync(path.join(ROOT, 'vite.config.ts'), 'utf8');
  if (/runtimeCaching/.test(viteCfg) && /urlPattern[\s\S]{0,160}?https?:\/\/(?!localhost)/.test(viteCfg))
    errs.push('no-runtime-net: vite.config workbox runtimeCaching references a third-party origin');
  return errs;
}

function walkSrc(dir: string): string[] {
  const full = path.join(ROOT, dir);
  if (!existsSync(full)) return [];
  return (readdirSync(full, { recursive: true }) as string[])
    .filter((rel) => /\.tsx?$/.test(rel))
    .map((rel) => path.join(full, rel));
}

// ---------- G18 — strict offline CSP in the shipped index.html ----------
export function gateCsp(): string[] {
  const html = readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const errs: string[] = [];
  const meta = /<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/i.exec(html)?.[0];
  if (!meta) return ['csp: index.html missing a Content-Security-Policy meta'];
  // the CSP value is full of single quotes ('self'/'none'), so capture the whole
  // double-quoted (or single-quoted) content attribute, not up to the first quote.
  const cm = /content="([^"]+)"/i.exec(meta) ?? /content='([^']+)'/i.exec(meta);
  const csp = cm?.[1];
  if (csp == null) return ['csp: Content-Security-Policy meta has no content'];
  const required: [RegExp, string][] = [
    [/default-src\s+'self'/, "default-src 'self'"],
    [/connect-src\s+'self'/, "connect-src 'self'"],
    [/script-src\s+'self'/, "script-src 'self'"],
    [/object-src\s+'none'/, "object-src 'none'"],
    [/base-uri\s+'none'/, "base-uri 'none'"],
  ];
  for (const [re, label] of required) if (!re.test(csp)) errs.push(`csp: missing/weak directive — ${label}`);
  if (/connect-src[^;]*https?:/.test(csp)) errs.push('csp: connect-src allows an http(s) origin (must be self only)');
  if (/script-src[^;]*'unsafe-eval'/.test(csp)) errs.push("csp: script-src allows 'unsafe-eval'");
  return errs;
}

// ============================================================
// v3 (OSCE3 pack) gates — pass-on-empty until content is authored.
// ============================================================
const OSCE3_PRIMARY_REFS = new Set([
  'ref.oswe.timip', 'ref.ysoserialnet', 'ref.osep.chvancooten', 'ref.osed.epi052',
  'ref.corelan', 'ref.osee.nccmitigations', 'ref.ringzero',
  'ref.offsec.web300', 'ref.offsec.pen300', 'ref.offsec.exp301', 'ref.offsec.exp401',
]);
const isOsce3Id = (id: string) => /^(oswe|osep|osed|osee)\./.test(id);

// ---------- gate-pack-coverage ----------
export function gatePackCoverage(): string[] {
  const b = loadBundle();
  const errs: string[] = [];
  const techById = new Map(b.techniques.map((t) => [t.id, t]));
  const cmdIds = new Set(b.commands.map((c) => c.id));
  const refIds = new Set(b.references.map((r) => r.id));
  const cov = parseYaml(readFileSync(path.join(ROOT, 'coverage.manifest.yaml'), 'utf8')) as {
    osce3?: Record<string, { id: string; band: string }[]>;
  };
  for (const [packId, entries] of Object.entries(cov.osce3 ?? {})) {
    for (const e of entries ?? []) {
      const t = techById.get(e.id);
      if (!t) { errs.push(`pack-coverage: ${packId} id "${e.id}" not a technique in the merged bundle`); continue; }
      if (!t.packs.includes(packId)) errs.push(`pack-coverage: "${e.id}" not tagged packs:[${packId}]`);
      const isRefPack = packId === 'osed' || packId === 'osee';
      const hasCmd = t.commands.some((c) => cmdIds.has(c));
      const hasRef = t.references.some((r) => refIds.has(r));
      if (!hasCmd && !(isRefPack && hasRef))
        errs.push(`pack-coverage: "${e.id}" resolves to no compiling command${isRefPack ? '/reference' : ''}`);
    }
  }
  return errs;
}

// ---------- gate-osce3-cite ----------
export function gateOsce3Cite(): string[] {
  const b = loadBundle();
  const errs: string[] = [];
  const refIds = new Set(b.references.map((r) => r.id));
  const check = (kind: string, id: string, refs: string[] | undefined, confidence: string) => {
    if (!isOsce3Id(id)) return;
    const rs = refs ?? [];
    for (const r of rs) if (!refIds.has(r)) errs.push(`osce3-cite: ${kind} "${id}" reference "${r}" unknown`);
    if (!rs.includes('ref.osce3.joas')) errs.push(`osce3-cite: ${kind} "${id}" missing ref.osce3.joas`);
    if (!rs.some((r) => OSCE3_PRIMARY_REFS.has(r))) errs.push(`osce3-cite: ${kind} "${id}" missing a primary source`);
    if (confidence === 'unverified' && rs.length === 0) errs.push(`osce3-cite: ${kind} "${id}" unverified with no references`);
  };
  for (const t of b.techniques) check('technique', t.id, t.references, t.confidence);
  for (const c of b.commands) check('command', c.id, c.references, c.confidence);
  return errs;
}

// ---------- gate-evasion-methodology-only ----------
export function gateEvasionMethodologyOnly(): string[] {
  const b = loadBundle();
  const errs: string[] = [];
  // working-bypass-payload markers — present on a node tagged `evasion` ⇒ FAIL.
  const PAYLOAD_MARKERS: [RegExp, string][] = [
    [/VirtualAlloc[\s\S]{0,120}?Create(?:Remote)?Thread/i, 'shellcode-loader body'],
    [/(?:\\x[0-9a-fA-F]{2}){12,}/, 'long \\x shellcode run'],
    [/AmsiScanBuffer[\s\S]{0,60}?(?:0x[0-9a-fA-F]{2}[\s,]+){4,}/i, 'AMSI patch byte sequence'],
    [/-Enc(?:odedCommand)?\s+[A-Za-z0-9+/=]{120,}/, 'base64 PowerShell stager'],
  ];
  const scan = (kind: string, id: string, tags: string[] | undefined, text: string) => {
    if (!(tags ?? []).includes('evasion')) return;
    for (const [re, label] of PAYLOAD_MARKERS)
      if (re.test(text)) errs.push(`evasion-methodology-only: ${kind} "${id}" carries a working-bypass marker (${label})`);
  };
  for (const c of b.commands) scan('command', c.id, c.tags, `${c.template} ${(c.notes ?? []).join(' ')}`);
  for (const t of b.techniques) scan('technique', t.id, t.tags, `${t.summary} ${stripHtml(t.body ?? '')}`);
  return errs;
}

// ---------- runner ----------
export function report(name: string, errors: string[]): never {
  if (errors.length) {
    console.error(`✗ ${name} — ${errors.length} error(s):`);
    for (const e of errors) console.error(`  • ${e}`);
    process.exit(1);
  }
  console.log(`✓ ${name}`);
  process.exit(0);
}

export async function ensureBuilt(): Promise<void> {
  try {
    await fs.access(path.join(CONTENT, 'oscp.json'));
  } catch {
    throw new Error('public/content/oscp.json not found — run `pnpm build:content` first');
  }
}
