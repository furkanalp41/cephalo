All five must-fixes are applied and verified in the file. Here is the complete revised markdown.

# DESIGN-PROMPT-v2-arsenal.md — Cephalo v2 Surfaces Visual Brief (for Claude Design)

> **You already designed Cephalo v1** (see `DESIGN-PROMPT.md` — "The Abyssal Instrument": deep-pelagic dark, bioluminescent signal, a living octopus named **Octo**). **This brief is an ADDITIVE upgrade**: it OWNS the *new v2 surfaces* — the **Ask-the-Octopus** page (a bigger, anatomically richer Octo + a "summon" box), the **Privilege Advisor**, the **CVE lookup**, the **Nmap Triage** board, the **Tool Arsenal** page, and the **output-conditional decision-tree mindmap** visual language. It supplies concrete VALUES for every NEW `--cph-` KEY the CODE addendum declares in `TOKEN_KEYS_V2`.
>
> **You bind to the FROZEN ADDITIVE CONTRACT verbatim.** You import the new prop/type modules (`src/types/{arsenal,advisor,ask,cve,decision,nmap}.ts`, `src/types/components.v2.ts`, `src/types/tokens.v2.ts`) and the v1 frozen modules (`content.ts`, `engine.ts`, `components.ts`, `tokens.ts`). You **never rename a prop, redefine an enum value, or invent a token key**. You reuse the ONE `OctoState`, the ONE `Severity`, the ONE `Confidence`/`OS`/`Shell`/`CredMode`, and all v1 `--cph-*` tokens. You ADD only the keys listed in §0.1. Where this brief and the contract disagree, **the contract wins**.
>
> **THE LOAD-BEARING IDEA — design this in:** every "smart" v2 feature is **DETERMINISTIC, NOT AI**. The Ask box, the Advisor, the CVE lookup, the Nmap triage are *Ctrl-F over the user's own notes with synonyms*, *a printed flowchart*, *a static lookup table*, *a scan organizer*. The visuals must feel **alive and instant** yet **explicitly, visibly non-AI** — no "thinking spinner that implies a model," no chat bubbles, no "generating…". Every result carries an **explain-why** chip. This is an exam requirement, not a nicety.

---

## 0. THE SEAM YOU BIND TO (read first; do not deviate)

All v1 names from `DESIGN-PROMPT.md` §0 still hold (product **Cephalo**, mascot **Octo**, `data-os ∈ linux|windows|ad` never `activedirectory`, prefix `--cph-`, copy modes `filled|raw|display`, the literal `[UNVERIFIED]` badge, the single `Severity = info|low|medium|high|critical` ramp, `credMode = password|nthash|kerberos`). The v2 additions:

- **Mascot vocabulary is UNCHANGED and CLOSED.** `OctoState = 'idle' | 'greeting' | 'listening' | 'thinking' | 'found' | 'empty' | 'copied' | 'error' | 'celebrate'`. There is **no `summon` state** — the word "summon" in this brief names a *composition/pose* of the big hero Octo, realized with the frozen states (`idle`/`greeting` at rest, `listening` on focus, `thinking` while resolving, `found`/`empty` on result, `copied` on copy). Never add a state.
- **OctoState wiring on /ask (frozen, from the contract):** input focus → `listening`; resolve produces hits → `found` with `intensity = min(1, hits/8)`; resolve produces nothing → `empty`; copy a command → `copied`. The big Octo is `aria-hidden` and **never the sole signal** for any state.
- **Octo emits only `onClick`** (the contract reuses `OctopusMascotProps.onClick?:()=>void`). The Ask page nav (mascot click → `/ask`) is owned by the **parent header**, not by a new prop. **Do NOT add `navigateTo` to `OctopusMascotProps`.** The big Octo on /ask is a NEW wrapper component **`AskOctopusHero`** that *composes the frozen `OctopusMascot`* (its SVG is 100% w/h → the container governs scale) and adds halo/particle layers using the new `--cph-ask-*` / `--cph-octo-large-glow` keys.
- **New component props (single source of truth — import, never re-declare):** `AskOctopusProps`, `PrivilegeAdvisorProps`, `CveLookupProps`, `ToolArsenalProps`, `DecisionMindMapProps`, `NmapTriageBoardProps` (all in `src/types/components.v2.ts`). Every visual state you design maps to a field on these (e.g. `octoState`, `mode ∈ {summon,paste-scan}`, `resolution.matchVia`, `SignalMatch.state`, `CveMatch.matchKind`, `RouteFiring.matchedOn`, `AutofillProposal.conflictsWithUserValue`, `DecisionEdge.condition.kind`).
- **New data vocabulary you visualize (verbatim enums — never a parallel set):**
  - `IntentMatchVia = 'phrasebook' | 'alias' | 'search'` (the explain-why source).
  - `SignalMatch.state ∈ 'enabled' | 'disabled' | 'present'`; `EnumSource ∈ 'whoami-priv'|'whoami-groups'|'whoami-all'|'sudo-l'|'id'|'getcap'|'suid-find'|'systeminfo'|'uname'|'ad-misc'`.
  - `CveMatch.matchKind ∈ 'exact' | 'in-range' | 'product-only'`; `matches.any ⇒ unverified`.
  - `DecisionNodeKind = 'start' | 'check' | 'branch' | 'action' | 'outcome' | 'note'`; edge `condition.kind ∈ 'if-found' | 'if-absent' | 'else'`; `outcomeKind ∈ 'system' | 'root' | 'da' | 'creds' | 'dead-end'`.
  - `RouteFiring.matchedOn ∈ 'port' | 'service' | 'product' | 'portService'`; `RealmInference.os ∈ linux|windows|ad`; `themeSwitch.autoApplied` is **literally `false`** (UI confirms; never auto-applies).
  - `ToolCategory` (18 values) + `ToolFormat`; `ToolBinary.fetchNote` is the **required literal** "You fetch this yourself. Nothing is bundled or hosted by Cephalo." — render it verbatim.

### 0.1 THE COMPLETE, CLOSED v2 TOKEN-KEY LIST (you define every one of these, and no others)

These are the ONLY new keys. They are declared by code in `src/types/tokens.v2.ts` as `TOKEN_KEYS_V2`; you supply VALUES. The gate unions `TOKEN_KEYS ∪ TOKEN_KEYS_V2` and rejects any stray `--cph-*`. **Reuse v1 keys wherever possible** (`--cph-sev-*`, `--cph-node-*`, `--cph-var-*`, `--cph-confidence-*`, `--cph-octo-*`, `--cph-color-*`, `--cph-elev-*`, `--cph-motion-*`, type/radius). Only reach for a v2 key when the v1 set genuinely has no home.

- **ask (9):** `--cph-ask-bg` · `--cph-ask-surface` · `--cph-ask-input-bg` · `--cph-ask-octo-halo` · `--cph-ask-suggestion` · `--cph-ask-result-accent` · `--cph-ask-explain-fg` · `--cph-intent-pin-accent` · `--cph-octo-large-glow`
- **advisor (6):** `--cph-advisor-signal-detected` · `--cph-advisor-signal-strong` · `--cph-advisor-signal-weak` · `--cph-advisor-signal-unverified` · `--cph-advisor-rank-1` · `--cph-advisor-rank-track`
- **decision (9):** `--cph-dec-node-check` · `--cph-dec-node-action` · `--cph-dec-node-outcome-system` · `--cph-dec-node-outcome-da` · `--cph-dec-branch-if-found` · `--cph-dec-branch-if-absent` · `--cph-dec-branch-else` · `--cph-dec-branch-manual` · `--cph-dec-trace`
- **tool (3):** `--cph-tool-verified-src` · `--cph-tool-kali-path-bg` · `--cph-tool-fetch-warn`
- **cve (4):** `--cph-cve-match-exact` · `--cph-cve-match-fuzzy` · `--cph-cve-degraded` · `--cph-cve-edb-bg`
- **nmap (5):** `--cph-nmap-realm-ad` · `--cph-nmap-realm-windows` · `--cph-nmap-realm-linux` · `--cph-nmap-confirm-bg` · `--cph-nmap-explain-fg`
- **shared (2):** `--cph-unverified-badge-bg` · `--cph-unverified-badge-fg`

**38 new keys total.** Need a "danger" hue? → reuse `--cph-sev-*`. Need a phase chip color? → reuse `--cph-node-*`. Need a variable pill? → reuse `--cph-var-*`. Need a glow? → reuse `--cph-octo-glow` (small) or the new `--cph-octo-large-glow` (the big hero only). There is no other escape hatch.

---

## 1. ART DIRECTION — "The Summoning Chamber" (extends The Abyssal Instrument)

The v2 surfaces live in the **same abyss** but in deeper, more deliberate chambers. v1 was the *workbench* (variable bar + specimen tubes); v2 is the **observatory** where you *ask the dark a question and it surfaces what you already wrote down*. Keep all three v1 pillars (Abyssal calm · Bioluminescent signal · Living instrument) and add a fourth that governs every v2 page:

4. **Explainable retrieval, not oracle.** The instrument never *pretends to think for you*. It shows its work: which alias matched, which line of your pasted output fired a rule, which version range a CVE sits in, which port routed to which technique. The aesthetic of a **librarian's card catalog and a dive-computer**, not a chatbot. Confidence is conveyed by **provenance, not personality**.

**The Ask page is the one hero surface** where Octo is allowed to be large and theatrical — a calm, watchful abyssal creature you address directly. Everywhere else (Advisor, CVE, Arsenal, Decision map) Octo stays in the small header dock; the v2 chrome is quiet, tabular, instrument-grade.

### 1.1 THE NON-AI LAW, MADE VISIBLE (hard requirement, repeated from the invariants)

Design the *deterministic-not-AI* distinction into the pixels:
- **No "AI" affordances anywhere.** No chat bubbles, no message threads, no streaming-token shimmer, no typing dots, no "✨ generate", no avatar-of-an-assistant, no "thinking…" copy that implies cognition, no confidence-as-a-percentage-the-model-feels. The summon box is a **search/console field**, not a conversation.
- **Every result row carries an explain-why chip** (the `--cph-ask-explain-fg` / `--cph-nmap-explain-fg` text): a small, plain-language tag — `matched alias "kerberoasting"`, `phrasebook: dump hashes with powershell`, `index match: title`, `port 445 → SMB rule`, `SeImpersonatePrivilege on line 7`. This chip is **mandatory and non-removable**; it is the visual proof the result was *retrieved*, not *invented*.
- **A persistent, non-dismissible banner** (extend the v1 `ResponsibleUseNote.tsx`) sits on every v2 route, literal copy: **"Cephalo is an offline, deterministic personal reference. NO AI, NO network, NO telemetry. It does not scan, exploit, or automate attacks — you run every command and make every decision. Verify current exam rules yourself."** Quiet muted text + small shield/anchor glyph; present, never nagging, never blocking.
- **Per-feature inline chip** on /ask, /advisor, /cve, /decision and the Paste-scan tab: the literal **"Deterministic retrieval, not AI — here's why this matched."** rendered next to the results header.

### 1.2 ANTI-AI-SLOP BANS (inherit v1 §1.1 in full, plus these v2 additions — violating any = rejection)
- All v1 bans still apply: **no generic purple-gradient SaaS hero, no default glassmorphism, no kawaii/clip-art octopus, no emoji-as-UI, no meaning-by-hue-alone, no drop-shadow soup / neon-on-neon / Matrix rain / skeuomorphic leather.**
- **NO chatbot UI** (see §1.1). The big Octo is a *creature you query*, not an assistant persona with a name-tag and a send button that looks like a messaging app.
- **NO fake "AI is working" theater.** The `thinking` Octo state on /ask is an *organic ripple of a real animal*, capped tight (results feel <16ms); it must never read as "the model is composing an answer." Reduced-motion users see an instant result with zero implication of latency-as-cognition.
- **NO invented authority.** Never mock up a CVE, EDB id, build number, CLSID, flag, or PowerView function that isn't in the authored data. Uncertain → the literal `[UNVERIFIED]` badge + a Sources affordance. Defang every example (`<tun0-ip>`, RFC5737 `198.51.100.0/24`/`192.0.2.0/24`, RFC3849 `2001:db8::/32`, `example.local`/`example.lab`). **No machine names anywhere** — not in copy, mock scans, layer names, or asset filenames. Sensitive vars (`PASS`/`NTHASH`/`AESKEY`) masked + session-only in every mock.

---

## 2. TOKEN VALUES — every new `--cph-` KEY (base + 3 realms)

You deliver the v2 token values appended into the **same four files** you already ship (`theme.base.css`, `theme.linux.css`, `theme.windows.css`, `theme.ad.css`). **`theme.base.css` defines all 38 new keys at `:root`** (so they resolve with no `data-os` present, exactly like v1); the realm files **override only** the keys in the **canonical re-skin set** defined verbatim below. Keys whose meaning is **constant across realms** (the realm-indicator hues `--cph-nmap-realm-*`, the severity-derived decision/cve hues, the structural advisor signal-tier hues, the `[UNVERIFIED]` badge) are defined once at `:root` and **not** overridden — so the visual language stays learnable. Every value passes **WCAG 2.1 AA** (4.5:1 text, 3:1 UI/graphics) and is **CVD-safe** (paired with shape/icon/label, never hue-only). Hex below is starting truth; micro-tune for contrast but keep semantics.

> **CANONICAL RE-SKIN SET (single source of truth — §2.2 CSS, Deliverable #1, and the parity gate all byte-match this list).** The realm files (`theme.windows.css`, `theme.ad.css`) override **exactly these 10 keys, and no others**:
> `--cph-ask-bg` · `--cph-ask-surface` · `--cph-ask-input-bg` · `--cph-ask-octo-halo` · `--cph-ask-result-accent` · `--cph-ask-explain-fg` · `--cph-intent-pin-accent` · `--cph-octo-large-glow` · `--cph-advisor-rank-1` · `--cph-nmap-confirm-bg`.
> This is the **`ask-*` family EXCEPT `--cph-ask-suggestion`** (which is **intentionally constant** dim muted text across all realms) **plus** the two realm-following structural accents `--cph-advisor-rank-1` (the #1-recommendation accent = realm primary) and `--cph-nmap-confirm-bg` (the confirm-theme affordance ground = realm primary). Every other v2 key is `:root`-only.

### 2.1 `theme.base.css` — `:root` (Phosphor-Reef-derived defaults)

```css
:root{
  /* ── ask (F4) ─────────────────────────────────────────────── */
  --cph-ask-bg:            #050D0B;  /* deeper than --cph-color-bg: the chamber is darker, Octo is the light */
  --cph-ask-surface:       #0C1A16;  /* summon-box + result rows ground */
  --cph-ask-input-bg:      #0A1713;  /* the console field interior (darkest, recessed) */
  --cph-ask-octo-halo:     radial-gradient(60% 60% at 50% 42%, rgba(43,212,168,.22), rgba(43,212,168,0) 70%); /* soft bioluminescent pool under the big Octo */
  --cph-ask-suggestion:    #9FBDB2;  /* dim suggestion/recent-query text (= text-muted family) */
  --cph-ask-result-accent: #2BD4A8;  /* result-row left accent = realm primary */
  --cph-ask-explain-fg:    #7FB8AB;  /* the mandatory explain-why chip text (AA on --cph-ask-surface) */
  --cph-intent-pin-accent: #F2B33D;  /* the "pinned intent" (phrasebook/alias rank-0) accent = amber discovery */
  --cph-octo-large-glow:   0 0 120px 12px rgba(43,212,168,.30), 0 0 56px rgba(43,212,168,.22); /* the BIG hero halo (only AskOctopusHero uses this; small Octo keeps --cph-octo-glow) */

  /* ── advisor (F3) ─────────────────────────────────────────── */
  --cph-advisor-signal-detected:   #57E6C2;  /* a recognized signal chip border/glow (cyan-mint = "found in your paste") */
  --cph-advisor-signal-strong:     #F2B33D;  /* high-leverage signal (e.g. SeImpersonate) — amber emphasis */
  --cph-advisor-signal-weak:       #6E8A82;  /* recognized but low/disabled-state signal — desaturated. 3:1-GRAPHIC ROLE ONLY (chip border/line + icon); NOT body text. Its tier name is carried by the always-present text label, which uses --cph-color-text (AA 4.5:1), NOT this hue. Borderline on the darkest --cph-ask-input-bg/--cph-ask-surface grounds — must clear 3:1 as a stroke; bump luminance if ever used as a text fill. */
  --cph-advisor-signal-unverified: #E8C24A;  /* signal whose mapped rule is [UNVERIFIED] (gold caution) */
  --cph-advisor-rank-1:            #2BD4A8;  /* the #1 ranked recommendation accent (realm primary) */
  --cph-advisor-rank-track:        rgba(127,127,127,.16); /* the rank-meter track behind rank pips */

  /* ── decision (F5/F7) ─────────────────────────────────────── */
  --cph-dec-node-check:           #4EA3E0;  /* CHECK node (run-this-command) = blue, reads as "input/observe" */
  --cph-dec-node-action:          #E8803A;  /* ACTION/MOVE node (do-this-now) = coral, reads as "act" */
  --cph-dec-node-outcome-system:  #57D08A;  /* OUTCOME: SYSTEM/root reached = success green */
  --cph-dec-node-outcome-da:      #E8C24A;  /* OUTCOME: Domain Admin reached = kerberos gold (the crown) */
  --cph-dec-branch-if-found:      #57D08A;  /* edge label/line when "output CONTAINS signal X" → green go */
  --cph-dec-branch-if-absent:     #C98A3A;  /* edge for "signal X ABSENT" → amber detour */
  --cph-dec-branch-else:          #8294A0;  /* the catch-all fallback edge → neutral grey (never dead-ends). 3:1-GRAPHIC ROLE ONLY (edge line/stroke + the ↳ glyph); NOT text. The "otherwise" edge label text uses --cph-color-text (AA 4.5:1), NOT this hue. Borderline on the darkest grounds — must clear 3:1 as a stroke; bump luminance if ever used as a text fill. */
  --cph-dec-branch-manual:        #B07CE8;  /* edge the human picks by hand (no auto-evaluable signal) = violet */
  --cph-dec-trace:                rgba(87,230,194,.85); /* the walked-path trail highlight (current lineage glows) */

  /* ── tool (F2) ────────────────────────────────────────────── */
  --cph-tool-verified-src:  #57D08A;  /* "official source linked" check (quiet green) */
  --cph-tool-kali-path-bg:  rgba(78,163,224,.14); /* the mono kaliPath pill ground (cool, "ships locally") */
  --cph-tool-fetch-warn:    #E8C24A;  /* the literal fetchNote line accent (gold: "you fetch this yourself") */

  /* ── cve (F6) ─────────────────────────────────────────────── */
  --cph-cve-match-exact:  #57D08A;  /* matchKind 'exact' — green, version sits exactly in range */
  --cph-cve-match-fuzzy:  #E8C24A;  /* matchKind 'in-range' / loose — gold caution */
  --cph-cve-degraded:     #E8803A;  /* matchKind 'product-only' / any ⇒ degraded → coral + forced [UNVERIFIED] */
  --cph-cve-edb-bg:       rgba(232,128,58,.16); /* the EDB-id / searchsploit mono pill ground */

  /* ── nmap (F8) — REALM HUES ARE CONSTANT ACROSS THEMES ────── */
  --cph-nmap-realm-ad:      #B07CE8;  /* inferred realm 'ad'      — amethyst (matches AD biome accent) */
  --cph-nmap-realm-windows: #3A9BFF;  /* inferred realm 'windows' — azure */
  --cph-nmap-realm-linux:   #2BD4A8;  /* inferred realm 'linux'   — teal */
  --cph-nmap-confirm-bg:    rgba(43,212,168,.16); /* the "Confirm theme switch" affordance ground (never auto) */
  --cph-nmap-explain-fg:    #7FB8AB;  /* per-firing "matched port 445 / SMB" explain text */

  /* ── shared ───────────────────────────────────────────────── */
  --cph-unverified-badge-bg: rgba(232,194,74,.14); /* [UNVERIFIED] badge ground (v2 surfaces) */
  --cph-unverified-badge-fg: #E8C24A;              /* [UNVERIFIED] badge text/border (= confidence-unverified family) */
}
```

> **Reduced-motion:** the v1 `@media (prefers-reduced-motion: reduce)` block already collapses `--cph-motion-*` and the octo ease; the v2 surfaces add **no new motion tokens** — they reuse `--cph-motion-fast/base/slow` and `--cph-ease-octo`. The big-hero halo (`--cph-octo-large-glow`) is a *static shadow string*; its pulsing is JS/Rive-driven and must be suppressed under reduced-motion (steady glow, no breathing).

### 2.2 Realm overrides (re-skin ONLY the canonical 10-key set from §2 above)

The **summoning chamber** belongs to the current biome, so the canonical re-skin set follows the realm primary: the `ask-*` family **except `--cph-ask-suggestion`** (which stays constant dim text), plus `--cph-advisor-rank-1` and `--cph-nmap-confirm-bg`. The realm-indicator hues (`--cph-nmap-realm-*`), the decision/cve hues, the advisor signal-tier structural hues, and the `[UNVERIFIED]` badge **stay constant** (learnable language). The three CSS blocks below override exactly the 10 canonical keys — `--cph-ask-suggestion` is deliberately absent from every block.

```css
/* theme.windows.css — Azure Trench */
[data-os="windows"]{
  --cph-ask-bg:            #070C16;
  --cph-ask-surface:       #101826;
  --cph-ask-input-bg:      #0C1320;
  --cph-ask-octo-halo:     radial-gradient(60% 60% at 50% 42%, rgba(58,155,255,.22), rgba(58,155,255,0) 70%);
  --cph-ask-result-accent: #3A9BFF;
  --cph-ask-explain-fg:    #9FB6D6;
  --cph-intent-pin-accent: #51E0F2;   /* glacial cyan discovery */
  --cph-octo-large-glow:   0 0 120px 12px rgba(58,155,255,.28), 0 0 56px rgba(58,155,255,.20);
  --cph-advisor-rank-1:    #3A9BFF;
  --cph-nmap-confirm-bg:   rgba(58,155,255,.16);
}

/* theme.ad.css — Forest of Trust */
[data-os="ad"]{
  --cph-ask-bg:            #0C0610;
  --cph-ask-surface:       #190F1F;
  --cph-ask-input-bg:      #140B1A;
  --cph-ask-octo-halo:     radial-gradient(60% 60% at 50% 42%, rgba(176,124,232,.24), rgba(176,124,232,0) 70%);
  --cph-ask-result-accent: #B07CE8;
  --cph-ask-explain-fg:    #C3A9CC;
  --cph-intent-pin-accent: #E8C24A;   /* kerberos gold discovery */
  --cph-octo-large-glow:   0 0 120px 12px rgba(176,124,232,.30), 0 0 56px rgba(176,124,232,.22);
  --cph-advisor-rank-1:    #B07CE8;
  --cph-nmap-confirm-bg:   rgba(176,124,232,.16);
}
/* theme.linux.css — Phosphor Reef.
   DECISION (explicit, gate-binding): linux IS the :root default biome, so it re-states the SAME
   canonical 10-key values explicitly. This makes realm switching symmetric (all three realm files
   carry the full 10-key block) and lets the token-key-parity gate diff the three blocks for an
   identical key set. The values equal :root because :root is Phosphor-Reef (linux)-derived. */
[data-os="linux"]{
  --cph-ask-bg:            #050D0B;
  --cph-ask-surface:       #0C1A16;
  --cph-ask-input-bg:      #0A1713;
  --cph-ask-octo-halo:     radial-gradient(60% 60% at 50% 42%, rgba(43,212,168,.22), rgba(43,212,168,0) 70%);
  --cph-ask-result-accent: #2BD4A8;
  --cph-ask-explain-fg:    #7FB8AB;
  --cph-intent-pin-accent: #F2B33D;
  --cph-octo-large-glow:   0 0 120px 12px rgba(43,212,168,.30), 0 0 56px rgba(43,212,168,.22);
  --cph-advisor-rank-1:    #2BD4A8;
  --cph-nmap-confirm-bg:   rgba(43,212,168,.16);
}
/* (If you prefer linux to inherit :root with NO override block, that is equally conformant — the
   parity gate accepts an absent [data-os="linux"] block as "inherits :root". Pick ONE and ship it;
   this brief ships the explicit block above for cross-realm symmetry.) */
```

> **CVD + AA note:** `--cph-dec-branch-if-found` (green) vs `--cph-dec-branch-if-absent` (amber) vs `--cph-dec-branch-else` (grey) must never be told apart by hue alone — each edge also carries a **glyph + text label** (`✓ if found` / `⌀ if absent` / `↳ otherwise`, drawn as bespoke line-icons, not emoji). Same for advisor signal tiers and CVE match kinds — always hue **+ icon + label**.
>
> **Two greys pinned to 3:1-graphic, never <4.5:1 text — explicit call-out (audit by name in Deliverable #6):** `--cph-advisor-signal-weak` (#6E8A82) and `--cph-dec-branch-else` (#8294A0) sit near the AA-text threshold on the darkest grounds (`--cph-ask-input-bg` #0A1713, `--cph-ask-surface` #0C1A16). They are **constrained to 3:1 graphic roles only** — chip/edge **borders, lines, and icons** — and must clear **3:1 against every ground they paint on**. Their semantic ("weak/disabled" tier, "otherwise" branch) is ALWAYS carried by the adjacent **text label** rendered in `--cph-color-text` (AA 4.5:1), never by these hues as a text fill. If a future mock needs either as text, **bump its luminance to clear 4.5:1 first**.

---

## 3. THE BIG OCTOPUS — `AskOctopusHero` (the centerpiece of /ask)

This is the one place Octo becomes **large, anatomically richer, and theatrical**. `AskOctopusHero` is a NEW wrapper that **composes the frozen `OctopusMascot`** (passing the frozen `state`/`intensity`/`theme`/`reducedMotion`) and wraps it in halo + particle + reflection layers. It owns the /ask art direction. It is `aria-hidden` and **never the sole signal** (results are announced via `aria-live`, see §10).

### 3.1 Form & anatomy (richer than the 120px header Octo)

Rendered ~**380–520px** tall, centered above the summon box, anchored in a soft bioluminescent pool (`--cph-ask-octo-halo`) with the big halo (`--cph-octo-large-glow`). It is the **same credible deep-sea cephalopod** as v1 — never cute, never a chatbot avatar — but with detail the small dock can't afford:

- **Mantle:** a soft domed head with subtle **chromatophore mottling** — faint darker speckles that drift and re-cluster slowly, reading as living skin (not a flat fill). A gentle **counter-shaded** gradient (darker dorsal, luminous ventral) gives volume without a SaaS gradient.
- **Eyes (the emotional center):** two large **W-shaped / horizontal slit pupils** (true cephalopod), with a thin luminous iris ring in `--cph-octo-tint`. The eyes *track the summon box*: pupils dilate on focus (`listening`), narrow slightly while resolving (`thinking`), widen on `found`. Occasional slow blink (a nictitating sweep) on `idle`. The eyes carry the personality; **no mouth, no eyebrows, no cartoon face.**
- **Eight tentacles** with believable taper and **suction-cup rows** (small luminous dots on the underside) that catch light as the arm curls. Arms move with weight, follow-through, and slight independent phase (not a single rigid rig). Two "lead" arms are more expressive (they reach toward the box); the rear arms drift as ballast.
- **Skin / chromatophore luminescence** is the **primary expressive channel** — color shifts read state more than posture does. A faint **breathing pulse** of the whole-body glow (~4s) on idle.
- **Personality:** *calm, watchful, competent, quietly uncanny.* A deep-sea librarian-creature who already knows where everything is and brings you exactly what you named. It is **summoned**, not "chatted with."

### 3.2 The motion states the Ask page exercises (all frozen `OctoState`)

The contract wires focus→`listening`, resolve→`found`/`empty`, copy→`copied`. The page also uses `idle`/`greeting` as its "summon-ready" rest, and `error` for a defanged-blocked copy. Map every beat to a frozen state — **invent nothing**.

| Page beat | Frozen `OctoState` | Big-Octo behavior (richer than dock) | Skin token |
|---|---|---|---|
| **Summon-ready / at rest** ("type to summon") | `idle` (first paint after a `greeting` perk) | Slow mantle breath; lead arms drift in a slow open "ready to receive" posture; eyes scan slowly; halo breathes at low amplitude. | `--cph-octo-idle` |
| **First arrival on /ask** | `greeting` | One-shot perk-up: a single lead arm does a slow welcoming unfurl; eyes widen warmly; halo blooms once. | `--cph-octo-greeting` |
| **Box focused** ("listening") | `listening` | Octo leans toward the box; both lead arms rotate to point at the field; pupils dilate; `--cph-ask-octo-halo` intensifies. **Capped — never reads as latency.** | `--cph-octo-listening` |
| **Resolving / typing** ("retrieving") | `thinking` | Lead arms **curl toward the box** as if drawing cards up from the dark; a single **fixed-duration** organic chromatophore flicker crosses the mantle; sparse plankton drift. The flicker is a **constant-tempo retrieval beat — its duration and amplitude are FIXED, never scaled by query length, keystroke count, or elapsed time** (a ramp tied to how much you typed would read as progressive computation/latency-as-cognition — banned). `intensity` is **not** consumed by `thinking` (the frozen wiring computes `intensity` only for `found` as `min(1, hits/8)`). **This is retrieval, not cognition** — short, organic, no spinner, no dots, no growing progress feel. | `--cph-octo-thinking` |
| **Results surfaced** ("found") | `found` | A bioluminescent **burst**: arms fan out *presenting* the result rows that rise beneath; bloom size = `intensity = min(1, hits/8)` (more hits → brighter, more suction-cups light). | `--cph-octo-found` |
| **Nothing matched** ("empty") | `empty` | Slight deflate; arms droop; skin desaturates to `--cph-octo-empty`; a small apologetic head-tilt. Paired with calm copy ("nothing surfaced — try a technique, port, or `whoami /priv` line"). | `--cph-octo-empty` |
| **Command copied** | `copied` | Satisfying ink-flash pulse; skin pulses green; a tiny `--cph-octo-ink` puff releases; one lead arm "taps." | `--cph-octo-copied` |
| **Copy-filled blocked** (unresolved/sensitive) | `error` | Brief recoil; skin flashes `--cph-octo-error`; small defensive ink wisp; eyes narrow. Never loud. | `--cph-octo-error` |
| **Milestone** (rare, e.g. cleared a decision walk) | `celebrate` | Full bloom, arms spiral, magenta `--cph-octo-celebrate` + sparse plankton confetti (no emoji). | `--cph-octo-celebrate` |

### 3.3 Reduced-motion / no-JS fallback (REQUIRED)

A **static, layered inline-SVG** big Octo that conveys every state via **posture + skin color + a state label/icon** — no breathing, no arm motion, no particles, no halo pulse, no ink puff. State changes are **instant** token swaps on the same `--cph-octo-*` keys plus the new `--cph-octo-large-glow` rendered as a *steady* (non-pulsing) shadow. Because Octo is `aria-hidden` and never the sole signal, the reduced-motion user loses **zero information** — the result rows + `aria-live` + explain-why chips carry everything. Deliver the big SVG as clean labeled groups (mantle / mottling / eyes / 8 arms / suction-rows / skin-glow) so code swaps the active state by class.

---

## 4. THE SUMMON BOX — `AskOctopusView` interaction (F4: type-what-you-want → results)

Binds to `AskOctopusProps`: `octoState, theme, reducedMotion, query, resolution, mode, nmap, onQueryChange, onSubmit, onModeChange, onPasteScan, onSelectTechnique, onCopyCommand, onConfirmTheme, onApplyAutofill`. Layout: big Octo (§3) → **mode tabs** (`summon` | `paste-scan`) → the input → results. The page is `--cph-ask-bg`; the box + rows are `--cph-ask-surface` over `--cph-ask-input-bg` fields.

**The summon box itself** is a single wide **console field** (not a chat composer): a tall monospace-friendly input on `--cph-ask-input-bg`, a left **anchor/sonar glyph** (never a chat icon), placeholder *"summon a command — type a technique, port, tool, or a `whoami /priv` line"*. No send-bubble; **Enter** submits (`onSubmit`), live results update as you type (`onQueryChange`). On focus the field gains a `--cph-color-focus` ring **and** Octo enters `listening`.

**The retrieval feels alive but is explicitly NOT AI:**
- Results **emerge from darkness** — a fast staggered fade-up (≤180ms, `--cph-ease-emphasized`) from a dim scrim, like specimens rising into Octo's light. Never a "generating…" reveal; the moment results exist they are fully formed and instantly copyable.
- **The pinned intent** (when `resolution.matchVia ∈ {phrasebook, alias}`, i.e. an exact curated hit, rank 0) renders as a **distinct top card** outlined in `--cph-intent-pin-accent` with a small pin glyph and the label *"exact match"* — this is the deterministic alias/phrasebook layer announcing itself. Below it, the index-fallback hits (`matchVia: 'search'`) render as ordinary result rows with `--cph-ask-result-accent` left bars.
- **Every row carries the mandatory explain-why chip** in `--cph-ask-explain-fg`, reading `resolution.matchVia` + the matched record: `alias "kerberoasting" → kerberoast`, `phrasebook: "dump hashes with powershell"`, `index match: title · spn`. This chip is the visual guarantee of determinism — never hide it.
- **Privilege short-circuit (bridge to F3):** when the query resolves through an alias `signalKey` / phrase `requiresSignals` (e.g. *"what can I do with SeImpersonate"*), pin a special **Advisor hand-off card** — a distinct card with the advisor glyph, copy *"This is a privilege you hold → open the Privilege Advisor"*, deep-linking to `/advisor`. It looks unmistakably like a *routing* affordance, not an answer.

**Result row anatomy** (reuse v1 CommandCard for command results): type icon · title · thin context line (os/phase/tool) · the explain-why chip · a one-click **copy** (calls `onCopyCommand(id, text)` → Octo `copied`). Technique rows call `onSelectTechnique(id)`. Empty query shows recent/most-used + a hint; zero results → Octo `empty` + the calm empty copy.

**Mode tabs** (`summon` | `paste-scan`): two quiet segmented tabs above the input. `summon` is the natural-language box above; `paste-scan` swaps the input into a multi-line **scan paste** textarea and renders the `NmapTriageBoard` (§7) below. `onModeChange` switches; the big Octo stays, reacting `thinking → found/empty` to either mode.

---

## 5. PRIVILEGE ADVISOR — `PrivilegeAdvisorView` (F3: paste output → signal chips → ranked cards)

Binds to `PrivilegeAdvisorProps`: `theme, source, rawInput, matches, recommendations, onSourceChange, onInputChange, onParse, onCopyCommand, onOpenTechnique, onFetchTool`. Three vertical stages, left→right or top→down: **PASTE → SIGNALS → RECOMMENDATIONS**. This is an instrument panel, not a chat — quiet, tabular, fast.

**Stage 1 — Paste.** A large monospace textarea on `--cph-color-surface` (recessed `--cph-color-surface-raised` inset) for `rawInput`, with a **source selector** (`EnumSource` segmented control / dropdown: *whoami /priv · whoami /groups · whoami /all · sudo -l · id · getcap · find -perm SUID · systeminfo · uname · ad-misc*) driving `onSourceChange`. A clear **"Analyze"** button (`onParse`). A **persistent session-only lock chip** ("this paste may contain host data — session-only, never saved"; same masked/forget discipline as PASS/NTHASH). A small placeholder shows a defanged example (e.g. `SeImpersonatePrivilege  Impersonate a client  Enabled`) — **no machine names, no real hosts.**

**Stage 2 — Signal chips** (one per `SignalMatch`). Each parsed signal becomes a **chip** showing the human label (`PrivilegeSignal.label`, e.g. *"SeImpersonatePrivilege (held)"*), a tier color, and its **state** (`SignalMatch.state ∈ enabled|disabled|present`) as a small text tag — *the chip fires whether Enabled or Disabled* (the exploit enables the held priv), so `disabled` reads as `--cph-advisor-signal-weak` but still actionable, never greyed-out-dead. Tiers:
- recognized & high-leverage → `--cph-advisor-signal-strong` (amber, e.g. SeImpersonate, SeBackup, SeDebug, Backup Operators);
- recognized, standard → `--cph-advisor-signal-detected` (cyan-mint border);
- recognized but disabled/low → `--cph-advisor-signal-weak`;
- recognized but its mapped rule is `[UNVERIFIED]` → `--cph-advisor-signal-unverified` (gold) + the literal `[UNVERIFIED]` badge.
Each chip is **clickable to scroll the exact `rawLine` it came from** — hovering a chip highlights the source line in the paste (explainability: *"this fired because of line 7"*). **Unrecognized lines** are surfaced verbatim in a quiet "not recognized" list — **never AI-guessed, never hidden** ("Cephalo only matches what it knows; it does not infer.").

**Stage 3 — Ranked recommendation cards** (one per `AdvisorRecommendation`, sorted by `rule.rank` then id). Each card:
- a **rank pip / meter** on the left using `--cph-advisor-rank-1` for #1 over `--cph-advisor-rank-track` (the #1 card is visually primary; lower ranks recede) — **rank shown as number + position, never hue-only**;
- **which signal(s) triggered it** (`triggeredBy[]` → the chips from Stage 2, echoed small, with the cited `rawLine` on hover) — the explain-why is built in;
- the **recommended technique** (`recommendsTechniqueId`) as a clickable title (`onOpenTechnique`);
- the **ready-to-copy command** rendered through the **frozen `CommandCard`** (the advisor never string-builds — `commandId` is rendered via the frozen TemplateEngine), with the v1 var-state styling + copy-filled/raw (`onCopyCommand`);
- a **"Fetch the tool →" affordance** (`onFetchTool(toolBinaryId)`) — a clearly-marked link styled with `--cph-tool-verified-src` (official-source check) opening the Arsenal entry (§8); it carries the literal `fetchNote`. **Never a download button** — it links to the official source page only.
- **build-gated / version-gated cards**: when a rule depends on a Windows build (PrintSpoofer/GodPotato vs JuicyPotato) the card shows the **build bracket** as a small mono tag (`build ≥ 17763`), and the `[UNVERIFIED]` JuicyPotato path is gold-badged with refs. Version-gated kernel/sudo rules render a **"check CVE →"** hand-off chip (`cveLookupHint`) into /cve (§6) instead of asserting an exploit.
- `unverified` cards: literal `[UNVERIFIED]` badge (`--cph-unverified-badge-*`) + mandatory **Sources** disclosure (`references[]`) + the `unverifiedReason` text. Never hide them; never gold-star verified ones.

Per-feature non-AI chip at the results header: *"Deterministic retrieval, not AI — these are rules over the lines you pasted."*

---

## 6. CVE LOOKUP — `CveLookupView` (F6: version in → exploit cards)

Binds to `CveLookupProps`: `product, version, matches, onQueryChange, onCopySearchsploit, onOpenReference`. A **static lookup table**, framed as exactly that. Layout: a two-field query bar (**product** + **version**, e.g. `ProFTPD` / `1.3.5`) calling `onQueryChange(p, v)` → a column of **exploit cards** (one per `CveMatch`).

**Query bar:** two labeled inputs on `--cph-color-surface`; product autocompletes against known `productAliases` (offline); version is free monospace. A small literal note: *"Offline curated dataset. No live CVE API. No auto-download, no auto-run."*

**Exploit card** (per `CveMatch`):
- **Match-kind ribbon** — `matchKind` drives a left ribbon + label: `exact` → `--cph-cve-match-exact` (green, *"version in range"*); `in-range` → `--cph-cve-match-fuzzy` (gold, *"within affected range"*); `product-only` → `--cph-cve-degraded` (coral, *"product match — version unconfirmed"*) which **forces the `[UNVERIFIED]` badge** (also when `versionRange.any`). Hue **+ icon + text**, always.
- **CVE id** (`cveId`, mono, `/CVE-\d{4}-\d{4,}/`) and **title**; absent id ⇒ `[UNVERIFIED]`.
- **EDB id + searchsploit term** in a mono pill on `--cph-cve-edb-bg`. The card's primary action is **"Copy `searchsploit {term}`"** and **"Copy `searchsploit -m {edbId}`"** (`onCopySearchsploit`) — the **only "tool" the app touches, and only as copy-to-clipboard the human runs locally**. This is the always-present escape hatch (even on degraded matches).
- **Exploit type** (`ExploitType`) + **platform** as quiet chips; **requiresAuth** flag if set.
- **Sources** (`ref` + `references[]` → `onOpenReference`) — REQUIRED, NVD/EDB/vendor; never invent an id or link.
- **Related technique** (`relatedTechniqueId`) deep-link if present.

A synthetic **searchsploit escape-hatch row** always renders last (even on zero curated matches): *"Not sure? Run `searchsploit {product} {version}` locally — offline and exam-legal."* Per-feature non-AI chip: *"Static lookup table, not AI — curated, cited, offline."*

---

## 7. NMAP TRIAGE — `NmapTriageBoard` on the /ask 'Paste scan' tab (F8)

Binds to `NmapTriageBoardProps`: `result, theme, onConfirmTheme, onApplyAutofill, onOpenTechnique, onOpenCve`. Lives **inside /ask** as the `paste-scan` mode (§4) — paste raw nmap (human / `-oG` / `-oX`), the board organizes & **routes** it. Octo reacts `thinking → found/empty`. It **organizes the scan and points; the human runs every command** — never scans, never exploits.

**Layout top → bottom:**

1. **Parse summary + warnings.** A quiet strip: detected format (`human|grep|xml|unknown`), host count, and any `warnings[]` (the parser **never throws** — it degrades). `parsedAt` is cosmetic and **never shown as load-bearing**.

2. **Inferred-realm banner + Confirm affordance (the headline interaction).** From `RealmInference`, a banner using the **constant** realm hue — `--cph-nmap-realm-ad|windows|linux` — reading e.g. *"Looks like Active Directory (kerberos + ldap + smb)"* with the **evidence list** (`evidence[]`) and a **confidence** tag (`verified` only on margin≥2 with a strong AD-gate signal; else `unverified` + caution). Because `themeSwitch.autoApplied === false`, the realm is **NEVER auto-applied** — instead render a clearly-labeled **"Switch theme to {realm} →"** button on `--cph-nmap-confirm-bg` that calls `onConfirmTheme(os)` and only then flips `data-os` (smooth v1 cross-fade + Octo `greeting`). Make the *proposed-not-applied* state obvious (a dotted/ghost preview, not a committed skin).

3. **Per-port routing board** (the core). A **prioritized table/cards**, one block per open port (`PortTriage`), ordered by severity then specificity then port:
   - **Port header:** `port/proto` + `service` + `product version` banner (mono). State chips for `open` / `open|filtered`.
   - **Routed techniques** (`RouteFiring[]` → `techniqueIds`): clickable chips (`onOpenTechnique`) — the "next moves" for that service. Severity per firing uses the **v1 `--cph-sev-*`** ramp (shape+icon+label), reusing the v1 `--cph-node-*` phase tints for the technique chips.
   - **Explain-why per firing** (mandatory, `--cph-nmap-explain-fg`): `RouteFiring.matchedOn` + `matchedText`, e.g. *"matched port 445 → SMB"*, *"matched product `Samba` → linux override"*, *"matched service `kerberos` → AD"*. This is the determinism proof.
   - **CVE handoff** (`CveHandoff` when `port.version` exists): an inline **"known exploits →"** row (`onOpenCve`) surfacing F6 matches by `entryIds`, gold-badged `[UNVERIFIED]` on loose match, **no version ⇒ no handoff** (never fabricate).

4. **Autofill panel** (`AutofillProposal[]`). Proposed variable fills — `RHOST`/`TARGET` ← host ip, AD+hostname ⇒ extra `TARGET`=FQDN, `DOMAIN` ← ldap/kerberos banner — each a row with an **Apply** button (`onApplyAutofill(varId, value)`). **Reuse the v1 `--cph-var-*` panel styling.** When `conflictsWithUserValue === true` the row is **DISPLAY-ONLY with Apply disabled** (a "you already set this — won't overwrite" lock), honoring "never overwrite a user-set var." **Never propose** PASS/NTHASH/AESKEY. Show what was inferred and let the human confirm.

Per-feature non-AI chip: *"Deterministic scan organizer, not AI — it routes ports to your notes; you run every command."*

---

## 8. TOOL ARSENAL — `ToolArsenalView` at /arsenal (F2: where to fetch each tool)

Binds to `ToolArsenalProps`: `tools, filter, onFilterChange, onOpenSource`. A clean catalog of `ToolBinary` cards, filterable by `ToolCategory` and `OS` (`onFilterChange`). **No binaries, ever** — link only.

**Tool card:** name + aliases · `ToolCategory` + `runsOn` chips · `format` badges (`exe|ps1|py|elf|jar|dll|so|script|msi`) · an **"Official source →"** link styled with `--cph-tool-verified-src` + check (`onOpenSource(officialRef)`, release **page** only) · an optional **"Releases →"** (`releaseRef`) · a **kaliPath pill** on `--cph-tool-kali-path-bg` with `shipsOnKali` shown as text (and `[UNVERIFIED]` until a real Kali confirms) · the **literal `fetchNote`** rendered verbatim in a line accented `--cph-tool-fetch-warn`: *"You fetch this yourself. Nothing is bundled or hosted by Cephalo."* GhostPack tools carry a *"compile-your-own"* note; NetExec shows the *"maintained CrackMapExec successor (`nxc`)"* note; JuicyPotato the build-gated note. `unverified` entries carry the badge + Sources. **There is no download button anywhere** — a `binaryUrl` is gate-forbidden; the only call-to-action is an outbound official-source link.

---

## 9. DECISION-TREE MINDMAP — `DecisionMindMapView` at /$os/decision/$mapId (F5/F7)

Binds to `DecisionMindMapProps`: `map, theme, reducedMotion, currentNodeId, walkedPath, onRunCheck, onPickBranch, onOpenTechnique`. This is a **NEW render path** on `@xyflow/react` — it does **NOT** go through the frozen `MindMapRenderModel` (which has no condition fields). It is the *output-conditional flowchart* the user walks during an engagement: *try THIS; if the output contains X, branch A; if Y, branch B.* It reuses the v1 node/severity tokens and adds the `--cph-dec-*` family.

### 9.1 The node visual language (shape carries meaning; color is redundant)

Map each `DecisionNodeKind` to a distinct shape + token (always shape **+** icon **+** label):

| `kind` | Shape | Token | Reads as |
|---|---|---|---|
| `start` | rounded capsule, realm primary | `--cph-color-primary` | the entry ("run `whoami /priv` + `systeminfo`") |
| `check` | **rectangle with a terminal/`>` glyph** | `--cph-dec-node-check` (blue) | *run this command, then read its output* — renders the `checkCommandId` via the frozen `CommandCard` (or `inlineTemplate` fallback); `onRunCheck` |
| `branch` | **amber diamond** (reuse v1 `--cph-node-decision`) | `--cph-node-decision` | a junction — *what did the output contain?* |
| `action` | **rectangle with a lightning/wrench glyph** | `--cph-dec-node-action` (coral) | *do this move now* — `actionCommandId` / `techniqueId` (`onOpenTechnique`) |
| `outcome` | **rounded capsule** | `outcomeKind` → `--cph-dec-node-outcome-system` (SYSTEM/root, green) · `--cph-dec-node-outcome-da` (Domain Admin, gold) · `--cph-node-outcome` for `creds` · muted for `dead-end` | the goal reached (terminal) |
| `note` | quiet dashed pill, muted | `--cph-color-text-muted` | caveat / `[UNVERIFIED]` aside |

Technique-bearing nodes carry the v1 **severity heat ring** (`--cph-sev-*` border weight + corner glyph) and v1 phase tints, so the language is continuous with the v1 MindMap.

### 9.2 Branch-on-signal EDGE labels (the heart of F5)

Each `DecisionEdge.condition` styles the edge line + label (hue **+** glyph **+** text, never hue-only):

- `{ kind: 'if-found', signalId }` → **`--cph-dec-branch-if-found`** (green), glyph `✓`, label like *"if output contains: `SeImpersonatePrivilege`"* (the human-readable form of the source node's `ObservableSignal` — which, when `match:'signalRef'`, is the **same F3 `PrivilegeSignal`**, authored once; F3 and F5 can never disagree).
- `{ kind: 'if-absent', signalId }` → **`--cph-dec-branch-if-absent`** (amber), glyph `⌀`, label *"if absent: …"*.
- `{ kind: 'else' }` → **`--cph-dec-branch-else`** (neutral grey), glyph `↳`, label *"otherwise"* — the **fallback so the walk never dead-ends** (every non-outcome node has ≥1 outgoing incl. this).
- A branch the **human must pick by hand** (no auto-evaluable signal) uses **`--cph-dec-branch-manual`** (violet) + a "you decide" glyph.

Edge `priority` (lower = evaluated first) may be shown as a small ordinal on the line for the walker's mental model.

### 9.3 Walk mode (the engagement companion)

The user **walks** the tree node-by-node (`currentNodeId`, `walkedPath`):
- The **current node** renders its check command via the frozen `CommandCard` (copy-filled/raw, var-states) — `onRunCheck`.
- Below it, **one button per outgoing edge**, labeled by `edge.label` (`onPickBranch(edge)`) — styled by the edge condition tokens above.
- An optional **"paste output here" box**: the walker pastes the command's real output; the board runs each outgoing edge's `signalRef`/`when` matcher over the text and **HIGHLIGHTS which signals are present** (using `--cph-advisor-signal-detected` for hits) — but it **NEVER auto-picks** the branch. The human reads the highlight and clicks. (Deterministic assist, not automation.)
- The **walked path glows** with `--cph-dec-trace` (current lineage lit; the rest of the abyss dims, reusing the v1 "lineage glows" effect). The session-only walk trace lives in the `decisionStore` (never persisted).
- **Reduced-motion** → instant layout snaps, no animated re-layout, no edge-flow animation; the trace is a static highlight. Nodes are **keyboard-reachable & labeled** (accessible name = label + kind + severity + outcomeKind).

The three flagship maps to mock fully: `dec.win.tokenpriv` (SeImpersonate→potato-by-build / SeBackup→hive→secretsdump / SeDebug→LSASS / Backup-Operators / fallback PowerUp), `dec.linux.privesc` (sudo/getcap/SUID/kernel/group/NFS branches), `dec.ad.nocreds-to-da` (no-creds→creds→local-admin→DCSync→DA, with delegation & ADCS ESC subtrees — ESC1–8 verified, ESC9/10 cited, ESC11/12/13 `[UNVERIFIED]`).

---

## 10. EXPLAINABILITY, `[UNVERIFIED]`, ACCESSIBILITY (across all v2 surfaces)

- **Explain-why is first-class everywhere.** Ask rows, advisor cards, nmap firings, cve match ribbons, decision edges — each shows *why it matched* in plain language (`--cph-ask-explain-fg` / `--cph-nmap-explain-fg`). This is the design embodiment of "deterministic, not AI." Never hide it, never collapse it by default.
- **`[UNVERIFIED]` badge (v2):** the monospace, bracketed, `--cph-unverified-badge-*` badge, **always paired with a Sources affordance** and a human reason. It reads "be careful / cite," never "broken." Applies to: ESC11/12/13, JuicyPotato build-gate, loose CVE matches (`product-only`/`any`), uncertain Kali paths, fork-divergent PowerView names, kernel/sudo CVE-hint rules.
- **Session-only / never persisted:** the advisor paste, the cve query, the nmap paste, the decision-walk output box — all carry the lock/forget chip and the discipline of PASS/NTHASH/AESKEY (may contain host data). No localStorage, no telemetry, no network. Theme switch proposed-not-applied; autofill never overwrites user-set vars.
- **WCAG 2.1 AA, every new surface, every realm:** 4.5:1 text, 3:1 UI/graphics; all 38 new tokens audited under deuter/protan/tritan. **Meaning is never hue-only** — advisor signal tiers, cve match kinds, decision edge conditions, realm-inference all pair color **+ bespoke line-icon + text label**.
- **Reduced-motion:** big-hero halo steady (no pulse), result fade-ups become instant, decision edge-flow + walk-trace static, nmap realm banner no shimmer. No information lost (Octo `aria-hidden`, all state in text + `aria-live`).
- **`aria-live`:** results-surfaced ("3 commands matched kerberoast"), copy-success ("copied filled command"), realm-inference ("scan looks like Active Directory — confirm to switch theme"), advisor parse ("4 signals recognized, 1 unrecognized line"). Targets ≥24px; visible `--cph-color-focus` rings (2px, 2px offset) on every interactive element including xyflow nodes/edges.
- **Defang + no machine names** in every mock: RFC5737/RFC3849 ranges, `example.local`/`example.lab`, `<tun0-ip>`; sensitive vars masked. No scan, card, or screenshot names or hints at a real/practice host.

---

## 11. DELIVERABLES CHECKLIST (what you hand back for v2)

1. **v2 token values appended to all four theme files** — all **38 keys** from §0.1 defined at `:root` in `theme.base.css`; the realm files override **exactly the canonical 10-key re-skin set** from §2 (byte-identical to the §2.2 CSS): `--cph-ask-bg` · `--cph-ask-surface` · `--cph-ask-input-bg` · `--cph-ask-octo-halo` · `--cph-ask-result-accent` · `--cph-ask-explain-fg` · `--cph-intent-pin-accent` · `--cph-octo-large-glow` · `--cph-advisor-rank-1` · `--cph-nmap-confirm-bg` (i.e. the `ask-*` family **except** the intentionally-constant `--cph-ask-suggestion`, **plus** `--cph-advisor-rank-1` and `--cph-nmap-confirm-bg`). `theme.linux.css` ships the **same explicit 10-key block** (values equal `:root`, for cross-realm symmetry) — or, equivalently and gate-conformant, **inherits `:root` with no `[data-os="linux"]` block**; pick one. **No key outside `TOKEN_KEYS ∪ TOKEN_KEYS_V2` may appear.** Each realm passes AA + CVD-safe.
2. **`AskOctopusHero`** — the big Octo: Rive state-machine extension (same nine `OctoState`, `intensity`, `theme`, halo/particle layers) **+** a static layered inline-SVG fallback (animation-free, state-class-swappable). Composes the frozen `OctopusMascot`; adds **no** prop to `OctopusMascotProps`.
3. **High-fidelity mocks, all three realms, every state:** /ask summon mode (idle/listening/thinking/found/empty + pinned-intent card + advisor hand-off card), /ask paste-scan mode (parse summary / inferred-realm banner + confirm / per-port routing board / autofill incl. conflict-disabled / cve handoff), /advisor (paste / signal chips incl. disabled+unverified / ranked cards incl. build-gate + fetch-tool + cve-hint), /cve (exact / in-range / product-only-degraded / searchsploit escape hatch), /arsenal (tool card with fetchNote verbatim, kaliPath, no download), /$os/decision (the three flagship maps + walk mode + paste-output highlight, reduced-motion static).
4. **Bespoke v2 line-icons** (1.5px stroke, no emoji): decision node-kinds ×6, edge-conditions ×4 (if-found/if-absent/else/manual), advisor signal-tiers ×4, cve match-kinds ×3, realm-inference ×3, tool-format badges, the anchor/sonar summon glyph. CVD-distinct.
5. **Token→visual spec sheet** mapping each new surface element to its exact `--cph-*` key (from §0.1 only) **and** to its exact prop/callback on the frozen v2 component-API (`AskOctopusProps`/`PrivilegeAdvisorProps`/`CveLookupProps`/`ToolArsenalProps`/`DecisionMindMapProps`/`NmapTriageBoardProps`).
6. **Contrast & CVD audit** for all 38 new keys per realm (4.5:1 text, 3:1 graphics, deuter/protan/tritan). **Call out by name** the two greys pinned to 3:1-graphic-only roles — `--cph-advisor-signal-weak` (#6E8A82) and `--cph-dec-branch-else` (#8294A0) — proving each clears **3:1 as a stroke/icon** against the darkest grounds (`--cph-ask-input-bg`, `--cph-ask-surface`) and confirming their tier/branch meaning is carried by an AA-4.5:1 text label, not the hue. Do **not** fold these two into the generic "micro-tune for contrast" caveat — audit them explicitly.
7. **Token-key conformance assertion:** union of keys across the four CSS files equals `TOKEN_KEYS ∪ TOKEN_KEYS_V2` exactly — zero invented keys, zero renames.
8. **Non-AI / explainability conformance:** evidence that every v2 result surface carries an explain-why chip, the persistent non-dismissible NO-AI/NO-network banner, and per-feature "deterministic retrieval, not AI" chips; no chatbot/streaming/generate affordances anywhere.

Bind every spec to the exact frozen names and the v2 additive contract. When in doubt, **the contract wins**.