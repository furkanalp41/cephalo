// src/app/pwa.ts — register the Workbox service worker for full offline + install.
// No runtime network, no telemetry; the SW only serves the precached shell +
// content JSON. Dev mode skips registration.
export function registerPwa(): void {
  if (import.meta.env.DEV) return;
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      registerSW({ immediate: true });
    })
    .catch(() => {
      // PWA registration is best-effort; the app works fully without it.
    });
}
