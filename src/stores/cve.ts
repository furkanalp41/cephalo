// src/stores/cve.ts — F6 CVE-lookup store (v2). Session-only; nothing persisted. The
// pure lookupCve engine runs over the curated F6 dataset. No Date.now/Math.random.
import { create } from 'zustand';
import { lookupCve } from '@/engine/cve-lookup';
import { CVE_ENTRIES } from '@/data/v2/cve';
import type { CveMatch } from '@/types/cve';

interface CveState {
  product: string;
  version: string;
  matches: CveMatch[];
  setQuery: (product: string, version: string) => void;
  reset: () => void;
}

export const useCve = create<CveState>((set) => ({
  product: '',
  version: '',
  matches: [],
  setQuery: (product, version) => set({ product, version, matches: lookupCve(product, version, CVE_ENTRIES) }),
  reset: () => set({ product: '', version: '', matches: [] }),
}));
