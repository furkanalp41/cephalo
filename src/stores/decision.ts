// src/stores/decision.ts — F5 decision-walk store (v2). Session-only; the walk trace +
// observed set are NEVER persisted. walkDecision is pure; the human picks branches (the
// store never auto-advances past what observe()/step() the view drives). No clock/random.
import { create } from 'zustand';
import { walkDecision } from '@/engine/decision-walk';
import { DECISIONS } from '@/data/v2/decisions';
import type { DecisionMap } from '@/types/decision';

function findMap(mapId: string): DecisionMap | undefined {
  return DECISIONS.find((m) => m.id === mapId);
}

interface DecisionState {
  mapId: string;
  currentNodeId: string;
  walkedPath: string[];
  observed: Set<string>;
  load: (mapId: string) => void;
  observe: (signalId: string) => void;
  step: () => void;
  reset: () => void;
}

export const useDecision = create<DecisionState>((set, get) => ({
  mapId: '',
  currentNodeId: '',
  walkedPath: [],
  observed: new Set(),
  load: (mapId) => {
    const m = findMap(mapId);
    set({ mapId, currentNodeId: m?.rootNodeId ?? '', walkedPath: m ? [m.rootNodeId] : [], observed: new Set() });
  },
  observe: (signalId) => set((s) => ({ observed: new Set(s.observed).add(signalId) })),
  step: () => {
    const { mapId, currentNodeId, observed, walkedPath } = get();
    const m = findMap(mapId);
    if (!m) return;
    const st = walkDecision(m, currentNodeId, observed);
    if (st) set({ currentNodeId: st.nextNodeId, walkedPath: [...walkedPath, st.nextNodeId] });
  },
  reset: () => get().load(get().mapId),
}));
