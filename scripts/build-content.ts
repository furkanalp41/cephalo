// scripts/build-content.ts — the content pipeline.
// Loads typed YAML authoring sources, validates against the Zod schemas (lockstep
// with the FROZEN interfaces), enforces cross-link / var-registry / credMode /
// placeholder integrity, then emits the static artifacts the offline app consumes:
//   public/content/oscp.json         (ContentBundle)
//   public/content/search-index.json (serialized MiniSearch)
//   public/content/search-side.json  (the §7.1 side table)
//   public/content/mindmaps.json
//   public/content/coverage-heatmap.json
//
// Run with: pnpm build:content
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

import { VARIABLE_REGISTRY, KNOWN_VAR_IDS } from '@/data/variables';
import { REFERENCES } from '@/data/references';
import { TAGS } from '@/data/tags';
import { PACKS } from '@/data/packs';
import { SectionBundleFileSchema, ContentBundleSchema } from '@/data/schema';
import { templateEngine } from '@/engine/template';
import { createSearchIndex, serializeSearchIndex, phaseOrderOf } from '@/engine/search';
import type { SearchSideTable } from '@/engine/search';
import type {
  Command,
  Technique,
  Section,
  MindMap,
  BloodHoundQuery,
  Tag,
  ContentBundle,
  Phase,
  CredMode,
} from '@/types/content';
import type { SearchDoc } from '@/types/engine';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT_DIR = path.join(ROOT, 'public', 'content');

const errors: string[] = [];
const warnings: string[] = [];
function fail(msg: string) {
  errors.push(msg);
}
function warn(msg: string) {
  warnings.push(msg);
}

// ---------- markdown ----------
function mdToHtml(md: string): string {
  const raw = marked.parse(md, { async: false }) as string;
  return sanitizeHtml(raw, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'a',
      'h2', 'h3', 'h4', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'span',
    ],
    allowedAttributes: { a: ['href', 'title', 'rel'], span: ['class'] },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: 'noopener noreferrer nofollow' },
      }),
    },
  });
}
function mdToText(md: string): string {
  const html = marked.parse(md, { async: false }) as string;
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------- load (every registered pack's content/<id>/**.yaml) ----------
async function loadYamlFiles(): Promise<{ file: string; data: unknown }[]> {
  const out: { file: string; data: unknown }[] = [];
  for (const pack of PACKS) {
    const dir = path.join(ROOT, 'content', pack.id);
    let entries: string[];
    try {
      entries = await fs.readdir(dir, { recursive: true });
    } catch {
      continue; // this pack has no authored content yet
    }
    for (const rel of entries) {
      if (!rel.endsWith('.yaml') && !rel.endsWith('.yml')) continue;
      const full = path.join(dir, rel);
      const stat = await fs.stat(full);
      if (!stat.isFile()) continue;
      const text = await fs.readFile(full, 'utf8');
      try {
        out.push({ file: `${pack.id}/${rel}`, data: parseYaml(text) });
      } catch (e) {
        fail(`YAML parse error in ${pack.id}/${rel}: ${(e as Error).message}`);
      }
    }
  }
  return out;
}

// ---------- main ----------
async function main() {
  const files = await loadYamlFiles();

  const sections: Section[] = [];
  const techniques: Technique[] = [];
  const commands: Command[] = [];
  const mindmaps: MindMap[] = [];
  const bloodhound: BloodHoundQuery[] = [];

  for (const { file, data } of files) {
    const parsed = SectionBundleFileSchema.safeParse(data);
    if (!parsed.success) {
      fail(`Schema validation failed in ${file}:\n${parsed.error.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n')}`);
      continue;
    }
    const b = parsed.data;
    if (b.section) sections.push(b.section as Section);
    if (b.sections) sections.push(...(b.sections as Section[]));
    if (b.techniques) techniques.push(...(b.techniques as Technique[]));
    if (b.commands) commands.push(...(b.commands as Command[]));
    if (b.mindmaps) mindmaps.push(...(b.mindmaps as MindMap[]));
    if (b.bloodhound) bloodhound.push(...(b.bloodhound as BloodHoundQuery[]));
  }

  // ---- unique-id checks ----
  const dupCheck = (name: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) fail(`Duplicate ${name} id: ${id}`);
      seen.add(id);
    }
  };
  dupCheck('command', commands.map((c) => c.id));
  dupCheck('technique', techniques.map((t) => t.id));
  dupCheck('section', sections.map((s) => s.id));
  dupCheck('mindmap', mindmaps.map((m) => m.id));
  dupCheck('bloodhound', bloodhound.map((q) => q.id));
  dupCheck('reference', REFERENCES.map((r) => r.id));
  dupCheck('variable', VARIABLE_REGISTRY.map((v) => v.id));

  const commandIds = new Set(commands.map((c) => c.id));
  const techniqueIds = new Set(techniques.map((t) => t.id));
  const sectionIds = new Set(sections.map((s) => s.id));
  const refIds = new Set(REFERENCES.map((r) => r.id));

  // ---- auto-register tags used but not defined ----
  const definedTagIds = new Set(TAGS.map((t) => t.id));
  const allTags: Tag[] = [...TAGS];
  const noteTag = (id: string) => {
    if (!definedTagIds.has(id)) {
      definedTagIds.add(id);
      allTags.push({ id, label: id, category: 'concept' });
      warn(`auto-registered tag "${id}" (not in src/data/tags.ts)`);
    }
  };
  for (const c of commands) (c.tags ?? []).forEach(noteTag);
  for (const t of techniques) t.tags.forEach(noteTag);
  for (const q of bloodhound) (q.tags ?? []).forEach(noteTag);

  // ---- map command -> owning technique (for ports/services + side table) ----
  const owningTechnique = new Map<string, Technique>();
  for (const t of techniques) {
    for (const cid of t.commands) {
      if (!owningTechnique.has(cid)) {
        const tt = techniques.find((x) => x.id === t.id);
        if (tt) owningTechnique.set(cid, tt);
      }
    }
  }

  // ---- cross-link integrity ----
  for (const t of techniques) {
    for (const cid of t.commands)
      if (!commandIds.has(cid)) fail(`technique ${t.id}: missing command "${cid}"`);
    for (const rid of t.relatedIds ?? [])
      if (!techniqueIds.has(rid)) fail(`technique ${t.id}: relatedIds -> missing technique "${rid}"`);
    for (const rid of t.references)
      if (!refIds.has(rid)) fail(`technique ${t.id}: missing reference "${rid}"`);
    if (t.parent && !techniqueIds.has(t.parent)) fail(`technique ${t.id}: missing parent "${t.parent}"`);
    for (const cid of t.children ?? [])
      if (!techniqueIds.has(cid)) fail(`technique ${t.id}: missing child "${cid}"`);
  }
  for (const c of commands) {
    for (const rid of c.references ?? [])
      if (!refIds.has(rid)) fail(`command ${c.id}: missing reference "${rid}"`);
  }
  for (const s of sections) {
    for (const tid of s.techniques)
      if (!techniqueIds.has(tid)) fail(`section ${s.id}: missing technique "${tid}"`);
    if (s.parent && !sectionIds.has(s.parent)) fail(`section ${s.id}: missing parent "${s.parent}"`);
  }
  for (const q of bloodhound) {
    for (const rid of q.references)
      if (!refIds.has(rid)) fail(`bloodhound ${q.id}: missing reference "${rid}"`);
    if (q.abuseTechniqueId && !techniqueIds.has(q.abuseTechniqueId))
      fail(`bloodhound ${q.id}: abuseTechniqueId -> missing technique "${q.abuseTechniqueId}"`);
  }
  for (const m of mindmaps) {
    for (const n of m.nodes) {
      if (n.techniqueId && !techniqueIds.has(n.techniqueId))
        fail(`mindmap ${m.id} node ${n.id}: missing techniqueId "${n.techniqueId}"`);
      if (n.sectionId && !sectionIds.has(n.sectionId))
        fail(`mindmap ${m.id} node ${n.id}: missing sectionId "${n.sectionId}"`);
    }
    const nodeIds = new Set(m.nodes.map((n) => n.id));
    for (const e of m.edges) {
      if (!nodeIds.has(e.source)) fail(`mindmap ${m.id} edge ${e.id}: source "${e.source}" not a node`);
      if (!nodeIds.has(e.target)) fail(`mindmap ${m.id} edge ${e.id}: target "${e.target}" not a node`);
    }
  }

  // ---- var-registry integrity ----
  const checkVars = (label: string, template: string, declared?: string[]) => {
    const detected = templateEngine.detectVars(template);
    for (const v of detected)
      if (!KNOWN_VAR_IDS.has(v)) fail(`${label}: unknown variable {{${v}}} (not in registry)`);
    for (const v of declared ?? [])
      if (!KNOWN_VAR_IDS.has(v)) fail(`${label}: requiresVars lists unknown variable "${v}"`);
    // §5.3: warn on |quote in a non-bash template
    if (/\{\{[^}]*\|\s*quote\s*\}\}/.test(template)) {
      // determined by caller's shell; warning emitted there
    }
  };
  for (const c of commands) {
    checkVars(`command ${c.id}`, c.template, c.requiresVars);
    if ((c.shell ?? 'bash') !== 'bash' && /\|\s*quote\s*\}\}/.test(c.template))
      warn(`command ${c.id}: {{VAR|quote}} in a ${c.shell} template — quote is bash-only (§5.3)`);
    for (const v of c.variants ?? []) {
      checkVars(`command ${c.id} variant ${v.id}`, v.template);
      if ((v.shell ?? c.shell ?? 'bash') !== 'bash' && /\|\s*quote\s*\}\}/.test(v.template))
        warn(`command ${c.id} variant ${v.id}: {{VAR|quote}} in a non-bash template (§5.3)`);
    }
  }
  for (const q of bloodhound) checkVars(`bloodhound ${q.id}`, q.cypher);

  // ---- credMode variant completeness (Gate 7) ----
  const CRED_MODES: CredMode[] = ['password', 'nthash', 'kerberos'];
  for (const c of commands) {
    if (c.credMode) {
      const present = new Set((c.variants ?? []).map((v) => v.credMode).filter(Boolean));
      for (const m of CRED_MODES)
        if (!present.has(m))
          fail(`command ${c.id}: credMode set but missing a "${m}" variant (Gate 7)`);
    }
  }

  // ---- placeholder inert-shape + default whitelist (Gate 6, also asserted here) ----
  const INERT_RE = /<[^>\s]+>/;
  const DEFAULT_WHITELIST = new Set(['LPORT', 'INTERFACE']);
  for (const v of VARIABLE_REGISTRY) {
    if (!INERT_RE.test(v.placeholder))
      fail(`variable ${v.id}: placeholder "${v.placeholder}" is not an inert <token> (Gate 6)`);
    if (v.default !== undefined && !DEFAULT_WHITELIST.has(v.id))
      fail(`variable ${v.id}: only LPORT/INTERFACE may carry a default (Gate 6)`);
    if (v.default !== undefined && v.sensitive)
      fail(`variable ${v.id}: sensitive vars must never carry a default`);
  }

  // ---- unverified must carry references (Gate 3, asserted here) ----
  for (const c of commands)
    if (c.confidence === 'unverified' && !(c.references && c.references.length))
      fail(`command ${c.id}: confidence:'unverified' requires >=1 reference (Gate 3)`);
  for (const t of techniques)
    if (t.confidence === 'unverified' && t.references.length === 0)
      fail(`technique ${t.id}: confidence:'unverified' requires >=1 reference (Gate 3)`);
  for (const q of bloodhound)
    if (q.confidence === 'unverified' && q.references.length === 0)
      fail(`bloodhound ${q.id}: confidence:'unverified' requires >=1 reference (Gate 3)`);

  if (errors.length) {
    reportAndExit();
    return;
  }

  // ---- pre-render markdown bodies (emit HTML; keep plaintext for search) ----
  const techniqueText = new Map<string, string>();
  const emittedTechniques: Technique[] = techniques.map((t) => {
    const text = t.body ? mdToText(t.body) : '';
    techniqueText.set(t.id, text);
    return t.body ? { ...t, body: mdToHtml(t.body) } : t;
  });

  // ---- assemble bundle ----
  const bundle: ContentBundle = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    packs: PACKS,
    variables: VARIABLE_REGISTRY,
    tags: allTags,
    sections,
    techniques: emittedTechniques,
    commands,
    mindmaps,
    bloodhound,
    references: REFERENCES,
  };

  const bundleCheck = ContentBundleSchema.safeParse(bundle);
  if (!bundleCheck.success) {
    fail(`assembled ContentBundle failed validation:\n${bundleCheck.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n')}`);
    reportAndExit();
    return;
  }

  // ---- search docs ----
  const phaseForBH = (q: BloodHoundQuery): Phase =>
    q.category === 'enumeration' || q.category === 'recon'
      ? 'enumeration'
      : q.category === 'attack-path'
        ? 'lateral-movement'
        : 'credential-access';

  const searchDocs: SearchDoc[] = [];
  const side: SearchSideTable = {};

  for (const c of commands) {
    const owner = owningTechnique.get(c.id);
    const phase = c.phase ?? owner?.phase;
    const doc: SearchDoc = {
      id: c.id,
      type: 'command',
      title: c.title,
      body: c.description ?? '',
      tags: c.tags ?? [],
      os: c.os,
      ports: owner?.ports ?? [],
      services: owner?.services ?? [],
      packs: c.packs,
    };
    if (c.template) doc.template = c.template;
    if (phase) doc.phase = phase;
    if (c.tool) doc.tool = c.tool;
    searchDocs.push(doc);
    side[c.id] = {
      confidence: c.confidence,
      phaseOrder: phaseOrderOf(phase),
      ...(owner ? { techniqueId: owner.id } : {}),
    };
  }
  for (const t of techniques) {
    const doc: SearchDoc = {
      id: t.id,
      type: 'technique',
      title: t.title,
      body: `${t.summary} ${techniqueText.get(t.id) ?? ''}`.trim(),
      tags: t.tags,
      os: t.os,
      phase: t.phase,
      ports: t.ports ?? [],
      services: t.services ?? [],
      packs: t.packs,
    };
    searchDocs.push(doc);
    side[t.id] = { confidence: t.confidence, phaseOrder: phaseOrderOf(t.phase), techniqueId: t.id };
  }
  for (const s of sections) {
    const doc: SearchDoc = {
      id: s.id,
      type: 'section',
      title: s.title,
      body: s.description ?? '',
      tags: [],
      os: [s.os],
      ports: [],
      services: [],
      packs: s.packs,
    };
    if (s.phase) doc.phase = s.phase;
    searchDocs.push(doc);
    side[s.id] = { confidence: 'verified', phaseOrder: phaseOrderOf(s.phase) };
  }
  for (const q of bloodhound) {
    const phase = phaseForBH(q);
    const doc: SearchDoc = {
      id: q.id,
      type: 'bloodhound',
      title: q.title,
      body: `${q.description} ${q.abuse ?? ''}`.trim(),
      template: q.cypher,
      tags: q.tags ?? [],
      os: ['ad'],
      phase,
      ports: [],
      services: [],
      packs: ['oscp'],
    };
    searchDocs.push(doc);
    side[q.id] = {
      confidence: q.confidence,
      phaseOrder: phaseOrderOf(phase),
      ...(q.abuseTechniqueId ? { techniqueId: q.abuseTechniqueId } : {}),
    };
  }
  for (const tag of allTags) {
    const doc: SearchDoc = {
      id: `tag.${tag.id}`,
      type: 'tag',
      title: tag.label,
      body: tag.label,
      tags: [tag.id],
      os: tag.os ?? ['linux', 'windows', 'ad'],
      ports: [],
      services: [],
      packs: ['oscp'],
    };
    searchDocs.push(doc);
    side[`tag.${tag.id}`] = { confidence: 'verified', phaseOrder: phaseOrderOf(undefined) };
  }

  // every SearchDoc.id MUST have a side entry (Gate 9 invariant)
  for (const d of searchDocs)
    if (!side[d.id]) fail(`search side-table missing entry for "${d.id}"`);
  if (errors.length) {
    reportAndExit();
    return;
  }

  const mini = createSearchIndex(searchDocs);
  const indexJson = serializeSearchIndex(mini);

  // ---- coverage heatmap ----
  const heatmap = buildHeatmap(emittedTechniques, commands);

  // ---- write outputs (one ContentBundle JSON per pack that has content) ----
  await fs.mkdir(OUT_DIR, { recursive: true });
  const emitted: string[] = [];
  for (const pack of PACKS) {
    const inPack = (arr: string[]) => arr.includes(pack.id);
    const packBundle: ContentBundle = {
      schemaVersion: 1,
      generatedAt: bundle.generatedAt,
      packs: PACKS,
      variables: VARIABLE_REGISTRY,
      tags: allTags,
      sections: sections.filter((s) => inPack(s.packs)),
      techniques: emittedTechniques.filter((t) => inPack(t.packs)),
      commands: commands.filter((c) => inPack(c.packs)),
      mindmaps: mindmaps.filter((m) => inPack(m.packs)),
      // OSCE3 packs ship NO bloodhound; it stays oscp-only (§4.3).
      bloodhound: pack.id === 'oscp' ? bloodhound : [],
      references: REFERENCES,
    };
    const hasContent =
      packBundle.sections.length > 0 || packBundle.techniques.length > 0 || packBundle.commands.length > 0;
    if (pack.id !== 'oscp' && !hasContent) continue; // oscp always emits; others only when authored
    await fs.writeFile(path.join(OUT_DIR, `${pack.id}.json`), JSON.stringify(packBundle));
    emitted.push(pack.id);
  }
  // ONE combined search index + side table spanning every pack's docs.
  await fs.writeFile(
    path.join(OUT_DIR, 'search-index.json'),
    JSON.stringify({ index: indexJson, side }),
  );
  await fs.writeFile(path.join(OUT_DIR, 'search-side.json'), JSON.stringify(side));
  await fs.writeFile(path.join(OUT_DIR, 'mindmaps.json'), JSON.stringify(mindmaps));
  await fs.writeFile(path.join(OUT_DIR, 'coverage-heatmap.json'), JSON.stringify(heatmap, null, 2));

  console.log(
    `✓ content built — packs [${emitted.join(', ')}] · ${commands.length} commands · ${techniques.length} techniques · ` +
      `${sections.length} sections · ${mindmaps.length} mindmaps · ${bloodhound.length} BH queries · ` +
      `${searchDocs.length} search docs`,
  );
  if (warnings.length) {
    console.log(`  ${warnings.length} warning(s):\n` + warnings.map((w) => `  - ${w}`).join('\n'));
  }
}

function buildHeatmap(techniques: Technique[], commands: Command[]) {
  const phases: Phase[] = [
    'recon', 'enumeration', 'web', 'initial-access', 'exploitation', 'foothold',
    'privilege-escalation', 'lateral-movement', 'credential-access', 'persistence',
    'post-exploitation', 'pivoting', 'exfiltration', 'cleanup',
  ];
  const oses = ['linux', 'windows', 'ad'] as const;
  const grid: Record<string, Record<string, number>> = {};
  for (const os of oses) {
    grid[os] = {};
    for (const p of phases) grid[os][p] = 0;
  }
  for (const t of techniques)
    for (const os of t.os) {
      const row = grid[os];
      if (row) row[t.phase] = (row[t.phase] ?? 0) + 1;
    }

  const cmdIds = new Set(commands.map((c) => c.id));
  const orphanTechniques = techniques
    .filter((t) => !t.commands.some((c) => cmdIds.has(c)))
    .map((t) => t.id);
  const requiredLeaves = techniques.filter((t) => t.requiredForOscpReadiness);
  const requiredUnresolved = requiredLeaves
    .filter((t) => !t.commands.some((c) => cmdIds.has(c)))
    .map((t) => t.id);

  return {
    generatedAt: new Date().toISOString(),
    perOsPhase: grid,
    totals: {
      techniques: techniques.length,
      commands: commands.length,
      requiredForOscpReadiness: requiredLeaves.length,
    },
    orphanTechniques,
    requiredUnresolved,
  };
}

function reportAndExit() {
  console.error(`\n✗ build-content failed with ${errors.length} error(s):\n`);
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
