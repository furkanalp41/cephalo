				# Cephalo v3 — The OSCE3 Content Packs (README-v3)

*Set your variables once; now the octopus summons OSWE web payloads, OSEP evasion + lateral methodology, and OSED/OSEE exploit-dev reference — pack-filtered, cited, offline.*

Two finalized addendum prompts that the **same** self-driving build agent folds into the **already-running** Cephalo build (`/home/vlad/bigOscpPrep`) and `/loop`. They are **purely additive CONTENT**: frozen `src/types/{content,engine,components,tokens}.ts` + `schema-parity.test.ts` stay **byte-identical** every tick. `osed` / `osee` ride the frozen `PackId = 'oscp' | 'oswe' | 'osep' | (string & {})` arm — **zero union edit**. New content lives in `content/<pack>/**`; new shapes in new sibling modules; new design tokens are **10** new `--cph-pack-*` KEYS only. Where anything disagrees, the embedded **ADDITIVE PACK CONTRACT wins** (restated verbatim in both prompts).

---

## 1. Which prompt goes to which tool

| Prompt | Tool | Role |
|---|---|---|
| `_prompts/CODE-PROMPT-v3-osce3-packs.md` | **Claude Code** | Adds *the content + plumbing* — four packs, pack registry/store, build generalization, gates, LOOP blocks. |
| `_prompts/DESIGN-PROMPT-v3-osce3-packs.md` | **Claude Design** | Adds *the pack layer skin* — "Reef Heraldry": PackSwitcher, CertBadge, the 10 `--cph-pack-*` VALUES. |

One sentence: **CODE authors the packs and declares the 10 pack KEYS + gates; DESIGN supplies the signet VALUES and binds the frozen `Pack`/`PackId` verbatim.** They bind to `CODE-PROMPT.md` (frozen contract) and the v2 surfaces they make pack-aware.

---

## 2. What each prompt OWNS (disjoint, no overlap)

**CODE-PROMPT-v3 owns (content authority + KEYS + behavior):**
- **Pack registration without a frozen edit:** `src/data/packs.ts` (registers `oscp`+`oswe`+`osep`+`osed`+`osee`; `osed`/`osee` via the `(string & {})` arm), per-pack manifests `src/data/pack-manifests/<id>.ts`, a NON-frozen `pack` store (enabled `Set<PackId>` + focused, persists only the toggle set + lazy same-origin bundle load).
- **Content:** OSWE (22 techniques, DEEP copy-paste command pack), OSEP (16, DEEP; evasion = methodology-only, AD/lateral **reuses** the OSCP tree via `relatedIds`), OSED (10, REFERENCE pack — msfvenom/mona/WinDbg/nasm helpers), OSEE (5, REFERENCE pack — concept + cited links). Every node carries `packs[]`, `{{TOKENS}}`, correct `shell`, `danger`, `confidence`, `references[]`.
- **A small NON-frozen generalization of two scripts:** `build-content.ts` (`content/<id>/** → public/content/<id>.json`, ONE combined index with `SearchDoc.packs`, mindmaps keyed by pack; `oscp.json` stays byte-stable) and `loadBundle()` so all invariants span all packs.
- **New `Reference` registry** built from `OSCE3-SOURCE-INDEX.md`; new `{{VARIABLES}}`; `PackSwitcher.tsx` (presentational); `tokens.v3.ts` **declaring** the 10 `--cph-pack-*` KEYS (no values).
- **New CI gates:** `gate-pack-coverage` (G-OSCE3-?), `gate-osce3-cite` (joas + ≥1 primary on every OSCE3 node), `gate-evasion-methodology-only` (no working bypass payload on any `evasion`-tagged node) + the EXTENDED token-parity gate + reuse of every existing gate. New `osce3:` coverage block, `canon-map.yaml` rows, and the `## v3` LOOP checklist.

**DESIGN-PROMPT-v3 owns (visual authority — VALUES):**
- Art direction **"Reef Heraldry"** — a pack is an engraved heraldic **diver's credential signet**, not gamified glitter. Five learnable monograms; calm, authoritative, never shouting over content.
- The **load-bearing orthogonality law:** a pack is a *credential lens over content*, **orthogonal** to the `data-os` skin (the room). The signet rides **alongside** the realm, never replaces it; pack hues are **constant across all three realms** (no realm file overrides a `--cph-pack-*` key).
- VALUES for the **10** new keys (5 hues `--cph-pack-{oscp,oswe,osep,osed,osee}` + 5 chrome `--cph-pack-{ink,signet-bg,track,filter-dim,filter-active-bg}`) and the visual spec for `PackSwitcher` + `CertBadge` (multi-signet stack for shared nodes) + the pack-filter affordance across every surface (search facet chips, `MindMapRenderNode.dimmed` scrim, the six v2 surfaces' pack-filter state). An all-excluded filter drives the **existing `empty`** Octo state — no new mascot state.

DESIGN never renames a key/prop/enum, widens the `PackId` union, or adds a frozen field. CODE never picks a hue.

---

## 3. What's new — the four packs

| Pack | Scope | Kind | Discipline highlight |
|---|---|---|---|
| **oswe** | web payloads + source-review methodology (22) | DEEP command pack | SQLi/SSTI/XXE/deser/UDF — real `{{TOKEN}}` commands, `shell: sql/text/bash` |
| **osep** | evasion + lateral + MSSQL + AD (16) | DEEP pack | **evasion = METHODOLOGY ONLY**; AD/lateral **cross-links** OSCP, zero duplication |
| **osed** | Windows user-mode exploit dev (10) | REFERENCE pack | only genuinely copy-pasteable helpers (msfvenom/mona/nasm/WinDbg); deep hands-on → **Ringzero** |
| **osee** | advanced Windows exploitation (5) | REFERENCE pack | concept + cited links only; no weaponization; deep → **Ringzero** |

Cephalo **authors** the commands under Joas Antonio's OSCE3 taxonomy (`OSCE3-SOURCE-INDEX.md` — a taxonomy + ~250 links, **no commands**), citing Joas + ≥1 primary author/repo per node.

---

## 4. Key differentiators

- **Packs ride the FROZEN union, not a fork.** `osed`/`osee` are first-class through `(string & {})` — the four type files stay byte-identical, proven by `git diff --stat` empty every tick.
- **Pack ⟂ OS skin.** A credential lens over content, shown *alongside* the realm — an `osep` card in the `ad` realm is aubergine-skinned **and** wears the constant violet `osep` signet.
- **Reuse over duplication.** OSEP AD/lateral/MSSQL **cross-links** the existing OSCP `ad.*`/`win.*`/`linux.*` nodes via `relatedIds`; the prose-overlap gate actively *catches* OSCP↔OSEP duplication.
- **Evasion is concept-only, enforced.** `gate-evasion-methodology-only` fails any `evasion`-tagged node carrying a working bypass payload — theory/enumeration/provenance ship, AMSI-patch strings/loaders/stagers never do.
- **Cite-pair enforced in CI.** `gate-osce3-cite` fails any OSCE3 node missing `ref.osce3.joas` + a primary source; `[UNVERIFIED]` + non-empty `references[]` is mandatory for any uncertain CVE/offset/gadget/version.
- **Deep exploit-dev links out, never duplicates.** OSED/OSEE bodies point at the companion **Ringzero** project (`ref.ringzero`) for full debugger walk-throughs / bespoke ROP / kernel-driver RE.
- **Surfaces are filtered, not re-implemented.** The v2 arsenal (Ask/CVE/Advisor/Nmap/Decision/ToolBinary) gains pack-awareness by threading `packStore.enabled`; `SURF-*` boxes stay `☐` until each v2 surface actually exists.

---

## 5. The non-negotiable shared spine (in both)
TRANSFORM-NEVER-REPRODUCE (mirror short headings, summarize + LINK; OffSec course material is copyrighted) · CITE THE PAIR (Joas + ≥1 primary) · NO MACHINE NAMES (HTB/PG review links → techniques only; never commit the source PDF/.xlsx/.xmind) · ANTI-FABRICATION (`[UNVERIFIED]` + cite; RFC5737/RFC3849/`example.local` defangs) · NO BUNDLED BINARY (link release PAGES via `Reference` + the v2 ToolBinary arsenal) · EVASION METHODOLOGY-ONLY · DETERMINISTIC/OFFLINE/NO-AI/EXAM-LEGAL · NEVER edit a frozen module.

A v3 leaf is `☑` only when content-complete **and** its CI gate is green — exactly the rule the existing loop already runs.

---

## 6. Integration — see the integration note (§ below in this package).
