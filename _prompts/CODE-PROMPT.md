# CODE-PROMPT.md — Build Cephalo (for Claude Code)

> You are Claude Code. Build **Cephalo** — an octopus-themed, copy-paste-ready OSCP command-and-technique engine — as a production-quality, offline-first static web app in the empty git repo at `/home/vlad/bigOscpPrep`. This document is your complete engineering brief. It OWNS: stack, repo layout, the content data model & authoring format, the variable templating engine, the search index, the mindmap data + wiring, the comprehensive technique-tree scaffolding (Linux/Windows/AD) + BloodHound cypher library, the theming MECHANISM that consumes design tokens, PWA/offline/local-first, OSWE/OSEP pack extensibility, tests + CI gates, and the anti-fabrication + responsible-use discipline.
>
> The **FROZEN SHARED CONTRACT** (§10) and **DESIGN-TOKEN KEYS** (§11) below are the single source of truth. Reproduce them **verbatim** into the files named. A separate DESIGN prompt (handed to "Claude Design") supplies the token VALUES and visual identity; it binds these same interfaces verbatim. Your job is the machine; design's job is the skin. The seam is defined in §12.
>
> **Three contract-internal seams are resolved in this brief and you MUST implement them exactly as stated — they reconcile capabilities that the FROZEN interfaces imply but do not themselves spell out:** (a) `credMode` switching is **variant-selection, not template transformation** (§5.1, §8.3); (b) the frozen `verified > unverified` search tiebreak and command→mindmap-node highlighting are powered by a **build-time side table** loaded alongside the serialized index, because the FROZEN `SearchDoc`/`SearchHit` carry neither field (§7.1); (c) `VariableDef.default` is consumed by **seeding defaults into the values map at store init**, leaving the FROZEN filled chain (`values ?? fallback ?? placeholder`) untouched (§5.2, §8.1). None of these three resolutions edits a frozen interface.

---

## 0. TL;DR EXECUTION ORDER (do these in this order; do not skip the green-gates)

1. Scaffold repo, toolchain, tsconfig (strict), lint, CI skeleton (§1–§4).
2. Drop the **FROZEN** type modules verbatim (§10) and token-key module verbatim (§11). Freeze them.
3. Build the **templating engine** (pure TS) + unit tests to 100% on the contract behavior (§5).
4. Build the **content pipeline** (`scripts/build-content.ts`): Zod schemas in lockstep with the frozen types, validate authoring sources, emit `public/content/*.json` + `search-index.json` + `search-side.json` + `mindmaps.json` (§6).
5. Build the **search engine** wrapper (MiniSearch, prebuilt+serialized) + side-table loader + tests on frozen ranking (§7).
6. Build the **stores** (Zustand: variables/theme/search/packs), seed defaults into the values map, + theming mechanism consuming `--cph-*` (§8).
7. Build the **components** to the frozen component-API seam: VariableBar → CommandCard → SearchPalette → MindMap → OctopusMascot (controlled/presentational) (§8).
8. Author the **content tree** (Linux/Windows/AD + Cross-Cutting + BloodHound) against the coverage checklist, every entity typed/validated/cited, every credMode card carrying a full variant set (§9).
9. Wire **PWA/offline**, routes/deep-links, keyboard map, responsible-use note (§8, §13).
10. Turn on **all CI gates** and Playwright e2e; ship green (§14).

Each numbered phase below ends with a **GREEN-GATE**: a mechanical command that must exit 0 before you proceed. Never proceed on red.

---

## 1. STACK (frozen — do not substitute)

- **Vite + React 18 SPA**, **TypeScript strict**. Pure static output, deployable to any CDN / GitHub Pages.
- **TanStack Router** (typed routes + deep-links), **Zustand**(+persist) for global state, **MiniSearch** (prebuilt, serialized client index), **@xyflow/react** (mindmaps), **vite-plugin-pwa / Workbox** (offline precache + installable), **Zod** (content validation in lockstep with frozen interfaces), **@rive-app/react-canvas** (octopus mascot state machine; lazy), **Vitest + Playwright** (unit + e2e), **dagre** (or elk) for deterministic mindmap layout.
- **Toolchain (pinned to verified-existing releases — do NOT invent a version that does not resolve):**
  - **Node `20.18.1`** (a real, published LTS "Iron" patch release). `.nvmrc` contains the **full patch version** `20.18.1` (not a floating `20.20`, which is not a published release as of this brief). If you must move, move only to another release you have confirmed exists on `nodejs.org/dist` (e.g. a later `20.x` LTS); never pin a fabricated number.
  - **pnpm `9.15.4`** (a real, published release), pinned via **Corepack** with `"packageManager": "pnpm@9.15.4"` in `package.json`. If you bump, confirm the exact version exists on the pnpm release feed first.
  - The CI runner uses `corepack enable && corepack prepare --activate` so the pinned pnpm is resolved from `packageManager`. GREEN-GATE 1 fails loudly if either runtime does not resolve.
- No backend, no SSR, no runtime network, no telemetry, no analytics, no signup.

Rationale (do not relitigate): the product is a *stateful instrument*, not a doc site. A global VariableBar re-interpolating every visible command, a whole-app `data-os` re-skin with no remount, a persistent mascot, and instant offline fuzzy search are one SPA with one shared store. Astro (island state can't span pages cleanly; theme flashes) and Next/RSC (server surface contradicts local-first/no-secrets/offline) are rejected.

**GREEN-GATE 1:** `corepack enable && pnpm install && pnpm tsc --noEmit && pnpm lint` exits 0 **and** `node -v` prints `v20.18.1` (the pinned `.nvmrc`/`packageManager` runtimes actually resolve). A nonexistent runtime here is a hard stop.

---

## 2. REPO LAYOUT (create exactly this)

```
/home/vlad/bigOscpPrep
├─ index.html
├─ package.json  pnpm-lock.yaml  .nvmrc(=20.18.1)
├─ tsconfig.json (strict)  vite.config.ts  .eslintrc.cjs  .prettierrc
├─ .gitignore                      # MUST ignore: reference-scratch/, *.pdf, denylist.local.*, .env*, machine-list*
├─ playwright.config.ts  vitest.config.ts
├─ .github/workflows/ci.yml        # all gates (§14); uses corepack to resolve pinned pnpm
├─ src/
│  ├─ types/{content,engine,components,tokens}.ts   # FROZEN merge seam — §10/§11 verbatim
│  ├─ engine/{template,search}.ts                   # pure framework-free TS (reused by validator)
│  ├─ stores/{variables,theme,search,packs}.ts      # Zustand
│  ├─ components/{CommandCard,VariableBar,SearchPalette,MindMap,OctopusMascot,
│  │              ResponsibleUseNote,SourcesPopover,KeyboardHelp,RealmSwitcher,CredModeSwitch}.tsx
│  ├─ routes/...                                     # TanStack Router (deep-linkable technique/node URLs)
│  ├─ data/references.ts                             # deduped citation registry (typed Reference[])
│  ├─ app/{App.tsx,boot.ts,pwa.ts,keymap.ts}
│  └─ main.tsx
├─ content/<pack>/<os>/<section>/technique.{yaml,md} # AUTHORING SOURCE (typed YAML + markdown body)
├─ content/<pack>/bloodhound/*.yaml                  # cypher library + edge→abuse table
├─ content/<pack>/mindmaps/*.yaml                    # one map per phase per OS
├─ coverage.manifest.yaml                            # abstract technique IDs + archetype bands (NO machine names)
├─ canon-map.yaml                                    # source.section -> cephalo.nodeId (superset audit)
├─ ci/
│  ├─ machine-denylist.manifest.json                 # COMMITTED: salted hashes ONLY (never plaintext names) — Gate 10 input
│  └─ overlap-fingerprints.json                      # COMMITTED: precomputed 8-gram shingle fingerprints — Gate 8 input
├─ scripts/{build-content.ts,gate-*.ts,emit-heatmap.ts,build-denylist-manifest.ts,build-overlap-fingerprints.ts}
├─ styles/theme.{base,linux,windows,ad}.css          # DESIGN supplies VALUES for --cph-* keys (stubs until then)
├─ public/
│  ├─ content/{<pack>.json,search-index.json,search-side.json,mindmaps.json}  # GENERATED build output
│  └─ mascot/octo.riv                                # DESIGN supplies; code lazy-loads
└─ reference-scratch/   (GITIGNORED — fingerprint SOURCE only, never tracked; CI consumes ci/overlap-fingerprints.json)
```

`.gitignore` MUST contain at least: `reference-scratch/`, `*.pdf`, `**/machine-list*`, `denylist.local.*`, `.env*`, `node_modules`, `dist`. The Trophy Room PDF lives only in `~/Downloads`, is never copied into the repo, never read by any build/import code path.

**Note on the two committed CI inputs (`ci/machine-denylist.manifest.json`, `ci/overlap-fingerprints.json`):** these contain **only one-way salted hashes / shingle fingerprints**, never plaintext machine names and never reference prose. They are how Gate 8 and Gate 10 stay reproducible on a CI runner that does NOT have the gitignored plaintext inputs. The generators (`build-denylist-manifest.ts`, `build-overlap-fingerprints.ts`) are run **locally** by the author against the gitignored sources and the resulting hash-only manifests are committed. See §14.

**GREEN-GATE 2:** `git status` shows no `*.pdf`, no `reference-scratch/`, no `denylist.local.*`, and no plaintext machine list; the only `ci/*` files tracked are the hash-only manifests. `pnpm exec tsc --noEmit` still 0.

---

## 3. TYPESCRIPT CONFIG

`strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `noImplicitOverride: true`, `verbatimModuleSyntax: true`, `moduleResolution: "bundler"`, path alias `@/* → src/*`. CI runs `tsc --noEmit` as a hard gate. No `any` in committed code except narrowly-scoped, commented adapter shims for third-party libs.

---

## 4. FROZEN-MODULE DISCIPLINE

The four files `src/types/{content,engine,components,tokens}.ts` are the **merge seam**. Paste §10 and §11 into them **byte-for-byte**. Do not rename a field, change an enum value, add a required field, or reorder a union. If you discover you need a new field, you do not have the authority — stop and surface it as a `[CONTRACT-CHANGE-REQUEST]` comment in your final report instead of editing. The DESIGN prompt imports these exact files; any drift breaks the merge.

**Because the frozen interfaces are immovable, the three reconciliations (credMode-as-variant, search side-table, default-seeding) live ENTIRELY in non-frozen code (engine wrappers, stores, build script, gates) and ADD ZERO fields to the frozen modules.** Do not be tempted to "fix" a frozen interface to make these cleaner — the side table, the seeding, and the variant lookup are all external.

Add one file header to each frozen module:
```ts
// FROZEN MERGE SEAM — single source of truth. DESIGN imports, never edits. Do not modify field names/enums.
```

---

## 5. TEMPLATING ENGINE — `src/engine/template.ts` (build first; everything depends on it)

Implement `TemplateEngine` exactly to the contract in §10/§2-of-contract. Frozen token grammar and regex:

```
{{VAR}}  |  {{VAR:198.51.100.10}} (inline fallback)  |  {{VAR|quote}} (filter)
/\{\{\s*([A-Z0-9_]+)(?::([^}|]*))?(?:\|\s*(\w+))?\s*\}\}/g
```

Behavior (FROZEN, enforced by tests):
- `parse(template)` → `TemplateAST { template, tokens: ParsedToken[], varNames }`.
- `detectVars(template)` → unique UPPER_SNAKE names in source order.
- `render(t, { values, defs, mode })`:
  - **filled**: each token resolves to **`values[name] ?? fallback ?? defs[name].placeholder`** (FROZEN chain — do NOT insert `default` here; see §5.2). If it falls through to the placeholder (unset), set `allResolved=false`. Apply filters to the resolved value. NEVER emit a blank, NEVER guess, NEVER emit a real host.
  - **raw**: the template verbatim (no substitution).
  - **display**: emit `RenderSpan[]` (`text`/`var` with `state: 'set'|'unset'|'invalid'`) for per-token UI styling; `state='invalid'` when the value fails `defs[name].validation`.
  - `affectedVars = command.requiresVars ?? detectVars(template)`.
  - Compute `missing`, `invalid`, `allResolved = missing.length===0` (see §5.2 for the exact `missing` definition).
- The engine is **framework-free** and is **imported by the build-time validator** so authoring and runtime share one parser. No React, no DOM.

### 5.1 `credMode` is variant-selection, NOT template transformation (FROZEN-engine-faithful)

The FROZEN token grammar has exactly three forms (`{{VAR}}`, inline fallback, single filter). **It has NO conditionals.** A single template string therefore *cannot* conditionally emit three different auth segments, and you MUST NOT pretend it can. The AD "switch the auth segment from one card" capability is implemented as **variant selection**, fully within the frozen interfaces:

- A `credMode`-bearing AD `Command` (e.g. an impacket/netexec lateral-movement command) sets `Command.credMode` (marks that the card shows the switch) AND supplies a `CommandVariant` for **each** of the three `CredMode` values — `'password'`, `'nthash'`, `'kerberos'` — each variant carrying its own `template` and `credMode` tag:
  - `password` → `{{USER}}:{{PASS}}` auth segment.
  - `nthash` → impacket `-hashes :{{NTHASH}}` (note the **leading colon** = empty LM half; correct, not a typo).
  - `kerberos` → `-k -no-pass` (and the card's notes mention `KRB5CCNAME`/clock-skew where relevant).
- **`onSetCredMode(id, mode)`** = the credMode axis. It selects the `CommandVariant` whose `credMode === mode`; the store records the active variant id for that command; the engine then renders **that variant's `template`** (plain `render` over the selected template — no conditional logic in the engine). The card never transforms one string into three.
- **`onSelectVariant(id, variantId)`** = the general (non-auth) variant axis — e.g. tool alternative or syntax flavor variants that are NOT a credMode switch. The two callbacks are distinct on purpose: `onSetCredMode` is the typed three-way auth switch (maps mode→the variant tagged with that `credMode`); `onSelectVariant` is the open-ended chooser for any other variant. When a command's only variants are its three credMode variants, the card renders the credMode switch and does not show a separate variant chooser.
- **Build gate (Gate 7, §14):** any `Command` with `credMode` set MUST have a `variants[]` that includes a variant tagged `credMode:'password'`, one `credMode:'nthash'`, and one `credMode:'kerberos'`. Missing any of the three → **FAIL**. (Authoring rule: you write the three real templates; the app never fabricates an auth segment.)

The CommandCard prose elsewhere in this brief that says "re-renders its auth segment" means **re-renders by swapping to the matching variant's template**, never by conditional string surgery.

### 5.2 `default` vs `placeholder` — resolved by SEEDING (FROZEN filled-chain untouched)

The FROZEN filled chain is `values[name] ?? fallback ?? defs[name].placeholder` and **cannot change** (it is in the frozen contract). `VariableDef.default` is therefore consumed **outside** the engine, by **seeding every defined `default` into the `values` map at store init** (§8.1). Consequences, stated precisely:

- A var that has a `default` but no user value is **already present in `values`** (seeded), so the frozen chain resolves it to the real default — it is **not** missing and contributes nothing to `allResolved=false`.
- A var with **no** `default` and **no** user value is absent from `values`, so the frozen chain falls through to `placeholder`, sets `allResolved=false`, and the var is **missing**.
- **`missing` = a token whose name is absent from `values` (no seeded default, no user value) and has no inline fallback.** There is no separate "no default" clause — defaults are already in `values` by the time `render` runs. This removes the prior contradiction where a defaulted var could be "not missing" yet render a defang placeholder. With seeding, a defaulted var renders its real default; only true placeholders ever appear in a non-`allResolved` filled string, and **copy-filled stays gated on `allResolved && invalid.length===0`** so a `<placeholder>`-containing string can never be copied as "filled".
- The engine never reads `defs[name].default`. Only the store-init seeding does. This keeps the validator (which imports the same engine) identical to runtime.

**Variable Registry disambiguation (placeholder vs default — authoritative columns).** The FROZEN §10-§4 registry uses a one-slot shorthand; the table below is the normative expansion every `VariableDef` MUST follow. `placeholder` is ALWAYS an inert non-routable token (Gate 6 shape); `default` is a real seeded value and is supplied for ONLY the few vars below that have a safe, non-sensitive convention:

| Var | group | placeholder (inert, always) | default (seeded; else undefined) | sensitive |
|---|---|---|---|---|
| LHOST | network | `<tun0-ip>` | — | no |
| LPORT | network | `<lport>` | `4444` | no |
| RHOST | target | `<target-ip>` | — | no |
| RPORT | target | `<rport>` | — | no |
| TARGET | target | `<target-ip>` | — | no |
| INTERFACE | network | `<interface>` | `tun0` | no |
| URL | web | `http://<target-ip>` | — | no |
| WORDLIST | files | `<rockyou.txt>` | — | no |
| DOMAIN | ad | `<domain.local>` | — | no |
| DC_IP | ad | `<dc-ip>` | — | no |
| USER | auth | `<user>` | — | no |
| PASS | auth | `<password>` | — | **yes** |
| NTHASH | auth | `<nthash>` | — | **yes** |
| AESKEY | auth | `<aeskey>` | — | **yes** |
| SPN | ad | `<service/host:port>` | — | no |
| SHARE | files | `<share>` | — | no |

Only `LPORT=4444` and `INTERFACE=tun0` carry real defaults (seeded). Every other primary var is placeholder-only (default undefined). Sensitive vars NEVER carry a default and are NEVER seeded/persisted. Secondary/derived vars (§10-§4) are placeholder-only inert tokens. This table is the input to Gate 6 (placeholder shape) and to the §8.1 seeding step.

### 5.3 Filters — `quote` is BASH-ONLY (engine has no shell context)

The FROZEN `RenderOptions` is `{ values, defs, mode }` — it carries **no shell**, so the engine cannot vary quoting per shell. Therefore:

- `quote` performs **bash/POSIX single-quote escaping only** (`'` → `'\''`, wrap in single quotes). It is documented and tested as **bash-only**.
- `upper`/`lower` = case transforms. `urlencode` = `encodeURIComponent`. `b64` = base64 (UTF-8 → standard base64).
- **Authoring rule (enforced by review, surfaced in Gate 2 lint note):** for any `Command`/`CommandVariant` whose `shell` is `powershell`, `cmd`, or `sql`, authors MUST hand-quote inside the template and MUST NOT rely on `{{VAR|quote}}` (PowerShell backtick/`'`-doubling, cmd `^`-escaping, and SQL quoting differ from bash and the engine will produce wrong escaping). The `quote` filter is reserved for `shell: 'bash'` (the default). The build step warns if `|quote` appears in a non-bash template.

Validation kinds (`VariableValidation.kind`) to implement: `ip` (IPv4 dotted), `ipv6`, `port` (1–65535), `domain`, `fqdn`, `hash-ntlm` (32 hex), `hash-aes` (64 hex), `path`, `url`, `spn` (`service/host[:port]`), `string` (any). Validation is non-blocking: invalid → token rendered in `--cph-var-invalid` state, copy-filled disabled, but **copy-raw is always enabled**.

**GREEN-GATE 5:** `pnpm vitest run src/engine/template` — exhaustive tests pass: each grammar form, each filter, each render mode, unset→placeholder→`allResolved=false`, **seeded-default→resolved→not-missing**, invalid→`display` invalid state, fallback precedence (`value > fallback > placeholder`, with `default` proven to act via seeding not via the chain), `quote` proven bash-escaping, idempotent `raw`. ≥95% line coverage on `template.ts`.

---

## 6. CONTENT PIPELINE — `scripts/build-content.ts`

Authoring format: typed YAML front-loaded entities + a markdown `body` per Technique under `content/<pack>/<os>/<section>/`. The build step:

1. **Zod schemas in lockstep with §10.** Define `zod` schemas that mirror every frozen interface exactly (same field names, same enums). A unit test asserts schema↔type parity (compile-time `satisfies` + runtime sample). If a type changes (it won't — it's frozen), the schema must change in lockstep or the build fails.
2. **Load + validate** every entity. Any Zod failure = hard fail with file+path+reason.
3. **Cross-link integrity:** every `commands[]`, `relatedIds[]`, `abuseTechniqueId`, `techniqueId`, `parent/children`, `references[]` must resolve to an existing id. Dangling FK = fail.
4. **Var-registry integrity:** for every Command, `affectedVars = requiresVars ?? detectVars(template)` (and the same for every `variants[].template` and every `BloodHoundQuery.cypher`); every detected/declared var MUST exist in the Variable Registry (§10-§4, expanded in §5.2). Unknown var = fail.
5. **Default seeding source:** emit the canonical `VariableDef[]` (with the §5.2 placeholder/default columns) into the OSCP bundle so the store can seed `default`s at init. The build asserts every primary var's `placeholder` passes the Gate 6 inert-shape check and that only the two whitelisted vars carry a `default`.
6. **credMode variant completeness:** for every `Command` with `credMode` set, assert `variants[]` covers all three `CredMode` values (Gate 7). Fail otherwise — the app must never synthesize an auth segment.
7. **Emit** static artifacts (no runtime markdown parsing):
   - `public/content/<pack>.json` (a `ContentBundle`),
   - `public/content/search-index.json` (serialized MiniSearch),
   - **`public/content/search-side.json`** — the **search side table** (§7.1): `Record<Id, { confidence: Confidence; phaseOrder: number; techniqueId?: Id }>` for every `SearchDoc.id`. For a `command` doc, `techniqueId` is its owning technique (the technique whose `commands[]` contains it); for a `technique` doc it is its own id; `phaseOrder` is the canonical Phase index (§7). This is how the FROZEN tiebreak and node-highlighting become computable without editing `SearchDoc`/`SearchHit`.
   - `public/content/mindmaps.json`.
   - Markdown bodies are pre-rendered to sanitized HTML at build time (prefer pre-render to keep bundle lean and offline).
8. **Emit** `coverage-heatmap.json` (per-OS × per-phase counts; orphan report).

OSCP pack is `enabledByDefault:true`. OSWE/OSEP packs build into **separate** `public/content/oswe.json` / `osep.json` + their own search docs **and their own `search-side` fragments**, lazy-loaded; the loader merges enabled packs additively and the pack toggle filters BOTH content and the search index (and merges side-table fragments).

**GREEN-GATE 6:** `pnpm build:content` exits 0 and produces all JSON artifacts **including `search-side.json`**; `pnpm test:content-parity` (schema↔type) passes; zero dangling FKs; zero unknown vars; every credMode command has all three variants; every primary placeholder passes inert-shape.

---

## 7. SEARCH — `src/engine/search.ts` (MiniSearch wrapper)

- Build the index at compile time in `build-content.ts`, **serialize** it, ship as static JSON. At boot, `SearchEngine.load(serialized)` — instant, no network, no re-index.
- Index `SearchDoc` fields (§10-§3): `id,type,title,body,template,tags,os,phase,ports,services,tool,packs`.
- **Frozen ranking** (do not tune): field boosts `title^6, tool^5, tags^4, services^3, ports^3, template^2, body^1`; MiniSearch opts `fuzzy:0.2, prefix:true`. A purely-numeric query (e.g. `445`) boosts docs whose `ports[]` contains that number (exact-port wins). `verified > unverified` on score ties. Final tiebreak: canonical Phase order, then alpha by title.
- `search()` returns `SearchHit[]` with `matchedFields` and `highlights` (char ranges) so the palette can render type-grouped results (Service/Port · Technique · BloodHound · MindMap node · Tag). Per-keystroke cost target **<16ms**; never visibly debounced.

### 7.1 SEARCH SIDE TABLE — how the FROZEN tiebreak + node-highlight are made computable

The FROZEN `SearchDoc` and `SearchHit` carry **no `confidence` and no `techniqueId`**, yet the FROZEN ranking demands a `verified > unverified` tiebreak and the product demands command-hit → mindmap-node highlighting. These cannot be satisfied from the frozen docs alone, and the frozen interfaces **must not be edited**. They are made computable by a **build-time side table** loaded by the `SearchEngine` wrapper alongside the serialized index:

- File: `public/content/search-side.json`, type `Record<Id, { confidence: Confidence; phaseOrder: number; techniqueId?: Id }>` (emitted by §6 step 7).
- The wrapper's `load(serialized)` ALSO loads the side table (the wrapper accepts an object that includes both, or loads the sibling file). The frozen `SearchEngine.load` signature (`serialized: string | object`) is honored — pass an object `{ index, side }` or load `search-side.json` adjacently; either way no interface changes.
- **Tiebreak (deterministic):** when two `SearchHit`s have equal MiniSearch score, compare `side[id].confidence` (`verified` before `unverified`), then `side[id].phaseOrder` (canonical Phase index), then alpha by title. This is the only way the frozen "verified > unverified on ties" becomes reproducible — Gate 13b asserts it.
- **Node highlighting:** a `command` or `technique` hit resolves `side[id].techniqueId`, which the store maps to the MindMap node carrying that `techniqueId` (§8) to drive the root→node highlight. No command→technique back-reference exists on the frozen doc; the side table supplies it.
- The side table is built FROM the content (technique `commands[]` ownership, each item's `confidence`, the Phase order), so it can never drift from the bundle; the build fails if any `SearchDoc.id` lacks a side entry.

Canonical Phase order (the `phaseOrder` index, FROZEN): `recon, enumeration, web, initial-access, exploitation, foothold, privilege-escalation, lateral-movement, credential-access, persistence, post-exploitation, pivoting, exfiltration, cleanup`.

**GREEN-GATE 7:** `pnpm vitest run src/engine/search` — typing `445` surfaces the SMB cluster first; exact service > tag > title > body ordering holds; **`verified` beats `unverified` on a forced score tie via the side table**; numeric-port boost verified; every indexed `id` has a `search-side.json` entry; a command hit resolves a `techniqueId` for node highlight.

---

## 8. APP LAYER

### 8.1 Stores (Zustand)
- `variables`: `values: Record<string,string>`, `validity: Record<string,boolean>`, actions `onChange/onReset/onClearSensitive`. **At store init, SEED every `VariableDef.default` into `values`** (§5.2) — this is the sole consumer of `default`, leaving the frozen filled chain untouched. Per §5.2 only `LPORT=4444` and `INTERFACE=tun0` seed real values; sensitive vars are never seeded. **Persist to localStorage** via `persist`, with a `partialize` that **EXCLUDES** any `sensitive` var (`PASS/NTHASH/AESKEY` and any def with `sensitive:true`). Sensitive vars are session-only + masked input. `onReset(undefined)` resets all to the seeded defaults (not to blank); `onReset(id)` resets one. Provide "clear sensitive". Live re-render is driven by store subscription; debounce re-render ~50ms (feels instant).
- `theme`: current `os: OS`; setting it flips `document.documentElement.dataset.os` — **no remount, no flash**. Code only ever reads `var(--cph-*)`; it never hardcodes a color.
- `search`: query, hits, open/closed, selected hit, octoState derivation, the loaded search **side table**, and the bi-directional MindMap selection link (hit → `side[id].techniqueId` → node).
- `packs`: enabled `PackId[]` (oscp default on); toggling lazy-loads the pack bundle + merges search docs + **side-table fragments** and filters content.

### 8.2 Theming MECHANISM (consume tokens; never define values)
One component tree. Theme = swapped design-token set keyed by `data-os` over CSS custom properties. `styles/theme.base.css` declares `:root { --cph-*: … }`; `theme.{linux,windows,ad}.css` override the SAME keys under `[data-os="linux|windows|ad"]`. **DESIGN owns the VALUES; you own the KEYS (§11) and only emit `var(--cph-…)`.** Until design lands, ship neutral placeholder values for every key so the app runs; mark the file `/* DESIGN OVERRIDES VALUES — placeholders only */`. `prefers-reduced-motion` collapses `--cph-motion-*`.

### 8.3 Components (controlled/presentational — render-state in, raw events out; props are §10-§6 verbatim)
- **VariableBar** (`VariableBarProps`): sticky global editor grouped by `VarGroup`. Inline non-blocking validation. Sensitive fields masked. Reset(one/all) + clear-sensitive. Hosts a **ResponsibleUseNote**.
- **CommandCard** (`CommandCardProps`): GTFOBins/LOLBAS anatomy — heading + abuse/tool chips + one-line intent + tight code block with inline `{{VAR}}` highlighting (from `render.spans`) + "uses LHOST, LPORT" chips (from `affectedVars`) + **Copy filled** (primary, gated on `render.allResolved && render.invalid.length===0`) + **Copy raw** (always enabled) + optional transform menu (base64/urlencode/PS `-EncodedCommand`) with raw always available + `[UNVERIFIED]` badge when `confidence==='unverified'` + Sources affordance. **credMode switch** on AD cards is **variant-selection** (§5.1): the `CredModeSwitch` calls `onSetCredMode(id, mode)`, which selects the matching `CommandVariant` (`password` → `{{USER}}:{{PASS}}`, `nthash` → `-hashes :{{NTHASH}}` with leading colon, `kerberos` → `-k -no-pass`+`KRB5CCNAME` note); the engine then renders **that variant's template**. The card NEVER conditionally rewrites one string into three. `onSelectVariant` handles any non-credMode variant axis. Copy success announced via `aria-live` + checkmark/toast (never animation-only); micro-flash resolves highlights to literal values for a beat. **Never block copy on a missing var — copy-raw always works; copy-filled simply disables with a reason.** Hosts a **ResponsibleUseNote**.
- **CredModeSwitch** (`src/components/CredModeSwitch.tsx`): the three-way `password|nthash|kerberos` segmented control rendered when `Command.credMode` is set; emits `onSetCredMode`. Pure presentational; reads the active mode from props.
- **SearchPalette** (`SearchPaletteProps`): cmdk-style `Cmd/Ctrl-K` + always-visible top bar, same in-memory index. Type-grouped results, full keyboard (arrows, Enter open, `Cmd-Enter` copy-filled top hit, Esc close). Drives `octoState`. Uses the side table to resolve a hit's `techniqueId` for node highlight on select.
- **MindMap** (`MindMapProps`): `@xyflow/react`, one per phase per OS, deterministic top-down dagre/elk layout (recon top → privesc/DA bottom). Collapse/expand subtrees (default current phase only). Minimap + zoom-to-fit + pan. Selecting a node highlights root→node path, dims the rest. **Node→command deep-link** (the killer feature): clicking a node with `techniqueId` filters/jumps the command view via a deep-linkable route. AD root branch keyed on the single decision "Have valid creds?". Nodes colored by phase via `--cph-node-*`, heat via `Severity`. `prefers-reduced-motion` → instant snaps, no layout animation. Keyboard-reachable + labeled nodes. Hosts a **ResponsibleUseNote**.
- **OctopusMascot** (`OctopusMascotProps`): Rive state machine, **lazy-loaded** so first paint/search/copy never block on it; `aria-hidden`; never the sole state signal. Inline SVG/CSS fallback for reduced-motion/no-JS. Renders exactly the `OctoState` union — `idle/greeting/listening/thinking/found/empty/copied/error/celebrate` (intensity from hit count). Emits only `onClick`.
- **ResponsibleUseNote**: persistent, unobtrusive, **non-dismissible** (NO close/dismiss control in the DOM) on every hands-on surface (CommandCards, VariableBar, MindMap): "Authorized testing only — learner-owned labs, HackTheBox/Proving-Grounds, the exam." Mounted by each hands-on surface above; Gate 13d asserts its presence and the absence of any dismiss affordance.
- **SourcesPopover**: renders `references[]` from `src/data/references.ts` with source-priority ordering + archive fallback URL.

### 8.4 Routes / deep-links (TanStack Router)
Typed routes: `/:os` (realm), `/:os/:sectionId`, `/:os/technique/:techniqueId`, `/:os/mindmap/:phase?node=:nodeId`, `/bloodhound`, `/cross-cutting/:topic`. Selecting a mindmap node updates the URL; opening that URL re-selects the node + filters commands. Search hits resolve to these routes (using the side table's `techniqueId` for command hits).

### 8.5 Keyboard map (`src/app/keymap.ts`)
`Cmd/Ctrl-K` search · `/` focus search · `c` copy-filled focused card · `r` copy-raw focused card · arrows nav palette/mindmap · `?` shortcut cheat-sheet · Esc close. Visible focus rings, all targets ≥24px.

### 8.6 PWA / offline / local-first
`vite-plugin-pwa`/Workbox precaches the static shell + `public/content/*.json` (incl. `search-index.json`, `search-side.json`, `mindmaps.json`) + mascot for **full offline + installable**. No runtime network, no telemetry. Variables in localStorage only (sensitive excluded). Deployable to any CDN / GitHub Pages (set `base` correctly).

**GREEN-GATE 8:** `pnpm build && pnpm preview` serves; offline mode (devtools "Offline") still searches, interpolates, copies, switches realm, flips credMode (variant swap), and opens a mindmap node→command path. No network requests after first load.

---

## 9. CONTENT AUTHORING (against the COVERAGE CHECKLIST; superset of viperone/HackTricks/TJnull/Section-18)

Author the full tree provided in the coverage checklist for three realms (**Linux / Windows / Active Directory**) plus the **Cross-Cutting** realm and the **BloodHound** section. Use the fixed **PHASE SPINE** with stable Section ids so theming/mindmaps bind to them: `P0 Methodology` · `P1 Recon` · `P2 Port/Service Enum (port = first-class facet)` · `P3 Web` · `P4 Initial Access/Exploitation` · `P5 Foothold & Shells` · `P6 PrivEsc` · `P7 Post-Ex/Cred Access` · `P8 Persistence` · `P9 Pivoting/Lateral` · `P10 (AD) Enum→PrivEsc→Lateral→Persistence→Trusts`.

Authoring rules:
- Every leaf is a **Technique** holding **ordered CommandCards** (= step-by-step). Each Command stores **only canonical, real tool syntax** with `{{TOKENS}}` from the registry. Variables consumed match the checklist's `vars:` notes.
- **Port pointer leaves** (Linux 88/389/445/636/3268/5985/5986) cross-link into the AD realm via `relatedIds` — never duplicate AD content.
- **credMode** is set on AD lateral/cred cards; per §5.1 EACH such command MUST ship all three `CommandVariant`s (`password`/`nthash`/`kerberos`) with real templates. There is NO conditional template — the switch swaps variants.
- For any **non-bash** Command/Variant (`shell: powershell|cmd|sql`), hand-quote in the template; do NOT use `{{VAR|quote}}` (§5.3).
- `archetypeBand` ∈ `core|high|medium|low` per checklist `[CORE/HIGH/MED/LOW]`. Mark `requiredForOscpReadiness:true` on CORE-band exam-critical leaves.
- **Anti-fabrication is structural:** anything version/CVE/offset/CLSID/ESC-prereq-gated (kernel/sudo/polkit/PwnKit/SambaCry/EternalBlue, Potato CLSIDs, ADCS ESC template prereqs, BH-CE schema, NoPac/Certifried/PrintNightmare, BOF offsets) is `confidence:'unverified'` with ≥1 `references[]` and renders the literal `[UNVERIFIED]` badge. **Never invent** a CVE number, flag, offset, gadget address, CLSID, or version.
- **Weaponization discipline:** Web vulns, UAC bypass, AMSI/AV evasion, BOF are **methodology + canonical tool syntax only** — never a turnkey weaponized exploit or working bypass string.
- **No machine names. Anywhere.** Not in content, comments, filenames, ids, or commits. The data model has no field for machine identity. Coverage is expressed only as abstract technique IDs + archetype bands in `coverage.manifest.yaml`.

### 9.1 BloodHound section (first-class)
Two legs: **collection** (`bloodhound-python` remote / `SharpHound` on-host) and **analysis** (neo4j + GUI + cypher). Ship:
1. A parameterized **cypher query library** (`{{DOMAIN}}`-tokenized; engine interpolates): owned→DA shortest path, kerberoastable, AS-REP-roastable, unconstrained-delegation hosts, AdminTo-from-owned, dangerous outbound ACLs, DCSync-capable principals, high-value sessions, RBCD-writable, mark-owned.
2. An **edge→abuse→command table** as first-class `BloodHoundQuery` records covering the full edge vocabulary (MemberOf, AdminTo, HasSession, GenericAll/GenericWrite, WriteDacl, WriteOwner, Owns, ForceChangePassword, AddMember, AllowedToDelegate, AllowedToAct/RBCD, CanRDP, CanPSRemote, ExecuteDCOM, SQLAdmin, AddKeyCredentialLink, DCSync/GetChanges/GetChangesAll, ReadLAPSPassword, ReadGMSAPassword, HasSIDHistory, GPLink). Each edge links abuse to an already-authored P10 technique via `abuseTechniqueId` (no command duplication). BH legacy vs CE schema divergence flagged `legacyUI` + `[UNVERIFIED]`.

### 9.2 Mindmaps
One `MindMap` per phase per OS. AD root branch keyed on "Have valid creds?" so nodes map 1:1 to filtered command sets. Nodes carry `techniqueId`/`sectionId` for deep-link (and feed the search side table's `techniqueId` resolution). Colored by phase via `--cph-node-*`, heat via `Severity`. Short edge labels ("creds found"/"no creds").

### 9.3 Citations
Maintain `src/data/references.ts` as a typed, deduped `Reference[]` with the source-priority ladder: official tool docs > NVD/MITRE for CVEs > RFC for protocols > GTFOBins/LOLBAS for binary abuse > HackTricks/PayloadsAllTheThings/AD-cheatsheet (secondary) > TJnull (syllabus framing). Include `archiveUrl` (web.archive.org) fallbacks.

**GREEN-GATE 9:** every Section-18 item (Enum, NTLM, Kerberos, PtH/OtH/PtT/DCOM, Kerberoast/Golden/Silver/DCSync, Impacket/Rubeus/Kerbrute/CrackMapExec-netexec/BloodHound) maps to ≥1 leaf (zero gaps in `canon-map.yaml`); every `requiredForOscpReadiness:true` leaf resolves to ≥1 compiling command node; every credMode command carries all three variants.

---

## 10. FROZEN SHARED CONTRACT (paste verbatim into the named files)

> Reproduce the entire block below byte-for-byte. `§1 → src/types/content.ts`, `§2 & §3 → src/types/engine.ts`, `§6 → src/types/components.ts`. The glossary (§0), variable registry (§4), and ranking are normative.

### §0 PRODUCT NAME + GLOSSARY (use these EXACT words)
- **Cephalo** — the app. **Octo** — the mascot persona. **Command** — a single copy-paste template (canonical tool syntax with `{{TOKENS}}`). **CommandCard** — the rendered, live-interpolated command surface. **Technique / Vector** — a step-by-step grouping of Commands (a tree node). **Section / Phase** — kill-chain navigational grouping. **Variable** — a `{{TOKEN}}` input (UPPER_SNAKE). **VariableBar** — the sticky global variable editor (RevShells loop). **SearchPalette** — the Cmd/Ctrl-K summon bar. **MindMap** — interactive @xyflow decision tree. **OctopusMascot** — the live Rive mascot. **token** — `{{UPPER_SNAKE}}`. **placeholder** — defang display when unset (`<tun0-ip>`). **filled / raw** — the two copy actions (`'filled' | 'raw'`, never "full"/"template"). **display** — the third render mode (spans for per-token UI state). **heat / severity** — the SHARED 5-step `Severity` scale (Command danger AND MindMap node heat — no parallel enum). **confidence** — `'verified' | 'unverified'`; unverified surfaces as the literal **`[UNVERIFIED]`** badge. **credMode** — `'password' | 'nthash' | 'kerberos'`. **Pack** — an OSCP/OSWE/OSEP content set. **OS / realm** — exactly `'linux' | 'windows' | 'ad'` (never `activedirectory`/`active-directory`). Theme attr `data-os`. Token prefix `--cph-`.

### §1 — `src/types/content.ts`
```ts
// ============================================================
// src/types/content.ts  —  FROZEN. DESIGN imports, never edits.
// ============================================================
export type OS = 'linux' | 'windows' | 'ad';
export type PackId = 'oscp' | 'oswe' | 'osep' | (string & {});
export type Id = string;     // dotted slug: 'ad.kerberoast.rubeus'
export type RefId = string;

export type Phase =
  | 'recon' | 'enumeration' | 'web' | 'initial-access' | 'exploitation'
  | 'foothold' | 'privilege-escalation' | 'lateral-movement' | 'credential-access'
  | 'persistence' | 'post-exploitation' | 'pivoting' | 'exfiltration' | 'cleanup';

export type Confidence = 'verified' | 'unverified';
export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type Shell = 'bash' | 'powershell' | 'cmd' | 'sql' | 'text';
export type CredMode = 'password' | 'nthash' | 'kerberos';
export type ArchetypeBand = 'core' | 'high' | 'medium' | 'low';

export type VarGroup = 'network' | 'target' | 'auth' | 'ad' | 'web' | 'files' | 'misc';

export interface VariableValidation {
  kind: 'ip' | 'ipv6' | 'port' | 'domain' | 'fqdn'
      | 'hash-ntlm' | 'hash-aes' | 'path' | 'url' | 'spn' | 'string';
  pattern?: string; min?: number; max?: number; message?: string;
}
export interface VariableDef {
  id: string;             // UPPER_SNAKE token: 'LHOST'
  label: string;          // 'Attacker IP (tun0)'
  group: VarGroup;
  placeholder: string;    // DEFANG token when unset: '<tun0-ip>'
  default?: string;       // optional non-routable default (RFC5737/3849); usually undefined
  example: string;        // '198.51.100.10' (TEST-NET; never a real host)
  validation?: VariableValidation;
  description?: string;
  sensitive?: boolean;    // PASS/NTHASH/AESKEY -> masked, NOT persisted
  aliases?: string[];     // ['ATTACKER_IP']
}

export interface CommandVariant {
  id: Id; label: string;  // 'PtH (nthash)'
  template: string; shell?: Shell; os?: OS[];
  credMode?: CredMode;    // marks which auth rendering this variant is
}
export interface Command {
  id: Id;
  title: string;
  template: string;       // raw with {{TOKENS}} — canonical tool syntax only
  shell?: Shell;          // default 'bash'
  description?: string;
  notes?: string[];       // gotchas (e.g. lockout policy, signing, clock skew)
  tool?: string;          // 'rubeus','impacket','netexec'
  requiresVars?: string[];// explicit; if omitted, engine auto-detects from template
  os: OS[];
  phase?: Phase;
  tags?: string[];
  confidence: Confidence; // 'unverified' MUST carry references
  references?: RefId[];
  danger?: Severity;      // destructiveness / OPSEC noise
  credMode?: CredMode;    // if set, card exposes the password|nthash|kerberos switch
  variants?: CommandVariant[];
  packs: PackId[];
}

export interface Technique {
  id: Id; title: string;
  os: OS[]; phase: Phase;
  summary: string;        // one-liner (cards + search)
  body?: string;          // markdown PROSE (original synthesis, never copied verbatim)
  commands: Id[];         // ordered = step-by-step
  prerequisites?: string[];
  tags: string[];
  ports?: number[];       // first-class searchable facet
  services?: string[];    // 'smb','ldap','http'
  mitre?: string[];       // verified only
  archetypeBand?: ArchetypeBand;
  requiredForOscpReadiness?: boolean;
  references: RefId[];
  confidence: Confidence;
  packs: PackId[];
  relatedIds?: Id[];      // cross-links (e.g. Linux 445 -> AD lens)
  parent?: Id; children?: Id[];
}

export interface Section {
  id: Id; title: string;
  os: OS; phase?: Phase; order: number;
  description?: string;
  techniques: Id[];
  parent?: Id; children?: Id[];
  packs: PackId[];
}

export interface Tag {
  id: string; label: string;
  os?: OS[];
  category?: 'service' | 'protocol' | 'tool' | 'phase' | 'concept' | 'port' | 'vuln-class';
  colorTokenKey?: string; // references a --cph- KEY; design owns the VALUE
}

export interface MindMapNode {
  id: string; label: string;
  kind: 'phase' | 'decision' | 'technique' | 'outcome' | 'note';
  techniqueId?: Id; sectionId?: Id;
  os?: OS; severity?: Severity;
  position?: { x: number; y: number };
  data?: Record<string, unknown>;
}
export interface MindMapEdge {
  id: string; source: string; target: string;
  label?: string;                 // 'if creds found' / 'no creds'
  kind?: 'then' | 'or' | 'requires' | 'escalates';
}
export interface MindMap {
  id: Id; title: string; os: OS; phase?: Phase;
  nodes: MindMapNode[]; edges: MindMapEdge[];
  layout?: 'dagre' | 'tree' | 'manual';
  packs: PackId[];
}

export interface BloodHoundQuery {
  id: Id; title: string;
  cypher: string;         // may contain {{DOMAIN}} tokens (engine interpolates)
  category: 'enumeration' | 'attack-path' | 'edge-abuse' | 'recon' | 'cleanup';
  edge?: string;          // 'GenericAll' | 'WriteDacl' | 'DCSync' | 'AddKeyCredentialLink' ...
  description: string;    // original prose
  abuse?: string;         // how to abuse (prose)
  abuseTechniqueId?: Id;  // FK to the weaponizing technique (no command duplication)
  legacyUI?: boolean;     // BH legacy vs BH CE schema divergence -> render [UNVERIFIED] note
  references: RefId[];
  confidence: Confidence;
  tags?: string[];
}

export interface Reference {
  id: RefId; title: string; url?: string;
  source: 'official-tool-docs' | 'hacktricks' | 'payloadsallthethings' | 'gtfobins'
        | 'lolbas' | 'ad-cheatsheet' | 'tjnull' | 'viperone' | 'microsoft'
        | 'mitre' | 'cve-nvd' | 'rfc' | 'vendor-advisory' | 'exploitdb' | 'other';
  author?: string; note?: string;
  archiveUrl?: string;    // web.archive.org link-rot fallback
  retrieved?: string;     // ISO date
}

export interface Pack {
  id: PackId; label: string; description: string;
  enabledByDefault: boolean; os: OS[]; version?: string;
}

export interface ContentBundle {
  schemaVersion: number; generatedAt: string;
  packs: Pack[];
  variables: VariableDef[];
  tags: Tag[];
  sections: Section[];
  techniques: Technique[];
  commands: Command[];
  mindmaps: MindMap[];
  bloodhound: BloodHoundQuery[];
  references: Reference[];
}
```

### §2 — `src/types/engine.ts` (templating)
Token grammar (FROZEN): `{{VAR}}`, inline fallback `{{VAR:198.51.100.10}}`, filter `{{VAR|quote}}`. Names UPPER_SNAKE.
Regex: `/\{\{\s*([A-Z0-9_]+)(?::([^}|]*))?(?:\|\s*(\w+))?\s*\}\}/g`
```ts
export type TokenFilter = 'quote' | 'upper' | 'lower' | 'urlencode' | 'b64';
export interface ParsedToken { raw: string; name: string; start: number; end: number; fallback?: string; filter?: TokenFilter; }
export interface TemplateAST { template: string; tokens: ParsedToken[]; varNames: string[]; }
export type RenderMode = 'filled' | 'raw' | 'display';
export interface RenderOptions { values: Record<string,string>; defs: Record<string,VariableDef>; mode: RenderMode; }
export interface RenderSpan { type: 'text' | 'var'; text: string; varName?: string; state?: 'set' | 'unset' | 'invalid'; }
export interface RenderResult {
  spans: RenderSpan[]; filled: string; raw: string;
  missing: string[]; invalid: string[]; allResolved: boolean;
}
export interface TemplateEngine {
  parse(template: string): TemplateAST;
  detectVars(template: string): string[];
  render(t: string | TemplateAST, o: RenderOptions): RenderResult;
}
```
Behavior (FROZEN): **filled** = `values[name] ?? fallback ?? defs[name].placeholder`; unset falls back to the DEFANG placeholder and sets `allResolved=false` (never blank, never a real host). **raw** = template verbatim. **display** = spans with set/unset/invalid state. `affectedVars = requiresVars ?? detectVars(template)`. Pure framework-free TS, reused by the build-time validator.

### §3 — `src/types/engine.ts` (search + mindmap render)
```ts
export interface SearchDoc {
  id: Id; type: 'command' | 'technique' | 'section' | 'bloodhound' | 'tag';
  title: string; body: string; template?: string;
  tags: string[]; os: OS[]; phase?: Phase;
  ports: number[]; services: string[]; tool?: string; packs: PackId[];
}
export interface SearchFilters { os?: OS[]; phase?: Phase[]; type?: SearchDoc['type'][]; packs?: PackId[]; }
export interface SearchOptions { query: string; filters?: SearchFilters; limit?: number; }
export interface SearchHit { id: Id; type: SearchDoc['type']; score: number; matchedFields: string[]; highlights?: Record<string, Array<[number,number]>>; }
export interface SearchEngine { load(serialized: string | object): void; search(o: SearchOptions): SearchHit[]; }

export interface MindMapRenderNode { id: string; label: string; kind: MindMapNode['kind']; severity?: Severity; os?: OS; selected?: boolean; dimmed?: boolean; position?: {x:number;y:number}; techniqueId?: Id; sectionId?: Id; }
export interface MindMapRenderEdge { id: string; source: string; target: string; label?: string; kind?: MindMapEdge['kind']; }
export interface MindMapRenderModel { nodes: MindMapRenderNode[]; edges: MindMapRenderEdge[]; layout: 'dagre' | 'tree' | 'manual'; }
```
Ranking (FROZEN): field boosts `title^6, tool^5, tags^4, services^3, ports^3, template^2, body^1`; `fuzzy:0.2, prefix:true`; numeric query (e.g. `445`) boosts docs whose `ports` contains it; `verified` > `unverified` on ties; final tiebreak by Phase canonical order then alpha. Index prebuilt + serialized at compile time.

> **Implementation note (non-frozen, does not edit the above):** `verified > unverified` and command→technique node-highlighting are computed from the build-time **side table** `public/content/search-side.json` (`Record<Id,{confidence;phaseOrder;techniqueId?}>`) loaded by the `SearchEngine` wrapper alongside the serialized index, because `SearchDoc`/`SearchHit` carry neither field and are FROZEN. See §7.1.

### §4 — VARIABLE REGISTRY (FROZEN canonical id list)
Primary (in VariableBar, persisted unless sensitive):
`LHOST`(network,`<tun0-ip>`) · `LPORT`(network,`4444`) · `RHOST`(target,`<target-ip>`) · `RPORT`(target) · `TARGET`(target,`<target-ip>`; == RHOST for AD) · `INTERFACE`(network,`tun0`) · `URL`(web,`http://<target-ip>`) · `WORDLIST`(files,`<rockyou.txt>`) · `DOMAIN`(ad,`<domain.local>`) · `DC_IP`(ad,`<dc-ip>`) · `USER`(auth) · `PASS`(auth, sensitive) · `NTHASH`(auth, sensitive, render as `:${NTHASH}` in impacket -hashes) · `AESKEY`(auth, sensitive, 64-hex) · `SPN`(ad, e.g. `MSSQLSvc/host:1433`) · `SHARE`(files,`<share>`).
Secondary / derived (auto or inline-prompted, NOT in main bar): `DOMAIN_SID` · `KRBTGT_NTHASH` · `CA` · `CA_HOST` · `TEMPLATE` · `GROUP` · `TARGET_USER` · `COMPUTER`.
All defaults are RFC5737 (`198.51.100.0/24`) / RFC3849 (`2001:db8::/32`) / `<placeholder>` tokens. Sensitive vars masked + session-only (excluded from localStorage).

> **Disambiguation note (non-frozen; expands the one-slot shorthand above):** in the shorthand a parenthetical value is the var's `placeholder` UNLESS it is one of the two real, safe conventions `LPORT=4444` / `INTERFACE=tun0`, which are `default`s (seeded into the values map at store init per §5.2/§8.1). The normative placeholder/default columns for every primary var are in §5.2. `placeholder` is ALWAYS an inert non-routable token; `default` is supplied ONLY for `LPORT` and `INTERFACE`; sensitive vars never carry a default.

### §6 — COMPONENT-API SEAM — `src/types/components.ts`
```ts
export type OctoState =
  | 'idle' | 'greeting' | 'listening' | 'thinking'
  | 'found' | 'empty' | 'copied' | 'error' | 'celebrate';   // sole mascot vocabulary

export interface OctopusMascotProps {
  state: OctoState; message?: string; intensity?: number; // 0..1 (e.g. hit count)
  theme: OS; reducedMotion?: boolean; onClick?: () => void;
}
export interface CommandCardProps {
  command: Command; render: RenderResult; affectedVars: string[];
  theme: OS; confidence: Confidence; danger?: Severity;
  credMode?: CredMode;
  onCopyFilled: (id: Id, text: string) => void;
  onCopyRaw: (id: Id, text: string) => void;
  onSelectVariant?: (id: Id, variantId: Id) => void;
  onSetCredMode?: (id: Id, mode: CredMode) => void;
  onOpenReference?: (refId: RefId) => void;
}
export interface VariableBarProps {
  defs: VariableDef[]; values: Record<string,string>; validity: Record<string,boolean>;
  groups: VarGroup[];
  onChange: (id: string, value: string) => void;
  onReset: (id?: string) => void;               // one (id) or all (undefined)
  onClearSensitive?: () => void;
  onFocusVar?: (id: string) => void;
}
export interface SearchPaletteProps {
  query: string; hits: SearchHit[]; loading: boolean; octoState: OctoState;
  filters?: SearchFilters;
  onQueryChange: (q: string) => void;
  onSelectHit: (hit: SearchHit) => void;
  onCopyHit?: (hit: SearchHit) => void;         // Cmd-Enter copy-filled top hit
  onFilterChange?: (f: SearchFilters) => void;
  onClose: () => void;
}
export interface MindMapProps {
  model: MindMapRenderModel; theme: OS; selectedNodeId?: string;
  onNodeClick: (nodeId: string, techniqueId?: Id) => void;
  onNodeHover?: (nodeId: string | null) => void;
}
```

> **Implementation note (non-frozen; does not edit the above):** `onSetCredMode(id, mode)` performs **variant selection** — it picks the `CommandVariant` whose `credMode === mode` and the engine renders that variant's `template`. `onSelectVariant(id, variantId)` is the open-ended (non-auth) variant chooser. There is NO conditional template rendering (the frozen grammar has no conditionals). See §5.1.

### §7 — PRE-RESOLVED NAMING (zero-rename guarantees)
OS enum `'linux'|'windows'|'ad'` only · theme attr `data-os` · token prefix `--cph-` · confidence `'verified'|'unverified'` surfaced as `[UNVERIFIED]` · one `Severity` scale for danger AND heat · copy modes `'filled'|'raw'|'display'` · token syntax `{{UPPER_SNAKE}}` in content AND design copy · mascot vocabulary is exactly the `OctoState` union · component props are the single source of truth (DESIGN imports `components.ts`, never re-declares). Frozen module paths DESIGN binds verbatim: `src/types/content.ts`, `src/types/engine.ts`, `src/types/components.ts`, `src/types/tokens.ts`.

---

## 11. DESIGN-TOKEN KEYS — `src/types/tokens.ts` (paste verbatim; code owns KEYS, design owns VALUES)

All keys are CSS custom properties under `:root`; the three OS themes override the SAME keys under `[data-os="linux"|"windows"|"ad"]`. **Code only ever writes `var(--cph-...)`.**
```ts
export const TOKEN_KEYS = {
  color: ['--cph-color-bg','--cph-color-surface','--cph-color-surface-raised',
          '--cph-color-border','--cph-color-text','--cph-color-text-muted',
          '--cph-color-primary','--cph-color-primary-contrast',
          '--cph-color-accent','--cph-color-focus','--cph-color-danger','--cph-color-success'],
  octo: ['--cph-octo-idle','--cph-octo-greeting','--cph-octo-listening','--cph-octo-thinking',
         '--cph-octo-found','--cph-octo-empty','--cph-octo-copied','--cph-octo-error',
         '--cph-octo-celebrate','--cph-octo-ink','--cph-octo-glow','--cph-octo-tint'],
  severity: ['--cph-sev-info','--cph-sev-low','--cph-sev-medium','--cph-sev-high','--cph-sev-critical'],
  variable: ['--cph-var-set','--cph-var-unset','--cph-var-invalid','--cph-var-token-bg'],
  confidence: ['--cph-confidence-verified','--cph-confidence-unverified'],
  copy: ['--cph-copy-success','--cph-copy-flash'],
  node: ['--cph-node-recon','--cph-node-enum','--cph-node-exploit','--cph-node-privesc',
         '--cph-node-lateral','--cph-node-persistence','--cph-node-outcome','--cph-node-decision'],
  elevation: ['--cph-elev-0','--cph-elev-1','--cph-elev-2','--cph-elev-3','--cph-elev-4',
              '--cph-radius-sm','--cph-radius-md','--cph-radius-lg','--cph-radius-full'],
  motion: ['--cph-motion-fast','--cph-motion-base','--cph-motion-slow',
           '--cph-ease-standard','--cph-ease-emphasized','--cph-ease-octo'],
  type: ['--cph-font-sans','--cph-font-mono',
         '--cph-fs-xs','--cph-fs-sm','--cph-fs-md','--cph-fs-lg','--cph-fs-xl','--cph-fs-2xl',
         '--cph-lh-tight','--cph-lh-normal','--cph-fw-regular','--cph-fw-medium','--cph-fw-bold'],
} as const;
```
DESIGN delivers `theme.base.css` + `theme.linux.css` + `theme.windows.css` + `theme.ad.css` defining EVERY key; each theme passes WCAG AA (4.5:1 text, 3:1 UI/graphics) + CVD-safe; meaning never by hue alone; `prefers-reduced-motion` collapses `--cph-motion-*`. Add a CI gate (§14) that asserts every key in `TOKEN_KEYS` is defined in `theme.base.css`.

---

## 12. MERGE SEAM (so the DESIGN output drops in cleanly)

Four seams, one direction each:
1. **Shared product name + glossary** (§10-§0): both prompts use these exact words. You do not coin synonyms.
2. **Frozen data interfaces** (§10): single source of truth lives in YOUR `src/types/*.ts`. DESIGN imports these modules, never redefines a field/enum, never renames a prop. If design needs a new visual concept, it expresses it as token VALUES, not new fields.
3. **Design-token seam** (§11): DESIGN owns VALUES (the four `theme.*.css` files + `octo.riv` + mascot fallback SVG). CODE owns KEYS and only consumes `var(--cph-*)`. When design's CSS lands, drop it into `styles/` replacing your placeholder values — zero code change required.
4. **Component-API seam** (§10-§6): the typing/command/mindmap surfaces are controlled/presentational — they take a render-state stream (props) and emit raw events. DESIGN styles them; it does not change their props or lift state into them.

Deliverables you must leave ready for design drop-in: placeholder `styles/theme.*.css` defining every key; a lazy mascot mount point that consumes `public/mascot/octo.riv` with an inline SVG fallback; every component reading only `var(--cph-*)` for color/motion/type.

---

## 13. HARD RULES (non-negotiable; bake into code + CI — each maps to a ship-blocking gate)

1. **Authorized-testing-only.** Persistent, unobtrusive, **non-dismissible** responsible-use note on every hands-on surface: "Authorized testing only — learner-owned labs, HackTheBox/Proving-Grounds, the exam." No third-party targeting. **Enforced by Gate 13d (Playwright): the note is present on CommandCard, VariableBar, and MindMap surfaces and exposes NO dismiss/close control.**
2. **Defang-by-default.** Every `VariableDef.placeholder` is an obvious non-routable token (`<tun0-ip>`,`<target-ip>`,`<domain.local>`,`<dc-ip>`,`<rockyou.txt>`). Any example IP is RFC5737 (`198.51.100.0/24`,`192.0.2.0/24`,`203.0.113.0/24`) or RFC3849 (`2001:db8::/32`). No command ever ships pre-aimed at a real host. **Enforced by Gate 5 (routable-IP reject) AND Gate 6 (placeholder inert-shape).**
3. **Never block copy on a missing var.** Unset → obvious inert token (`<LHOST>`) in `--cph-var-unset`, never blank, never guessed. **Copy-raw is always enabled.** Copy-filled is gated on `allResolved && no invalid` so an unfinished command can never look paste-ready. (Defaults are seeded — §5.2 — so a defaulted var renders its real value, never a placeholder, and never inflates `allResolved`.)
4. **No secrets / no telemetry.** Sensitive vars (PASS/NTHASH/AESKEY) masked + session-only (excluded from localStorage, never seeded). No network at runtime, no analytics, no signup. Nothing sensitive in git or bundle.
5. **No machine names. Ever.** Not in content, comments, data, ids, filenames, commit messages, or git history. No euphemisms ("the easy SMB box" is banned). The data model has no machine-identity field. **Enforced by Gate 10 against the COMMITTED salted-hash manifest.**
6. **Never commit/read the Trophy Room PDF** or its list. It is `.gitignore`d defensively, lives only in `~/Downloads`, and no build/import path reads it. Coverage is abstract technique IDs + archetype bands only. **Enforced by Gate 10 (PDF SHA in the must-not-be-tracked hash set) + Gate 2.**
7. **Anti-fabrication is structural.** Never invent CVE numbers, BOF offsets, ROP/gadget addresses, Potato CLSIDs, ADCS template prereqs, tool flags, versions, hashes, or keys. Commands store only canonical real tool syntax. Anything uncertain → `confidence:'unverified'` + ≥1 `references[]` + literal `[UNVERIFIED]` badge. **Enforced by Gates 3 + 4 (mechanical regexes — §14).**
8. **Methodology-only for weaponization.** Web vulns, UAC bypass, AMSI/AV evasion, BOF: methodology + canonical tool syntax only; no turnkey weaponized exploit or working bypass string.
9. **Copyright.** Reproduce only short canonical command syntax/flags (functional/non-creative, still cited) + public facts (ports, RFC behavior, MITRE IDs, CVE numbers). Never reproduce prose write-ups verbatim — synthesize. Prose overlap guard (Gate 8) runs on `summary`/`body`/`notes` only (command strings exempt) via 8-gram shingle Jaccard against COMMITTED fingerprints derived from gitignored `reference-scratch/`.
10. **credMode never fabricates.** A credMode card swaps among authored variants only (§5.1); the app never conditionally synthesizes an auth segment. **Enforced by Gate 7.**

---

## 14. CI GATES (`.github/workflows/ci.yml` — all SHIP-BLOCKING gates must pass; this is the green-gate for shipping)

The CI job runs `corepack enable && corepack prepare --activate` first so the pinned Node/pnpm (§1) resolve. Implement each gate as a script under `scripts/gate-*.ts` and wire into CI. **Every gate below is SHIP-BLOCKING (runs and can fail on a clean CI runner with no gitignored inputs) — there are no silent no-ops.** Where a gate's natural input is gitignored, a COMMITTED hash-only derivative is the CI input (Gates 8 and 10).

1. **Zod-validate** every entity (lockstep with frozen interfaces).
2. **Template-var registry integrity:** every template/variant/cypher parses; every detected/declared var exists in the Variable Registry (§10-§4 / §5.2). Also warns if `{{VAR|quote}}` appears in a non-bash template (§5.3).
3. **Unverified→reference:** every `confidence:'unverified'` item (Command, Technique, BloodHoundQuery) has ≥1 `references[]`. Empty → FAIL.
4. **Hard-fact gate (FULLY MECHANICAL — no NLP).** Over prose/text fields, FAIL when any of these regexes match while the item's `confidence !== 'verified'` OR its `references` is empty:
   - CVE id: `/\bCVE-\d{4}-\d{4,}\b/`
   - memory offset / gadget / address: `/\b0x[0-9a-fA-F]{4,}\b/`
   - CLSID/GUID (Potato/DCOM): `/\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/`
   - version literal in PROSE fields (`summary`/`body`/`notes` only, NOT command strings): `/\bv?\d+\.\d+(?:\.\d+)?\b/`
   The un-mechanizable phrase "version-specific claim" is REMOVED. Version-literal nuance lives additionally in a **curated author-local lint** with an explicit allow-list for legitimately-public version facts (e.g. an RFC number is excluded because it is not matched by these patterns; a genuinely needed version cite must carry `verified + references`). CI uses ONLY the deterministic regexes above.
5. **Routable-IP reject:** scan templates/examples/placeholders/defaults; allow only RFC5737 (`198.51.100.0/24`,`192.0.2.0/24`,`203.0.113.0/24`), RFC3849 (`2001:db8::/32`), and private-doc ranges; any routable IP → FAIL.
6. **Defang placeholder shape (NEW, ship-blocking):** every `VariableDef.placeholder` MUST be inert: it either (a) is a documentation-range literal (Gate 5 allowlist), or (b) contains at least one inert token matching `/<[a-z0-9.\-]+>/` AND contains NO routable IP and NO bare real-looking hostname. A blank, a real-looking string, or a routable literal → FAIL. (Covers the gap where Gate 5 alone would pass a non-IP real-looking placeholder.) The two seeded `default`s (`LPORT=4444`, `INTERFACE=tun0`) are validated separately as safe non-sensitive conventions; no other var may carry a `default`.
7. **credMode variant completeness (NEW, ship-blocking):** every `Command` with `credMode` set MUST have `variants[]` containing one variant tagged `credMode:'password'`, one `'nthash'`, one `'kerberos'`. Missing any → FAIL. (Locks §5.1: the switch swaps real authored variants; the engine never conditionally synthesizes.)
8. **Prose-only overlap guard (CI-runnable, ship-blocking):** 8-gram shingle Jaccard on `summary`/`body`/`notes` only (command strings exempt) against **`ci/overlap-fingerprints.json`** — precomputed shingle fingerprints (hashes only, NOT prose) generated locally by `build-overlap-fingerprints.ts` from the gitignored `reference-scratch/` and COMMITTED. Over-threshold overlap → FAIL. Because the fingerprints are committed, this runs deterministically on CI where `reference-scratch/` is absent. (Author-local step: regenerate fingerprints when reference-scratch changes; the plaintext never enters git.)
9. **Search side-table integrity:** every `SearchDoc.id` has a `search-side.json` entry; `confidence`/`phaseOrder`/`techniqueId` are consistent with the bundle; the forced-tie ordering test (verified before unverified) passes.
10. **No-machine-names denylist (CI-runnable, ship-blocking):** a normalized-token/salted-hash check over tracked files/comments/data/filenames/commit-messages/git-history against **`ci/machine-denylist.manifest.json`** — salted hashes ONLY (never plaintext names), generated locally by `build-denylist-manifest.ts` from the gitignored `denylist.local.*` and COMMITTED. CI normalizes each candidate token with the documented normalization (lowercase, strip separators) + documented salt, hashes, and compares. Any match → FAIL. The PDF's SHA is included in a "must-not-be-tracked" hash set; if any tracked file hashes to it → FAIL. (Plaintext names/list NEVER ship; only the one-way manifest does.)
11. **`tsc --strict --noEmit`** (and ESLint) clean.
12. **Token-key completeness:** every key in `TOKEN_KEYS` is defined in `theme.base.css`.
13. **Completeness + coverage:** every `requiredForOscpReadiness:true` leaf resolves to ≥1 compiling command; emit per-OS×per-phase heatmap; **orphan gate** (leaf↔checklist↔command both directions).
14. **Playwright e2e (ship-blocking):**
    - (a) copy-filled produces the fully-substituted string and is gated on `allResolved && invalid.length===0`; a `<placeholder>`-containing filled string can NEVER be copied as filled; copy-raw always works.
    - (b) search-summon (`445` → SMB cluster first; `Cmd-Enter` copies top hit filled); forced-tie shows `verified` before `unverified`.
    - (c) OS theme switch flips `data-os` with no remount/flash and re-skins node colors + mascot tint.
    - (d) **responsible-use (NEW):** `ResponsibleUseNote` is present on CommandCard, VariableBar, and MindMap surfaces AND has NO dismiss/close control (assert the dismiss affordance does not exist in the DOM).
    - (e) **credMode (NEW):** toggling the CredModeSwitch swaps the rendered template among the three authored variants (`password`/`nthash`/`kerberos`) — assert the `-hashes :{{NTHASH}}` and `-k -no-pass` segments appear from variant selection, not string surgery.

**Author-local-only steps (NOT gates; they PRODUCE committed CI inputs):** `build-denylist-manifest.ts` and `build-overlap-fingerprints.ts` run on the author's machine against gitignored plaintext and emit the hash-only `ci/*.json` manifests that Gates 8 and 10 consume. These are clearly documented as the only local steps; everything in the numbered list above runs on CI.

**SHIP-GATE:** `pnpm ci` runs gates 1–14 and exits 0. Do not consider the build done until it does.

---

## 15. FINAL REPORT (what to output when done)

After building, report: the green-gate status table (Gates 1–14), the coverage heatmap summary (per-OS×per-phase leaf counts, `requiredForOscpReadiness` resolution), confirmation that the pinned toolchain resolved (`node -v` == `v20.18.1`, pnpm == `9.15.4`), confirmation that every credMode command carries all three variants and every `SearchDoc.id` has a side-table entry, any `[UNVERIFIED]` items with their citation pointers, any `[CONTRACT-CHANGE-REQUEST]` you surfaced (you must NOT have edited the frozen modules), and absolute paths to: the four frozen type modules, `scripts/build-content.ts`, the generated `public/content/*.json` (including `search-side.json`), the committed hash-only CI inputs (`ci/machine-denylist.manifest.json`, `ci/overlap-fingerprints.json`), the placeholder `styles/theme.*.css` (ready for design drop-in), and the CI workflow. Do not write a separate report markdown file — return this in your final message.