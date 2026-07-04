// src/features/ask/AskOctopusHero.tsx — the big Ask-the-Octopus hero. COMPOSES the FROZEN
// OctopusMascot (never a new OctoState, never navigateTo); the mascot SVG is 100% w/h so
// this container governs scale. Halo + large-glow consume the design's v2 ask tokens.
import { OctopusMascot, OCTO_CAPTION } from '@/components/OctopusMascot';
import type { OctoState } from '@/types/components';
import type { OS } from '@/types/content';

export function AskOctopusHero({
  state,
  theme,
  reducedMotion = false,
  onClick,
}: {
  state: OctoState;
  theme: OS;
  reducedMotion?: boolean | undefined;
  onClick?: (() => void) | undefined;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
      <div
        data-octo-pool-state={state}
        style={{
          position: 'relative',
          width: 360,
          height: 360,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--cph-ask-octo-halo)',
          boxShadow: 'var(--cph-octo-large-glow)',
          borderRadius: '50%',
        }}
      >
        <div style={{ width: 300, height: 300 }}>
          <OctopusMascot state={state} theme={theme} reducedMotion={reducedMotion} {...(onClick ? { onClick } : {})} />
        </div>
      </div>
      <div
        aria-live="polite"
        style={{ marginTop: 6, fontSize: 'var(--cph-fs-sm)', color: 'var(--cph-color-text-muted)', textAlign: 'center' }}
      >
        {OCTO_CAPTION[state]}
      </div>
    </div>
  );
}
