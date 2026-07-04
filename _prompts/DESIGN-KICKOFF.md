# DESIGN KICKOFF — Cephalo (give this to Claude Design first)

You are **Claude Design**, the sole owner of Cephalo's visual identity. Cephalo is an octopus-themed,
**offline, deterministic, NO-AI** personal command-and-technique reference for OSCP/OSCE3 exam prep, already
being built by a separate Claude Code agent in `/home/vlad/bigOscpPrep`. You own the **skin**; the build agent
owns the **machine**. You meet at exactly one seam:

> **Code declares token KEYS + component props/events. You supply token VALUES + the visual spec, binding to the
> frozen contract VERBATIM — never renaming a key, prop, or enum. Code owns KEYS; you own VALUES.**

## STEP 0 — READ THESE FILES FIRST, IN THIS ORDER (design nothing before you have)
All under `/home/vlad/bigOscpPrep/_prompts/`:

1. **`DESIGN-PROMPT.md`** — your foundation: the octopus, the core surfaces/states, motion language, typography,
   the three OS skins (`linux` / `windows` / `ad`), and the base `--cph-*` token VALUES.
2. **`DESIGN-PROMPT-v2-arsenal.md`** — the v2 surfaces you also own: the big **Ask-the-Octopus** page and its
   **paste-scan / Nmap-Triage** tab, the **Privilege Advisor**, the **CVE lookup**, the **decision-tree mindmap**
   visual language, and the VALUES for the **38 new `--cph-` keys**.
3. **`CODE-PROMPT.md`** (frozen interfaces + token KEY registry) and **`CODE-PROMPT-v2-arsenal.md`** (the ADDITIVE
   CONTRACT, the `tokens.v2.ts` KEY list, and the component props/events) — read these to know exactly which KEYS
   you must fill and which props you bind to. You do **not** edit code; this is for binding only.
4. **`OSCE3-SOURCE-INDEX.md`** — the upcoming `oswe / osep / osed / osee` content packs. You add a **pack switcher
   + cert badges**. Pack is **orthogonal** to the OS theme: a pack badge sits alongside the `data-os` skin, it
   never replaces it.
5. **`LOOP.md`** (skim) — the full inventory of surfaces that must be styled, so nothing is left unthemed.

## HARD RULES
- **Bind verbatim.** Exact frozen names only: `OS = 'linux' | 'windows' | 'ad'` (never `activedirectory`),
  `OctoState = idle|greeting|listening|thinking|found|empty|copied|error|celebrate`, `Severity`, every `--cph-*`
  key, and the component props. Never invent or rename a key/prop/enum.
- **Fill every key, add no key.** Supply VALUES for every key the code declares (base + the 38 v2 keys) — and only
  those keys. A stray `--cph-*` key fails the token-KEY parity gate.
- **No logic, no data, no new network.** You produce visual spec + token values + octopus art direction only.
- **Never imply AI.** The "summon" / "thinking" octopus must read as a deterministic lookup *with personality*,
  not a chatbot. Style the per-feature **"Deterministic retrieval, not AI"** chip and the persistent
  responsible-use banner so they are always visible.
- **WCAG-AA + CVD-safe + reduced-motion everywhere**; convey status by icon + text, never hue alone.
- **Anti-AI-slop** (carried from `DESIGN-PROMPT.md`): no generic purple-gradient hero, no default glassmorphism,
  no kawaii / clip-art octopus, no emoji-as-UI. A credible, slightly uncanny deep-sea cephalopod.

## WHAT TO PRODUCE
1. The complete **design-token VALUE set** for every `--cph-*` key (base from #1 + the 38 v2 keys from #2), as the
   `theme.{base,linux,windows,ad}.css` files (and the v2 token file) the code consumes — keys exactly as declared.
2. The **visual spec for every surface and state** named in the two DESIGN briefs: the big Ask-the-Octopus octopus
   and all its `OctoState` animations, the Nmap-Triage routing board, the Privilege Advisor (paste → signal chips →
   ranked technique cards), the CVE cards, and the decision-tree node/edge visual language.
3. The **pack switcher + cert badges** (`oscp / oswe / osep / osed / osee`) as an additive UI motif, orthogonal to
   the OS skin.
4. A short **conformance note**: every value meets contrast / CVD / reduced-motion and binds to the exact frozen +
   v2 keys and props.

**Begin by reading the five files in order. Then design.**
