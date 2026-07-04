// src/data/v2/toolBinaries.ts — F2 ToolBinary arsenal (v2 dataset). Link-only: each
// carries officialRef → a real repo/project PAGE and the literal fetchNote; NEVER a
// binaryUrl, never a committed blob. confidence:'verified' = the project exists (build
// gating / applicability uncertainty lives on the advisor RULE, not the tool). Validated
// by src/data/schema.v2.ts (ToolBinarySchema) at build time via scripts/build-v2.ts.
import type { ToolBinary } from '@/types/arsenal';

const FETCH = 'You fetch this yourself. Nothing is bundled or hosted by Cephalo.';

export const TOOL_BINARIES: ToolBinary[] = [
  { id: 'tool.rubeus', name: 'Rubeus', category: 'ad-cred', format: ['exe'], runsOn: ['windows', 'ad'], officialRef: 'ref.rubeus', shipsOnKali: false, fetchNote: FETCH, relatedTechniqueIds: ['ad.credaccess.kerberoast', 'ad.credaccess.asreproast'], confidence: 'verified' },
  { id: 'tool.powerview', name: 'PowerView', category: 'ad-enum', format: ['ps1'], runsOn: ['ad'], officialRef: 'ref.powerview', shipsOnKali: false, fetchNote: FETCH, relatedTechniqueIds: ['ad.enum.bloodhound'], confidence: 'verified' },
  { id: 'tool.powerup', name: 'PowerUp', category: 'win-privesc', format: ['ps1'], runsOn: ['windows'], officialRef: 'ref.powersploit', shipsOnKali: false, fetchNote: FETCH, relatedTechniqueIds: ['win.privesc.privs'], confidence: 'verified' },
  { id: 'tool.printspoofer', name: 'PrintSpoofer', category: 'potato', format: ['exe'], runsOn: ['windows'], officialRef: 'ref.printspoofer', shipsOnKali: false, fetchNote: FETCH, relatedTechniqueIds: ['win.privesc.token'], relatedSignalIds: ['sig.win.seimpersonate'], confidence: 'verified' },
  { id: 'tool.godpotato', name: 'GodPotato', category: 'potato', format: ['exe'], runsOn: ['windows'], officialRef: 'ref.godpotato', shipsOnKali: false, fetchNote: FETCH, relatedTechniqueIds: ['win.privesc.token'], relatedSignalIds: ['sig.win.seimpersonate'], confidence: 'verified' },
  { id: 'tool.juicypotato', name: 'JuicyPotato', category: 'potato', format: ['exe'], runsOn: ['windows'], officialRef: 'ref.juicypotato', shipsOnKali: false, fetchNote: FETCH, relatedTechniqueIds: ['win.privesc.token'], relatedSignalIds: ['sig.win.seimpersonate'], confidence: 'verified' },
  { id: 'tool.certipy', name: 'Certipy', category: 'adcs', format: ['py'], runsOn: ['windows', 'ad'], officialRef: 'ref.certipy', shipsOnKali: false, fetchNote: FETCH, confidence: 'verified' },
  { id: 'tool.netexec', name: 'NetExec (nxc)', category: 'ad-enum', format: ['py'], runsOn: ['linux', 'windows', 'ad'], officialRef: 'ref.netexec', shipsOnKali: true, fetchNote: FETCH, relatedTechniqueIds: ['ad.credaccess.asreproast'], confidence: 'verified' },
  { id: 'tool.mimikatz', name: 'mimikatz', category: 'ad-cred', format: ['exe'], runsOn: ['windows'], officialRef: 'ref.mimikatz', shipsOnKali: false, fetchNote: FETCH, relatedTechniqueIds: ['ad.credaccess.dcsync'], confidence: 'verified' },
  { id: 'tool.nishang', name: 'Nishang', category: 'powershell-offensive', format: ['ps1'], runsOn: ['windows'], officialRef: 'ref.nishang', shipsOnKali: false, fetchNote: FETCH, confidence: 'verified' },
  { id: 'tool.impacket', name: 'Impacket', category: 'ad-lateral', format: ['py'], runsOn: ['linux', 'windows', 'ad'], officialRef: 'ref.impacket', shipsOnKali: true, fetchNote: FETCH, relatedTechniqueIds: ['ad.credaccess.dcsync'], confidence: 'verified' },
];
