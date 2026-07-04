// src/stores/ask.ts — F4 Ask-the-Octopus store (v2). Session-only; the query + pasted
// scan are NEVER persisted. resolveIntent runs OVER the frozen SearchEngine (loaded at
// app boot) + the F4 datasets; the paste-scan tab routes to the F8 triage. No clock/random.
import { create } from 'zustand';
import { resolveIntent, type IntentDeps } from '@/engine/intent';
import { triageNmap } from '@/engine/nmap';
import { searchEngine } from '@/engine/search';
import { INTENT_ALIASES, PHRASEBOOK } from '@/data/v2/intents';
import { NMAP_ROUTES } from '@/data/v2/nmapRoutes';
import { CVE_ENTRIES } from '@/data/v2/cve';
import type { IntentResolution } from '@/types/ask';
import type { NmapTriageResult } from '@/types/nmap';

const intentDeps: IntentDeps = { aliases: INTENT_ALIASES, phrasebook: PHRASEBOOK, search: searchEngine };

interface AskState {
  query: string;
  mode: 'summon' | 'paste-scan';
  resolution?: IntentResolution;
  nmap?: NmapTriageResult;
  setQuery: (q: string) => void;
  submit: (q: string) => void;
  setMode: (m: 'summon' | 'paste-scan') => void;
  pasteScan: (raw: string) => void; // session-only; raw NEVER persisted
}

export const useAsk = create<AskState>((set) => ({
  query: '',
  mode: 'summon',
  setQuery: (query) => set({ query }),
  submit: (q) => set({ query: q, resolution: resolveIntent(q, intentDeps) }),
  setMode: (mode) => set({ mode }),
  pasteScan: (raw) => set({ nmap: triageNmap(raw, { routes: NMAP_ROUTES, cveEntries: CVE_ENTRIES }) }),
}));
