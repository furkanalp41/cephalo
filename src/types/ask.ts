// src/types/ask.ts — ADDITIVE (v2). F4 deterministic intent layer OVER frozen
// MiniSearch. Imports frozen types; adds ZERO fields to them. NOT a frozen module.
import type { Id as Id3, OS as OS3, Shell, Confidence as Conf3 } from './content';
export interface IntentAlias {
  id: string;                  // 'alias.kerberoast'
  canonical: string;           // 'kerberoast'
  aliases: string[];           // ['kerberoasting','roast spns','tgs crack']
  techniqueIds?: Id3[]; commandIds?: Id3[]; toolBinaryIds?: string[];
  signalKey?: string;          // privilege → bridge to F3 PrivilegeSignal.id
  os?: OS3[]; weight?: number;
}
export interface PhrasebookEntry {
  id: string;                  // 'phrase.dump-hashes-powershell'
  phrasings: string[];
  requireAll?: string[];       // hard-gate tokens that MUST be present post-normalize
  intent: string;
  techniqueIds?: Id3[]; commandIds?: Id3[];
  requiresSignals?: string[];  // bridge to F3 advisor
  shell?: Shell; os?: OS3[];
  minOverlap?: number;         // default 0.6 token-Jaccard
  rationale: string;
  confidence: Conf3;
}
export type IntentMatchVia = 'phrasebook' | 'alias' | 'search';
export interface IntentResolution {
  query: string; normalized: string;
  matchVia: IntentMatchVia;
  matchedRecordId?: string;
  techniqueIds: Id3[]; commandIds: Id3[]; signalIds?: string[];
  searchFallbackUsed: boolean; explanation: string;
}
