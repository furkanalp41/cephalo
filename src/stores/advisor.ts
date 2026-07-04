// src/stores/advisor.ts — F3 Privilege-Advisor store (v2). Session-only; the pasted enum
// output (rawInput) is NEVER persisted (may contain host data). parseEnumOutput + advise
// are pure functions over the F3 datasets. No Date.now/Math.random.
import { create } from 'zustand';
import { parseEnumOutput, parseBuildInfo } from '@/engine/privilege-parser';
import { advise } from '@/engine/privilege-advisor';
import { SIGNALS } from '@/data/v2/signals';
import { RULES } from '@/data/v2/rules';
import type { EnumSource, SignalMatch, AdvisorRecommendation } from '@/types/advisor';

interface AdvisorState {
  source: EnumSource;
  rawInput: string; // session-only; NEVER persisted
  matches: SignalMatch[];
  recommendations: AdvisorRecommendation[];
  unrecognizedLines: string[];
  setSource: (s: EnumSource) => void;
  setInput: (t: string) => void;
  parse: () => void;
  reset: () => void;
}

export const useAdvisor = create<AdvisorState>((set, get) => ({
  source: 'whoami-priv',
  rawInput: '',
  matches: [],
  recommendations: [],
  unrecognizedLines: [],
  setSource: (source) => set({ source }),
  setInput: (rawInput) => set({ rawInput }),
  parse: () => {
    const { rawInput, source } = get();
    const { matches, unrecognizedLines } = parseEnumOutput(rawInput, source, SIGNALS);
    const build = parseBuildInfo(rawInput);
    set({ matches, unrecognizedLines, recommendations: advise(matches, RULES, build) });
  },
  reset: () => set({ rawInput: '', matches: [], recommendations: [], unrecognizedLines: [] }),
}));
