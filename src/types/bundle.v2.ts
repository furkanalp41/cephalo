// src/types/bundle.v2.ts — ADDITIVE (v2) aggregate. The frozen ContentBundle is NOT
// extended; v2 datasets ship as this sibling bundle. NOT a frozen module.
import type { ToolBinary as TB } from './arsenal';
import type { PrivilegeSignal as PS, PrivilegeRule as PR } from './advisor';
import type { IntentAlias as IA, PhrasebookEntry as PB } from './ask';
import type { CveExploitEntry as CE } from './cve';
import type { DecisionMap as DM } from './decision';
import type { ServiceRoute as SR } from './nmap';
export interface CephaloV2Bundle {
  schemaVersion: number; generatedAt: string;
  toolBinaries: TB[]; signals: PS[]; rules: PR[];
  intentAliases: IA[]; phrasebook: PB[]; cve: CE[]; decisions: DM[]; nmapRoutes: SR[];
}
