// src/types/nmap.ts — ADDITIVE (v2). F8 nmap triage / scan router. Imports frozen
// types; adds ZERO fields to them. NOT a frozen module.
import type { Id as Id6, OS as OS6, Severity as Sev6, RefId as RefId6, Confidence as Conf6 } from './content';
export type NmapInputFormat = 'human' | 'grep' | 'xml' | 'unknown';
export type Transport = 'tcp' | 'udp' | 'sctp';
export type PortState = 'open' | 'filtered' | 'closed' | 'open|filtered' | 'closed|filtered' | 'unfiltered';
export interface NmapScript { id: string; output: string; }
export interface NmapPort {
  port: number; proto: Transport; state: PortState;
  service?: string; product?: string; version?: string; extrainfo?: string;
  banner?: string;             // raw service/version blob — SOURCE OF TRUTH
  tunnel?: 'ssl'; scripts?: NmapScript[];
}
export interface NmapHost {
  ip?: string; hostname?: string;
  os?: OS6; osEvidence?: string[];
  status?: 'up' | 'down' | 'unknown';
  ports: NmapPort[];           // open + open|filtered only (post parse-filter)
  hostScripts?: NmapScript[];
}
export interface NmapParseResult {
  format: NmapInputFormat; hosts: NmapHost[]; warnings: string[];
  rawLineCount: number; parsedAt: string;   // COSMETIC; injectable clock; EXCLUDED from test equality
}
export type RouteMatch =
  | { by: 'port'; port: number; proto?: Transport }
  | { by: 'service'; serviceRegex: string }
  | { by: 'product'; productRegex: string }
  | { by: 'portService'; port: number; serviceRegex: string };
export interface ServiceRoute {
  id: string;                  // 'route.smb','route.ldap.ad' — Id string-alias; NOT a registered content Id (HARD RULE 6)
  label: string; match: RouteMatch;
  techniqueIds: Id6[];         // FK → REAL existing frozen Technique.id
  realmHint?: OS6; realmWeight?: number;
  realmCategory?: 'kerberos' | 'ldap' | 'smb' | 'rdp' | 'winrm' | 'nix';
  severity: Sev6; cveCandidate?: boolean; note?: string; references?: RefId6[];
}
export interface RouteFiring {
  route: ServiceRoute; host: string; port: number; proto: Transport;
  matchedOn: 'port' | 'service' | 'product' | 'portService';
  matchedText: string;
  techniqueIds: Id6[]; severity: Sev6;
}
export interface CveHandoff { query: { product?: string; version?: string; service?: string; port: number }; entryIds: Id6[]; unverified: boolean; }
export interface PortTriage { port: NmapPort; firings: RouteFiring[]; techniqueIds: Id6[]; cve?: CveHandoff; }
export interface RealmInference { os: OS6; confidence: Conf6; scores: Record<OS6, number>; evidence: string[]; }
export interface AutofillProposal { varId: string; value: string; source: string; confidence: Conf6; conflictsWithUserValue: boolean; }
export interface HostTriage { host: NmapHost; realm: RealmInference; ports: PortTriage[]; autofill: AutofillProposal[]; }
export interface NmapTriageResult {
  parse: NmapParseResult; hosts: HostTriage[];
  themeSwitch?: { proposedOs: OS6; reason: string; autoApplied: false };
  warnings: string[];
}
