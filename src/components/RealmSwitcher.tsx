// src/components/RealmSwitcher.tsx — flips the realm via data-os (no remount, no
// flash) and routes to that realm's home. Label text required (never icon-only).
import { useNavigate } from '@tanstack/react-router';
import { useTheme } from '@/stores/theme';
import { useUI } from '@/stores/ui';
import type { OS } from '@/types/content';

const REALMS: { os: OS; label: string }[] = [
  { os: 'linux', label: 'Linux' },
  { os: 'windows', label: 'Windows' },
  { os: 'ad', label: 'Active Directory' },
];

export function RealmSwitcher() {
  const os = useTheme((s) => s.os);
  const setOs = useTheme((s) => s.setOs);
  const flashOcto = useUI((s) => s.flashOcto);
  const navigate = useNavigate();

  return (
    <div className="realm-switcher" role="group" aria-label="Realm">
      {REALMS.map((r) => (
        <button
          key={r.os}
          type="button"
          className="realm-btn"
          aria-pressed={os === r.os}
          onClick={() => {
            setOs(r.os);
            flashOcto('greeting');
            void navigate({ to: '/$os', params: { os: r.os } });
          }}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
