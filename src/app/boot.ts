// src/app/boot.ts — apply the persisted theme BEFORE first paint so realm colors
// never flash (the index.html ships data-os="linux"; this corrects it for the
// persisted realm synchronously).
import type { OS } from '@/types/content';

const VALID: OS[] = ['linux', 'windows', 'ad'];

export function applyInitialTheme(): void {
  try {
    const raw = localStorage.getItem('cephalo.theme');
    if (!raw) return;
    const parsed = JSON.parse(raw) as { state?: { os?: string } };
    const os = parsed.state?.os;
    if (os && VALID.includes(os as OS)) document.documentElement.dataset.os = os;
  } catch {
    // ignore — default data-os="linux" from index.html stands
  }
}
