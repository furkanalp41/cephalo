import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// Cephalo is deployable to any CDN / GitHub Pages. `base` is configurable via
// the CEPHALO_BASE env var so a project-page deploy (e.g. /cephalo/) works.
const base = process.env.CEPHALO_BASE ?? '/';

export default defineConfig({
  base,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['mascot/octo.riv', 'content/*.json'],
      manifest: {
        name: 'Cephalo — OSCP Command Engine',
        short_name: 'Cephalo',
        description:
          'Offline-first, copy-paste-ready OSCP command-and-technique engine. Authorized testing only.',
        theme_color: '#07120F',
        background_color: '#07120F',
        display: 'standalone',
        icons: [],
      },
      workbox: {
        // Precache the static shell + all generated content JSON for full offline.
        globPatterns: ['**/*.{js,css,html,json,riv,svg,woff2}'],
        navigateFallback: null,
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
    }),
  ],
  build: {
    target: 'es2022',
    sourcemap: false,
  },
});
