// src/stores/variables.ts — the VariableBar state.
// SEEDS every VariableDef.default into `values` at init (§5.2/§8.1) — the SOLE
// consumer of `default`, leaving the FROZEN filled chain untouched. Persists
// non-sensitive values only; sensitive vars (PASS/NTHASH/AESKEY/...) are
// session-only and never written to localStorage.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VARIABLE_DEFS_BY_ID, seededDefaults } from '@/data/variables';
import { validateValue } from '@/engine/template';

function computeValidity(values: Record<string, string>): Record<string, boolean> {
  const validity: Record<string, boolean> = {};
  for (const [id, value] of Object.entries(values)) {
    const def = VARIABLE_DEFS_BY_ID[id];
    if (def?.validation) validity[id] = validateValue(value, def.validation);
    else validity[id] = true;
  }
  return validity;
}

interface VariablesState {
  values: Record<string, string>;
  validity: Record<string, boolean>;
  setValue: (id: string, value: string) => void;
  reset: (id?: string) => void;
  clearSensitive: () => void;
}

export const useVariables = create<VariablesState>()(
  persist(
    (set, get) => ({
      values: seededDefaults(),
      validity: computeValidity(seededDefaults()),
      setValue: (id, value) => {
        const values = { ...get().values };
        // Empty string === unset: drop the key so the FROZEN chain falls through
        // to the defang placeholder (never an empty filled string).
        if (value === '') delete values[id];
        else values[id] = value;
        set({ values, validity: computeValidity(values) });
      },
      reset: (id) => {
        if (id === undefined) {
          const values = seededDefaults();
          set({ values, validity: computeValidity(values) });
          return;
        }
        const values = { ...get().values };
        const seeded = seededDefaults();
        if (seeded[id] !== undefined) values[id] = seeded[id];
        else delete values[id];
        set({ values, validity: computeValidity(values) });
      },
      clearSensitive: () => {
        const values = { ...get().values };
        for (const key of Object.keys(values)) {
          if (VARIABLE_DEFS_BY_ID[key]?.sensitive) delete values[key];
        }
        set({ values, validity: computeValidity(values) });
      },
    }),
    {
      name: 'cephalo.variables',
      // Persist NON-sensitive values only.
      partialize: (s) => ({
        values: Object.fromEntries(
          Object.entries(s.values).filter(([k]) => !VARIABLE_DEFS_BY_ID[k]?.sensitive),
        ),
      }),
      // Keep seeded defaults for any key the persisted snapshot omits, then
      // recompute validity from the merged values.
      merge: (persisted, current) => {
        const persistedValues = (persisted as { values?: Record<string, string> })?.values ?? {};
        const values = { ...seededDefaults(), ...persistedValues };
        return { ...current, values, validity: computeValidity(values) };
      },
    },
  ),
);
