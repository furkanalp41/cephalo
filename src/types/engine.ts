// FROZEN MERGE SEAM — single source of truth. DESIGN imports, never edits. Do not modify field names/enums.
// ============================================================
// src/types/engine.ts  —  FROZEN. DESIGN imports, never edits.
// (§2 templating + §3 search/mindmap-render of the SHARED CONTRACT)
// The `import type` line below is structurally required for compilation; it
// adds no field, enum, or union member to the frozen surface.
// ============================================================
import type {
  VariableDef,
  Id,
  OS,
  Phase,
  PackId,
  Severity,
  MindMapNode,
  MindMapEdge,
} from './content';

// ---- §2 templating ----
export type TokenFilter = 'quote' | 'upper' | 'lower' | 'urlencode' | 'b64';
export interface ParsedToken {
  raw: string;
  name: string;
  start: number;
  end: number;
  fallback?: string;
  filter?: TokenFilter;
}
export interface TemplateAST {
  template: string;
  tokens: ParsedToken[];
  varNames: string[];
}
export type RenderMode = 'filled' | 'raw' | 'display';
export interface RenderOptions {
  values: Record<string, string>;
  defs: Record<string, VariableDef>;
  mode: RenderMode;
}
export interface RenderSpan {
  type: 'text' | 'var';
  text: string;
  varName?: string;
  state?: 'set' | 'unset' | 'invalid';
}
export interface RenderResult {
  spans: RenderSpan[];
  filled: string;
  raw: string;
  missing: string[];
  invalid: string[];
  allResolved: boolean;
}
export interface TemplateEngine {
  parse(template: string): TemplateAST;
  detectVars(template: string): string[];
  render(t: string | TemplateAST, o: RenderOptions): RenderResult;
}

// ---- §3 search + mindmap render ----
export interface SearchDoc {
  id: Id;
  type: 'command' | 'technique' | 'section' | 'bloodhound' | 'tag';
  title: string;
  body: string;
  template?: string;
  tags: string[];
  os: OS[];
  phase?: Phase;
  ports: number[];
  services: string[];
  tool?: string;
  packs: PackId[];
}
export interface SearchFilters {
  os?: OS[];
  phase?: Phase[];
  type?: SearchDoc['type'][];
  packs?: PackId[];
}
export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  limit?: number;
}
export interface SearchHit {
  id: Id;
  type: SearchDoc['type'];
  score: number;
  matchedFields: string[];
  highlights?: Record<string, Array<[number, number]>>;
}
export interface SearchEngine {
  load(serialized: string | object): void;
  search(o: SearchOptions): SearchHit[];
}

export interface MindMapRenderNode {
  id: string;
  label: string;
  kind: MindMapNode['kind'];
  severity?: Severity;
  os?: OS;
  selected?: boolean;
  dimmed?: boolean;
  position?: { x: number; y: number };
  techniqueId?: Id;
  sectionId?: Id;
}
export interface MindMapRenderEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  kind?: MindMapEdge['kind'];
}
export interface MindMapRenderModel {
  nodes: MindMapRenderNode[];
  edges: MindMapRenderEdge[];
  layout: 'dagre' | 'tree' | 'manual';
}
