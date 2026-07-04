# DESIGN-PROMPT-v3-osce3-packs.md — Cephalo OSCE3 Pack UI Visual Brief (for Claude Design)

> **You already designed Cephalo v1** (`DESIGN-PROMPT.md` — "The Abyssal Instrument") and **the v2 surfaces** (`DESIGN-PROMPT-v2-arsenal.md` — Ask-the-Octopus, Privilege Advisor, CVE lookup, Nmap Triage, decision-tree mindmaps, ToolBinary arsenal). **This brief is a FOCUSED ADDITIVE upgrade** and it OWNS exactly one new thing: the **pack layer** — the **pack switcher** (a restyle of the live rail, not a new control), the **cert badges** for `oscp / oswe / osep / osed / osee`, the **pack-filter affordance across ALL surfaces**, and the **per-pack accent** as a small, closed set of NEW `--cph-pack-*` KEYS. Nothing else.
>
> **You bind to the FROZEN contract verbatim.** You import `content.ts` (`PackId`, `Pack`, every entity's `packs: PackId[]`), `engine.ts` (`SearchDoc.packs`, `SearchFilters.packs`, `MindMapRenderNode.dimmed`), `components.ts` (`OctoState`, `SearchPaletteProps.{filters,onFilterChange}`, `MindMapProps`, …), and `tokens.ts` (every existing `--cph-*` KEY). You **never rename a key, prop, or enum value**, never add a `PackId` literal to the frozen union, never add a field to a frozen prop, never re-declare a `TOKEN_KEYS` key. Where this brief and the contract disagree, **the contract wins**.
>
> **THE LOAD-BEARING IDEA — design this in:** a **pack is ORTHOGONAL to the OS skin.** `data-os ∈ linux|windows|ad` re-skins the *whole app ground*; a **pack** is a *credential lens over the content*. The two live in **different registers** and are shown **at the same time** — a pack badge sits **alongside** the realm, **never replaces it**. An `osep` card in the `ad` realm is aubergine-skinned (OS) **and** wears the constant magenta `osep` badge (pack). One is the room; the other is the stamp on the page.

---

## 0. THE SEAM YOU BIND TO (read first; do not deviate)

All v1 + v2 names still hold. The pack-specific frozen surface you bind to, **verbatim and verified against the live tree**:

- **`PackId = 'oscp' | 'oswe' | 'osep' | (string & {})`** (`content.ts`, FROZEN). `'osed'` and `'osee'` are **legal ADDITIVELY** through the `(string & {})` arm — they are first-class packs with **zero change to the frozen union**. **Design treats all five uniformly**; never special-case osed/osee as second-class, never widen or rewrite the union.
- **Every content entity carries `packs: PackId[]`** — `Command.packs`, `Technique.packs`, `Section.packs`, `MindMap.packs`, and the search-index `SearchDoc.packs` are all frozen arrays. The **`PackBadge` reads these directly.** An entity may belong to **several packs** (e.g. an AD/lateral technique shared by `oscp` **and** `osep` via the reuse/cross-link rule) → render a **multi-badge cluster**, never duplicate the card.
- **`Pack` interface (frozen, from `packs.ts`):** `{ id: PackId; label: string; description: string; enabledByDefault: boolean; os: OS[]; version?: string }`. The five live rows (paste-ready in the CODE addendum) are: `oscp` "OSCP / PEN-200", `oswe` "OSWE / WEB-300", `osep` "OSEP / PEN-300", `osed` "OSED / EXP-301", `osee` "OSEE / EXP-401". The switcher and badges consume **these fields only**: `label` = the human name shown in the rail; `id` = the `data-pack` value + the monogram source (uppercased); `description` = tooltip/sub-label prose; `enabledByDefault` = which packs are lit on first run (`oscp` true, the rest false); `os` = which realms the pack spans; `version` = a small caption (`'1'` on all five). **Invent no extra field** (no "completion %", no fake version).
- **The pack-filter store is LIVE — do not invent a parallel filter.** `src/stores/packs.ts` exports `usePacks` → `{ enabled: PackId[]; toggle(id); isEnabled(id) }`, OSCP always forced into `enabled`, persisted at `cephalo.packs`. The ONE predicate every surface already uses: `entity.packs.some((p) => enabled.includes(p))`. You **style the on/off states; you add no store field and no new filter prop.**
  - Search: `SearchPaletteProps.filters?: SearchFilters` where `SearchFilters.packs?: PackId[]`, mutated via the frozen `onFilterChange`. `SearchDoc.packs` already makes the index pack-aware. Hits carry a `PackBadge` from `SearchDoc.packs`.
  - Mindmaps & decision maps: a node excluded by the active pack is rendered with the **frozen `MindMapRenderNode.dimmed`** flag — you style `dimmed` (recede with opacity + existing muted tokens). **No new mindmap prop, no new dim KEY.**
  - Ask / Advisor / CVE / Nmap Triage / **ToolBinary arsenal**: the v2 contract already declares these six surfaces **pack-aware**; **you style their in-pack / dimmed states**, you do not add props to the v2 component APIs.
- **`OctoState` is UNCHANGED and CLOSED** (`idle | greeting | listening | thinking | found | empty | copied | error | celebrate`). A pack filter that excludes every result drives the **existing `empty`** state — **no new mascot state for packs.**
- **`PackBadge` is a NEW NON-FROZEN presentational component.** Signature (the contract's single source of truth — import, never re-declare):
  ```ts
  export interface PackBadgeProps { packId: PackId; size?: 'sm' | 'md'; label?: string }
  // renders <span class="pack-badge" data-pack={packId}> consuming --cph-pack-<id>-accent / -on-accent
  ```
  It composes the frozen `Pack`/`PackId` data; it adds **no** prop to any frozen component. It sits **alongside** `data-os` (orthogonal skin), never replaces it.
- **There is NO separate switcher component.** The "pack switcher" is the **existing rail Packs group in `App.tsx`** — already live and structurally frozen: `PACKS.map(...)` → one `<button class="rail-link" aria-pressed={enabled.includes(id)} data-active={enabled.includes(id)} disabled={id==='oscp'} onClick={toggle}>` per pack, with a leading `'● '`/`'○ '` text marker and `{p.label}`. **You restyle `.rail-link[data-active]` and the in-rail `.pack-badge[data-pack]`; you change no markup.** The OS realm switcher and the pack rail are **sibling controls — never merged into one control.**

### 0.1 THE COMPLETE, CLOSED PACK TOKEN-KEY LIST (you define every one of these, and no others)

These **12** keys are the ONLY new keys this brief introduces. They are declared by code in NEW **`src/styles/pack-tokens.ts`** as **`PACK_TOKEN_KEYS`** (the frozen `tokens.ts` `TOKEN_KEYS` const stays **byte-identical** — never append here). `scripts/gate-tokens.ts` is EXTENDED (non-frozen) to assert the stylesheet declares **`TOKEN_KEYS ∪ PACK_TOKEN_KEYS`** and rejects strays. You (design) supply the VALUES; code declares the KEYS and the gate.

> **EXACT VALUES FILE — pin it, do not guess.** The 12 pack VALUES land at `:root` in **`/styles/theme.base.css`** (repo root) — the **exact file `gate-tokens` reads** (`gateTokens()` scans `ROOT/styles/theme.base.css`, where every base `--cph-*` VALUE already lives). Do **NOT** put pack VALUES in **`src/styles/app.css`** (which only *consumes* tokens via `var()` and is **never scanned by the gate** — values there would silently fail the gate). Wherever this brief says "the global stylesheet" / "the stylesheet," it means **`/styles/theme.base.css`** and nothing else.

```ts
// src/styles/pack-tokens.ts — ADDITIVE token KEYS for pack accents (code declares KEYS, design supplies VALUES).
export const PACK_TOKEN_KEYS = [
  '--cph-pack-oscp-accent','--cph-pack-oscp-on-accent',
  '--cph-pack-oswe-accent','--cph-pack-oswe-on-accent',
  '--cph-pack-osep-accent','--cph-pack-osep-on-accent',
  '--cph-pack-osed-accent','--cph-pack-osed-on-accent',
  '--cph-pack-osee-accent','--cph-pack-osee-on-accent',
  '--cph-pack-badge-radius','--cph-pack-badge-border',
] as const;
```

- **per-pack accent pair (10):** `--cph-pack-<id>-accent` (the pack hue) + `--cph-pack-<id>-on-accent` (the AA-contrast ink that sits **on** the accent fill). Meaning is **never hue-alone** — the badge always renders the cert **label text** in the `on-accent` ink.
- **badge chrome (2):** `--cph-pack-badge-radius` (the chip corner — distinct from the fully-round variable pills and from the severity alert glyphs) + `--cph-pack-badge-border` (the realm-invariant hairline edge that frames the chip on any ground).

**12 new keys total.** There is no other escape hatch. Everything else reuses an existing v1/v2 KEY — **use the exact frozen names:**

- focus ring → **`--cph-color-focus`** (v1)
- elevation / radius → **`--cph-elev-*`**, **`--cph-radius-*`** (v1)
- the recessed `+N` chip / outline-badge recess → **`--cph-var-token-bg`** (v1, `rgba(127,127,127,.14)`)
- muted/dimmed (out-of-pack) text → **`--cph-color-text-muted`** (v1); the out-of-pack **recede is plain `opacity` + the muted token, NOT a new key**
- the `empty`-state Octo → **`--cph-octo-empty`** (v1)
- the `[UNVERIFIED]` badge → **`--cph-confidence-unverified`** / **`--cph-confidence-verified`** (v1)

---

## 1. ART DIRECTION — "Reef Heraldry" (a credential layer over The Abyssal Instrument)

A pack is a **diver's credential patch** — a small, etched **cert chip** bearing a four-letter wordmark (OSCP/OSWE/OSEP/OSED/OSEE), worn on the existing instrument. The aesthetic is **engraved metal / depth-rank**, not glossy gamification. Five chips, learnable at a glance, calm and authoritative. They never shout over the content; they **certify** it.

The **orthogonality law is the whole brief:**

1. **OS skin = the room.** `data-os` re-skins ground/surface/primary across the entire app (Phosphor Reef teal-black / Azure Trench navy / Forest of Trust aubergine). **Pack accents do NOT participate in re-skinning** — they are **constant across all three realms** (exactly like the `--cph-sev-*` ramp and the `--cph-node-*` phase colors), so the pack language is learnable everywhere. **`pack-tokens` lives at `:root` only; no realm file (`theme.{linux,windows,ad}.css`) overrides any `--cph-pack-*` key.**
2. **Pack = the stamp.** A badge rides on top of whatever realm is active. It is small, bounded, and framed by the hairline so it reads as *metadata about the content*, not as part of the chrome theme.
3. **They coexist, always.** Switching realm never changes which packs are active; switching pack never changes the realm. Both selections persist independently (`data-os` theme + `cephalo.packs`). A badge is **always shown with the realm**, never instead of it.

### 1.1 THE ORTHOGONALITY LAW, MADE VISIBLE (hard requirement)

- The **header/rail carries two clearly separate controls**: the v1 **realm switcher** — which is the dedicated **`RealmSwitcher.tsx` component** (the three OS realms Linux / Windows / Active Directory; label text required) and is the **only** control that writes `data-os` — and the live **Packs rail group** in `App.tsx` (OSCP / OSWE / OSEP / OSED / OSEE), which is the **only** pack control. **Do not conflate the rail's `rail-group-title` "Realm" nav group with the realm toggle:** that rail "Realm" group additionally holds **BloodHound + Cross-cutting nav links** (plain navigation, not OS toggles) — the actual `data-os` toggle is `RealmSwitcher.tsx`, a separate component. Give the realm switcher and the Packs rail visible separation (group titles plus a divider/spacer) and **distinct affordance shapes** so they are never read as one toggle group. The realm switcher (`RealmSwitcher.tsx`) governs `data-os`; the Packs rail governs `usePacks.enabled`. Mock every realm × pack combination at least once to prove neither overrides the other.
- A cert badge's **accent is identical in all three realms.** Verify the same `osep` magenta on Phosphor-Reef `#07120f`, Azure-Trench `#0a0f1a`, and Forest-of-Trust `#120a15` — it must hold its AA role on **all three** grounds and on every realm surface/surface-raised.
- **The pack badge is visually a different SPECIES from the severity chip AND from the phase-tinted node.** Severity = a *saturated warm/cyan alert glyph* (circle-i / chevrons / triangle-bang / octagon-bang) on the `--cph-sev-*` ramp, at the card heading. A mindmap **node** = a *phase-tinted fill* (the **whole `--cph-node-*` ramp**: the blue `--cph-node-enum` `#4ea3e0` and cyan `--cph-node-recon` `#5bc8d6` **and** the violet `--cph-node-lateral` `#b07ce8`). A cert badge = a *framed rectangular chip with a four-letter WORDMARK* in a **different slot** (card corner / rail). **Different shape family, different color family, different position** — never confusable with severity OR with **any** node fill. The by-form rule is the general disambiguator: it must hold for a **blue/steel pack badge (oscp/oswe) over a blue/cyan node fill (node-enum/node-recon)** exactly as it holds for a magenta pack badge over the violet node-lateral — there is no hue-adjacency the form does not cover. This is the "cert badges legible at a glance and distinct from severity colors" requirement, satisfied **by form first**.

### 1.2 ANTI-AI-SLOP / ANTI-FABRICATION (inherit v1 §1.1 and v2 §1.2 in full, plus these)

- All prior bans hold: no purple-gradient SaaS hero, no glassmorphism, no kawaii octopus, **no emoji as UI** (the wordmarks are a bespoke engraved letterform, never emoji or clip-art shields), no meaning-by-hue-alone, no chatbot/streaming affordances.
- **Do NOT clone or imply official OffSec badge artwork.** These are **original cert chips** in Cephalo's own visual language. Never reproduce a vendor's certification emblem, seal, or trademark. The wordmarks are plain four-letter labels, nothing more.
- **No invented packs, no invented authority.** Render exactly the five `PackId`s and only the `Pack` data provided. Never mock a sixth pack, a fake version string, or a fabricated "completion %". A pack with `version` unset shows **no** version caption (never a guessed one); all five currently carry `version:'1'`.
- **Defang + no machine names** in every pack mock (RFC5737 `198.51.100.0/24`/`203.0.113.0/24`, RFC3849, `example.local`/`example.lab`; sensitive vars masked). Pack filtering is over the user's own offline content — **NO AI, NO network, NO telemetry** in any pack interaction.

---

## 2. TOKEN VALUES — the 12 pack keys (`:root` only; constant across realms)

Append into **`/styles/theme.base.css`** (repo root) **at `:root`** — the exact file `gate-tokens` reads and where every base `--cph-*` VALUE already lives; **not** `src/styles/app.css` (consume-only, ungated). The realm files (`theme.linux.css` / `theme.windows.css` / `theme.ad.css`) **override NONE of these keys** — pack identity is realm-invariant by design (the same learnable language as `--cph-sev-*` and `--cph-node-*`). Hex is starting truth; micro-tune for contrast but keep the semantics and the depth ordering.

```css
:root{
  /* ── pack accents (the five credentials; CONSTANT across all realms) ─────────
     Identity ladder: a steel foundation rising through indigo into jewel-magenta
     as depth/difficulty increases (OSCP→OSEE). Hue is the TERTIARY cue — the
     four-letter WORDMARK + rail position carry identity; hue never alone.
     Each `-accent` is mid-light so the dark `-on-accent` ink clears AA 4.5:1 on a
     FILLED badge; each accent also clears 3:1 as a graphic/large-label on every
     realm ground for the OUTLINE variant. None of the five falls in the severity
     ramp's cyan→red bands — packs are blue→magenta, severity is cyan→red. */
  --cph-pack-oscp-accent:     #7C96B8;  /* OSCP / PEN-200 — muted slate-steel (~215°, low chroma): the broad FOUNDATION */
  --cph-pack-oscp-on-accent:  #0B0F14;  /*   dark ink — AA 6.2:1 on the steel fill */
  --cph-pack-oswe-accent:     #6F84EE;  /* OSWE / WEB-300 — indigo (~234°): white-box web */
  --cph-pack-oswe-on-accent:  #0B0F14;  /*   AA 5.6:1 */
  --cph-pack-osep-accent:     #C56FDC;  /* OSEP / PEN-300 — magenta (~292°): evasion + AD/lateral */
  --cph-pack-osep-on-accent:  #0B0F14;  /*   AA 6.0:1 */
  --cph-pack-osed-accent:     #DC6BC6;  /* OSED / EXP-301 — orchid (~318°): user-mode exploit-dev */
  --cph-pack-osed-on-accent:  #0B0F14;  /*   AA 6.3:1 */
  --cph-pack-osee-accent:     #E86B9E;  /* OSEE / EXP-401 — rose-magenta (~338°): advanced Windows exploitation */
  --cph-pack-osee-on-accent:  #0B0F14;  /*   AA 6.4:1 */

  /* ── badge chrome (realm-agnostic structure) ───────────────────────────────── */
  --cph-pack-badge-radius: 4px;                       /* sharp etched-tag corner — distinct from the round variable pills (--cph-radius-full) and from severity glyphs; equals --cph-radius-sm */
  --cph-pack-badge-border: 1px solid rgba(127,135,150,.30); /* realm-invariant hairline framing the chip on any ground; the per-pack hue does the fill/ink, this gives the chip a crisp edge on both dark and filled backgrounds */
}
```

> **CONTRAST & CVD NOTE (audit by name).** The five accents are *not* maximally hue-separated — `oscp`↔`oswe` are both blue-family (distinguished by **chroma**: oscp is desaturated steel, oswe is saturated indigo) and `osep`↔`osed`↔`osee` are a magenta trio (~292/318/338°). This is **deliberate and safe** because pack identity is **NEVER hue-only**: every badge renders its **four-letter wordmark** and sits in a **fixed depth-ordered position** in the rail. Simulate all five under deuter/protan/tritan and in **greyscale**; where two read close, the **wordmark + rail position must remain the disambiguator**. Confirm every pack is still identifiable with hue stripped.
>
> **Two carve-outs, both explicit and both safe-by-form:**
> 1. **vs severity (`--cph-sev-*`):** none of the five accents falls in the severity ramp's warm/green/cyan bands (`info` cyan `#5bc8d6`, `low` sea-green `#6fb36b`, `medium` amber `#e0b341`, `high` coral-orange `#e8803a`, `critical` red `#e8554e`) — **packs are blue→magenta, severity is cyan→red; the two ramps never overlap.** Plus the form differs (framed wordmark chip vs alert glyph).
> 2. **vs node phase ramp (`--cph-node-*`):** the node ramp has hue-adjacencies at **both ends** of the pack ladder, not just one. At the magenta end, the violet `--cph-node-lateral` (`#b07ce8`, ~270°) is adjacent to `osep` (`~292°`) / `osed` (`~318°`). At the **blue end**, the blue `--cph-node-enum` (`#4ea3e0`, ~205°) and cyan `--cph-node-recon` (`#5bc8d6`) are adjacent to the **blue pack accents** `oscp` (steel `~215°`) / `oswe` (indigo `~234°`), again at near-identical luminance. On a mindmap a **dimmed out-of-pack node keeps its phase tint underneath a pack badge**, so the two CAN co-render at EITHER end. Disambiguation is **by form, not hue** in every case: a node is a *filled phase-tinted shape*; a badge is a *framed wordmark chip* in the node-corner slot. Prove the badge reads cleanly over **every** `--cph-node-*` fill in the mock — specifically a **blue/steel `oscp`/`oswe` badge over a `node-enum`/`node-recon` fill**, not only a magenta `osep`/`osed` badge over `node-lateral`.

---

## 3. THE CERT BADGE — `PackBadge` (`<span class="pack-badge" data-pack={packId}>`)

**Anatomy (every badge, every size):** a **framed rectangular chip** (radius `--cph-pack-badge-radius`, edge `--cph-pack-badge-border`) bearing the centered **four-letter wordmark** = `Pack.id` uppercased (or the optional `label` prop, truncated to the cert short-name). The `data-pack` attribute selects the accent pair. Two render modes, both driven only from the per-pack KEY pair:

- **Filled badge (default / active / emphasis):** background = `var(--cph-pack-<id>-accent)`, wordmark = `var(--cph-pack-<id>-on-accent)` (the dark ink, AA ≥4.5:1). The robust everywhere-AA default — use for the active pack in the rail and the primary pack on a focused card.
- **Outline badge (dense listings / search hits):** transparent/`--cph-var-token-bg` recess, wordmark + edge drawn in `var(--cph-pack-<id>-accent)`. Because the accent-on-realm-ground path is a **graphic/large-label**, render the wordmark at the chip's bold weight so the **3:1** large-text/graphic threshold applies (verified ≥3:1 for every accent on every realm `surface`/`surface-raised`). Where an outline badge would sit on the lightest realm-raised surface at body size, prefer the filled mode.

**Sizes (`PackBadgeProps.size`):**
- **`md` ≈ 22–24px:** full four-letter wordmark; `Pack.label` + `version` available via tooltip/accessible name. This is the rail/header size.
- **`sm` ≈ 16px:** wordmark only; `Pack.description`/`version` move into the tooltip + `aria-label`. The wordmark alone must stay crisp at 16px — choose a wide, unambiguous engraved letterform.
- **Multi-pack cluster (an entity in several `packs`):** show up to 3 `sm` badges (highest-depth pack last/frontmost), then a **`+N` chip** on `--cph-var-token-bg`; the full list is in the tooltip. Reuse the v1 cross-link affordance — **never duplicate the card per pack.**

**TARGET-SIZE RULE (WCAG 2.2 SC 2.5.8 — hard requirement).** The **`sm` (16px) card-corner badge and the `+N` chip are NON-INTERACTIVE** — label/tooltip only (the **parent card/row is the click & focus target**). They MUST NOT be independent click/focus targets at 16px. The only interactive pack targets are the **live rail `.rail-link` buttons** (§4), which already meet the 24px minimum with their own focus ring.

**Depth/tier copy (a fixed DESIGN constant, NOT a data field), used in tooltip grouping only:** `oscp` = "Foundation"; `oswe · osep · osed` = "OSCE3"; `osee` = "Advanced". The tier word is **text**, never hue-only.

**Status by text, never hue:** a badge's pack is always announced by its **wordmark (text)**. Color is redundant. Accessible name: `"${Pack.label} pack${version ? ', v'+version : ''}"`; on a card, suffix the relationship — e.g. `"shared OSCP + OSEP"`.

---

## 4. THE PACK SWITCHER — restyle the LIVE rail (no new component)

The switcher already exists in `App.tsx` as the **Packs rail group** and is structurally frozen. You **only restyle** `.rail-link[data-active]` and drop a `PackBadge` into each row. Do not change the markup, the `aria-pressed`, the `data-active`, the `disabled` on `oscp`, the `onClick={toggle}`, or the leading `'● '`/`'○ '` text marker.

- **Selection model (live):** multi-select via `usePacks.toggle`; `oscp` is forced on (the store re-inserts it) and its button is `disabled` — style it as **permanently lit, visibly non-togglable** (lowered affordance, no hover-press). The `'● '`/`'○ '` glyph is the **redundant non-hue** on/off indicator — keep it; it is the text/shape signal that pairs with the accent.
- **Active treatment (`.rail-link[data-active]`):** the row reads as *engaged* — its `PackBadge` switches to **filled** mode (`accent` + `on-accent`), and the row gains a **2px leading indicator drawn in that pack's own accent** (`box-shadow`/`border-inline-start: var(--cph-pack-<id>-accent)`), composed by code from the per-pack KEY — **no new "active" token**. Inactive rows show the **outline** badge at reduced emphasis.
- **Per-row badge:** each Packs `rail-link` hosts a `<PackBadge packId={p.id} size="md" />` beside `{p.label}`. This is the only structural addition (a presentational child), permitted by the additive-component rule; it carries the per-pack accent so the rail itself teaches the five hues.
- **"All packs" = no filter:** an empty/`['oscp']`-only selection is treated by every surface as **show-all** (never "show nothing"). Make the lit-set legible at a glance via the filled badges.
- **`os` hint:** a row may surface, on hover/focus, which realms the pack spans (`Pack.os` → realm labels) — informational only; it **never** changes `data-os`.
- **Keyboard & a11y (already wired, style it):** `aria-pressed` per button; visible `--cph-color-focus` ring (2px, 2px offset); an `aria-live` line on toggle ("OSEP pack enabled — N items in view"). Each button is a real ≥24px target (SC 2.5.8 satisfied here, not on the `sm` badge).
- **Reduced motion:** selection is an **instant** token swap (outline↔filled + indicator) — no slide, no badge-fill tween; honor the `prefers-reduced-motion` block that already collapses `--cph-motion-*` to 1ms.

---

## 5. THE PACK-FILTER AFFORDANCE — across ALL surfaces

A single, consistent **"in this pack / dimmed out-of-pack"** language, reused on every surface, bound to the **existing** props/store above (§0). The rule everywhere: **in-pack content is full-opacity; out-of-pack content recedes via plain `opacity` + `--cph-color-text-muted`** (never removed, so the user keeps spatial memory **and stays countable**) — **no new dim KEY**. Each surface keeps its **explain-why chip** ("in OSEP", "shared OSCP + OSEP").

This covers **all six** frozen pack-aware v2 surfaces (Ask, Advisor, CVE, Nmap Triage, Decision maps, **ToolBinary arsenal**) plus Search and Mindmaps:

- **Search palette (`SearchPalette`):** a **pack-filter chip row** in the filter area, mutating `SearchFilters.packs` via `onFilterChange`; each chip is a small `PackBadge` toggle. Hits carry a `sm` `PackBadge` from `SearchDoc.packs`. When the active filter excludes everything → Octo **`empty`** (`--cph-octo-empty`) + "no results in {packs} — clear the pack filter."
- **Mindmaps (`MindMap`) & Decision maps:** nodes whose technique is out-of-pack get the **frozen `MindMapRenderNode.dimmed`** flag — recede with `opacity` (the v1 phase tint + severity heat ring stay underneath, just muted). In-pack nodes stay lit; in-pack nodes may show a corner `sm` badge. The v2 walk-mode lineage trace still reads. **No new mindmap prop, no new KEY.**
- **ToolBinary arsenal:** each entry carries a `sm` `PackBadge` from the tool's `packs`; out-of-pack tools **recede (opacity) but stay countable** ("4 tools in OSEP, 6 in other packs"). The pack-filter chip scopes which tools fire to full emphasis. Binds to the **same existing v2 pack-aware API — no new prop**. A multi-pack tool shows the cluster + `+N` (§3), never a duplicated row. The v2 `fetchNote` literal stays verbatim.
- **Ask-the-Octopus:** the active-pack set scopes retrieval; the result header gains a small "scoped to OSWE + OSEP" note **next to** the existing "Deterministic retrieval, not AI — here's why this matched" chip. Out-of-pack near-matches may show recessed (opacity) with a "switch pack to see" hint — **never auto-switching.**
- **Privilege Advisor:** ranked cards carry a `sm` `PackBadge`; out-of-pack cards recede but remain countable in the parse summary ("3 in OSEP, 2 in other packs").
- **CVE lookup & Nmap Triage:** match cards / routing rows carry a `sm` `PackBadge`; the pack-filter chip scopes which fire to full emphasis. Nmap realm-inference is **independent** of pack — it proposes a `data-os` switch (never auto-applied), orthogonal to the active pack. (Per the v3 routing spec: port 1433 → `osep.mssql.attacks` when `osep` lit; web ports → `oswe.*` when `oswe` lit.)

Every surface's pack-filter chip and "scoped to …" note is **explain-why text + wordmark**, never hue-only, and is **session-only state** (the persisted bit is only `cephalo.packs`).

---

## 6. ORTHOGONALITY, ACCESSIBILITY, CONFORMANCE

- **Orthogonality proof:** mock the same content card in **all 3 realms × at least 3 pack states** (single pack, multi-pack cluster, all-packs) to show the badge accent is realm-invariant and the realm skin is pack-invariant. The realm switcher and the Packs rail never visually merge.
- **Distinct from severity AND from node fills:** in any mock where a card shows **both** a `danger` severity chip **and** a `PackBadge`, they sit in different slots, different shape families, different ramps (cyan→red vs blue→magenta). On mindmaps, prove the by-form disambiguation at **both ends of the ramp**: a **magenta `osep`/`osed` badge over a violet `--cph-node-lateral` fill** AND a **blue/steel `oscp`/`oswe` badge over a `--cph-node-enum`/`--cph-node-recon` fill** — each stays disambiguated by **form** (framed wordmark chip vs node fill), not hue.
- **WCAG 2.1 AA + 2.2 SC 2.5.8, CVD-safe, no hue-only:** all 12 keys audited per realm — `on-accent` ink ≥4.5:1 on every filled accent; outline accent ≥3:1 as a bold graphic-label on every realm `surface`/`surface-raised`. Pack identity always = **wordmark + rail position**; greyscale the rail to prove it. The only interactive pack targets are the ≥24px live rail buttons; the `sm` badge and `+N` chip are non-interactive (parent is the target).
- **Reduced motion:** rail selection instant; the filter dim is an **instant opacity change with no animated reflow**; clusters do not animate; no badge-fill tween. No information is ever motion-only (Octo stays `aria-hidden`; all state in text + `aria-live`).
- **Non-AI / offline discipline preserved:** the pack layer adds **no** network, telemetry, or AI affordance; the persistent NO-AI/NO-network banner and per-feature "deterministic retrieval, not AI" chips remain on every surface. Pack selection is local persisted (`cephalo.packs`) + session UI state only.

---

## 7. DELIVERABLES CHECKLIST (what you hand back for the pack layer)

1. **The 12 pack token VALUES at `:root`** in **`/styles/theme.base.css`** (repo root — the gated file; never `src/styles/app.css`) — exactly the keys in `PACK_TOKEN_KEYS` (§0.1/§2), **no realm overrides**, no key outside `TOKEN_KEYS ∪ PACK_TOKEN_KEYS`. Each passes its AA role + a CVD/greyscale audit.
2. **`PackBadge`** — `<span class="pack-badge" data-pack={packId}>` per the frozen `PackBadgeProps` (`packId`, `size?:'sm'|'md'`, `label?`): filled + outline modes from the `accent`/`on-accent` pair, the five bespoke four-letter wordmarks (engraved letterform, no emoji / no vendor emblem), the multi-pack cluster + `+N` on `--cph-var-token-bg`, sizes `md` (≈22–24px) / `sm` (16px), the **non-interactive `sm` + `+N`** rule (§3), full tooltip/`aria-label` from `Pack` fields.
3. **Pack rail restyle** — `.rail-link[data-active]` engaged treatment + per-row `PackBadge` + per-pack accent leading indicator; the permanently-lit non-togglable `oscp` (`disabled`); the `'● '`/`'○ '` redundant marker kept; `--cph-color-focus` ring; reduced-motion instant swap. **No markup change.**
4. **Pack-filter mocks on EVERY surface** — search palette filter chips + dimmed (opacity) rows with `sm` badges; dimmed mindmap/decision nodes via the frozen `dimmed` flag, **including the by-form proof at BOTH ramp ends** (a blue/steel `oscp`/`oswe` badge over a `--cph-node-enum`/`--cph-node-recon` fill AND a magenta `osep`/`osed` badge over a `--cph-node-lateral` fill); **ToolBinary arsenal** `sm` badges + dimmed-but-countable out-of-pack tools + filter chip; Ask "scoped to" note; Advisor/CVE/Nmap badges; the all-realm × all-pack orthogonality grid; and the **`empty`-state** (`--cph-octo-empty`) when a filter excludes everything.
5. **Bespoke pack glyphs:** the framed wordmark chip, the `+N` cluster chip — CVD-distinct, never emoji.
6. **Token→visual + frozen-binding map:** each pack UI element mapped to its exact `--cph-pack-*` KEY **and** to the exact frozen field/prop/store it reads — `Command.packs` / `Technique.packs` / `Section.packs` / `MindMap.packs` / `SearchDoc.packs`, ToolBinary `packs`, `SearchFilters.packs` + `onFilterChange`, `MindMapRenderNode.dimmed`, `usePacks.{enabled,toggle,isEnabled}`, `Pack.{id,label,description,enabledByDefault,os,version}`, `OctoState.empty` — plus reuse pointers to the exact v1 keys (`--cph-color-focus`, `--cph-elev-*`, `--cph-radius-sm`, `--cph-var-token-bg`, `--cph-color-text-muted`, `--cph-octo-empty`, `--cph-confidence-unverified`).
7. **Conformance assertion:** the stylesheet's `--cph-*` set equals `TOKEN_KEYS ∪ PACK_TOKEN_KEYS` exactly (extended `gate-tokens`), zero invented keys, zero renames; frozen `tokens.ts` byte-identical; no new `PackId` literal in the frozen union; no field added to any frozen prop; the pack badge always coexists with (never replaces) the `data-os` skin.

Bind every spec to the exact frozen names. When in doubt, **the contract wins.**
