// @vitest-environment node
// Golden + determinism tests for the F3 enum parser. Fixtures are synthetic, defanged,
// and machine-name-free. Asserts: SeImpersonate Disabled STILL fires; SID S-1-5-32-551
// matches in any locale; unrecognizedLines pass through verbatim; build/kernel parsing.
import { describe, it, expect } from 'vitest';
import { parseEnumOutput, parseBuildInfo, preprocess } from '@/engine/privilege-parser';
import type { PrivilegeSignal } from '@/types/advisor';

const SIGNALS: PrivilegeSignal[] = [
  { id: 'sig.win.seimpersonate', os: 'windows', source: 'whoami-priv', label: 'SeImpersonatePrivilege', match: { pattern: 'SeImpersonatePrivilege' }, severity: 'high', description: 'Impersonate a client after authentication.', confidence: 'verified' },
  { id: 'sig.win.sebackup', os: 'windows', source: 'whoami-priv', label: 'SeBackupPrivilege', match: { pattern: 'SeBackupPrivilege' }, severity: 'high', description: 'Back up files and directories.', confidence: 'verified' },
  { id: 'sig.win.backupoperators', os: 'windows', source: 'whoami-groups', label: 'Backup Operators', match: { pattern: 'S-1-5-32-551' }, sids: ['S-1-5-32-551'], severity: 'high', description: 'Backup Operators group.', confidence: 'verified' },
  { id: 'sig.linux.sudo_nopasswd', os: 'linux', source: 'sudo-l', label: 'sudo NOPASSWD', match: { pattern: 'NOPASSWD' }, severity: 'high', description: 'Passwordless sudo entry.', confidence: 'verified' },
  { id: 'sig.linux.cap_setuid', os: 'linux', source: 'getcap', label: 'cap_setuid', match: { pattern: 'cap_setuid' }, severity: 'high', description: 'setuid capability.', confidence: 'verified' },
  { id: 'sig.linux.docker', os: 'linux', source: 'id', label: 'docker group', match: { pattern: '\\bdocker\\b' }, severity: 'high', description: 'docker group membership.', confidence: 'verified' },
];

const WHOAMI_PRIV = [
  'PRIVILEGES INFORMATION',
  '----------------------',
  'Privilege Name                Description                                State',
  'SeImpersonatePrivilege        Impersonate a client after authentication  Disabled',
  'SeChangeNotifyPrivilege       Bypass traverse checking                   Enabled',
].join('\n');

const WHOAMI_GROUPS = [
  'GROUP INFORMATION',
  '-----------------',
  'Group Name                  Type   SID           Attributes',
  'BUILTIN\\Backup Operators    Alias  S-1-5-32-551  Mandatory group, Enabled by default, Enabled group',
].join('\n');

const SUDO_L = ['User u may run the following commands:', '    (root) NOPASSWD: /usr/bin/find'].join('\n');
const GETCAP = '/usr/bin/python3.8 = cap_setuid+ep';
const ID_OUT = 'uid=1000(u) gid=1000(u) groups=1000(u),998(docker)';
const SYSTEMINFO_2019 = ['OS Name:                   Microsoft Windows Server 2019 Standard', 'OS Version:                10.0.17763 N/A Build 17763'].join('\n');
const SYSTEMINFO_1803 = ['OS Name:                   Microsoft Windows 10 Pro', 'OS Version:                10.0.17134 N/A Build 17134'].join('\n');
const UNAME = 'Linux host 5.4.0-42-generic #46-Ubuntu SMP x86_64 GNU/Linux';

describe('privilege-parser — parseEnumOutput', () => {
  it('SeImpersonate Disabled STILL fires (state recorded for display only)', () => {
    const { matches } = parseEnumOutput(WHOAMI_PRIV, 'whoami-priv', SIGNALS);
    expect(matches.map((m) => m.signalId)).toEqual(['sig.win.seimpersonate']);
    expect(matches[0]?.state).toBe('disabled');
  });

  it('unrecognized lines pass through verbatim', () => {
    const { unrecognizedLines } = parseEnumOutput(WHOAMI_PRIV, 'whoami-priv', SIGNALS);
    expect(unrecognizedLines).toContain('SeChangeNotifyPrivilege       Bypass traverse checking                   Enabled');
    expect(unrecognizedLines).toContain('PRIVILEGES INFORMATION');
  });

  it('SID S-1-5-32-551 matches Backup Operators in any locale', () => {
    const { matches } = parseEnumOutput(WHOAMI_GROUPS, 'whoami-groups', SIGNALS);
    expect(matches.map((m) => m.signalId)).toEqual(['sig.win.backupoperators']);
    expect(matches[0]?.state).toBe('enabled');
  });

  it('linux sources: sudo NOPASSWD / getcap / id-docker', () => {
    expect(parseEnumOutput(SUDO_L, 'sudo-l', SIGNALS).matches.map((m) => m.signalId)).toEqual(['sig.linux.sudo_nopasswd']);
    expect(parseEnumOutput(GETCAP, 'getcap', SIGNALS).matches.map((m) => m.signalId)).toEqual(['sig.linux.cap_setuid']);
    expect(parseEnumOutput(ID_OUT, 'id', SIGNALS).matches.map((m) => m.signalId)).toEqual(['sig.linux.docker']);
  });

  it('per-source pool isolation: a win signal does not fire under a linux source', () => {
    expect(parseEnumOutput(WHOAMI_PRIV, 'sudo-l', SIGNALS).matches).toHaveLength(0);
  });

  it('whoami-all pools every source', () => {
    const { matches } = parseEnumOutput(WHOAMI_PRIV, 'whoami-all', SIGNALS);
    expect(matches.map((m) => m.signalId)).toEqual(['sig.win.seimpersonate']);
  });

  it('strips ANSI and is deterministic across two runs', () => {
    const colored = '\x1b[31mSeImpersonatePrivilege\x1b[0m   ...   Disabled';
    expect(preprocess(colored).lines[0]).toBe('SeImpersonatePrivilege ... Disabled');
    const a = JSON.stringify(parseEnumOutput(WHOAMI_PRIV, 'whoami-priv', SIGNALS));
    const b = JSON.stringify(parseEnumOutput(WHOAMI_PRIV, 'whoami-priv', SIGNALS));
    expect(a).toBe(b);
  });
});

describe('privilege-parser — parseBuildInfo', () => {
  it('parses Windows build numbers', () => {
    const a = parseBuildInfo(SYSTEMINFO_2019);
    expect(a.os).toBe('windows');
    expect(a.buildNumber).toBe(17763);
    expect(a.productName).toContain('Server 2019');
    expect(parseBuildInfo(SYSTEMINFO_1803).buildNumber).toBe(17134);
  });

  it('parses a Linux kernel string', () => {
    const k = parseBuildInfo(UNAME);
    expect(k.os).toBe('linux');
    expect(k.kernel).toBe('5.4.0-42-generic');
    expect(k.buildNumber).toBeUndefined();
  });
});
