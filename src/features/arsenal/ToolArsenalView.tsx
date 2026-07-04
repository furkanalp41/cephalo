// src/features/arsenal/ToolArsenalView.tsx — F2 tool provenance. ToolArsenalView is pure
// presentational (binds the frozen ToolArsenalProps, consumes var(--cph-*) only).
// ToolArsenalRoute holds the static F2 dataset + a local category filter. Link-only: the
// literal fetchNote is always shown; the official source opens via onOpenSource.
import { useState } from 'react';
import { TOOL_BINARIES } from '@/data/v2/toolBinaries';
import { REFERENCES } from '@/data/references';
import { ResponsibleUseNote } from '@/components/ResponsibleUseNote';
import { ZeroAiBanner, DeterministicChip } from '@/components/v2bits';
import type { ToolArsenalProps } from '@/types/components.v2';
import type { OS } from '@/types/content';

export function ToolArsenalView({ tools, filter, onFilterChange, onOpenSource }: ToolArsenalProps) {
  const cats = [...new Set(tools.map((t) => t.category))].sort();
  const fcat = filter?.category;
  const fos = filter?.os;
  const shown = tools.filter((t) => (!fcat || t.category === fcat) && (!fos || t.runsOn.includes(fos)));
  return (
    <div>
      <h1 className="section-title">Tool arsenal</h1>
      <ZeroAiBanner />
      <DeterministicChip reason="link-only provenance — you fetch every tool yourself" />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0' }}>
        <button type="button" aria-pressed={!fcat} onClick={() => onFilterChange({})}>
          all
        </button>
        {cats.map((c) => (
          <button key={c} type="button" aria-pressed={fcat === c} onClick={() => onFilterChange({ category: c })}>
            {c}
          </button>
        ))}
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {shown.map((t) => (
          <li key={t.id} style={{ border: '1px solid var(--cph-color-border)', borderRadius: 'var(--cph-radius-md)', padding: 12, marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <strong>{t.name}</strong>
              <span className="muted" style={{ fontSize: 'var(--cph-fs-xs)' }}>
                {t.category} · {t.format.join('/')} · {t.runsOn.join('/')}
              </span>
            </div>
            <p className="muted" style={{ fontSize: 'var(--cph-fs-xs)', margin: '4px 0' }}>{t.fetchNote}</p>
            <div className="muted" style={{ fontSize: 'var(--cph-fs-xs)' }}>
              {t.shipsOnKali ? `On Kali${t.kaliPath ? ` (${t.kaliPath})` : ''}` : 'Not bundled with Kali — fetch from source'}
            </div>
            <button type="button" style={{ marginTop: 6 }} onClick={() => onOpenSource(t.officialRef)}>
              Official source
            </button>
          </li>
        ))}
      </ul>
      <ResponsibleUseNote />
    </div>
  );
}

export function ToolArsenalRoute() {
  const [filter, setFilter] = useState<{ category?: string; os?: OS }>({});
  return (
    <ToolArsenalView
      tools={TOOL_BINARIES}
      filter={filter}
      onFilterChange={setFilter}
      onOpenSource={(refId) => {
        const ref = REFERENCES.find((r) => r.id === refId);
        if (ref?.url) window.open(ref.url, '_blank', 'noopener,noreferrer');
      }}
    />
  );
}
