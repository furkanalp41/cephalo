// FROZEN MERGE SEAM — single source of truth. DESIGN imports, never edits. Do not modify field names/enums.
// ============================================================
// src/types/components.ts  —  FROZEN. (§6 COMPONENT-API SEAM)
// The `import type` lines below are structurally required for compilation; they
// add no field, enum, or prop to the frozen surface.
// ============================================================
import type {
  Command,
  Id,
  OS,
  Severity,
  CredMode,
  RefId,
  VariableDef,
  VarGroup,
  Confidence,
} from './content';
import type { RenderResult, SearchHit, SearchFilters, MindMapRenderModel } from './engine';

export type OctoState =
  | 'idle'
  | 'greeting'
  | 'listening'
  | 'thinking'
  | 'found'
  | 'empty'
  | 'copied'
  | 'error'
  | 'celebrate'; // sole mascot vocabulary

export interface OctopusMascotProps {
  state: OctoState;
  message?: string;
  intensity?: number; // 0..1 (e.g. hit count)
  theme: OS;
  reducedMotion?: boolean;
  onClick?: () => void;
}
export interface CommandCardProps {
  command: Command;
  render: RenderResult;
  affectedVars: string[];
  theme: OS;
  confidence: Confidence;
  danger?: Severity;
  credMode?: CredMode;
  onCopyFilled: (id: Id, text: string) => void;
  onCopyRaw: (id: Id, text: string) => void;
  onSelectVariant?: (id: Id, variantId: Id) => void;
  onSetCredMode?: (id: Id, mode: CredMode) => void;
  onOpenReference?: (refId: RefId) => void;
}
export interface VariableBarProps {
  defs: VariableDef[];
  values: Record<string, string>;
  validity: Record<string, boolean>;
  groups: VarGroup[];
  onChange: (id: string, value: string) => void;
  onReset: (id?: string) => void; // one (id) or all (undefined)
  onClearSensitive?: () => void;
  onFocusVar?: (id: string) => void;
}
export interface SearchPaletteProps {
  query: string;
  hits: SearchHit[];
  loading: boolean;
  octoState: OctoState;
  filters?: SearchFilters;
  onQueryChange: (q: string) => void;
  onSelectHit: (hit: SearchHit) => void;
  onCopyHit?: (hit: SearchHit) => void; // Cmd-Enter copy-filled top hit
  onFilterChange?: (f: SearchFilters) => void;
  onClose: () => void;
}
export interface MindMapProps {
  model: MindMapRenderModel;
  theme: OS;
  selectedNodeId?: string;
  onNodeClick: (nodeId: string, techniqueId?: Id) => void;
  onNodeHover?: (nodeId: string | null) => void;
}
