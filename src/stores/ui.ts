// src/stores/ui.ts — transient UI state: the Octo mascot vocabulary + the copy
// toast. Octo is never the SOLE signal (text/aria-live always accompany it).
import { create } from 'zustand';
import type { OctoState } from '@/types/components';

let octoTimer: ReturnType<typeof setTimeout> | undefined;
let toastTimer: ReturnType<typeof setTimeout> | undefined;

interface UIState {
  octoState: OctoState;
  octoIntensity: number;
  octoMessage?: string | undefined;
  toast?: string | undefined;
  setOcto: (state: OctoState, opts?: { intensity?: number; message?: string }) => void;
  flashOcto: (state: OctoState, ms?: number) => void;
  showToast: (msg: string, ms?: number) => void;
}

export const useUI = create<UIState>((set) => ({
  octoState: 'idle',
  octoIntensity: 0,
  setOcto: (state, opts) =>
    set({ octoState: state, octoIntensity: opts?.intensity ?? 0, octoMessage: opts?.message }),
  flashOcto: (state, ms = 1400) => {
    if (octoTimer) clearTimeout(octoTimer);
    set({ octoState: state });
    octoTimer = setTimeout(() => set({ octoState: 'idle', octoIntensity: 0 }), ms);
  },
  showToast: (msg, ms = 1800) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: msg });
    toastTimer = setTimeout(() => set({ toast: undefined }), ms);
  },
}));
