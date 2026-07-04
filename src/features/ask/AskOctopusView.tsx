// src/features/ask/AskOctopusView.tsx — F4 Ask-the-Octopus. AskOctopusView is pure
// presentational (binds the frozen AskOctopusProps, var(--cph-*) only): hero + summon
// (deterministic intent over the offline index) / paste-scan (F8 triage) tabs.
// AskOctopusRoute wires the session-only useAsk store + theme/content/variables.
import { useNavigate } from '@tanstack/react-router';
import { useAsk } from '@/stores/ask';
import { useTheme } from '@/stores/theme';
import { useContent } from '@/stores/content';
import { useVariables } from '@/stores/variables';
import { ResponsibleUseNote } from '@/components/ResponsibleUseNote';
import { ZeroAiBanner, DeterministicChip } from '@/components/v2bits';
import { AskOctopusHero } from './AskOctopusHero';
import { NmapTriageBoard } from '@/features/nmap/NmapTriageBoard';
import type { AskOctopusProps } from '@/types/components.v2';
import type { OctoState } from '@/types/components';

const MONO = { fontFamily: 'var(--cph-font-mono)' } as const;

export function AskOctopusView(props: AskOctopusProps) {
  const { octoState, theme, reducedMotion, query, resolution, mode, nmap } = props;
  const { onQueryChange, onSubmit, onModeChange, onPasteScan, onSelectTechnique, onCopyCommand, onConfirmTheme, onApplyAutofill } = props;
  const summon = mode === 'summon';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 760, margin: '0 auto' }}>
      <ZeroAiBanner />
      <AskOctopusHero state={octoState} theme={theme} reducedMotion={reducedMotion} />

      <div role="tablist" aria-label="Ask mode" style={{ display: 'flex', gap: 4, alignSelf: 'flex-start', borderBottom: '1px solid var(--cph-var-token-bg)', width: '100%', margin: '14px 0' }}>
        <button type="button" role="tab" aria-selected={summon} onClick={() => onModeChange('summon')} style={tabStyle(summon)}>
          ⌕ Summon
        </button>
        <button type="button" role="tab" aria-selected={!summon} onClick={() => onModeChange('paste-scan')} style={tabStyle(!summon)}>
          ⊟ Paste scan
        </button>
      </div>

      {summon ? (
        <div style={{ width: '100%' }}>
          <div className="summon-field" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--cph-ask-input-bg)', border: '1px solid var(--cph-var-token-bg)', borderRadius: 'var(--cph-radius-md)', padding: '0 14px' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSubmit(query);
              }}
              placeholder="summon a command — technique, port, tool, or a whoami /priv line"
              aria-label="Summon a command"
              style={{ ...MONO, flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--cph-color-text)', fontSize: 'var(--cph-fs-md)', padding: '16px 0', minWidth: 0 }}
            />
            <kbd style={{ ...MONO, fontSize: 'var(--cph-fs-xs)', color: 'var(--cph-color-text-muted)', border: '1px solid var(--cph-var-token-bg)', borderRadius: 4, padding: '2px 6px' }}>↵</kbd>
          </div>

          <div style={{ margin: '18px 0 12px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <DeterministicChip reason={resolution?.explanation} />
          </div>

          {resolution && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {resolution.signalIds && resolution.signalIds.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--cph-ask-surface)', border: '1px solid var(--cph-advisor-signal-strong)', borderRadius: 'var(--cph-radius-md)', padding: '14px 16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>This is a privilege you hold → open the Privilege Advisor</div>
                    <div style={{ fontSize: 'var(--cph-fs-xs)', color: 'var(--cph-ask-explain-fg)' }}>
                      matched signal: <code style={{ ...MONO, color: 'var(--cph-advisor-signal-strong)' }}>{resolution.signalIds.join(', ')}</code>
                    </div>
                  </div>
                </div>
              )}
              {resolution.techniqueIds.map((tid) => (
                <button
                  key={tid}
                  type="button"
                  onClick={() => onSelectTechnique(tid)}
                  style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, background: 'var(--cph-ask-surface)', border: '1px solid var(--cph-var-token-bg)', borderLeft: '3px solid var(--cph-ask-result-accent)', borderRadius: 'var(--cph-radius-md)', padding: '13px 15px', cursor: 'pointer', color: 'var(--cph-color-text)' }}
                >
                  <span aria-hidden style={{ color: 'var(--cph-ask-result-accent)' }}>◆</span>
                  <span style={{ ...MONO, fontWeight: 600 }}>{tid}</span>
                </button>
              ))}
              {resolution.commandIds.map((cid) => (
                <div key={cid} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--cph-ask-surface)', border: '1px solid var(--cph-var-token-bg)', borderRadius: 'var(--cph-radius-md)', padding: '11px 15px' }}>
                  <span style={{ ...MONO, flex: 1 }}>{cid}</span>
                  <button type="button" onClick={() => onCopyCommand(cid, cid)} style={{ background: 'var(--cph-var-token-bg)', border: 0, color: 'var(--cph-color-text)', borderRadius: 'var(--cph-radius-sm)', padding: '8px 14px', cursor: 'pointer' }}>
                    Copy
                  </button>
                </div>
              ))}
              {resolution.techniqueIds.length === 0 && resolution.commandIds.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--cph-color-text-muted)', padding: '26px 10px', lineHeight: 1.6 }}>
                  nothing surfaced — try a technique, port, tool, or a <code style={{ ...MONO, color: 'var(--cph-octo-empty)' }}>whoami /priv</code> line.
                  <br />
                  <span style={{ fontSize: 'var(--cph-fs-xs)', opacity: 0.8 }}>Cephalo only matches what it knows; it does not infer.</span>
                </div>
              )}
            </div>
          )}
          <ResponsibleUseNote />
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          <textarea
            aria-label="Paste nmap scan"
            onChange={(e) => onPasteScan(e.target.value)}
            placeholder="paste nmap output (-oN / -oG / -oX) — parsed offline, nothing leaves this tab"
            style={{ ...MONO, width: '100%', boxSizing: 'border-box', height: 110, resize: 'vertical', background: 'var(--cph-ask-input-bg)', border: '1px solid var(--cph-var-token-bg)', borderRadius: 'var(--cph-radius-md)', color: 'var(--cph-color-text)', fontSize: 'var(--cph-fs-xs)', lineHeight: 1.6, padding: '12px 14px' }}
          />
          <div style={{ margin: '12px 0' }}>
            <DeterministicChip reason="routes ports to your notes; you run every command" />
          </div>
          {nmap && (
            <NmapTriageBoard
              result={nmap}
              theme={theme}
              onConfirmTheme={onConfirmTheme}
              onApplyAutofill={onApplyAutofill}
              onOpenTechnique={onSelectTechnique}
              onOpenCve={onSelectTechnique}
            />
          )}
          <ResponsibleUseNote />
        </div>
      )}
    </div>
  );
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    background: 'transparent',
    border: 0,
    color: active ? 'var(--cph-color-text)' : 'var(--cph-color-text-muted)',
    boxShadow: active ? 'inset 0 -2px 0 var(--cph-color-primary)' : 'none',
    fontFamily: 'inherit',
    fontSize: 'var(--cph-fs-md)',
    fontWeight: 600,
    padding: '9px 14px',
    cursor: 'pointer',
  };
}

export function AskOctopusRoute() {
  const navigate = useNavigate();
  const query = useAsk((s) => s.query);
  const mode = useAsk((s) => s.mode);
  const resolution = useAsk((s) => s.resolution);
  const nmap = useAsk((s) => s.nmap);
  const setQuery = useAsk((s) => s.setQuery);
  const submit = useAsk((s) => s.submit);
  const setMode = useAsk((s) => s.setMode);
  const pasteScan = useAsk((s) => s.pasteScan);
  const themeOs = useTheme((s) => s.os);
  const setOs = useTheme((s) => s.setOs);
  const onVarChange = useVariables((s) => s.setValue);

  const hits = (resolution?.techniqueIds.length ?? 0) + (resolution?.commandIds.length ?? 0);
  const octoState: OctoState = !query ? 'idle' : !resolution ? 'thinking' : hits > 0 ? 'found' : 'empty';

  return (
    <AskOctopusView
      octoState={octoState}
      theme={themeOs}
      query={query}
      mode={mode}
      {...(resolution ? { resolution } : {})}
      {...(nmap ? { nmap } : {})}
      onQueryChange={(q) => setQuery(q)}
      onSubmit={(q) => submit(q)}
      onModeChange={(m) => setMode(m)}
      onPasteScan={(raw) => pasteScan(raw)}
      onSelectTechnique={(id) => void navigate({ to: '/$os/technique/$techniqueId', params: { os: themeOs, techniqueId: id } })}
      onCopyCommand={(id) => {
        const t = useContent.getState().bundle?.commands.find((c) => c.id === id)?.template;
        if (t) void navigator.clipboard?.writeText(t);
      }}
      onConfirmTheme={(os) => setOs(os)}
      onApplyAutofill={(varId, value) => onVarChange(varId, value)}
    />
  );
}
