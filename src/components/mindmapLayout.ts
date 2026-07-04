// src/components/mindmapLayout.ts — deterministic top-down dagre layout for a
// content MindMap → MindMapRenderModel. Selecting a node highlights the root→node
// path (ancestors) and dims the rest ("current lineage glows, the abyss recedes").
import dagre from 'dagre';
import type { MindMap } from '@/types/content';
import type { MindMapRenderModel, MindMapRenderNode, MindMapRenderEdge } from '@/types/engine';

const NODE_W = 168;
const NODE_H = 56;

function ancestorsOf(mm: MindMap, nodeId: string): Set<string> {
  const parents = new Map<string, string[]>();
  for (const e of mm.edges) {
    const arr = parents.get(e.target) ?? [];
    arr.push(e.source);
    parents.set(e.target, arr);
  }
  const seen = new Set<string>([nodeId]);
  const stack = [nodeId];
  while (stack.length) {
    const cur = stack.pop() as string;
    for (const p of parents.get(cur) ?? []) {
      if (!seen.has(p)) {
        seen.add(p);
        stack.push(p);
      }
    }
  }
  return seen;
}

export function toRenderModel(mm: MindMap, selectedNodeId?: string): MindMapRenderModel {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 36, ranksep: 64, marginx: 16, marginy: 16 });
  g.setDefaultEdgeLabel(() => ({}));
  for (const n of mm.nodes) g.setNode(n.id, { width: NODE_W, height: NODE_H });
  for (const e of mm.edges) g.setEdge(e.source, e.target);
  dagre.layout(g);

  const highlight = selectedNodeId ? ancestorsOf(mm, selectedNodeId) : null;

  const nodes: MindMapRenderNode[] = mm.nodes.map((n) => {
    const pos = g.node(n.id) as { x: number; y: number } | undefined;
    const node: MindMapRenderNode = {
      id: n.id,
      label: n.label,
      kind: n.kind,
      position: pos ? { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 } : { x: 0, y: 0 },
    };
    if (n.severity) node.severity = n.severity;
    if (n.os) node.os = n.os;
    if (n.techniqueId) node.techniqueId = n.techniqueId;
    if (n.sectionId) node.sectionId = n.sectionId;
    if (selectedNodeId) {
      node.selected = n.id === selectedNodeId;
      node.dimmed = highlight ? !highlight.has(n.id) : false;
    }
    return node;
  });

  const edges: MindMapRenderEdge[] = mm.edges.map((e) => {
    const edge: MindMapRenderEdge = { id: e.id, source: e.source, target: e.target };
    if (e.label) edge.label = e.label;
    if (e.kind) edge.kind = e.kind;
    return edge;
  });

  return { nodes, edges, layout: mm.layout ?? 'dagre' };
}
