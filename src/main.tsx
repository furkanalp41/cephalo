// src/main.tsx — entry point. Loads tokens (DESIGN values) + app CSS, hydrates the
// content store + search index, registers the PWA, mounts the router.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';

import '@xyflow/react/dist/style.css';
import '../styles/theme.base.css';
import '../styles/theme.linux.css';
import '../styles/theme.windows.css';
import '../styles/theme.ad.css';
import './styles/app.css';

import { router } from './routes/router';
import { useContent } from './stores/content';
import { applyInitialTheme } from './app/boot';
import { registerPwa } from './app/pwa';

applyInitialTheme();
void useContent.getState().load();
registerPwa();

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root not found');

createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
