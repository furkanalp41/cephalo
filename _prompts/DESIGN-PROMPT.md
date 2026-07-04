# DESIGN-PROMPT.md — Cephalo Visual Identity & Surface Brief (for Claude Design)

> **You are designing Cephalo.** Cephalo is a stateful instrument — a copy-paste-ready OSCP command-and-technique engine fronted by a living octopus mascot named **Octo**. The user sets variables once in a sticky **VariableBar**; every visible **CommandCard** live-interpolates and is one-click copyable. Around that loop sit an instant fuzzy **SearchPalette**, interactive **MindMap** decision-trees, a first-class **BloodHound** section, and **OS-reactive theming** across three realms: `linux`, `windows`, `ad`.
>
> **This prompt OWNS the entire visual identity and the design-token VALUES.** The CODE prompt owns structure, the frozen TypeScript interfaces, the token KEYS, and the component-API seam. You **bind to that seam verbatim**: you import `src/types/content.ts`, `src/types/engine.ts`, `src/types/components.ts`, `src/types/tokens.ts` — you never rename a prop, redefine an enum value, or invent a token key. You produce four CSS files — `theme.base.css`, `theme.linux.css`, `theme.windows.css`, `theme.ad.css` — that define **every** `--cph-*` key listed in `TOKEN_KEYS` (and only those keys), plus a Rive mascot artifact and an inline-SVG fallback. Where this brief and the FROZEN SHARED CONTRACT disagree, **the contract wins**.

---

## 0. THE SEAM YOU BIND TO (read first, do not deviate)

These names are **final**. Use them exactly in every spec, redline, layer name, and CSS selector.

- **Product:** Cephalo. **Mascot persona:** Octo.
- **OS / realm enum:** `'linux' | 'windows' | 'ad'` — never `activedirectory`, never `active-directory`. Theme attribute is **`data-os`**.
- **Token prefix:** `--cph-`. Code only ever writes `var(--cph-…)`. You supply the VALUE for every KEY in `TOKEN_KEYS`; **you never add a KEY the contract didn't declare** (no `--cph-glow`, no `--cph-var-text`, no improvised aliases — if you need a glow/rim or a value-text color, reuse an existing declared key).
- **Copy modes:** `'filled' | 'raw' | 'display'` — never "full"/"template".
- **Confidence:** `'verified' | 'unverified'`; the unverified user-facing label is the literal string **`[UNVERIFIED]`** (monospace badge, brackets included).
- **Severity (single shared scale, powers BOTH command `danger` AND MindMap node heat):** `'info' | 'low' | 'medium' | 'high' | 'critical'`. There is no separate "risk"/"heat" enum — design ONE ramp.
- **credMode:** `'password' | 'nthash' | 'kerberos'` — the AD auth-segment switch.
- **Mascot vocabulary (the ONLY states; render every one):** `OctoState = 'idle' | 'greeting' | 'listening' | 'thinking' | 'found' | 'empty' | 'copied' | 'error' | 'celebrate'`. The app drives state via the `state` prop; Octo emits only `onClick`.
- **Token syntax in command bodies:** `{{UPPER_SNAKE}}`. The unset display token is rendered as `<lowercase-placeholder>` (e.g. `<tun0-ip>`); the inert in-card token is `<LHOST>`.
- **Component props (single source of truth — you import, never re-declare):** `OctopusMascotProps`, `CommandCardProps`, `VariableBarProps`, `SearchPaletteProps`, `MindMapProps`. Every visual state you design must map to a field on these props (e.g. `render.spans[].state ∈ {set,unset,invalid}`, `octoState`, `intensity`, `selectedNodeId`, `dimmed`).

### 0.1 THE COMPLETE, CLOSED TOKEN-KEY LIST (you define every one of these, and no others)

These are the ONLY keys you may emit. Memorize the namespaces; inventing or renaming any key is a seam break and an automatic rejection.

- **color (12):** `--cph-color-bg` · `--cph-color-surface` · `--cph-color-surface-raised` · `--cph-color-border` · `--cph-color-text` · `--cph-color-text-muted` · `--cph-color-primary` · `--cph-color-primary-contrast` · `--cph-color-accent` · `--cph-color-focus` · `--cph-color-danger` · `--cph-color-success`
- **octo (12):** `--cph-octo-idle` · `--cph-octo-greeting` · `--cph-octo-listening` · `--cph-octo-thinking` · `--cph-octo-found` · `--cph-octo-empty` · `--cph-octo-copied` · `--cph-octo-error` · `--cph-octo-celebrate` · `--cph-octo-ink` · `--cph-octo-glow` · `--cph-octo-tint`
- **severity (5):** `--cph-sev-info` · `--cph-sev-low` · `--cph-sev-medium` · `--cph-sev-high` · `--cph-sev-critical`
- **variable (4):** `--cph-var-set` · `--cph-var-unset` · `--cph-var-invalid` · `--cph-var-token-bg`
- **confidence (2):** `--cph-confidence-verified` · `--cph-confidence-unverified`
- **copy (2):** `--cph-copy-success` · `--cph-copy-flash`
- **node (8):** `--cph-node-recon` · `--cph-node-enum` · `--cph-node-exploit` · `--cph-node-privesc` · `--cph-node-lateral` · `--cph-node-persistence` · `--cph-node-outcome` · `--cph-node-decision`
- **elevation (9):** `--cph-elev-0` · `--cph-elev-1` · `--cph-elev-2` · `--cph-elev-3` · `--cph-elev-4` · `--cph-radius-sm` · `--cph-radius-md` · `--cph-radius-lg` · `--cph-radius-full`
- **motion (6):** `--cph-motion-fast` · `--cph-motion-base` · `--cph-motion-slow` · `--cph-ease-standard` · `--cph-ease-emphasized` · `--cph-ease-octo`
- **type (15):** `--cph-font-sans` · `--cph-font-mono` · `--cph-fs-xs` · `--cph-fs-sm` · `--cph-fs-md` · `--cph-fs-lg` · `--cph-fs-xl` · `--cph-fs-2xl` · `--cph-lh-tight` · `--cph-lh-normal` · `--cph-fw-regular` · `--cph-fw-medium` · `--cph-fw-bold`

Need a "rim light" or "glow"? → reuse `--cph-octo-glow` (a shadow string) or fold it into the `--cph-elev-*` shadow strings. Need a "value text" color? → reuse `--cph-color-text` (resolved value text) or `--cph-var-set` (themed-primary value). There is no other escape hatch.

---

## 1. ART DIRECTION — "The Abyssal Instrument"

Cephalo lives in the **deep pelagic ocean at night**: an unlit, high-pressure abyss where the only light is **bioluminescence** — and Octo is the light source. The aesthetic is **precision instrument meets living deep-sea creature**: think an oscilloscope, a dive computer, and a cephalopod that signals by pulsing chromatophores. It is dark, confident, scientific, slightly uncanny, and tactile. Commands feel *summoned from the dark*, not pulled from a list.

**Three pillars:**
1. **Abyssal calm** — deep near-black grounds, generous negative space, no visual noise. The dark is load-bearing: it makes the bioluminescent accents and the monospace commands glow.
2. **Bioluminescent signal** — color is *information*, used sparingly and meaningfully (severity, confidence, variable-state, phase). Accent color is a flare in the dark, never wallpaper.
3. **Living instrument** — Octo breathes, listens, reaches. Motion is organic (tentacle easing) layered over crisp, mechanical UI transitions. The creature is alive; the chrome is exact.

**Texture & form language:** soft suction-cup dot motifs and faint sonar-ring grids as *restrained* background texture (≤4% opacity); rounded-but-purposeful rectangles for surfaces; hairline 1px borders that read as etched glass-tube outlines, not cards floating in fog. Commands sit in tight monospace "specimen tubes."

### 1.1 ANTI-AI-SLOP BANS (hard constraints — a design that violates these is rejected)
- **NO generic purple-gradient SaaS hero.** No full-bleed violet→indigo→pink gradient backgrounds anywhere. Gradients, if any, are *subtle radial bioluminescent glows* localized around Octo or a focused element — never a marketing hero wash.
- **NO glassmorphism-by-default.** No frosted blur panels as the standard surface treatment. Surfaces are solid, matte, etched. (One *deliberate* exception: the SearchPalette may use a single faint backdrop scrim — solid + low-opacity dim, not a blur cliché.)
- **NO childish / clip-art / kawaii octopus.** Octo is a *credible deep-sea cephalopod* — anatomically grounded (mantle, eight tentacles, slit pupils, chromatophore skin), stylized but not cute, never a smiling cartoon with a round head and dot eyes. Tasteful, a little uncanny, expressive through skin-luminescence and posture, not a mascot-suit grin.
- **NO emoji as UI.** No 🐙🔒⚡ in chrome, buttons, badges, or section headers. All iconography is a bespoke line-icon set (1.5px stroke, rounded joins). Emoji never encode state.
- **NO meaning by hue alone.** Every color-coded signal (severity, confidence, var-state, phase) is *redundantly* encoded with shape + icon + text/label. CVD users must lose zero information.
- Also banned: drop-shadow soup, neon-on-neon vibrancy that tanks contrast, stock "cyber" Matrix rain, skeuomorphic leather/metal, and centered hero with a single CTA. This is a tool, not a landing page.

---

## 2. COLOR SYSTEM & DESIGN-TOKEN VALUES

You deliver `theme.base.css` (a **complete default `:root` set — including a full default `--cph-color-*` palette — plus all structural tokens** shared by all themes) and three OS overrides scoped to `[data-os="linux"]`, `[data-os="windows"]`, `[data-os="ad"]`. **Every `--cph-*` KEY in `TOKEN_KEYS` resolves to a real value at `:root` from `theme.base.css` alone, with no `data-os` present** — the realm files only *re-skin* keys, never introduce them. **Switching `data-os` re-skins via CSS-var cascade only — no remount, no flash.** Every theme independently passes **WCAG 2.1 AA** (4.5:1 body text, 3:1 UI/graphics & large text) and is **CVD-safe** (verified under deuter/protan/tritan sim). Below are concrete, ready-to-consume values. Hex values are starting truth; you may micro-tune for contrast but must keep the contract's semantics and pass AA.

### 2.1 `theme.base.css` — defines EVERY key at `:root`

`theme.base.css` MUST assign a value to **all 12 `--cph-color-*` keys at `:root`** so that semantic tokens which reference them (`--cph-var-set: var(--cph-color-primary)`, `--cph-octo-glow`, `--cph-confidence-*`, etc.) always resolve — even before/without any `data-os` skin. The default `:root` color palette is the **linux / Phosphor Reef** set, used as the universal fallback; the three realm files then override these same 12 keys.

**Default color palette (`:root` fallback — Phosphor Reef as base)**
```
:root{
  /* the 12 --cph-color-* keys MUST be defined here so every dependent token resolves
     with no data-os present; realm files override these same keys */
  --cph-color-bg:               #07120F;  /* abyssal teal-black */
  --cph-color-surface:          #0E1F1A;
  --cph-color-surface-raised:   #15302A;
  --cph-color-border:           #244A41;
  --cph-color-text:             #E6F2EC;  /* AA on bg (≈14:1) */
  --cph-color-text-muted:       #9FBDB2;  /* ≥4.5:1 on surface */
  --cph-color-primary:          #2BD4A8;  /* teal-mint signal */
  --cph-color-primary-contrast: #04120D;  /* text on primary */
  --cph-color-accent:           #F2B33D;  /* amber phosphor */
  --cph-color-focus:            #57E6C2;
  --cph-color-danger:           #F0635A;
  --cph-color-success:          #57D08A;
}
```

**Elevation & radius (`:root`)**
```
--cph-elev-0: none;
--cph-elev-1: 0 1px 2px rgba(0,0,0,.45);
--cph-elev-2: 0 2px 6px rgba(0,0,0,.50), 0 1px 2px rgba(0,0,0,.40);
--cph-elev-3: 0 6px 18px rgba(0,0,0,.55), 0 2px 6px rgba(0,0,0,.40), inset 0 1px 0 rgba(43,212,168,.10);
--cph-elev-4: 0 14px 40px rgba(0,0,0,.60), 0 4px 12px rgba(0,0,0,.45), inset 0 1px 0 rgba(43,212,168,.14);
--cph-radius-sm: 4px;
--cph-radius-md: 8px;
--cph-radius-lg: 14px;
--cph-radius-full: 9999px;
```
> Elevation in the abyss is conveyed by a **bioluminescent rim-light** baked **into the `--cph-elev-3/4` shadow strings themselves** (the trailing `inset 0 1px 0 …` accent-tinted highlight) layered over the soft shadow, so raised surfaces glow faintly at their top edge rather than only casting shadow. When a stronger state halo is wanted on a surface (e.g. a focused/primary CommandCard), reuse the declared **`--cph-octo-glow`** shadow token — **do not invent a `--cph-glow` key.** Each realm re-tints the inset highlight by overriding `--cph-elev-3/4` with its own accent alpha (see per-realm note in §2.2).

**Motion** (durations + easing; `prefers-reduced-motion` collapses all `--cph-motion-*` to `1ms` and disables the octo ease)
```
--cph-motion-fast: 120ms;
--cph-motion-base: 220ms;
--cph-motion-slow: 420ms;
--cph-ease-standard: cubic-bezier(.2,0,0,1);      /* crisp UI in/out */
--cph-ease-emphasized: cubic-bezier(.2,0,0,1.1);  /* slight overshoot for arrivals */
--cph-ease-octo: cubic-bezier(.34,1.56,.45,1);    /* organic, tentacle-spring; the living-curve */
```
Reduced-motion override block (ship in every theme file):
```
@media (prefers-reduced-motion: reduce) {
  :root { --cph-motion-fast:1ms; --cph-motion-base:1ms; --cph-motion-slow:1ms;
          --cph-ease-octo: linear; --cph-ease-emphasized: linear; }
}
```

**Typography (`:root`)**
```
--cph-font-sans: 'Inter var', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
--cph-font-mono: 'JetBrains Mono', 'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace;
--cph-fs-xs: .75rem;    /* 12px — chips, badges, var pills */
--cph-fs-sm: .8125rem;  /* 13px — secondary, notes */
--cph-fs-md: .9375rem;  /* 15px — body, command code */
--cph-fs-lg: 1.125rem;  /* 18px — card titles */
--cph-fs-xl: 1.5rem;    /* 24px — section heads */
--cph-fs-2xl: 2rem;     /* 32px — realm titles */
--cph-lh-tight: 1.25;
--cph-lh-normal: 1.55;
--cph-fw-regular: 400;
--cph-fw-medium: 530;   /* Inter optical mid; use 500 if non-variable */
--cph-fw-bold: 680;
```
> **Monospace is the hero typeface.** Commands are the product — the mono face must be wide, legible, with unambiguous `0/O`, `1/l/I`, `{}` and `:`. Tokens `{{VAR}}` render in mono with a tinted pill background (`--cph-var-token-bg`). Type scale is modular (~1.2 ratio) and never goes below 12px for any readable text.

**Severity ramp (the SINGLE shared scale — used for `Command.danger` chips AND MindMap node heat).** Designed as a perceptual ramp that *also reads in CVD* by pairing hue with shape/icon (see §6 & §8). Base values at `:root` (realm files may shift lightness to hold contrast but must keep the ordered ramp):
```
--cph-sev-info:     #5BC8D6;  /* cool cyan — informational */
--cph-sev-low:      #6FB36B;  /* sea-green */
--cph-sev-medium:   #E0B341;  /* amber */
--cph-sev-high:     #E8803A;  /* coral-orange */
--cph-sev-critical: #E8554E;  /* venom-red */
```
Severity icons (redundant encoding, never hue-only): info = circle-i, low = single-chevron, medium = double-chevron, high = triangle-bang, critical = octagon-bang. Heat in MindMap = node border weight + corner glyph in addition to fill.

> **Base-file completeness rule:** by the end of §2.1, `theme.base.css` has assigned a value to **every key in the §0.1 list** — the 12 colors above, plus octo (§2.3), variable/confidence/copy/node (§2.4), elevation, motion, and type here. The realm files override only; they introduce nothing.

### 2.2 Per-OS palettes (the three skins)

Each realm is a **distinct abyssal biome**. All are dark-grounded. Accent is the realm's bioluminescent signature. Each realm file **also overrides `--cph-elev-3` / `--cph-elev-4`** to re-tint the baked-in rim-light inset highlight with its own accent alpha (linux teal / windows azure / ad amethyst), and overrides `--cph-octo-tint` / `--cph-octo-glow` per §2.3.

#### REALM: `linux` — "Phosphor Reef" (deep teal abyss + amber terminal phosphor)
Mood: a warm terminal glowing in cold teal water. The classic hacker terminal, drowned and bioluminescent. (Identical to the `:root` fallback palette; shipped explicitly so realm switching is symmetric.)
```
[data-os="linux"]{
  --cph-color-bg:               #07120F;  /* abyssal teal-black */
  --cph-color-surface:          #0E1F1A;
  --cph-color-surface-raised:   #15302A;
  --cph-color-border:           #244A41;
  --cph-color-text:             #E6F2EC;  /* AA on bg (≈14:1) */
  --cph-color-text-muted:       #9FBDB2;  /* ≥4.5:1 on surface */
  --cph-color-primary:          #2BD4A8;  /* teal-mint signal */
  --cph-color-primary-contrast: #04120D;  /* text on primary */
  --cph-color-accent:           #F2B33D;  /* amber phosphor */
  --cph-color-focus:            #57E6C2;
  --cph-color-danger:           #F0635A;
  --cph-color-success:          #57D08A;
}
```

#### REALM: `windows` — "Azure Trench" (deep slate-blue + cold cyan/azure)
Mood: cold, corporate-clean, glacial. Sophisticated Windows blue, darkened and pressurized — not the flat consumer blue.
```
[data-os="windows"]{
  --cph-color-bg:               #0A0F1A;  /* slate-navy black */
  --cph-color-surface:          #121A2B;
  --cph-color-surface-raised:   #1B2740;
  --cph-color-border:           #2E3F5E;
  --cph-color-text:             #E9EEF8;
  --cph-color-text-muted:       #9FB0CC;
  --cph-color-primary:          #3A9BFF;  /* azure signal */
  --cph-color-primary-contrast: #04101F;
  --cph-color-accent:           #51E0F2;  /* glacial cyan */
  --cph-color-focus:            #7DC0FF;
  --cph-color-danger:           #FF6B61;
  --cph-color-success:          #46C9A0;
}
```

#### REALM: `ad` — "Forest of Trust" (oxblood-violet + gold kerberos glint)
Mood: the most dangerous realm. A dark amethyst forest of domain trusts; regal, ominous, gold ticket-glints. Plum + burgundy, never candy-purple (avoid the banned SaaS gradient — this is desaturated, deep, smoky).
```
[data-os="ad"]{
  --cph-color-bg:               #120A15;  /* near-black aubergine */
  --cph-color-surface:          #1E1224;
  --cph-color-surface-raised:   #2C1A36;
  --cph-color-border:           #4A2E55;
  --cph-color-text:             #F1E8F2;
  --cph-color-text-muted:       #BBA3C4;
  --cph-color-primary:          #B07CE8;  /* amethyst signal (AA large/UI; pair w/ label) */
  --cph-color-primary-contrast: #160a1c;
  --cph-color-accent:           #E8C24A;  /* kerberos gold */
  --cph-color-focus:            #C79BF0;
  --cph-color-danger:           #F0635A;
  --cph-color-success:          #57C98C;
}
```
> AD intentionally feels heavier and warmer-darker than the cool Linux/Windows realms — it is the boss realm. Gold accent = "tickets/keys" (Kerberoast, Golden/Silver, DCSync). Keep amethyst text usages ≥18px or as UI graphics (3:1); for body text on AD surfaces use `--cph-color-text`.

### 2.3 Octo state colors (the chromatophore palette — `--cph-octo-*`)
These tint Octo's bioluminescent skin per state (the Rive machine reads them as input colors; the SVG fallback uses them directly). `--cph-octo-tint` is the per-realm base body wash so Octo belongs to the current biome; `--cph-octo-ink` is the ink-cloud color; `--cph-octo-glow` is the ambient halo **shadow string** (also the token any surface reuses when it wants a state/primary glow — there is no `--cph-glow`). All twelve octo keys are defined at `:root` in `theme.base.css` (values below are the **base/Linux** set); realm files override `--cph-octo-tint`, `--cph-octo-thinking`, and `--cph-octo-glow` toward each biome's accent.

Base (`theme.base.css`, `:root`):
```
--cph-octo-idle:      #2BB89A;  /* calm teal pulse */
--cph-octo-greeting:  #45D6B0;  /* brighter, welcoming */
--cph-octo-listening: #57E6C2;  /* alert cyan-mint */
--cph-octo-thinking:  #6AA0FF;  /* cool blue, focused */
--cph-octo-found:     #F2B33D;  /* amber flash of discovery */
--cph-octo-empty:     #6E8A82;  /* desaturated, deflated */
--cph-octo-copied:    #57D08A;  /* success green pulse */
--cph-octo-error:     #F0635A;  /* venom red */
--cph-octo-celebrate: #FF7AC6;  /* magenta bioluminescent bloom */
--cph-octo-ink:       #0A0F0D;  /* near-black ink cloud (copy/error puff) */
--cph-octo-glow:      0 0 32px rgba(43,212,168,.45);  /* ambient halo shadow; reused for surface rim-glow */
--cph-octo-tint:      #1B6E5E;  /* body base wash (overridden per realm) */
```
Realm tint overrides: `windows` → `--cph-octo-tint:#1E3A66; --cph-octo-thinking:#3A9BFF; --cph-octo-glow: 0 0 32px rgba(58,155,255,.40);`  ·  `ad` → `--cph-octo-tint:#3A2148; --cph-octo-thinking:#B07CE8; --cph-octo-found:#E8C24A; --cph-octo-glow: 0 0 32px rgba(176,124,232,.40);`. `found`/`copied`/`error`/`celebrate` semantics stay constant across realms (discovery=amber/gold, success=green, error=red, celebrate=magenta) so users learn one signal language.

### 2.4 Variable-state, confidence, copy, and node tokens

**Variable states** (`--cph-var-*` — the heart of the RevShells loop; only these four keys exist). These color the inline `{{VAR}}` spans (`render.spans[].state`):
```
--cph-var-set:      var(--cph-color-primary);  /* resolved value — confident, themed */
--cph-var-unset:    #C9A24B;                    /* warning-amber: inert <LHOST> token, "you must set me" */
--cph-var-invalid:  var(--cph-color-danger);    /* failed validation (bad IP/port/hash shape) */
--cph-var-token-bg: rgba(127,127,127,.14);      /* subtle pill behind every {{VAR}} */
```
> **Unset is never blank and never alarming-red** — it's an inviting amber pill with a dotted underline meaning "fill me." Invalid is solid red with a wavy underline + inline message. Set is the realm primary with a steady underline. These three are distinguishable by **underline style + icon**, not color alone (dotted = unset, wavy = invalid, solid = set). Note: resolved *value text* is colored with the declared `--cph-color-text` (plain literal) or `--cph-var-set` (themed-primary emphasis) — there is **no `--cph-var-text` key**.

**Confidence:**
```
--cph-confidence-verified:   var(--cph-color-success);   /* quiet — a small check, low emphasis */
--cph-confidence-unverified: var(--cph-color-accent);    /* the [UNVERIFIED] badge color */
```
> Verified is *understated* (we don't gold-star the normal case). `[UNVERIFIED]` is a monospace, bracketed, accent-outlined badge with a small caret icon, always paired with a "Sources" affordance — it must read as "be careful / cite," not "broken."

**Copy feedback:**
```
--cph-copy-success: var(--cph-color-success);
--cph-copy-flash:   rgba(87,208,138,.22);  /* the micro-flash wash that sweeps the code block on copy */
```

**MindMap node tokens** (`--cph-node-*`, phase coloring — combined with severity heat). These should be CVD-distinct *and* carry an icon per phase (§8):
```
--cph-node-recon:       #5BC8D6;  /* cyan */
--cph-node-enum:        #4EA3E0;  /* blue */
--cph-node-exploit:     #E8803A;  /* coral */
--cph-node-privesc:     #E8554E;  /* red */
--cph-node-lateral:     #B07CE8;  /* violet */
--cph-node-persistence: #C9933A;  /* bronze */
--cph-node-outcome:     #57D08A;  /* green (terminal/goal) */
--cph-node-decision:    #E0B341;  /* amber diamond (decision junction) */
```
> Phase color is consistent across realms (a recon node is cyan in all three themes) so the decision-tree language is learnable; only the *surface/background* re-skins. Decision nodes (e.g. AD's "Have valid creds?") are amber **diamonds** — shape-distinct from rectangular technique nodes and rounded outcome capsules.

---

## 3. OCTO — THE LIVING MASCOT (OctopusMascot)

Octo is the **personality and the status light** of Cephalo. Built in **Rive** as a single state-machine artifact (target: tens of KB, 60fps GPU-composited), lazy-loaded so first paint / first search / first copy never block on it. Octo is **`aria-hidden`** and is **never the sole signal** for any state (every state Octo shows is also conveyed by text/`aria-live`/iconography). Octo emits only `onClick` (an easter-egg ripple + a randomized greeting tip). The app sets `state`, `intensity` (0..1), `theme`, `reducedMotion`, `message`.

### 3.1 Form & personality
A **credible deep-sea octopus**, stylized for clarity: a soft domed **mantle**, two expressive **slit-pupil eyes** (the emotional center), eight **tentacles** that move with weight and follow-through, and **chromatophore skin** that shifts color/luminescence to signal state (this is the primary expressive channel — not facial cartooning). Personality: *calm, watchful, competent, quietly playful* — a deep-sea companion who knows the dark and brings you exactly what you asked for. Octo is mysterious and a little uncanny, never goofy. It signals with skin and posture like a real cephalopod. Default size ~120–160px in the header dock; scales down to a 40px "resting" glyph when scrolled.

### 3.2 The nine states (render EVERY `OctoState`; map color to `--cph-octo-*`)
| `state` | Body posture & motion | Skin color | Trigger (app-driven) |
|---|---|---|---|
| `idle` | Slow breathing of the mantle (~4s loop); one or two tentacles drift/sway; eyes blink occasionally, look around. | `--cph-octo-idle` | Default resting. |
| `greeting` | Brief perk-up, a single tentacle does a small wave-curl; eyes widen warmly. Plays once on first mount / realm change. | `--cph-octo-greeting` | App load, theme switch. |
| `listening` | Leans toward the search bar; pupils dilate; tentacles still, attentive; faint glow ramps up. | `--cph-octo-listening` | SearchPalette focus. |
| `thinking` | Tentacles **curl toward the search bar**, skin shimmers/ripples in a thinking wave; subtle particle plankton drift. | `--cph-octo-thinking` | Typing / searching. |
| `found` | A burst — tentacles fan out presenting results; bioluminescent flash; **`intensity` scales the bloom** (more hits = brighter, more tentacles light). | `--cph-octo-found` | Results arrive. |
| `empty` | Deflates slightly, tentacles droop, skin desaturates; a small apologetic head-tilt. | `--cph-octo-empty` | Zero results. |
| `copied` | A satisfying **ink-flash pulse**: skin pulses green, a tiny ink puff `--cph-octo-ink` releases and dissipates; quick tentacle "tap." | `--cph-octo-copied` | On copy success. |
| `error` | Recoil; skin flashes red; a defensive ink cloud; eyes narrow. Brief, not alarming-loud. | `--cph-octo-error` | Copy-filled blocked / invalid / failure. |
| `celebrate` | Full bioluminescent bloom, all tentacles flare and spiral, magenta bloom + sparse plankton confetti (no emoji). | `--cph-octo-celebrate` | Milestone (e.g. completing a phase checklist) — rare, earned. |

`intensity` (0..1) modulates amplitude/brightness within a state (primarily `found`: hit-count → bloom size; also `thinking`: query length → ripple speed). `message` may surface as a small speech-tip beside Octo (optional, dismissible, never blocking).

### 3.3 Reduced-motion / no-JS fallback (REQUIRED)
A **hand-built inline SVG + CSS** Octo that conveys all nine states **without animation** — via **static posture + skin color + a state label/icon**. Under `prefers-reduced-motion: reduce` or no-JS: no breathing, no tentacle motion, no particles, no ink puff; state changes are **instant** color/posture swaps. The SVG fallback reads the same `--cph-octo-*` tokens. Because Octo is `aria-hidden` and never the sole signal, losing animation loses no information. Deliver the SVG as clean, layered, labeled paths (mantle / eyes / 8 tentacles / skin-glow group) so code can swap the active state by class.

---

## 4. VARIABLE BAR (VariableBar) — the RevShells loop, made physical

A **sticky global bar** (top, below the header dock; collapsible to a single summary chip on scroll). It is the control panel of the instrument. Binds to `VariableBarProps`: `defs`, `values`, `validity`, `groups`, `onChange`, `onReset`, `onClearSensitive`, `onFocusVar`.

**Layout:** variables grouped by `VarGroup` (`network · target · auth · ad · web · files · misc`) into labeled clusters with a quiet group divider + group glyph. Each field is a compact labeled input (label = `VariableDef.label`, e.g. "Attacker IP (tun0)"). Primary registry vars (LHOST, LPORT, RHOST, RPORT, TARGET, INTERFACE, URL, WORDLIST, DOMAIN, DC_IP, USER, PASS, NTHASH, AESKEY, SPN, SHARE) are always present; secondary/derived vars are inline-prompted from cards, not crowding the bar.

**Field visual states (drive from `validity` + value presence):**
- **Empty/unset** → input shows the **defang placeholder** (`VariableDef.placeholder`, e.g. `<tun0-ip>`) in `--cph-var-unset` amber, dotted underline. A subtle "unset" dot on the field.
- **Set & valid** → resolved value text in **`--cph-color-text`** (plain literal) with the field's left accent bar in **`--cph-var-set`** + tiny check. (Use `--cph-var-set` for the value text itself when you want themed-primary emphasis. There is no `--cph-var-text` key — never reference one.)
- **Invalid** → red border + wavy underline + a **non-blocking** inline message (`VariableValidation.message`), field marked `--cph-var-invalid`. Validation kinds: ip/ipv6/port(1–65535)/domain/fqdn/hash-ntlm/hash-aes/path/url/spn/string — show shape hints on focus (e.g. NTHASH = 32 hex; AESKEY = 64 hex; port = 1–65535).
- **Sensitive vars** (`PASS`, `NTHASH`, `AESKEY` — `sensitive: true`) → **masked input** (dots) with a reveal-on-hold toggle, a small "session-only, not saved" lock glyph + tooltip, and they are visually grouped under `auth`/`ad`. The bar provides **"Reset to defaults"** (`onReset()`) and **"Clear sensitive"** (`onClearSensitive`) as clearly-labeled controls.

**Behavior cues:** editing any field triggers the live re-interpolation of every visible CommandCard (~50ms, feels instant) — communicate this with a faint synchronized **ripple** that flows from the edited field outward to cards (respect reduced-motion → no ripple). `onFocusVar` lets a CommandCard "uses LHOST, LPORT" chip focus+scroll the matching field (highlight pulse on arrival). A persistent, unobtrusive **responsible-use note** lives in/near the bar (see §11).

---

## 5. COMMAND CARD (CommandCard) — the specimen tube

The atomic unit. Binds to `CommandCardProps`: `command`, `render: RenderResult`, `affectedVars`, `theme`, `confidence`, `danger`, `credMode`, `onCopyFilled`, `onCopyRaw`, `onSelectVariant`, `onSetCredMode`, `onOpenReference`. Anatomy follows GTFOBins/LOLBAS clarity:

**Anatomy (top → bottom):**
1. **Heading** = `command.title` (`--cph-fs-lg`, medium weight) + a `danger` severity chip (`Severity` icon+label+`--cph-sev-*`) and the **confidence** affordance (quiet check for verified; the `[UNVERIFIED]` accent badge for unverified).
2. **Tag chips** = `command.tags` / abuse-function chips (`--cph-fs-xs`, pill, `--cph-var-token-bg` ground, category-tinted border per `Tag.category`).
3. **One-line intent** = `command.description` in `--cph-color-text-muted`.
4. **Code block** = the **tight monospace specimen tube**: solid dark inset surface, hairline etched border, the command rendered from `render.spans` with each `{{VAR}}` span styled by its `state` (set/unset/invalid — see §2.4) over `--cph-var-token-bg`. This is the visual centerpiece; give it breathing room and a faint top rim-glow (reuse `--cph-octo-glow` or the `--cph-elev-*` inset highlight — never a new key).
5. **"uses …" chips** = `affectedVars` listed as small clickable pills ("uses **LHOST**, **LPORT**") → click calls back to focus that field in the VariableBar.
6. **Copy controls (ALWAYS two):** **Copy filled** (primary button, calls `onCopyFilled(id, render.filled)`) — **disabled** unless `render.allResolved && render.invalid.length===0`; disabled state shows a tooltip "Set N variables to copy filled." **Copy raw** (secondary, always enabled, `onCopyRaw(id, render.raw)`). An optional clearly-marked transform menu (base64 / URL-encode / PowerShell `-EncodedCommand`) sits beside them; raw is always one click away.
7. **`[UNVERIFIED]` / notes line** = `command.notes[]` (gotchas: lockout policy, SMB signing, clock skew) in muted text with a caution glyph.
8. **Sources affordance** = a "Sources" link/disclosure calling `onOpenReference(refId)` for each `command.references` (cited per the source-priority ladder).

**Card visual states:**
- **raw** (no vars set / showing raw) — tokens render as inert `{{VAR}}` mono with neutral pill; Copy filled disabled.
- **filled** — all tokens resolved to themed `--cph-var-set` values; Copy filled enabled and primary-glowing.
- **unset-var-highlighted** — one or more tokens in `--cph-var-unset` amber with dotted underline; a small "needs LHOST, DC_IP" hint; Copy filled gated.
- **invalid-var** — offending token in `--cph-var-invalid`, wavy underline, card shows the inline validation message.
- **copied** — see §7: a `--cph-copy-flash` wash sweeps the code block once; a brief micro-flash *resolves highlighted tokens to literal values for one beat* (so the user sees the real substituted string); checkmark + toast + `aria-live` announce success; Octo goes `copied`.

**credMode switch (AD cards where `command.credMode` is set):** a clearly-labeled 3-segment control — **password · nthash · kerberos** — that calls `onSetCredMode(id, mode)`; the auth segment of the same template re-renders: `{{USER}}:{{PASS}}` → `-hashes :{{NTHASH}}` (note the **leading colon** convention, visually preserved) → `-k -no-pass` + `KRB5CCNAME`. One card, three renderings — animate the swapped segment with a quick crossfade (reduced-motion → instant). `command.variants` (`CommandVariant` with `label`) render as a small variant selector (`onSelectVariant`).

---

## 6. SEARCH PALETTE (SearchPalette) — "summon from the dark"

The signature interaction. A **cmdk-style** palette (`Cmd/Ctrl-K`, `/` to focus) plus an always-visible top search bar that opens the same surface. Binds to `SearchPaletteProps`: `query`, `hits`, `loading`, `octoState`, `filters`, `onQueryChange`, `onSelectHit`, `onCopyHit`, `onFilterChange`, `onClose`.

**The summon moment:** on focus, Octo enters `listening`; on keystroke, `thinking` (tentacles curl toward the bar); when `hits` arrive, `found` with `intensity` = normalized hit count, and results **emerge from darkness** — a fast staggered fade-up (≤180ms total, `--cph-ease-emphasized`) from a dim scrim, like specimens rising into Octo's light. Never visibly debounced; feels <16ms/keystroke. Empty query shows recent/most-used + a hint ("type a port, service, or technique — try `445`").

**Results:** grouped by `SearchDoc['type']` (**Service/Port · Technique · BloodHound query · MindMap node · Tag**) with a type icon and the **current realm accent**. Each hit row: type icon, title, a thin context line (os/phase/tool), and `matchedFields` shown as faint highlight on the matched substring (`highlights` ranges). Typing a bare port (e.g. `445`) instantly floats the SMB cluster to the top (ports are a first-class facet; numeric boost per the frozen ranking). Show realm/phase facet filters (`onFilterChange`) as quiet toggles.

**Keyboard (show affordances):** ↑/↓ move, **Enter** open (`onSelectHit`), **Cmd-Enter** copy-filled the top hit (`onCopyHit` → copied feedback + Octo `copied`), **Esc** close (`onClose`). Visible focus ring on the active row. `loading` shows a slim indeterminate bioluminescent shimmer bar (reduced-motion → static "searching…" text). Zero results → Octo `empty`, a calm "nothing surfaced — try a port number or tool name."

**Bi-directional MindMap sync:** a search match faintly **highlights matching MindMap nodes**; selecting a node filters the command list and reflects back into the palette context.

---

## 7. COPY FEEDBACK & MICRO-INTERACTIONS

Copy is the **payoff of the whole instrument** — make it feel certain and a little magical, but never animation-only (accessibility):
- On `onCopyFilled`/`onCopyRaw` success: (1) a `--cph-copy-flash` wash sweeps the code block left→right once (`--cph-motion-base`, `--cph-ease-standard`); (2) the **micro-flash** briefly resolves any highlighted `{{VAR}}` spans to their **literal substituted values** for ~600ms so the user sees the real string they copied; (3) a checkmark morph on the Copy button + a small **toast** ("Copied filled command"); (4) **`aria-live="polite"`** announcement; (5) Octo `copied` (ink-flash). All five fire together; the visual ones are redundant to the live-region text.
- Copy-filled **blocked** (unresolved/invalid): shake-free, no scary flash — the button stays disabled with a tooltip; if attempted via keyboard, a gentle inline "Set DC_IP, USER to copy filled" + Octo `error` (brief). Never let an unfinished command look paste-ready.
- Hover/focus on a "uses VAR" chip → the matching VariableBar field pulses (`--cph-color-focus`).
- All interactive targets **≥24px**; visible focus rings everywhere (`--cph-color-focus`, 2px, 2px offset).

---

## 8. MINDMAP (MindMap) — attack-path decision-trees

Interactive `@xyflow/react` graphs (never static images), one per phase per OS. Binds to `MindMapProps`: `model: MindMapRenderModel`, `theme`, `selectedNodeId`, `onNodeClick`, `onNodeHover`. Deterministic **top-down** layout (recon at top → privesc/DA at bottom).

**Node visual language (by `kind` — shape carries meaning, color is redundant):**
- `phase` → rounded rectangle, phase color (`--cph-node-*`) as left accent + tinted fill, phase icon.
- `decision` → **amber diamond** (`--cph-node-decision`), e.g. AD's **"Have valid creds?"** — the single root branch; edges labeled "if creds found" / "no creds" (`MindMapEdge.label`).
- `technique` → solid card-node, phase-colored, with a **heat ring** = `severity` (`--cph-sev-*`) drawn as border weight + a small corner severity glyph (so heat survives CVD). Clicking deep-links (see below).
- `outcome` → green rounded **capsule** (`--cph-node-outcome`), terminal goal (e.g. "Domain Admin", "SYSTEM").
- `note` → quiet dashed pill, muted.

**Edges:** thin, directional; `kind` styles the line — `then` solid, `or` dashed, `requires` dotted, `escalates` solid with a chevron + slight glow. Short labels only. The whole graph reads as bioluminescent neural wiring in the dark.

**Interaction:** selecting a node (`selectedNodeId`) **highlights the root→node path** and **dims the rest** (`dimmed` on render nodes) — a "current lineage glows, the abyss recedes" effect. **Node→command deep-link (killer feature):** clicking a node with `techniqueId` calls `onNodeClick(nodeId, techniqueId)` → filters/jumps the command view (deep-linkable URL). Collapse/expand subtrees (default: current phase only — never 300 nodes at once). Provide minimap, zoom-to-fit, pan. `onNodeHover` previews the node's technique summary. **Reduced-motion → instant layout snaps** (no animated re-layout). Nodes are **keyboard-reachable and labeled** (arrow-nav, focus ring, accessible name = node label + kind + severity). Bi-directional sync with SearchPalette (§6).

---

## 9. BLOODHOUND SECTION (first-class)

Two legs, visually distinct but unified: **Collection** (`bloodhound-python` remote / `SharpHound` on-host) rendered as standard CommandCards; **Analysis** = the **cypher query library** + the **edge→abuse→command table**.

- **Cypher library:** each `BloodHoundQuery` is a card with a **mono cypher block** that interpolates `{{DOMAIN}}` exactly like a CommandCard (same var-state styling, same copy-filled/raw, same `[UNVERIFIED]` + Sources). Group by `category` (`enumeration · attack-path · edge-abuse · recon · cleanup`).
- **Edge→abuse→command table:** a first-class data table keyed on `edge` (MemberOf, AdminTo, GenericAll, WriteDacl, WriteOwner, ForceChangePassword, AddMember, AllowedToAct/RBCD, AddKeyCredentialLink, DCSync, ReadLAPSPassword, ReadGMSAPassword, etc.). Columns: **Edge** (mono pill) · **What it grants** (`description`) · **Abuse** (`abuse`) · **Run it →** (links via `abuseTechniqueId` to the authored P10 technique — no command duplication). Severity heat per row uses the shared `--cph-sev-*` ramp.
- **Schema divergence:** any query with `legacyUI: true` renders a small `[UNVERIFIED]` note ("BloodHound legacy vs CE schema — verify in your version"). The realm here is `ad` (Forest of Trust skin) — gold accents for the ticket/edge motifs.

---

## 10. OS-REACTIVE THEMING LOOK (mechanism is code's; the LOOK is yours)

One component tree, theme = swapped token set keyed by **`data-os`** over CSS custom properties (instant, no remount, no flash). You deliver `theme.linux.css`, `theme.windows.css`, `theme.ad.css` overriding the **same keys** already defined at `:root` in `theme.base.css`. **Realm files only re-skin existing keys — they never declare a key that `theme.base.css` didn't already define at `:root`.** Each realm must:
- Feel like a **distinct biome** (Phosphor Reef / Azure Trench / Forest of Trust) — re-skinning bg/surface/border/text/primary/accent/focus, the `--cph-elev-3/4` rim-light inset tint, Octo's `--cph-octo-tint` & `--cph-octo-glow`, and the realm-accent used on search type-icons and card glows.
- Keep **structure, phase-node colors, severity ramp, and state semantics constant** so muscle memory transfers (a recon node is cyan, critical is venom-red, copied is green — in all three).
- **Independently pass WCAG AA + CVD-safe**, meaning never by hue alone.
- Transition smoothly: when the realm changes, the whole app cross-fades color tokens over `--cph-motion-base` and Octo plays `greeting` (reduced-motion → instant). Provide a clear realm switcher (Linux / Windows / Active Directory) — label text required, never icon-only.

---

## 11. ETHICS, DEFANG & RESPONSIBLE-USE (bake into the visuals)

- **Persistent, unobtrusive, non-dismissible responsible-use note** on every hands-on surface (CommandCards area, VariableBar, MindMap): the literal copy **"Authorized testing only — learner-owned labs, HackTheBox/Proving-Grounds, the exam."** Render it as quiet muted text with a small shield glyph — present, never nagging, never blocking, and not dismissible.
- **Defang-by-default in every mock & placeholder:** all example values use defang tokens (`<tun0-ip>`, `<target-ip>`, `<dc-ip>`, `<domain.local>`, `<rockyou.txt>`) or documentation ranges only (RFC5737 `198.51.100.0/24`, `192.0.2.0/24`, `203.0.113.0/24`; RFC3849 `2001:db8::/32`). **No mock, screenshot, or redline may show a command aimed at a real/routable host, or any real credential/hash/key.** Unset vars are always the inert amber token, never blank.
- **No machine names anywhere** — not in copy, mock data, layer names, asset filenames, or examples. The product has no surface that names or hints at a specific practice box.
- **Anti-fabrication respected visually:** the `[UNVERIFIED]` badge + Sources affordance are first-class, frozen UI — never hide or stylize them away. Don't invent CVEs/flags/offsets in any mock copy; use the canonical, real tool syntax shown in the spec or clearly-marked lorem.
- **Local-first / anonymous:** no signup screens, no account UI, no telemetry/consent banners, no "share" social chrome. Design for offline and installable (PWA): an install affordance and an offline-ready indicator, nothing that implies a backend.

---

## 12. SOUND DESIGN INTENT (optional, off-by-default, never required)

If implemented, sound is **subtle, organic, and opt-in** (a clearly-labeled mute toggle; default muted; honor reduced-motion users by also defaulting sound off). Palette: a soft low **"bloop"/water-tap** on copy-success (paired with, never replacing, the visual+`aria-live` feedback); a faint **sonar-ping** when results surface; a near-subliminal **bubble/current** ambient under `idle` (≤ −24dB). No alarms, no harsh beeps; error = a soft muted "thunk," not a buzzer. Sound is decorative only — it must never be the sole carrier of any state or success signal.

---

## 13. DELIVERABLES CHECKLIST (what you hand back)

1. **`theme.base.css`** defining **every `--cph-*` KEY in `TOKEN_KEYS`** at `:root` — **including a full default 12-key `--cph-color-*` palette** (so dependent tokens like `--cph-var-set`, `--cph-octo-glow`, `--cph-confidence-*` resolve with no `data-os` present) — plus all structural/state tokens and the reduced-motion override block. **No key outside `TOKEN_KEYS` may appear** (no `--cph-glow`, no `--cph-var-text`).
2. **`theme.linux.css`, `theme.windows.css`, `theme.ad.css`** — each **overriding only the same keys** already defined in `theme.base.css` for its realm, each passing WCAG AA + CVD-safe; none introduces a new key.
3. **Octo Rive artifact** with a state machine exposing all nine `OctoState` members + an `intensity` input + color inputs bound to `--cph-octo-*` + a `theme` input; ≤ low-tens-of-KB, 60fps.
4. **Octo inline-SVG fallback** (layered, labeled, state-class-swappable, animation-free) for reduced-motion/no-JS.
5. **Bespoke line-icon set** (severity ×5, phase ×8, var-state ×3, confidence ×2, node-kind ×5, type-icons ×5, group glyphs ×7) — 1.5px stroke, no emoji.
6. **High-fidelity mocks** of every surface in **all three realms** and every state: VariableBar (empty/set/invalid/sensitive-masked), CommandCard (raw/filled/unset-highlighted/invalid/copied + credMode ×3), SearchPalette (focus/thinking/found/empty), MindMap (default/node-selected/decision-branch), BloodHound (cypher card + edge table), and the responsible-use note in context.
7. **Type & color spec sheet** mapping each visual to its exact `--cph-*` token (from the closed §0.1 list only) and each interactive element to its exact prop/callback on the frozen component-API.
8. **Contrast & CVD audit** proving AA + colorblind-safe per realm.
9. **Token-key conformance check:** an explicit assertion that the union of keys across all four CSS files equals `TOKEN_KEYS` exactly — every key present at `:root`, zero invented keys, zero renames.

Bind every spec to the exact frozen names. When in doubt, the SHARED CONTRACT is law.