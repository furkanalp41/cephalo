// src/components/MindMap.tsx — interactive @xyflow decision-tree (FROZEN MindMapProps)
// + a content/route-wired host. Node shape carries meaning (decision=diamond-ish,
// outcome=capsule); severity = heat ring; color is redundant with shape/label
// (CVD-safe). Clicking a node with techniqueId deep-links to its commands.
import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import { useNavigate } from '@tanstack/react-router';
import type { MindMapProps } from '@/types/components';
import type { MindMap as MindMapData, Severity } from '@/types/content';
import { toRenderModel } from './mindmapLayout';
import { ResponsibleUseNote } from './ResponsibleUseNote';

const SEV_VAR: Record<Severity, string> = {
  info: 'var(--cph-sev-info)',
  low: 'var(--cph-sev-low)',
  medium: 'var(--cph-sev-medium)',
  high: 'var(--cph-sev-high)',
  critical: 'var(--cph-sev-critical)',
};

type CphNodeData = {
  label: string;
  kind: string;
  severity?: Severity;
  selected?: boolean;
  dimmed?: boolean;
  techniqueId?: string;
};

function CphNode({ data }: NodeProps<Node<CphNodeData>>) {
  const cls = ['mm-node'];
  if (data.kind === 'decision') cls.push('mm-node--decision');
  if (data.kind === 'outcome') cls.push('mm-node--outcome');
  const style = data.severity ? { borderColor: SEV_VAR[data.severity] } : undefined;
  return (
    <div
      className={cls.join(' ')}
      data-selected={data.selected ? 'true' : undefined}
      data-dimmed={data.dimmed ? 'true' : undefined}
      style={style}
      aria-label={`${data.label} (${data.kind}${data.severity ? `, ${data.severity}` : ''})`}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      {data.label}
      {data.severity && <span className="mm-node__sev">{data.severity}</span>}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = { cph: CphNode };

export function MindMap({ model, selectedNodeId, onNodeClick, onNodeHover }: MindMapProps) {
  const nodes: Node<CphNodeData>[] = useMemo(
    () =>
      model.nodes.map((n) => ({
        id: n.id,
        type: 'cph',
        position: n.position ?? { x: 0, y: 0 },
        data: {
          label: n.label,
          kind: n.kind,
          ...(n.severity ? { severity: n.severity } : {}),
          selected: Boolean(n.id === selectedNodeId || n.selected),
          dimmed: Boolean(n.dimmed),
          ...(n.techniqueId ? { techniqueId: n.techniqueId } : {}),
        },
      })),
    [model.nodes, selectedNodeId],
  );

  const edges: Edge[] = useMemo(
    () =>
      model.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: e.kind === 'escalates',
        style: { stroke: 'var(--cph-color-border)' },
      })),
    [model.edges],
  );

  return (
    <div className="mindmap" data-testid="mindmap">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_e, node) => onNodeClick(node.id, (node.data as CphNodeData).techniqueId)}
        onNodeMouseEnter={(_e, node) => onNodeHover?.(node.id)}
        onNodeMouseLeave={() => onNodeHover?.(null)}
      >
        <Background gap={24} color="var(--cph-color-border)" />
        <MiniMap pannable zoomable />
        <Controls showInteractive={false} />
      </ReactFlow>
      <div className="mm-legend" aria-label="Mindmap legend">
        <span className="mm-legend__title">Heat</span>
        {(['info', 'low', 'medium', 'high', 'critical'] as Severity[]).map((s) => (
          <span className="mm-legend__item" key={s}>
            <span className="mm-legend__sw" style={{ background: SEV_VAR[s] }} aria-hidden />
            {s}
          </span>
        ))}
        <span className="mm-legend__title">Nodes</span>
        <span className="mm-legend__item">decision (diamond)</span>
        <span className="mm-legend__item">technique (card)</span>
        <span className="mm-legend__item">outcome (capsule)</span>
      </div>
    </div>
  );
}

// ---- content/route-wired host ----
export function MindMapHost({
  map,
  selectedNodeId,
}: {
  map: MindMapData;
  selectedNodeId?: string;
}) {
  const navigate = useNavigate();
  const model = useMemo(() => toRenderModel(map, selectedNodeId), [map, selectedNodeId]);

  return (
    <div>
      <MindMap
        model={model}
        theme={map.os}
        {...(selectedNodeId ? { selectedNodeId } : {})}
        onNodeClick={(nodeId, techniqueId) => {
          // update the URL (deep-link) + jump to the technique's commands
          void navigate({
            to: '/$os/mindmap/$mapId',
            params: { os: map.os, mapId: map.id },
            search: { node: nodeId },
          });
          if (techniqueId) {
            void navigate({
              to: '/$os/technique/$techniqueId',
              params: { os: map.os, techniqueId },
            });
          }
        }}
      />
      <ResponsibleUseNote />
    </div>
  );
}
