// src/features/advisor/PrivilegeAdvisorView.tsx — F3 Privilege Advisor. Pure presentational
// (binds the frozen PrivilegeAdvisorProps, var(--cph-*) only). The pasted enum output is
// session-only (the container never persists it). Each recommendation cites the exact
// triggering rawLine; unverified recs surface [UNVERIFIED] + the reason.
import { useNavigate } from '@tanstack/react-router';
import { useAdvisor } from '@/stores/advisor';
import { useTheme } from '@/stores/theme';
import { useContent } from '@/stores/content';
import { TOOL_BINARIES } from '@/data/v2/toolBinaries';
import { REFERENCES } from '@/data/references';
import { ResponsibleUseNote } from '@/components/ResponsibleUseNote';
import { ZeroAiBanner, DeterministicChip, UnverifiedBadge } from '@/components/v2bits';
import type { PrivilegeAdvisorProps } from '@/types/components.v2';
import type { EnumSource } from '@/types/advisor';

const MONO = { fontFamily: 'var(--cph-font-mono)' } as const;
const SOURCES: EnumSource[] = ['whoami-priv', 'whoami-groups', 'whoami-all', 'sudo-l', 'id', 'getcap', 'suid-find', 'systeminfo', 'uname', 'ad-misc'];

export function PrivilegeAdvisorView({ source, rawInput, matches, recommendations, onSourceChange, onInputChange, onParse, onCopyCommand, onOpenTechnique, onFetchTool }: PrivilegeAdvisorProps) {
  return (
    <div>
      <h1 className="section-title">Privilege Advisor</h1>
      <ZeroAiBanner />
      <DeterministicChip reason="regex over a curated signal table — token-priv fires whether Enabled or Disabled" />

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '12px 0' }}>
        <label style={{ fontSize: 'var(--cph-fs-xs)', color: 'var(--cph-color-text-muted)' }}>Source</label>
        <select value={source} onChange={(e) => onSourceChange(e.target.value as EnumSource)} style={{ background: 'var(--cph-ask-input-bg)', color: 'var(--cph-color-text)', border: '1px solid var(--cph-var-token-bg)', borderRadius: 'var(--cph-radius-sm)', padding: '6px 8px' }}>
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <textarea
        aria-label="Paste enum output"
        value={rawInput}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="paste whoami /priv, whoami /groups, sudo -l, getcap, id, systeminfo… — parsed offline, never persisted"
        style={{ ...MONO, width: '100%', boxSizing: 'border-box', height: 130, resize: 'vertical', background: 'var(--cph-ask-input-bg)', border: '1px solid var(--cph-var-token-bg)', borderRadius: 'var(--cph-radius-md)', color: 'var(--cph-color-text)', fontSize: 'var(--cph-fs-xs)', lineHeight: 1.6, padding: '12px 14px' }}
      />
      <button type="button" onClick={onParse} style={{ marginTop: 10, background: 'var(--cph-color-primary)', color: 'var(--cph-color-bg)', border: 0, borderRadius: 'var(--cph-radius-sm)', padding: '9px 18px', fontWeight: 600, cursor: 'pointer' }}>
        Parse
      </button>

      {matches.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '16px 0' }}>
          {matches.map((m) => (
            <span key={`${m.signalId}|${m.rawLine}`} title={m.rawLine} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 'var(--cph-fs-xs)', background: 'var(--cph-var-token-bg)', border: '1px solid var(--cph-advisor-signal-detected)', color: 'var(--cph-color-text)', borderRadius: 'var(--cph-radius-full)', padding: '4px 10px' }}>
              <span style={{ ...MONO, color: 'var(--cph-advisor-signal-detected)' }}>{m.signalId}</span>
              {m.state && <span className="muted">· {m.state}</span>}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {recommendations.map((rec) => {
          const cmdId = rec.rule.commandId;
          const toolId = rec.rule.toolBinaryId;
          const trigger = rec.triggeredBy[0];
          return (
            <div key={rec.rule.id} style={{ background: 'var(--cph-ask-surface)', border: '1px solid var(--cph-var-token-bg)', borderLeft: '3px solid var(--cph-advisor-rank-1)', borderRadius: 'var(--cph-radius-md)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <strong>{rec.rule.rationale}</strong>
                {rec.unverified && <UnverifiedBadge />}
              </div>
              {rec.unverified && rec.rule.unverifiedReason && (
                <div className="muted" style={{ fontSize: 'var(--cph-fs-xs)', marginTop: 4 }}>{rec.rule.unverifiedReason}</div>
              )}
              {trigger && (
                <div style={{ fontSize: 'var(--cph-fs-xs)', color: 'var(--cph-ask-explain-fg)', marginTop: 6 }}>
                  triggered by: <code style={{ ...MONO }}>{trigger.rawLine}</code>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => onOpenTechnique(rec.rule.recommendsTechniqueId)} style={btn()}>
                  Open technique → {rec.rule.recommendsTechniqueId}
                </button>
                {toolId && (
                  <button type="button" onClick={() => onFetchTool(toolId)} style={btn()}>
                    Fetch this tool → {toolId}
                  </button>
                )}
                {cmdId && (
                  <button type="button" onClick={() => onCopyCommand(cmdId, cmdId)} style={btn()}>
                    Copy command
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <ResponsibleUseNote />
    </div>
  );
}

function btn(): React.CSSProperties {
  return { background: 'var(--cph-var-token-bg)', border: '1px solid var(--cph-color-border)', color: 'var(--cph-color-text)', borderRadius: 'var(--cph-radius-sm)', padding: '7px 12px', fontSize: 'var(--cph-fs-xs)', cursor: 'pointer' };
}

export function PrivilegeAdvisorRoute() {
  const navigate = useNavigate();
  const source = useAdvisor((s) => s.source);
  const rawInput = useAdvisor((s) => s.rawInput);
  const matches = useAdvisor((s) => s.matches);
  const recommendations = useAdvisor((s) => s.recommendations);
  const unrecognizedLines = useAdvisor((s) => s.unrecognizedLines);
  const setSource = useAdvisor((s) => s.setSource);
  const setInput = useAdvisor((s) => s.setInput);
  const parse = useAdvisor((s) => s.parse);
  const themeOs = useTheme((s) => s.os);
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <PrivilegeAdvisorView
        theme={themeOs}
        source={source}
        rawInput={rawInput}
        matches={matches}
        recommendations={recommendations}
        onSourceChange={setSource}
        onInputChange={setInput}
        onParse={parse}
        onCopyCommand={(id) => {
          const t = useContent.getState().bundle?.commands.find((c) => c.id === id)?.template;
          if (t) void navigator.clipboard?.writeText(t);
        }}
        onOpenTechnique={(id) => void navigate({ to: '/$os/technique/$techniqueId', params: { os: themeOs, techniqueId: id } })}
        onFetchTool={(id) => {
          const tool = TOOL_BINARIES.find((t) => t.id === id);
          const ref = tool && REFERENCES.find((r) => r.id === tool.officialRef);
          if (ref?.url) window.open(ref.url, '_blank', 'noopener,noreferrer');
          else void navigate({ to: '/arsenal' });
        }}
      />
      {unrecognizedLines.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div className="muted" style={{ fontSize: 'var(--cph-fs-xs)', marginBottom: 6 }}>Unrecognized lines (passed through verbatim — never AI-guessed):</div>
          <pre style={{ fontFamily: 'var(--cph-font-mono)', fontSize: 'var(--cph-fs-xs)', background: 'var(--cph-ask-input-bg)', border: '1px solid var(--cph-var-token-bg)', borderRadius: 'var(--cph-radius-sm)', padding: '10px 12px', overflow: 'auto', color: 'var(--cph-color-text-muted)' }}>
            {unrecognizedLines.join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
}
