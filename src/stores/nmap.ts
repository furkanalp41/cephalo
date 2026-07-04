// src/stores/nmap.ts — F8 nmap-triage store (v2). Session-only; the pasted scan
// (rawInput) is NEVER persisted (may contain host data). triageNmap is pure with an
// injected clock (default fixed epoch — no Date.now in store logic). No random.
import { create } from 'zustand';
import { triageNmap } from '@/engine/nmap';
import { NMAP_ROUTES } from '@/data/v2/nmapRoutes';
import { CVE_ENTRIES } from '@/data/v2/cve';
import type { NmapTriageResult } from '@/types/nmap';

interface NmapState {
  rawInput: string; // session-only; NEVER persisted
  userValues: Record<string, string>;
  result: NmapTriageResult | undefined;
  setInput: (t: string) => void;
  setUserValues: (v: Record<string, string>) => void;
  triage: () => void;
  reset: () => void;
}

export const useNmap = create<NmapState>((set, get) => ({
  rawInput: '',
  userValues: {},
  result: undefined,
  setInput: (rawInput) => set({ rawInput }),
  setUserValues: (userValues) => set({ userValues }),
  triage: () => {
    const { rawInput, userValues } = get();
    set({ result: triageNmap(rawInput, { routes: NMAP_ROUTES, cveEntries: CVE_ENTRIES, userValues }) });
  },
  reset: () => set({ rawInput: '', userValues: {}, result: undefined }),
}));
