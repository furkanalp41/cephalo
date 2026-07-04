// src/components/v2bits.tsx — small presentational bits shared by the v2 arsenal views.
// Consume var(--cph-*) only; no logic, no network. The ZERO-AI/offline banner + the
// per-feature 'Deterministic retrieval, not AI' chip make the non-AI framing always visible.
export function ZeroAiBanner() {
  return (
    <p
      role="note"
      className="muted"
      style={{ fontSize: 'var(--cph-fs-xs)', borderLeft: '2px solid var(--cph-color-border)', paddingLeft: 8, margin: '8px 0' }}
    >
      Cephalo is an offline, deterministic personal reference. NO AI, NO network, NO telemetry. It does not scan,
      exploit, or automate attacks — you run every command and make every decision. Verify current exam rules yourself.
    </p>
  );
}

export function DeterministicChip({ reason }: { reason?: string | undefined }) {
  return (
    <span
      className="muted"
      style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 'var(--cph-fs-xs)', color: 'var(--cph-ask-explain-fg)' }}
    >
      <span aria-hidden>◇</span>
      Deterministic retrieval, not AI{reason ? ` — ${reason}` : ' — here’s why this matched'}
    </span>
  );
}

export function UnverifiedBadge() {
  return (
    <span
      style={{
        background: 'var(--cph-unverified-badge-bg)',
        color: 'var(--cph-unverified-badge-fg)',
        borderRadius: 'var(--cph-radius-sm)',
        padding: '0 6px',
        fontSize: 'var(--cph-fs-xs)',
        fontWeight: 700,
      }}
    >
      [UNVERIFIED]
    </span>
  );
}
