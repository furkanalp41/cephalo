# CEPHALO — MASTER BUILD PROMPT (give this to Claude Code)

You are **Claude Code**, building **Cephalo** — an octopus-themed, **OFFLINE, deterministic, NO-AI** personal
command-and-technique reference for OffSec exam prep (OSCP now; OSWE / OSEP / OSED / OSEE packs) — in the git repo
at `/home/vlad/bigOscpPrep`. **This is your single entry point.** The exhaustive specs live in `_prompts/`; this
prompt encodes the mission, the non-negotiable invariants, the build order, and the operating loop. Read the
layered specs in order, then build to DEFINITION OF DONE.

## 0. NON-NEGOTIABLE INVARIANTS (never violate; restate on-page + enforce in CI)
- **Educational / authorized-use ONLY** — learner-owned labs, HackTheBox / Proving-Grounds, and the OffSec exam.
  Persistent responsible-use banner on every route. The app organizes knowledge and FILLS variables the user sets;
  it NEVER scans, exploits, automates, auto-downloads, or auto-runs. The human runs every command and makes every
  decision.
- **ZERO AI** — no LLM / model / embedding / inference at runtime or in anything shipped. Every "smart" feature
  (Ask-the-Octopus, Privilege Advisor, CVE lookup, Nmap triage, decision trees, intent search) is DETERMINISTIC
  (regex + lookup table + the prebuilt MiniSearch index), explainable, byte-reproducible. No `Math.random`, no
  ambient clock in logic. Exam requirement — state it loudly + per-feature "deterministic, not AI" chips.
- **Offline / local-first** — no runtime network, telemetry, analytics, or signup; same-origin bundled assets only;
  installable PWA; works fully offline.
- **No machine names** anywhere (content, comments, filenames, commits, git history); never commit any source PDF /
  list / machine roster. Coverage is abstract technique IDs only.
- **Anti-fabrication** — never invent a CVE / EDB / flag / offset / gadget / version / function. Uncertain ⇒ literal
  `[UNVERIFIED]` + non-empty `references[]` + a reason. Defang by default (RFC5737 `198.51.100.0/24` +
  `192.0.2.0/24`, RFC3849, `example.local`); sensitive vars (`PASS`/`NTHASH`/`AESKEY`/`SESSION`/`DB_PASS`) masked +
  session-only.
- **No bundled binary** — tools are LINKED to official sources via the `Reference` type + the `ToolBinary` arsenal;
  never host/commit a binary. `searchsploit` is the only local escape hatch (the human runs it).
- **OSEP evasion = methodology/concept ONLY** (no working AV/EDR/AMSI/AppLocker bypass payload). **OSED/OSEE deep
  hands-on LINKS OUT** to the companion "Ringzero" project — never duplicated here.
- **Never edit the frozen contract** — `src/types/{content,engine,components,tokens}.ts` + `schema-parity.test.ts`
  stay byte-identical every tick (`git diff --stat` on those paths = empty). All new capability lives in NEW modules.
- **Safety classifier** — if the platform flags content while you author, DO NOT try to evade it. Defang /
  conceptualize, mark `[UNVERIFIED]`, or skip that node and report it; the human can pursue the official
  cyber-use-case exemption. Never obfuscate or split content to dodge a safety system.

## 1. READ THE LAYERED SPECS (in order — they are the authoritative detail)
1. `_prompts/CODE-PROMPT.md` — **v1: the engineering brief. BUILD THIS FIRST.** Stack (Vite + React 18 + TS strict,
   Zustand, MiniSearch, `@xyflow/react`, `vite-plugin-pwa`, Rive), the FROZEN contract + token KEYS, the variable
   templating engine, search, mindmaps, the OSCP (linux/windows/ad) content scaffolding, the CI gates.
2. `_prompts/CODE-PROMPT-v2-arsenal.md` — **v2 (additive, F1–F8):** PowerShell/Invoke arsenal, `ToolBinary`
   provenance, Privilege Advisor, the Ask-the-Octopus page, CVE/version lookup, output-conditional decision trees,
   Nmap triage/scan-router.
3. `_prompts/CODE-PROMPT-v3-osce3-packs.md` — **v3 (additive):** the `oswe`/`osep`/`osed`/`osee` packs (osed/osee on
   the `(string & {})` PackId arm), the pack switcher, pack-aware surfaces.
4. `_prompts/CODE-PROMPT-v4-depth.md` — **v4 (additive):** the DEPTH rubric + expanded coverage; deepen OSCP/OSWE/OSEP.
5. `_prompts/LOOP.md` — **THE DRIVER.** The MASTER CHECKLIST (v1 AD/Linux/Windows/Cross-cut + v2 + v3 + v4) and the
   DEFINITION OF DONE. You run this every tick.
6. `_prompts/OSCE3-SOURCE-INDEX.md` — the OSCE3 taxonomy + citation sources.

## 2. BUILD ORDER (all driven by LOOP.md, gate-green, INCREMENTALLY — a few nodes per tick, never bulk-dump)
- **A. Foundation (v1):** scaffold + toolchain; drop the frozen type modules verbatim; the templating + search
  engines + unit tests; the content pipeline; OSCP content; all CI gates. Verify GREEN-GATE 1.
- **B. Engines (v2 F1–F8):** the new additive modules / routes / components / gates.
- **C. Packs (v3):** register oswe/osep/osed/osee additively; pack switcher; pack-aware surfaces.
- **D. Depth (v4):** re-audit every node to the rubric + author the finer `depth-v4` leaves.

## 3. OPERATE THE LOOP (every tick)
Follow the LOOP.md per-iteration contract: (1) **measure** state (run the gates, read `coverage.manifest.yaml`),
(2) **audit** the MASTER CHECKLIST AND re-audit existing nodes against the v4 depth rubric (demote thin nodes),
(3) **author** the next highest-leverage batch fully — no stubs, (4) **verify** invariants, (5) **report** ≤15
lines. A leaf is `☑` only when content-complete AND its gate is green. Keep the five frozen files byte-identical
every tick.

## 4. DEFINITION OF DONE (stop only when ALL hold)
Every `☐` across v1 (AD / Linux / Windows / Cross-cut) + v2 + v3 + v4 is `☑`; coverage 100%; all CI gates exit 0
(tsc, lint, unit, e2e, anti-fabrication, no-machine-names, overlap, template-clone, routable-IP, placeholder,
no-bundled-binary, evasion-methodology-only, token-KEY parity, a11y/contrast, coverage, build); the app builds to
static output, installs as a PWA, and works fully offline; the five frozen files are byte-identical. Then print
`CEPHALO COMPLETE` and stop.

## 5. DESIGN SEAM
You DECLARE the `--cph-*` token KEYS and the component props/events; Claude Design SUPPLIES the VALUES + visual spec
(via the companion MASTER DESIGN prompt). Ship CSS stubs for every key so the app compiles before design lands; the
design output is a clean file-drop onto your stubs (`theme.{base,linux,windows,ad}.css` + the Rive `octo.riv`).
Never hardcode a color / font / motion value.

**START NOW:** read the six specs in order, then begin Build Order Phase A and run the loop to DEFINITION OF DONE.
You may run `/loop` against `_prompts/LOOP.md` to self-drive; report each tick.
