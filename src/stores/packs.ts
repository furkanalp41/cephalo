// src/stores/packs.ts — enabled content packs. OSCP is locked on; oswe/osep/osed/osee
// are lazy-loaded extensibility seams. Toggling filters BOTH content and the search
// index. `focused` drives the realm signet/skin accent; `loadPack` same-origin fetches a
// pack bundle and merges it into the content store (the search index is already combined
// at build time). Session-only `loaded` set is NOT persisted. No Date.now/Math.random.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useContent } from '@/stores/content';
import type { PackId, ContentBundle } from '@/types/content';

const BASE = import.meta.env.BASE_URL ?? '/';

interface PacksState {
  enabled: PackId[];
  focused: PackId;
  loaded: PackId[]; // session-only — packs already merged into the content store
  toggle: (id: PackId) => void;
  isEnabled: (id: PackId) => boolean;
  focus: (id: PackId) => void;
  loadPack: (id: PackId) => Promise<void>;
}

export const usePacks = create<PacksState>()(
  persist(
    (set, get) => ({
      enabled: ['oscp'],
      focused: 'oscp',
      loaded: [],
      toggle: (id) => {
        const has = get().enabled.includes(id);
        const next = has ? get().enabled.filter((p) => p !== id) : [...get().enabled, id];
        // OSCP can never be disabled — it is the core pack.
        set({ enabled: next.includes('oscp') ? next : ['oscp', ...next] });
        if (!has) void get().loadPack(id); // lazy-load on enable
      },
      isEnabled: (id) => get().enabled.includes(id),
      focus: (id) => set({ focused: id }),
      loadPack: async (id) => {
        if (id === 'oscp' || get().loaded.includes(id)) return; // oscp loads at boot
        try {
          const res = await fetch(`${BASE}content/${id}.json`);
          if (!res.ok) return; // this pack has no authored content yet
          const bundle = (await res.json()) as ContentBundle;
          useContent.getState().mergePack(bundle);
          set({ loaded: [...get().loaded, id] });
        } catch {
          /* offline / missing bundle — no-op (the app stays usable) */
        }
      },
    }),
    {
      name: 'cephalo.packs',
      // persist only the user's choices — never the session-only `loaded` set.
      partialize: (s) => ({ enabled: s.enabled, focused: s.focused }),
    },
  ),
);
