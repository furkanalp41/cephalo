// src/types/components.v2.ts — ADDITIVE (v2) prop types (pure presentational).
// Imports frozen + v2 types; renames no prop, redefines no enum. NOT a frozen module.
import type { Id, OS, RefId } from './content';
import type { OctoState } from './components';
import type { IntentResolution } from './ask';
import type { SignalMatch, AdvisorRecommendation, EnumSource } from './advisor';
import type { CveMatch } from './cve';
import type { ToolBinary } from './arsenal';
import type { DecisionMap, DecisionEdge } from './decision';
import type { NmapTriageResult, HostTriage } from './nmap';   // HostTriage re-synced w/ canonical contract
export interface AskOctopusProps { octoState: OctoState; theme: OS; reducedMotion?: boolean; query: string;
  resolution?: IntentResolution; mode: 'summon' | 'paste-scan'; nmap?: NmapTriageResult;
  onQueryChange:(q:string)=>void; onSubmit:(q:string)=>void; onModeChange:(m:'summon'|'paste-scan')=>void;
  onPasteScan:(raw:string)=>void; onSelectTechnique:(id:Id)=>void; onCopyCommand:(id:Id,text:string)=>void;
  onConfirmTheme:(os:OS)=>void; onApplyAutofill:(varId:string,value:string)=>void; }
export interface PrivilegeAdvisorProps { theme: OS; source: EnumSource; rawInput: string;
  matches: SignalMatch[]; recommendations: AdvisorRecommendation[];
  onSourceChange:(s:EnumSource)=>void; onInputChange:(t:string)=>void; /* session-only; NEVER persisted */
  onParse:()=>void; onCopyCommand:(id:Id,text:string)=>void; onOpenTechnique:(id:Id)=>void; onFetchTool:(id:string)=>void; }
export interface CveLookupProps { product: string; version: string; matches: CveMatch[];
  onQueryChange:(p:string,v:string)=>void; onCopySearchsploit:(term:string)=>void; onOpenReference:(r:RefId)=>void; }
export interface ToolArsenalProps { tools: ToolBinary[]; filter?: { category?: string; os?: OS };
  onFilterChange:(f:{category?:string;os?:OS})=>void; onOpenSource:(r:RefId)=>void; }
export interface DecisionMindMapProps { map: DecisionMap; theme: OS; reducedMotion?: boolean;
  currentNodeId: string; walkedPath: string[];
  onRunCheck:(id:Id)=>void; onPickBranch:(e:DecisionEdge)=>void; onOpenTechnique:(id:Id)=>void; }
export interface NmapTriageBoardProps { result: NmapTriageResult; theme: OS;
  onConfirmTheme:(os:OS)=>void; onApplyAutofill:(varId:string,value:string)=>void;
  onOpenTechnique:(id:Id)=>void; onOpenCve:(id:Id)=>void; }
// Per-host board-row prop (per-host panels destructure HostTriage from
// NmapTriageResult.hosts[]); keeps this block byte-aligned with the canonical contract.
export interface NmapHostPanelProps { host: HostTriage; theme: OS;
  onApplyAutofill:(varId:string,value:string)=>void; onOpenTechnique:(id:Id)=>void; onOpenCve:(id:Id)=>void; }
// DecisionMindMapView / NmapTriageBoard use @xyflow/react with their OWN node/edge
// mapping — they do NOT go through the frozen MindMapRenderModel. MindMapProps untouched.
