// src/types/advisor.ts — ADDITIVE (v2). F3 deterministic privilege advisor. No AI.
// Imports frozen types; adds ZERO fields to them. NOT a frozen module.
import type { Id as Id2, RefId as RefId2, OS as OS2, Severity, Confidence as Conf2 } from './content';
export type EnumSource =
  | 'whoami-priv' | 'whoami-groups' | 'whoami-all'
  | 'sudo-l' | 'id' | 'getcap' | 'suid-find' | 'systeminfo' | 'uname' | 'ad-misc';
export interface PrivilegeSignal {
  id: string;                  // 'sig.win.seimpersonate', 'sig.linux.cap_setuid'
  os: OS2;
  source: EnumSource;
  label: string;               // 'SeImpersonatePrivilege (held)'
  match: { pattern: string; flags?: string; captures?: string[] };
  actionableStates?: ('enabled' | 'disabled' | 'present')[];
  sids?: string[];             // well-known SIDs for locale-safe group match (S-1-5-32-551 …)
  severity: Severity;
  description: string;
  references?: RefId2[];
  confidence: Conf2;
}
export interface SignalMatch {                     // runtime parser output (session-only, NEVER persisted)
  signalId: string;
  source: EnumSource;
  rawLine: string;
  state?: 'enabled' | 'disabled' | 'present';
  captures?: Record<string, string>;
}
export interface BuildGate { minBuild?: number; maxBuild?: number; }
export interface PrivilegeRule {
  id: string;                  // 'rule.win.seimpersonate.printspoofer'
  os: OS2;
  whenSignals: string[];       // signal ids; ALL present (AND). Use multiple rules for OR.
  buildGate?: BuildGate;
  recommendsTechniqueId: Id2;
  commandId?: Id2;             // rendered via FROZEN TemplateEngine; advisor never string-builds
  toolBinaryId?: string;
  rank: number;                // lower = higher priority; tie-break by id
  rationale: string;
  unverifiedReason?: string;   // REQUIRED when confidence==='unverified'
  decisionNodeId?: string;     // hand-off into F5
  cveLookupHint?: string;      // hand-off into F6
  confidence: Conf2;
  references?: RefId2[];        // REQUIRED when unverified
}
export interface AdvisorRecommendation { rule: PrivilegeRule; triggeredBy: SignalMatch[]; unverified: boolean; }
export interface ParsedBuildInfo { os: OS2; buildNumber?: number; productName?: string; kernel?: string; }
