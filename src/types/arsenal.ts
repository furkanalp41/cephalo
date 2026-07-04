// src/types/arsenal.ts — ADDITIVE (v2). Imports frozen types; adds ZERO fields to
// them. NOT a frozen module. F1 cross-link + F2 tool provenance.
import type { Id, RefId, OS, Confidence } from './content';
export type ToolFormat = 'exe' | 'ps1' | 'py' | 'elf' | 'jar' | 'dll' | 'so' | 'script' | 'msi';
export type ToolCategory =
  | 'ad-enum' | 'ad-cred' | 'ad-lateral' | 'adcs' | 'bloodhound'
  | 'win-privesc' | 'win-enum' | 'potato'
  | 'linux-privesc' | 'linux-enum'
  | 'recon' | 'web' | 'relay' | 'pivot' | 'transfer' | 'cracking' | 'powershell-offensive';
export interface ToolBinary {
  id: string;                  // 'tool.rubeus'
  name: string;                // 'Rubeus'
  aliases?: string[];
  category: ToolCategory;
  format: ToolFormat[];
  runsOn: OS[];
  officialRef: RefId;          // FK → frozen Reference: canonical repo/project page (LINK ONLY)
  releaseRef?: RefId;          // FK → frozen Reference: releases/download PAGE (LINK ONLY; never a hosted blob)
  shipsOnKali: boolean;
  kaliPath?: string;
  fetchNote: string;           // REQUIRED literal: 'You fetch this yourself. Nothing is bundled or hosted by Cephalo.'
  relatedTechniqueIds?: Id[];  // FK → frozen Technique/Command ids
  relatedSignalIds?: string[]; // FK → PrivilegeSignal.id (advisor "fetch this tool")
  confidence: Confidence;      // 'unverified' MUST carry references
  references?: RefId[];
  tags?: string[];
  // INVARIANT (gate-enforced, not a field): NO binaryUrl, NO embedded artifact.
}
