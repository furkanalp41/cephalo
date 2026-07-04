// src/components/OctopusMascot.tsx — Octo, the living status light.
// Ported from the "Cephalo Core Loop" design (claude.ai/design): a credible deep-sea
// cephalopod (domed mantle · blinking slit-pupil eyes · eight swaying tentacles ·
// chromatophore skin) that signals state through skin luminescence + posture, NOT
// cartoon faces. aria-hidden, never the sole signal. Reads --cph-octo-* tokens; the
// `state` prop picks the skin color, `intensity` modulates the bioluminescent bloom.
// Reduced-motion → static posture + color, no animation (info-equivalent).
import type { OctopusMascotProps, OctoState } from '@/types/components';

// A small italic caption surfaced beside the brand (text accompanies the mascot so
// it is never the only state signal).
export const OCTO_CAPTION: Record<OctoState, string> = {
  idle: 'Octo is listening to the dark.',
  greeting: 'Octo surfaces to greet you.',
  listening: 'Octo leans in.',
  thinking: 'Octo is reaching…',
  found: 'Octo brings them up from the dark.',
  empty: 'Octo finds nothing.',
  copied: 'Octo inks — copied!',
  error: 'Octo recoils — set your variables first.',
  celebrate: 'Octo blooms — every variable is set.',
};

const GLOW_BASE: Record<OctoState, number> = {
  idle: 14,
  listening: 16,
  thinking: 16,
  greeting: 18,
  found: 28,
  empty: 12,
  copied: 20,
  error: 14,
  celebrate: 28,
};

const STATE_ANIM: Partial<Record<OctoState, string>> = {
  greeting: 'cph-pulse .9s var(--cph-ease-octo)',
  copied: 'cph-pulse .5s var(--cph-ease-octo)',
  error: 'cph-shake .5s ease',
  celebrate: 'cph-spin 1.2s var(--cph-ease-octo)',
};

export function OctopusMascot({ state, intensity = 0, reducedMotion, onClick }: OctopusMascotProps) {
  const color = `var(--cph-octo-${state})`;
  const tint = 'var(--cph-octo-tint)';
  const glowR = Math.round(GLOW_BASE[state] + Math.min(1, Math.max(0, intensity)) * 12);
  const anim = (a: string) => (reducedMotion ? 'none' : a);
  const stateAnim = reducedMotion ? 'none' : (STATE_ANIM[state] ?? 'none');
  const droop = state === 'empty' ? { transform: 'translateY(6px)', opacity: 0.72 } : {};

  return (
    <svg
      viewBox="0 0 200 210"
      width="100%"
      height="100%"
      aria-hidden="true"
      role="presentation"
      focusable="false"
      onClick={onClick}
      data-octo-state={state}
      style={{
        display: 'block',
        overflow: 'visible',
        cursor: onClick ? 'pointer' : 'default',
        filter: `drop-shadow(0 0 ${glowR}px ${color})`,
        transition: 'filter var(--cph-motion-base) var(--cph-ease-standard)',
      }}
    >
      <g
        className="cph-anim"
        style={{
          animation: stateAnim,
          transformOrigin: '100px 95px',
          transition: 'opacity .3s, transform .3s',
          ...droop,
        }}
      >
        {/* breathing body */}
        <g
          className="cph-anim"
          style={{ animation: anim('cph-breathe 4.2s ease-in-out infinite'), transformOrigin: '100px 70px' }}
        >
          <path
            d="M62 86 C58 44 80 24 100 24 C120 24 142 44 138 86 C136 104 120 112 100 112 C80 112 64 104 62 86 Z"
            fill={tint}
            fillOpacity={0.9}
            stroke={color}
            strokeWidth={2.4}
          />
          <circle cx={84} cy={50} r={3} fill={color} opacity={0.28} />
          <circle cx={112} cy={46} r={2.4} fill={color} opacity={0.22} />
          <circle cx={100} cy={62} r={2.2} fill={color} opacity={0.2} />
          {/* blinking slit-pupil eyes — the emotional center */}
          <g
            className="cph-anim"
            style={{ animation: anim('cph-blink 5.5s ease-in-out infinite'), transformOrigin: '100px 80px' }}
          >
            <ellipse cx={84} cy={80} rx={12} ry={10} fill="var(--cph-color-bg)" stroke={color} strokeWidth={2} />
            <ellipse cx={116} cy={80} rx={12} ry={10} fill="var(--cph-color-bg)" stroke={color} strokeWidth={2} />
            <rect x={82} y={72} width={4.2} height={16} rx={2.1} fill={color} />
            <rect x={114} y={72} width={4.2} height={16} rx={2.1} fill={color} />
          </g>
        </g>
        {/* swaying tentacles */}
        <g
          className="cph-anim"
          style={{
            animation: anim('cph-sway 5.4s ease-in-out infinite'),
            transformOrigin: '100px 112px',
            fill: 'none',
            stroke: color,
            strokeWidth: 9,
            strokeLinecap: 'round',
            opacity: 0.92,
          }}
        >
          <path d="M70 106 C52 130 44 158 30 176 C24 184 22 190 26 196" />
          <path d="M80 110 C68 138 62 166 56 190" />
          <path d="M90 112 C84 142 82 170 80 196" />
          <path d="M100 113 C100 144 100 172 100 200" />
          <path d="M106 113 C110 145 112 174 114 200" />
          <path d="M112 112 C118 142 120 170 122 196" />
          <path d="M120 110 C132 138 138 166 144 190" />
          <path d="M130 106 C148 130 156 158 170 176 C176 184 178 190 174 196" />
        </g>
      </g>
    </svg>
  );
}
