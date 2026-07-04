// src/types/tokens.v3.ts — ADDITIVE (v3). NEW --cph-pack-* KEYS only; frozen tokens.ts
// is untouched. Code declares KEYS; the v3 "Reef Heraldry" design supplies VALUES. Pack
// hues are REALM-CONSTANT (a pack is a credential lens over content, orthogonal to the
// data-os skin) — no realm file overrides a --cph-pack-* key. NOT a frozen module.
export const TOKEN_KEYS_V3 = {
  pack: [
    '--cph-pack-oscp',
    '--cph-pack-oscp-contrast',
    '--cph-pack-oswe',
    '--cph-pack-oswe-contrast',
    '--cph-pack-osep',
    '--cph-pack-osep-contrast',
    '--cph-pack-osed',
    '--cph-pack-osed-contrast',
    '--cph-pack-osee',
    '--cph-pack-osee-contrast',
    '--cph-pack-badge-bg',
    '--cph-pack-badge-ring',
  ],
} as const;
