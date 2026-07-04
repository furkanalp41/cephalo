// src/features/decision/DecisionMindMapView.tsx — F5 decision walk. Pure presentational
// (binds the frozen DecisionMindMapProps, var(--cph-*) only). An accessible node/branch
// walk (not a heavy xyflow canvas): the current node is shown with its check + outgoing
// branches; the HUMAN clicks a branch (Cephalo never auto-picks). Nodes are colored by
// --cph-dec-node-*, branches by --cph-dec-branch-*, the walked trace by --cph-dec-trace.
import { useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useDecision } from '@/stores/decision';
import { useTheme } from '@/stores/theme';
import { useContent } from '@/stores/content';
import { DECISIONS } from '@/data/v2/decisions';
import { ResponsibleUseNote } from '@/components/ResponsibleUseNote';
import { ZeroAiBanner, DeterministicChip, UnverifiedBadge } from '@/components/v2bits';
import type { DecisionMindMapProps } from '@/types/components.v2';
import type { DecisionNode, DecisionEdge, DecisionMap } from '@/types/decision';
import type { OS } from '@/types/content';

function nodeColor(n: DecisionNode): string {
  if (n.kind === 'outcome') return n.outcomeKind === 'da' ? 'var(--cph-dec-node-outcome-da)' : 'var(--cph-dec-node-outcome-system)';
  if (n.kind === 'action') return 'var(--cph-dec-node-action)';
  return 'var(--cph-dec-node-check)';
}
function branchColor(e: DecisionEdge): string {
  return e.condition.kind === 'if-found'
    ? 'var(--cph-dec-branch-if-found)'
    : e.condition.kind === 'if-absent'
      ? 'var(--cph-dec-branch-if-absent)'
      : 'var(--cph-dec-branch-else)';
}
function branchLabel(e: DecisionEdge): string {
  return e.condition.kind === 'if-found'
    ? `if found: ${e.condition.signalId}`
    : e.condition.kind === 'if-absent'
      ? `if absent: ${e.condition.signalId}`
      : 'otherwise';
}
function nodeLabel(map: DecisionMap, id: string): string {
  return map.nodes.find((n) => n.id === id)?.label ?? id;
}
function btn(): React.CSSProperties {
  return { background: 'var(--cph-var-token-bg)', border: '1px solid var(--cph-color-border)', color: 'var(--cph-color-text)', borderRadius: 'var(--cph-radius-sm)', padding: '7px 12px', fontSize: 'var(--cph-fs-xs)', cursor: 'pointer' };
}

export function DecisionMindMapView({ map, currentNodeId, walkedPath, onRunCheck, onPickBranch, onOpenTechnique }: DecisionMindMapProps) {
  const current = map.nodes.find((n) => n.id === currentNodeId) ?? map.nodes.find((n) => n.id === map.rootNodeId);
  const outgoing = current ? map.edges.filter((e) => e.source === current.id) : [];
  const tid = current?.techniqueId;
  const inlineTpl = current?.inlineTemplate;
  const checkCmd = current?.checkCommandId;
  return (
    <div>
      <h1 className="section-title">{map.title}</h1>
      <ZeroAiBanner />
      <DeterministicChip reason="you observe the output and click the branch — Cephalo never auto-picks" />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '12px 0', fontSize: 'var(--cph-fs-xs)', color: 'var(--cph-dec-trace)', fontFamily: 'var(--cph-font-mono)' }}>
        {walkedPath.map((id, i) => (
          <span key={`${id}-${i}`}>
            {nodeLabel(map, id)}
            {i < walkedPath.length - 1 ? ' → ' : ''}
          </span>
        ))}
      </div>

      {current && (
        <div style={{ background: 'var(--cph-ask-surface)', border: `2px solid ${nodeColor(current)}`, borderRadius: 'var(--cph-radius-md)', padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: nodeColor(current), flex: 'none' }} />
            <strong>{current.label}</strong>
            {current.unverified && <UnverifiedBadge />}
            <span className="muted" style={{ fontSize: 'var(--cph-fs-xs)' }}>{current.kind}</span>
          </div>
          {inlineTpl && (
            <code style={{ display: 'block', fontFamily: 'var(--cph-font-mono)', fontSize: 'var(--cph-fs-sm)', background: 'var(--cph-ask-input-bg)', borderRadius: 'var(--cph-radius-sm)', padding: '10px 12px', marginTop: 10, overflow: 'auto' }}>{inlineTpl}</code>
          )}
          {checkCmd && (
            <button type="button" onClick={() => onRunCheck(checkCmd)} style={{ ...btn(), marginTop: 10 }}>Copy check command</button>
          )}
          {tid && (
            <div style={{ marginTop: 10 }}>
              <button type="button" onClick={() => onOpenTechnique(tid)} style={btn()}>Open technique → {tid}</button>
            </div>
          )}
          {outgoing.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div className="muted" style={{ fontSize: 'var(--cph-fs-xs)', marginBottom: 6 }}>What did you observe? Pick a branch:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {outgoing.map((e) => (
                  <button key={e.id} type="button" onClick={() => onPickBranch(e)} style={{ textAlign: 'left', background: 'var(--cph-ask-input-bg)', border: `1px solid ${branchColor(e)}`, color: 'var(--cph-color-text)', borderRadius: 'var(--cph-radius-sm)', padding: '9px 12px', cursor: 'pointer' }}>
                    <span style={{ color: branchColor(e), fontWeight: 600 }}>{branchLabel(e)}</span> → {nodeLabel(map, e.target)}
                  </button>
                ))}
              </div>
            </div>
          )}
          {current.kind === 'outcome' && (
            <div style={{ marginTop: 12, color: nodeColor(current), fontWeight: 600 }}>
              Outcome reached{current.outcomeKind ? `: ${current.outcomeKind}` : ''}.
            </div>
          )}
        </div>
      )}
      <ResponsibleUseNote />
    </div>
  );
}

export function DecisionMindMapRoute() {
  const params = useParams({ strict: false });
  const mapId = params.mapId;
  const osParam = params.os as OS | undefined;
  const load = useDecision((s) => s.load);
  const currentNodeId = useDecision((s) => s.currentNodeId);
  const walkedPath = useDecision((s) => s.walkedPath);
  const observe = useDecision((s) => s.observe);
  const step = useDecision((s) => s.step);
  const themeOs = useTheme((s) => s.os);
  const setOs = useTheme((s) => s.setOs);
  const navigate = useNavigate();

  useEffect(() => {
    if (mapId) load(mapId);
  }, [mapId, load]);
  useEffect(() => {
    if (osParam && osParam !== themeOs) setOs(osParam);
  }, [osParam, themeOs, setOs]);

  const map = DECISIONS.find((m) => m.id === mapId);
  if (!map) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 24 }}>
        <p className="muted">No such decision map: {String(mapId)}</p>
      </div>
    );
  }
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <DecisionMindMapView
        map={map}
        theme={themeOs}
        currentNodeId={currentNodeId}
        walkedPath={walkedPath}
        onRunCheck={(id) => {
          const t = useContent.getState().bundle?.commands.find((c) => c.id === id)?.template;
          if (t) void navigator.clipboard?.writeText(t);
        }}
        onPickBranch={(e) => {
          if (e.condition.kind === 'if-found') observe(e.condition.signalId);
          step();
        }}
        onOpenTechnique={(id) => void navigate({ to: '/$os/technique/$techniqueId', params: { os: themeOs, techniqueId: id } })}
      />
    </div>
  );
}
