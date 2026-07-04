// src/data/v2/signals.ts — F3 PrivilegeSignal dataset (v2). Each signal is a regex over
// a specific enum source; token-priv signals fire whether Enabled OR Disabled (the
// exploit ENABLES the held priv). [UNVERIFIED] signals (applicability not machine-
// verifiable) carry references[]. Validated by schema.v2.ts (PrivilegeSignalSchema).
import type { PrivilegeSignal } from '@/types/advisor';

export const SIGNALS: PrivilegeSignal[] = [
  { id: 'sig.win.seimpersonate', os: 'windows', source: 'whoami-priv', label: 'SeImpersonatePrivilege', match: { pattern: 'SeImpersonatePrivilege' }, severity: 'high', description: 'Impersonate a client after authentication — token-impersonation primitive.', confidence: 'verified' },
  { id: 'sig.win.sebackup', os: 'windows', source: 'whoami-priv', label: 'SeBackupPrivilege', match: { pattern: 'SeBackupPrivilege' }, severity: 'high', description: 'Back up files and directories — read any file, including registry hives.', confidence: 'verified' },
  { id: 'sig.win.sedebug', os: 'windows', source: 'whoami-priv', label: 'SeDebugPrivilege', match: { pattern: 'SeDebugPrivilege' }, severity: 'high', description: 'Debug programs — open and read protected process memory (e.g. LSASS).', confidence: 'verified' },
  { id: 'sig.win.seloaddriver', os: 'windows', source: 'whoami-priv', label: 'SeLoadDriverPrivilege', match: { pattern: 'SeLoadDriverPrivilege' }, severity: 'medium', description: 'Load and unload device drivers — BYOVD path; applicability is target-specific.', confidence: 'unverified', references: ['ref.hacktricks'] },
  { id: 'sig.win.semanagevolume', os: 'windows', source: 'whoami-priv', label: 'SeManageVolumePrivilege', match: { pattern: 'SeManageVolumePrivilege' }, severity: 'medium', description: 'Perform volume maintenance — can lead to arbitrary file write; target-specific.', confidence: 'unverified', references: ['ref.hacktricks'] },
  { id: 'sig.win.backupoperators', os: 'windows', source: 'whoami-groups', label: 'Backup Operators', match: { pattern: 'S-1-5-32-551' }, sids: ['S-1-5-32-551'], severity: 'high', description: 'Backup Operators group — backup/restore rights over the filesystem and hives.', confidence: 'verified' },
  { id: 'sig.win.serveroperators', os: 'windows', source: 'whoami-groups', label: 'Server Operators', match: { pattern: 'S-1-5-32-549' }, sids: ['S-1-5-32-549'], severity: 'high', description: 'Server Operators group — can reconfigure services to run a chosen binary.', confidence: 'verified' },
  { id: 'sig.linux.sudo_nopasswd', os: 'linux', source: 'sudo-l', label: 'sudo NOPASSWD', match: { pattern: 'NOPASSWD' }, severity: 'high', description: 'A passwordless sudo entry — cross-reference the runnable binary against GTFOBins.', confidence: 'verified' },
  { id: 'sig.linux.cap_setuid', os: 'linux', source: 'getcap', label: 'cap_setuid', match: { pattern: 'cap_setuid' }, severity: 'high', description: 'A binary with the setuid capability — can drop to uid 0.', confidence: 'verified' },
  { id: 'sig.linux.docker', os: 'linux', source: 'id', label: 'docker group', match: { pattern: '\\bdocker\\b' }, severity: 'high', description: 'Membership of the docker group — mount the host filesystem via a container.', confidence: 'verified' },
];
