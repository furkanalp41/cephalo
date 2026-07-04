// src/types/cve.ts — ADDITIVE (v2). F6 bundled, offline CVE/version lookup. No API.
// Imports frozen types; adds ZERO fields to them. NOT a frozen module.
import type { RefId as RefId4, Id as Id4, Confidence as Conf4 } from './content';
export interface VersionRange {
  exact?: string;
  introduced?: string;         // inclusive lower bound
  fixedExclusive?: string;     // exclusive upper bound
  prefix?: string;             // '2.4.' ⇒ 2.4.x
  any?: boolean;               // product-wide ⇒ FORCES unverified handling
  expression?: string;         // human note only
}
export type ExploitType = 'remote' | 'local' | 'webapps' | 'dos' | 'priv-esc' | 'shellcode' | 'hardware';
export interface CveExploitEntry {
  id: string;                  // 'cve.proftpd.135.modcopy'
  product: string;
  productAliases?: string[];
  versionRange: VersionRange;
  cveId?: string;              // /^CVE-\d{4}-\d{4,}$/  (absent ⇒ [UNVERIFIED])
  title: string;
  edbId?: string;
  searchsploitTerm: string;    // EXACT offline term
  exploitType: ExploitType;
  platform?: 'linux'|'windows'|'unix'|'multiple'|'php'|'java'|'hardware';
  requiresAuth?: boolean;
  ref: RefId4;                 // REQUIRED
  references?: RefId4[];
  relatedTechniqueId?: Id4;
  notes?: string;
  confidence: Conf4;
}
export interface CveMatch { entry: CveExploitEntry; matchKind: 'exact' | 'in-range' | 'product-only'; unverified: boolean; }
