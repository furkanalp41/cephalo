// src/features/nmap/NmapTriageBoard.tsx — F8 triage board. Pure presentational (binds the
// frozen NmapTriageBoardProps, var(--cph-*) only). Realm hint is PROPOSED — the Confirm
// button is the only thing that flips the skin (themeSwitch.autoApplied stays false).
// Autofill Apply is DISABLED on conflict (never overwrites a user-set var).
import type { NmapTriageBoardProps } from '@/types/components.v2';
import type { OS } from '@/types/content';

const REALM_TOKEN: Record<OS, string> = {
  ad: '--cph-nmap-realm-ad',
  windows: '--cph-nmap-realm-windows',
  linux: '--cph-nmap-realm-linux',
};

export function NmapTriageBoard({ result, onConfirmTheme, onApplyAutofill, onOpenTechnique, onOpenCve }: NmapTriageBoardProps) {
  const ts = result.themeSwitch;
  return (
    <div>
      {ts && (
        <div
          style={{
            background: 'var(--cph-ask-surface)',
            border: `1px dashed var(${REALM_TOKEN[ts.proposedOs]})`,
            borderRadius: 'var(--cph-radius-md)',
            padding: '15px 16px',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: `var(${REALM_TOKEN[ts.proposedOs]})`, flex: 'none' }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 600 }}>Looks like {ts.proposedOs}</div>
              <div style={{ fontSize: 'var(--cph-fs-xs)', color: 'var(--cph-nmap-explain-fg)', marginTop: 3 }}>{ts.reason}</div>
            </div>
            <button
              type="button"
              onClick={() => onConfirmTheme(ts.proposedOs)}
              style={{
                background: 'var(--cph-nmap-confirm-bg)',
                border: `1px solid var(${REALM_TOKEN[ts.proposedOs]})`,
                color: 'var(--cph-color-text)',
                borderRadius: 'var(--cph-radius-sm)',
                padding: '8px 14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Switch theme to {ts.proposedOs} →
            </button>
          </div>
          <div style={{ fontSize: 'var(--cph-fs-xs)', color: 'var(--cph-color-text-muted)', marginTop: 9, opacity: 0.85 }}>
            Proposed, not applied — Cephalo never auto-switches your realm.
          </div>
        </div>
      )}

      {result.hosts.map((h, hi) => (
        <div key={h.host.ip ?? h.host.hostname ?? `host-${hi}`} style={{ marginBottom: 16 }}>
          {h.ports.map((pt) => {
            const sev = pt.firings[0]?.severity ?? 'info';
            const cve = pt.cve;
            return (
              <div
                key={`${pt.port.port}/${pt.port.proto}`}
                style={{ background: 'var(--cph-ask-surface)', border: '1px solid var(--cph-var-token-bg)', borderRadius: 'var(--cph-radius-md)', padding: '13px 15px', marginBottom: 10 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: `var(--cph-sev-${sev})`, flex: 'none' }} />
                  <code style={{ fontFamily: 'var(--cph-font-mono)', fontWeight: 600 }}>
                    {pt.port.port}/{pt.port.proto}
                  </code>
                  <span>{pt.port.service ?? '—'}</span>
                  {pt.port.product && (
                    <code className="muted" style={{ fontFamily: 'var(--cph-font-mono)', fontSize: 'var(--cph-fs-xs)' }}>
                      {pt.port.product}
                      {pt.port.version ? ` ${pt.port.version}` : ''}
                    </code>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
                  {pt.techniqueIds.map((tid) => (
                    <button
                      key={tid}
                      type="button"
                      onClick={() => onOpenTechnique(tid)}
                      style={{ fontSize: 'var(--cph-fs-xs)', background: 'var(--cph-var-token-bg)', border: '1px solid var(--cph-color-border)', color: 'var(--cph-color-text)', borderRadius: 'var(--cph-radius-full)', padding: '5px 11px', cursor: 'pointer' }}
                    >
                      {tid}
                    </button>
                  ))}
                  {cve &&
                    cve.entryIds.map((cid) => (
                      <button
                        key={cid}
                        type="button"
                        onClick={() => onOpenCve(cid)}
                        style={{ fontSize: 'var(--cph-fs-xs)', background: 'var(--cph-cve-edb-bg)', border: '1px solid var(--cph-cve-match-fuzzy)', color: 'var(--cph-color-text)', borderRadius: 'var(--cph-radius-full)', padding: '5px 11px', cursor: 'pointer' }}
                      >
                        {cid}
                        {cve.unverified ? ' ⚠' : ''}
                      </button>
                    ))}
                </div>
              </div>
            );
          })}

          {h.autofill.length > 0 && (
            <div style={{ marginTop: 8, background: 'var(--cph-ask-surface)', border: '1px solid var(--cph-var-token-bg)', borderRadius: 'var(--cph-radius-md)', padding: '14px 16px' }}>
              <div style={{ fontSize: 'var(--cph-fs-xs)', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--cph-color-text-muted)', marginBottom: 11 }}>
                Autofill variables <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, opacity: 0.7 }}>· inferred — you confirm</span>
              </div>
              {h.autofill.map((af, ai) => (
                <div key={`${af.varId}-${ai}`} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--cph-font-mono)', fontSize: 'var(--cph-fs-sm)', marginBottom: 8 }}>
                  <span style={{ color: 'var(--cph-node-lateral)', fontWeight: 600 }}>{af.varId}</span>
                  <span className="muted">←</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--cph-color-text)' }}>{af.value}</span>
                  <button
                    type="button"
                    disabled={af.conflictsWithUserValue}
                    onClick={() => onApplyAutofill(af.varId, af.value)}
                    style={{
                      opacity: af.conflictsWithUserValue ? 0.5 : 1,
                      cursor: af.conflictsWithUserValue ? 'not-allowed' : 'pointer',
                      background: 'var(--cph-var-token-bg)',
                      border: '1px solid var(--cph-color-border)',
                      color: 'var(--cph-color-text)',
                      borderRadius: 'var(--cph-radius-sm)',
                      padding: '5px 12px',
                      fontFamily: 'var(--cph-font-sans)',
                      fontSize: 'var(--cph-fs-xs)',
                    }}
                    title={af.conflictsWithUserValue ? 'You already set this variable — Apply is disabled' : undefined}
                  >
                    {af.conflictsWithUserValue ? 'Conflict' : 'Apply'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {result.warnings.length > 0 && (
        <ul className="muted" style={{ fontSize: 'var(--cph-fs-xs)', marginTop: 12 }}>
          {result.warnings.map((w, i) => (
            <li key={`warn-${i}`}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
