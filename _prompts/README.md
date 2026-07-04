# Cephalo — Build Package (README)

**Cephalo** — *Set your variables once; the octopus summons every Linux, Windows, and Active Directory command — fully filled in, copy-paste ready, offline.*

This repo ships as **two prompts that build one app** at `/home/vlad/bigOscpPrep`. They share a single FROZEN contract embedded verbatim in both, so they can be authored independently and merged with zero conflict.

---

## 1. Which prompt goes to which tool

| Prompt | Tool | Role |
|---|---|---|
| `CODE-PROMPT.md` | **Claude Code** | Builds *the machine* — the offline-first React/TS SPA, engines, content, CI. |
| `DESIGN-PROMPT.md` | **Claude Design** | Builds *the skin* — visual identity, token VALUES, Octo Rive artifact. |

One sentence: **CODE owns the structure and the contract; DESIGN owns the look and binds the contract verbatim.** Where the two ever disagree, the FROZEN SHARED CONTRACT wins.

---

## 2. What each prompt OWNS (disjoint, no overlap)

**CODE-PROMPT owns (and *declares* the contract):**
- Stack: Vite + React 18 SPA, TS strict, TanStack Router, Zustand(+persist), MiniSearch, @xyflow/react, vite-plugin-pwa/Workbox, Zod, Rive, Vitest+Playwright. Pinned runtimes: Node `20.18.1`, pnpm `9.15.4` (verified-existing).
- The four FROZEN type modules verbatim: `src/types/{content,engine,components,tokens}.ts`.
- Engines (pure framework-free TS, reused by the build validator): the templating engine (`{{TOKEN}}` grammar, `filled|raw|display`) and the search engine (frozen field-boost ranking).
- Content pipeline (`scripts/build-content.ts`): Zod schemas in lockstep with frozen types → emits `public/content/*.json`, `search-index.json`, `search-side.json`, `mindmaps.json`.
- Stores + the **theming MECHANISM** that consumes `var(--cph-*)` and re-skins the whole app via `data-os` with no remount.
- Controlled/presentational components wired to the component-API seam.
- The full Linux/Windows/AD technique tree + BloodHound cypher library + mindmaps.
- PWA/offline/local-first, deep-link routes, keymap, responsible-use note.
- **All CI gates**: anti-fabrication hard-fact gate, no-machine-names denylist, prose-overlap fingerprints, routable-IP rejection, green-gate runtime checks.
- The three contract-internal resolutions: credMode = *variant-selection* (not template transform); `verified>unverified` tiebreak + command→node highlight powered by a **build-time side table**; `VariableDef.default` seeded into the values map at store init. *None edits a frozen interface.*

**DESIGN-PROMPT owns (and *binds* the contract):**
- The entire visual identity: art direction "The Abyssal Instrument" (deep-pelagic dark, bioluminescent signal, living instrument).
- The token VALUES — four CSS files (`theme.base.css` + `theme.{linux,windows,ad}.css`) defining **every** `--cph-*` KEY in `TOKEN_KEYS` and **only** those keys; `:root` (base) resolves all keys with no `data-os` present, realm files only re-skin.
- Octo: the Rive mascot artifact (`public/mascot/octo.riv`) rendering every `OctoState` member, plus an inline-SVG fallback.
- Accessibility floor: each theme independently passes WCAG AA (4.5:1 text, 3:1 UI/graphics), CVD-safe, meaning never by hue alone, `prefers-reduced-motion` collapses `--cph-motion-*`.
- Hard anti-AI-slop bans (no purple-SaaS-gradient hero, no default glassmorphism, no kawaii octopus, no emoji-as-UI).

DESIGN **never** renames a prop, redefines an enum value, invents a token KEY, or sets structure. CODE **never** picks a color, font, or motion curve.

---

## 3. Canon / competitor analysis — conclusion

Each prior art nails exactly one slice; none unify them into a single local-first, cited, multi-OS instrument. Cephalo is the deliberate superset that owns the seam between *content correctness* and *live instrument UX*.

- **RevShells** — the "set variables once, every command updates" loop. Cephalo generalizes it from reverse shells to the **entire OSCP kill chain** via the sticky `VariableBar` re-interpolating every visible `CommandCard` — and fully offline.
- **navi** — interactive cheatsheet with argument prompting in the terminal. Cephalo lifts that template+arg model into a GUI with **live `filled`/`raw`/`display` interpolation** and a Cmd/Ctrl-K `SearchPalette`.
- **HackTricks** — encyclopedic prose methodology. Treated as a **secondary citation only**: synthesized never transcribed (8-gram shingle overlap guard on prose fields), restructured as a navigable Technique/Section tree + MindMap.
- **viperone** (AD cheatsheet) — AD methodology. Covered by the **`credMode` switch** (`password|nthash|kerberos` re-rendering one template) plus the first-class BloodHound section; cited as secondary.
- **TJnull** (NetSecFocus / OSCP-prep list) — *syllabus framing only*. Coverage is expressed as **abstract technique IDs + archetype-frequency bands** (`coverage.manifest.yaml`), never machine links — TJnull is a citation source, not a data source.
- **BloodHound** — attack-path cypher. Promoted to a first-class `BloodHoundQuery` model with an **edge→abuse FK** (`abuseTechniqueId`) so weaponization links to a technique with **zero command duplication**; legacy-vs-CE schema divergence is flagged `[UNVERIFIED]`.

**Bottom line:** competitors are point tools; Cephalo composes the variable-loop, offline fuzzy search, three-realm theming, AD credMode rendering, BloodHound paths, mindmaps, *and* an enforced citation/anti-fabrication discipline into one stateful instrument. The moat is the **enforced-correctness seam** (a hard fact with no citation literally cannot ship) wrapped in a UX no cheatsheet has.

---

## 4. Key differentiators

1. **Global variable-loop across the whole kill chain**, fully offline — RevShells' trick generalized to Linux/Windows/AD.
2. **Anti-fabrication as a CI gate, not a vibe** — every Command/Technique/BH query carries `confidence` + `references[]`; the hard-fact gate FAILs the build on a CVE/offset/version claim that is unverified or uncited; uncertain items render the literal `[UNVERIFIED]` badge.
3. **One `Severity` scale powers both command `danger` and MindMap node heat**; one `OctoState` vocabulary; one `--cph-` namespace — zero parallel enums, zero renames.
4. **`credMode` = variant-selection** — one AD template re-renders as password / NT-hash / Kerberos.
5. **First-class BloodHound** with edge→abuse FK and legacy-vs-CE divergence handling — no duplicated commands.
6. **Defang-by-default operational safety** — placeholders are inert tokens (`<tun0-ip>`); examples are RFC5737/RFC3849 only; sensitive vars masked + session-only; copy-filled gated on `allResolved && no invalid`; CI rejects routable IPs.
7. **Exam integrity baked in** — HARD no-machine-names rule + no Trophy Room PDF anywhere (content, comments, filenames, commit messages, git history), enforced by a hash-only denylist lint.
8. **Local-first** — no signup, no telemetry, no runtime network; offline fuzzy index prebuilt + serialized at compile time; installable PWA.
9. **OS-reactive theming with no remount** — `data-os` re-skins the same `--cph-*` keys; three WCAG-AA, CVD-safe themes.
10. **A living instrument** — Octo, a credible deep-sea cephalopod (not kawaii), driven purely by app `state`.

---

## 5. The pre-resolved seam (why the merge cannot conflict)

The seam is resolved *before* either prompt runs. Both embed the FROZEN SHARED CONTRACT **verbatim**; ownership is disjoint along four axes:

- **Shared name + glossary** — `Cephalo`/`Octo`, `Command`/`CommandCard`, `Technique`/`Vector`, `Section`/`Phase`, `Variable`/`VariableBar`, `token`/`placeholder`/`filled`/`raw`/`display`. Both prompts use these EXACT words in code, copy, and layer names.
- **Frozen interfaces** — `src/types/content.ts`, `engine.ts`, `components.ts`. CODE declares them; DESIGN imports them and never redeclares a field, enum value, or prop.
- **Design-token KEYS ↔ VALUES** — `src/types/tokens.ts` (`TOKEN_KEYS`) is the closed key list owned by CODE; DESIGN supplies a VALUE for every key and **adds none**. Need a glow/rim/value-text color? reuse an existing key (`--cph-octo-glow`, `--cph-color-text`, `--cph-var-set`) — there is no escape hatch.
- **Component-API seam** — `components.ts` props are the single source of truth: render-state in, raw events out (`OctopusMascotProps`, `CommandCardProps`, `VariableBarProps`, `SearchPaletteProps`, `MindMapProps`). Every visual state DESIGN draws maps to a prop field.

**Zero-rename guarantees (frozen):** OS enum `'linux'|'windows'|'ad'` only · theme attr `data-os` · token prefix `--cph-` · confidence surfaced as `[UNVERIFIED]` · one `Severity` for danger AND heat · copy modes `'filled'|'raw'|'display'` · content/copy token syntax `{{UPPER_SNAKE}}` · mascot vocabulary == the `OctoState` union (code emits only these; design renders every one).

---

## 6. EXACT merge procedure

The two outputs meet at four file paths and one binary. Run in this order:

1. **Land CODE first.** Claude Code scaffolds `/home/vlad/bigOscpPrep` and drops the four FROZEN type modules (`src/types/{content,engine,components,tokens}.ts`) **verbatim** from the contract, then freezes them. These are the merge anchor.
2. **CODE ships `styles/theme.{base,linux,windows,ad}.css` as stubs** (every `--cph-*` key present with placeholder values) so the app compiles and themes switch before DESIGN lands. CODE also stubs `public/mascot/octo.riv` loading (lazy, with SVG fallback path).
3. **DESIGN delivers its artifacts against the same paths:** the four real `theme.*.css` files (defining every key in `TOKEN_KEYS`, and only those), the real `octo.riv`, and the inline-SVG fallback. **DESIGN overwrites only the CSS stubs and the mascot binary — it touches no `.ts`, no component, no structure.**
4. **Merge = drop DESIGN's CSS/Rive into CODE's tree.** Because CODE never wrote a color/font/motion value and DESIGN never added a key/prop/enum, the files do not overlap. There is no textual conflict to resolve.
5. **Verify the seam mechanically:**
   - Token KEY parity: every key in `TOKEN_KEYS` resolves at `:root` in `theme.base.css` with no `data-os`, and **no extra `--cph-*` key** exists anywhere (lint).
   - Realm parity: each `[data-os="…"]` file overrides only declared keys; `data-os` switch re-skins without remount.
   - Mascot parity: `octo.riv` (or SVG fallback) renders all nine `OctoState` members.
   - Run GREEN-GATEs + CI: `corepack enable && pnpm install && pnpm tsc --noEmit && pnpm lint`, then the full gate suite (anti-fabrication, no-machine-names, overlap fingerprints, routable-IP, a11y). Ship only on green.

**The single seam, restated:** CODE owns KEYS + interfaces + events; DESIGN owns VALUES + identity + the mascot artifact; they meet at `src/types/tokens.ts` (keys) ⇄ `styles/theme.*.css` (values), `src/types/components.ts` (props) ⇄ rendered states, and a shared glossary. Pre-resolved, so the merge is a file drop, not a negotiation.