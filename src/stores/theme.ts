// src/stores/theme.ts — the theming MECHANISM. Setting `os` flips
// document.documentElement.dataset.os; the whole app re-skins via the --cph-*
// cascade with NO remount and NO flash. Code never reads a color — only var(--cph-*).
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OS } from '@/types/content';

interface ThemeState {
  os: OS;
  setOs: (os: OS) => void;
}

function applyOs(os: OS) {
  if (typeof document !== 'undefined') document.documentElement.dataset.os = os;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      os: 'linux',
      setOs: (os) => {
        applyOs(os);
        set({ os });
      },
    }),
    {
      name: 'cephalo.theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyOs(state.os);
      },
    },
  ),
);
