// src/stores/search.ts — SearchPalette state. Drives Octo and links a hit to its
// MindMap node via the side table (searchEngine.sideEntry().techniqueId, §7.1).
import { create } from 'zustand';
import { searchEngine } from '@/engine/search';
import type { SearchHit, SearchFilters } from '@/types/engine';
import { useUI } from './ui';

interface SearchState {
  open: boolean;
  query: string;
  hits: SearchHit[];
  selected: number;
  loading: boolean;
  filters?: SearchFilters | undefined;
  highlightedTechniqueId?: string | undefined;
  recent: SearchHit[];
  openPalette: () => void;
  closePalette: () => void;
  setQuery: (q: string) => void;
  setFilters: (f: SearchFilters) => void;
  move: (delta: number) => void;
  setSelected: (i: number) => void;
  /** Resolve the hit's owning technique (for node highlight + routing). */
  resolveTechniqueId: (hit: SearchHit) => string | undefined;
  /** Record a selected hit as "recent" (shown when the query is empty). */
  recordRecent: (hit: SearchHit) => void;
}

export const useSearch = create<SearchState>((set, get) => ({
  open: false,
  query: '',
  hits: [],
  selected: 0,
  loading: false,
  recent: [],
  openPalette: () => {
    set({ open: true });
    useUI.getState().setOcto('listening');
  },
  closePalette: () => {
    set({ open: false });
    useUI.getState().setOcto('idle');
  },
  setQuery: (q) => {
    const filters = get().filters;
    let hits: SearchHit[] = [];
    if (q.trim()) {
      try {
        hits = searchEngine.search(filters ? { query: q, filters } : { query: q });
      } catch {
        hits = [];
      }
    }
    set({ query: q, hits, selected: 0 });
    const ui = useUI.getState();
    if (!q.trim()) ui.setOcto('listening');
    else if (hits.length === 0) ui.setOcto('empty');
    else ui.setOcto('found', { intensity: Math.min(1, hits.length / 8) });
  },
  setFilters: (filters) => {
    set({ filters });
    get().setQuery(get().query);
  },
  move: (delta) => {
    const { hits, selected } = get();
    if (!hits.length) return;
    const next = (selected + delta + hits.length) % hits.length;
    set({ selected: next });
  },
  setSelected: (i) => set({ selected: i }),
  resolveTechniqueId: (hit) => {
    const tid = searchEngine.sideEntry(hit.id)?.techniqueId;
    set({ highlightedTechniqueId: tid });
    return tid;
  },
  recordRecent: (hit) => {
    const prev = get().recent.filter((h) => h.id !== hit.id);
    set({ recent: [hit, ...prev].slice(0, 6) });
  },
}));
