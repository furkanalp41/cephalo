// src/app/App.tsx — the single component tree. One shell, theme = data-os token
// swap (no remount). Hosts the VariableBar, the SearchPalette overlay, the Octo
// dock, the toast, and the global keymap.
import { useEffect, useState } from 'react';
import { Link, Outlet } from '@tanstack/react-router';
import { useTheme } from '@/stores/theme';
import { useUI } from '@/stores/ui';
import { useSearch } from '@/stores/search';
import { useContent } from '@/stores/content';
import { usePacks } from '@/stores/packs';
import { PackSwitcher } from '@/components/PackSwitcher';
import { VariableBarHost } from '@/components/VariableBar';
import { SearchPaletteHost } from '@/components/SearchPalette';
import { RealmSwitcher } from '@/components/RealmSwitcher';
import { OctopusMascot, OCTO_CAPTION } from '@/components/OctopusMascot';
import { KeyboardHelp } from '@/components/KeyboardHelp';
import { Icon } from '@/components/Icon';
import type { Section, MindMap } from '@/types/content';
import { useKeymap } from './keymap';

// Module-level stable empty arrays (never recreated per render).
const EMPTY_SECTIONS: Section[] = [];
const EMPTY_MINDMAPS: MindMap[] = [];

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export function App() {
  const os = useTheme((s) => s.os);
  const openPalette = useSearch((s) => s.openPalette);
  const octoState = useUI((s) => s.octoState);
  const octoIntensity = useUI((s) => s.octoIntensity);
  const reducedMotion = usePrefersReducedMotion();
  const toast = useUI((s) => s.toast);
  const flashOcto = useUI((s) => s.flashOcto);
  const showToast = useUI((s) => s.showToast);
  // Select the STABLE bundle ref; derive arrays outside the selector so the
  // Zustand snapshot is referentially stable (a `?? []` in the selector returns a
  // fresh array every call → React "getSnapshot" loop / error #185).
  const bundle = useContent((s) => s.bundle);
  const sections = bundle?.sections ?? EMPTY_SECTIONS;
  const mindmaps = bundle?.mindmaps ?? EMPTY_MINDMAPS;
  const enabledPacks = usePacks((s) => s.enabled);
  const [helpOpen, setHelpOpen] = useState(false);

  // keep the <html data-os> in sync with the persisted theme on first paint
  useEffect(() => {
    document.documentElement.dataset.os = os;
  }, [os]);

  useKeymap({ openPalette, toggleHelp: () => setHelpOpen((v) => !v) });

  // realm list honors the enabled packs (a disabled-but-already-merged pack drops out).
  const inEnabledPack = (packs: string[]) => packs.some((p) => enabledPacks.includes(p));
  const realmSections = sections
    .filter((s) => s.os === os && inEnabledPack(s.packs))
    .sort((a, b) => a.order - b.order);
  const realmMaps = mindmaps.filter((m) => m.os === os && inEnabledPack(m.packs));

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <nav className="app-rail" aria-label="Sections">
        <Link to="/$os" params={{ os }} className="brand" style={{ textDecoration: 'none' }}>
          Cephalo
          <small>OSCP command engine</small>
        </Link>
        <div>
          <div className="rail-group-title">Realm</div>
          <Link to="/$os" params={{ os: 'linux' }} className="rail-link">
            Linux
          </Link>
          <Link to="/$os" params={{ os: 'windows' }} className="rail-link">
            Windows
          </Link>
          <Link to="/$os" params={{ os: 'ad' }} className="rail-link">
            Active Directory
          </Link>
          <Link to="/bloodhound" className="rail-link">
            BloodHound
          </Link>
          <Link to="/cross-cutting/$topic" params={{ topic: 'cross-cutting' }} className="rail-link">
            Cross-cutting
          </Link>
        </div>
        <div>
          <div className="rail-group-title">Packs</div>
          <PackSwitcher />
        </div>
        {realmSections.length > 0 && (
          <div>
            <div className="rail-group-title">Sections</div>
            {realmSections.flatMap((s) =>
              s.techniques.map((tid) => (
                <Link
                  key={tid}
                  to="/$os/technique/$techniqueId"
                  params={{ os, techniqueId: tid }}
                  className="rail-link"
                >
                  {tid.split('.').slice(1).join(' · ')}
                </Link>
              )),
            )}
          </div>
        )}
        {realmMaps.length > 0 && (
          <div>
            <div className="rail-group-title">Mindmaps</div>
            {realmMaps.map((m) => (
              <Link
                key={m.id}
                to="/$os/mindmap/$mapId"
                params={{ os, mapId: m.id }}
                className="rail-link"
              >
                {m.title}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <header className="app-header">
        <RealmSwitcher />
        <button type="button" className="search-trigger" onClick={openPalette} aria-label="Open search">
          <Icon name="search" size={15} />
          <span>Search ports, services, techniques…</span>
          <kbd>Ctrl K</kbd>
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => setHelpOpen(true)} aria-label="Keyboard shortcuts">
          ?
        </button>
        <div className="octo-dock">
          <div className="octo-dock__svg">
            <OctopusMascot
              state={octoState}
              intensity={octoIntensity}
              theme={os}
              reducedMotion={reducedMotion}
              onClick={() => {
                flashOcto('greeting');
                showToast('Octo: set your variables once — every command fills in.');
              }}
            />
          </div>
          <span className="octo-caption">{OCTO_CAPTION[octoState]}</span>
        </div>
      </header>

      <VariableBarHost />

      <main id="main" className="app-main" tabIndex={-1}>
        <Outlet />
      </main>

      <SearchPaletteHost />
      {helpOpen && <KeyboardHelp onClose={() => setHelpOpen(false)} />}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
