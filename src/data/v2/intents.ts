// src/data/v2/intents.ts — F4 IntentAlias + PhrasebookEntry datasets (v2). The intent
// engine resolves natural-language queries deterministically OVER these + the frozen
// MiniSearch. Every techniqueId targets a LIVE oscp technique; signalKey/requiresSignals
// target real sig.* ids; toolBinaryIds target real tool.* ids. No expandsTo (expansion
// is via canonical). Validated by schema.v2.ts (IntentAliasSchema / PhrasebookEntrySchema).
import type { IntentAlias, PhrasebookEntry } from '@/types/ask';

export const INTENT_ALIASES: IntentAlias[] = [
  { id: 'alias.kerberoast', canonical: 'kerberoast', aliases: ['kerberoasting', 'roast spns', 'tgs crack', 'crack service tickets'], techniqueIds: ['ad.credaccess.kerberoast'], toolBinaryIds: ['tool.rubeus', 'tool.netexec'], os: ['ad'] },
  { id: 'alias.asreproast', canonical: 'asreproast', aliases: ['as-rep roast', 'asrep roasting', 'roast no preauth', 'asreproasting'], techniqueIds: ['ad.credaccess.asreproast'], toolBinaryIds: ['tool.rubeus', 'tool.netexec'], os: ['ad'] },
  { id: 'alias.dcsync', canonical: 'dcsync', aliases: ['dc sync', 'replicate directory', 'dump ntds remotely'], techniqueIds: ['ad.credaccess.dcsync'], toolBinaryIds: ['tool.mimikatz', 'tool.impacket'], os: ['ad'] },
  { id: 'alias.smbenum', canonical: 'smb enum', aliases: ['smb enumeration', 'enumerate shares', 'share enum', 'null session'], techniqueIds: ['ad.enum.smb'], toolBinaryIds: ['tool.netexec'], os: ['ad', 'linux'] },
  { id: 'alias.bloodhound', canonical: 'bloodhound', aliases: ['sharphound', 'attack path', 'collect ad graph'], techniqueIds: ['ad.enum.bloodhound'], toolBinaryIds: ['tool.netexec'], os: ['ad'] },
  { id: 'alias.responder', canonical: 'responder', aliases: ['llmnr poisoning', 'nbt-ns poisoning', 'capture netntlm'], techniqueIds: ['ad.cred.responder'], os: ['ad'] },
  { id: 'alias.seimpersonate', canonical: 'seimpersonate', aliases: ['seimpersonateprivilege', 'potato', 'impersonate token'], signalKey: 'sig.win.seimpersonate', techniqueIds: ['win.privesc.token'], toolBinaryIds: ['tool.printspoofer', 'tool.godpotato'], os: ['windows'] },
  { id: 'alias.sudo', canonical: 'sudo privesc', aliases: ['sudo -l', 'gtfobins sudo', 'abuse sudo'], signalKey: 'sig.linux.sudo_nopasswd', techniqueIds: ['linux.privesc.sudo'], os: ['linux'] },
  { id: 'alias.suid', canonical: 'suid privesc', aliases: ['suid binary', 'setuid', 'gtfobins suid', 'find suid'], techniqueIds: ['linux.privesc.suid'], os: ['linux'] },
  { id: 'alias.docker', canonical: 'docker escape', aliases: ['docker group', 'container escape', 'mount host'], signalKey: 'sig.linux.docker', techniqueIds: ['linux.privesc.docker'], os: ['linux'] },
];

export const PHRASEBOOK: PhrasebookEntry[] = [
  { id: 'phrase.seimpersonate', phrasings: ['what can i do with seimpersonate', 'exploit seimpersonate privilege', 'seimpersonate to system'], requireAll: ['seimpersonate'], intent: 'SeImpersonate exploitation', techniqueIds: ['win.privesc.token'], requiresSignals: ['sig.win.seimpersonate'], minOverlap: 0.34, rationale: 'Bridges the held-privilege question to the advisor signal + potato techniques.', confidence: 'verified' },
  { id: 'phrase.dump-ntds', phrasings: ['dump ntds', 'dump domain hashes', 'dcsync krbtgt', 'replicate and dump hashes'], requireAll: ['dump'], intent: 'Dump domain credentials (DCSync/NTDS)', techniqueIds: ['ad.credaccess.dcsync'], minOverlap: 0.34, rationale: 'Maps hash-dumping intent to DCSync/NTDS extraction.', confidence: 'verified' },
  { id: 'phrase.crack-spn-tickets', phrasings: ['crack service account tickets', 'roast service principal names', 'request and crack spn'], requireAll: ['crack'], intent: 'Kerberoast SPN accounts', techniqueIds: ['ad.credaccess.kerberoast'], minOverlap: 0.34, rationale: 'Maps SPN-ticket cracking intent to Kerberoast.', confidence: 'verified' },
  { id: 'phrase.privesc-sudo', phrasings: ['escalate with sudo', 'sudo to root', 'abuse passwordless sudo'], requireAll: ['sudo'], intent: 'Linux sudo privilege escalation', techniqueIds: ['linux.privesc.sudo'], requiresSignals: ['sig.linux.sudo_nopasswd'], minOverlap: 0.34, rationale: 'Maps sudo escalation intent to the sudo/GTFOBins technique.', confidence: 'verified' },
];
