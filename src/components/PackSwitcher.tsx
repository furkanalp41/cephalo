// src/components/PackSwitcher.tsx — presentational pack toggles + focus selector.
// Consumes the EXTENDED usePacks store; renders one chip per registered pack with
// icon + text + color (never hue-only). OSCP is locked on. Pack hue comes from the
// --cph-pack-<id> KEY (design owns the VALUE); orthogonal to the data-os realm skin.
import { PACKS } from '@/data/packs';
import { PACK_MANIFEST_BY_ID } from '@/data/pack-manifests';
import { usePacks } from '@/stores/packs';

export function PackSwitcher() {
  const enabled = usePacks((s) => s.enabled);
  const focused = usePacks((s) => s.focused);
  const toggle = usePacks((s) => s.toggle);
  const focus = usePacks((s) => s.focus);

  return (
    <div role="group" aria-label="Certification packs" style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {PACKS.map((p) => {
        const on = enabled.includes(p.id);
        const locked = p.id === 'oscp';
        const isFocus = focused === p.id;
        const badge = `--cph-pack-${p.id}`;
        return (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              disabled={locked}
              aria-pressed={on}
              onClick={() => toggle(p.id)}
              title={PACK_MANIFEST_BY_ID[p.id]?.blurb ?? p.description}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                textAlign: 'left',
                background: on ? 'var(--cph-pack-badge-bg)' : 'transparent',
                border: `1px solid ${isFocus ? `var(${badge})` : 'var(--cph-pack-badge-ring)'}`,
                borderRadius: 'var(--cph-radius-sm)',
                padding: '6px 9px',
                cursor: locked ? 'default' : 'pointer',
                color: 'var(--cph-color-text)',
                opacity: on ? 1 : 0.65,
              }}
            >
              <span aria-hidden style={{ width: 9, height: 9, borderRadius: 2, background: `var(${badge})`, flex: 'none' }} />
              <span style={{ flex: 1, fontSize: 'var(--cph-fs-xs)' }}>{p.label}</span>
              <span aria-hidden style={{ fontSize: 'var(--cph-fs-xs)', color: 'var(--cph-color-text-muted)' }}>
                {locked ? 'core' : on ? 'on' : 'off'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => focus(p.id)}
              aria-pressed={isFocus}
              title={`Focus ${p.label} signet`}
              style={{ background: 'transparent', border: 0, cursor: 'pointer', color: isFocus ? `var(${badge})` : 'var(--cph-color-text-muted)', fontSize: 'var(--cph-fs-sm)' }}
            >
              ◎
            </button>
          </div>
        );
      })}
    </div>
  );
}
