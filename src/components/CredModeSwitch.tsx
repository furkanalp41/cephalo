// src/components/CredModeSwitch.tsx — the three-way password|nthash|kerberos
// segmented control. Pure presentational: reads the active mode from props,
// emits onSetCredMode. The auth axis is variant-SELECTION (§5.1) — choosing a
// mode swaps to the authored variant tagged with that credMode; the engine then
// renders THAT variant's template. No conditional string surgery, ever.
import type { CredMode, Id } from '@/types/content';

const MODES: { mode: CredMode; label: string }[] = [
  { mode: 'password', label: 'password' },
  { mode: 'nthash', label: 'nthash' },
  { mode: 'kerberos', label: 'kerberos' },
];

export function CredModeSwitch({
  id,
  active,
  onSetCredMode,
}: {
  id: Id;
  active: CredMode;
  onSetCredMode: (id: Id, mode: CredMode) => void;
}) {
  return (
    <div className="cred-switch" role="group" aria-label="Authentication mode">
      {MODES.map(({ mode, label }) => (
        <button
          key={mode}
          type="button"
          className="cred-switch__opt"
          aria-pressed={active === mode}
          onClick={() => onSetCredMode(id, mode)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
