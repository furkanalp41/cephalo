// src/types/decision.ts — ADDITIVE (v2). F5 output-conditional decision maps; F7 AD
// trees. Imports frozen types; adds ZERO fields to them. NOT a frozen module.
import type { Id as Id5, OS as OS5, Phase, Severity as Sev5, Confidence as Conf5, PackId } from './content';
import type { RefId as RefId5 } from './content';
export type DecisionNodeKind = 'start' | 'check' | 'branch' | 'action' | 'outcome' | 'note';
export interface ObservableSignal {
  id: string; label: string;
  match: 'contains' | 'regex' | 'signalRef'; // 'signalRef' ⇒ value is a PrivilegeSignal.id (DRY with F3)
  value: string; caseInsensitive?: boolean;  // default ci=true + trim
}
export interface DecisionNode {
  id: string;                  // 'dec.win.tokenpriv.whoami'
  kind: DecisionNodeKind; label: string;
  checkCommandId?: Id5;        // preferred; no duplication
  inlineTemplate?: string;     // fallback only when no Command exists
  techniqueId?: Id5; actionCommandId?: Id5; toolBinaryId?: string;
  os?: OS5; severity?: Sev5;
  observes?: ObservableSignal[];
  outcomeKind?: 'system' | 'root' | 'da' | 'creds' | 'dead-end';
  confidence?: Conf5; unverified?: boolean; references?: RefId5[];
  position?: { x: number; y: number };
}
export interface DecisionEdge {
  id: string; source: string; target: string; label?: string;
  condition:
    | { kind: 'if-found'; signalId: string }
    | { kind: 'if-absent'; signalId: string }
    | { kind: 'else' };
  priority?: number;           // lower evaluated first
  confidence?: Conf5;
}
export interface DecisionMap {
  id: Id5;                     // 'dec.win.tokenpriv' — Id string-alias; NOT a registered content Id (HARD RULE 6)
  title: string; os: OS5; phase?: Phase;
  rootNodeId: string; nodes: DecisionNode[]; edges: DecisionEdge[];
  legend?: string; layout?: 'dagre' | 'tree' | 'manual';
  packs: PackId[]; references?: RefId5[]; confidence: Conf5;
}
export interface DecisionStep { fromNodeId: string; chosenEdge: DecisionEdge; nextNodeId: string; }
