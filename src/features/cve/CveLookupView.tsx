// src/features/cve/CveLookupView.tsx — F6 CVE lookup. CveLookupView is pure presentational
// (binds the frozen CveLookupProps, consumes var(--cph-*) only). CveLookupRoute wires the
// session-only useCve store. searchsploit is the only copy-to-clipboard escape hatch.
import { useCve } from '@/stores/cve';
import { REFERENCES } from '@/data/references';
import { ResponsibleUseNote } from '@/components/ResponsibleUseNote';
import { ZeroAiBanner, DeterministicChip, UnverifiedBadge } from '@/components/v2bits';
import type { CveLookupProps } from '@/types/components.v2';

export function CveLookupView({ product, version, matches, onQueryChange, onCopySearchsploit, onOpenReference }: CveLookupProps) {
  return (
    <div>
      <h1 className="section-title">CVE / version lookup</h1>
      <ZeroAiBanner />
      <DeterministicChip reason="offline searchsploit-term + version match over a curated table" />
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input aria-label="Product" placeholder="product (e.g. proftpd)" value={product} onChange={(e) => onQueryChange(e.target.value, version)} />
        <input aria-label="Version" placeholder="version (e.g. 1.3.5)" value={version} onChange={(e) => onQueryChange(product, e.target.value)} />
      </div>
      {matches.length === 0 && (
        <p className="muted">
          No curated match. Run <code>searchsploit {product || '<product>'} {version}</code> locally.
        </p>
      )}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {matches.map((m) => (
          <li key={m.entry.id} style={{ border: '1px solid var(--cph-color-border)', borderRadius: 'var(--cph-radius-md)', padding: 12, marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <strong>{m.entry.title}</strong>
              {m.unverified && <UnverifiedBadge />}
              <span className="muted" style={{ fontSize: 'var(--cph-fs-xs)' }}>{m.matchKind}</span>
            </div>
            {m.entry.cveId && <div className="muted" style={{ fontSize: 'var(--cph-fs-xs)' }}>{m.entry.cveId}</div>}
            <code>searchsploit {m.entry.searchsploitTerm}</code>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button type="button" onClick={() => onCopySearchsploit(m.entry.searchsploitTerm)}>
                Copy searchsploit
              </button>
              <button type="button" onClick={() => onOpenReference(m.entry.ref)}>
                Sources
              </button>
            </div>
          </li>
        ))}
      </ul>
      <ResponsibleUseNote />
    </div>
  );
}

export function CveLookupRoute() {
  const product = useCve((s) => s.product);
  const version = useCve((s) => s.version);
  const matches = useCve((s) => s.matches);
  const setQuery = useCve((s) => s.setQuery);
  return (
    <CveLookupView
      product={product}
      version={version}
      matches={matches}
      onQueryChange={(p, v) => setQuery(p, v)}
      onCopySearchsploit={(term) => void navigator.clipboard?.writeText(`searchsploit ${term}`)}
      onOpenReference={(refId) => {
        const ref = REFERENCES.find((r) => r.id === refId);
        if (ref?.url) window.open(ref.url, '_blank', 'noopener,noreferrer');
      }}
    />
  );
}
