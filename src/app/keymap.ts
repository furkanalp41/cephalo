// src/app/keymap.ts — the global keyboard map (§8.5). Cmd/Ctrl-K search · `/` focus
// search · `c` copy-filled focused card · `r` copy-raw focused card · `?` cheat-sheet
// · Esc handled by the open dialog. Targets are real buttons (≥24px, focus rings).
import { useEffect } from 'react';

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || target.isContentEditable;
}

function clickInFocusedCard(selector: string) {
  const active = document.activeElement as HTMLElement | null;
  const card = active?.closest('.cmd-card') ?? document.querySelector('.cmd-card');
  const btn = card?.querySelector<HTMLButtonElement>(selector);
  btn?.click();
}

export function useKeymap(opts: { openPalette: () => void; toggleHelp: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = isTyping(e.target);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        opts.openPalette();
        return;
      }
      if (typing) return;
      if (e.key === '/') {
        e.preventDefault();
        opts.openPalette();
      } else if (e.key === '?') {
        e.preventDefault();
        opts.toggleHelp();
      } else if (e.key === 'c') {
        clickInFocusedCard('.btn--primary');
      } else if (e.key === 'r') {
        // the "Copy raw" button is the second .btn in the actions row
        const active = document.activeElement as HTMLElement | null;
        const card = active?.closest('.cmd-card') ?? document.querySelector('.cmd-card');
        const buttons = card?.querySelectorAll<HTMLButtonElement>('.cmd-actions .btn');
        buttons?.[1]?.click();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [opts]);
}
