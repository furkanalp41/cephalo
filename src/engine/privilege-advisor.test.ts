// @vitest-environment node
// Golden + determinism tests for the F3 rules engine. Build-gated potato selection:
// 17763→PrintSpoofer (verified), 17134→JuicyPotato ([UNVERIFIED]+refs). Each rec cites
// the exact triggering rawLine. Fixtures are synthetic, defanged, machine-name-free.
import { describe, it, expect } from 'vitest';
import { advise } from '@/engine/privilege-advisor';
import { parseEnumOutput } from '@/engine/privilege-parser';
import type { PrivilegeSignal, PrivilegeRule, SignalMatch } from '@/types/advisor';

const SIGNALS: PrivilegeSignal[] = [
  { id: 'sig.win.seimpersonate', os: 'windows', source: 'whoami-priv', label: 'SeImpersonatePrivilege', match: { pattern: 'SeImpersonatePrivilege' }, severity: 'high', description: 'token impersonation', confidence: 'verified' },
];
const WHOAMI_PRIV = [
  'Privilege Name                Description                                State',
  'SeImpersonatePrivilege        Impersonate a client after authentication  Disabled',
].join('\n');

const RULES: PrivilegeRule[] = [
  { id: 'rule.win.seimpersonate.printspoofer', os: 'windows', whenSignals: ['sig.win.seimpersonate'], buildGate: { minBuild: 17763 }, recommendsTechniqueId: 'win.privesc.token', commandId: 'win.privesc.token.printspoofer', toolBinaryId: 'tool.printspoofer', rank: 1, rationale: 'Recent build → PrintSpoofer to SYSTEM.', confidence: 'verified' },
  { id: 'rule.win.seimpersonate.juicypotato', os: 'windows', whenSignals: ['sig.win.seimpersonate'], buildGate: { maxBuild: 17134 }, recommendsTechniqueId: 'win.privesc.token', toolBinaryId: 'tool.juicypotato', rank: 2, rationale: 'Older build → JuicyPotato.', unverifiedReason: 'CLSID availability is build-gated and not machine-verifiable.', confidence: 'unverified', references: ['ref.lolbas'] },
  { id: 'rule.linux.sudo.gtfobins', os: 'linux', whenSignals: ['sig.linux.sudo_nopasswd'], recommendsTechniqueId: 'linux.privesc.sudo', rank: 1, rationale: 'NOPASSWD → GTFOBins.', confidence: 'verified' },
];

describe('privilege-advisor — advise()', () => {
  const { matches } = parseEnumOutput(WHOAMI_PRIV, 'whoami-priv', SIGNALS);

  it('build 17763 → PrintSpoofer (verified), cites the exact rawLine', () => {
    const recs = advise(matches, RULES, { os: 'windows', buildNumber: 17763 });
    expect(recs.map((r) => r.rule.id)).toEqual(['rule.win.seimpersonate.printspoofer']);
    expect(recs[0]?.unverified).toBe(false);
    expect(recs[0]?.triggeredBy[0]?.rawLine).toContain('SeImpersonatePrivilege');
    expect(recs[0]?.triggeredBy[0]?.rawLine).toContain('Disabled');
  });

  it('build 17134 → JuicyPotato ([UNVERIFIED] with refs)', () => {
    const recs = advise(matches, RULES, { os: 'windows', buildNumber: 17134 });
    expect(recs.map((r) => r.rule.id)).toEqual(['rule.win.seimpersonate.juicypotato']);
    expect(recs[0]?.unverified).toBe(true);
    expect(recs[0]?.rule.references).toContain('ref.lolbas');
  });

  it('no build → both build-gated rules are excluded', () => {
    expect(advise(matches, RULES)).toEqual([]);
  });

  it('a rule fires only when ALL whenSignals are present (AND)', () => {
    const andRule: PrivilegeRule[] = [
      { id: 'rule.and', os: 'windows', whenSignals: ['sig.a', 'sig.b'], recommendsTechniqueId: 't', rank: 1, rationale: 'x', confidence: 'verified' },
    ];
    const onlyA: SignalMatch[] = [{ signalId: 'sig.a', source: 'whoami-priv', rawLine: 'a' }];
    const bothAB: SignalMatch[] = [
      { signalId: 'sig.a', source: 'whoami-priv', rawLine: 'a' },
      { signalId: 'sig.b', source: 'whoami-priv', rawLine: 'b' },
    ];
    expect(advise(onlyA, andRule)).toEqual([]);
    expect(advise(bothAB, andRule).map((r) => r.rule.id)).toEqual(['rule.and']);
  });

  it('sorts by rank then id', () => {
    const m: SignalMatch[] = [{ signalId: 'sig.x', source: 'whoami-priv', rawLine: 'x' }];
    const rules: PrivilegeRule[] = [
      { id: 'rule.b', os: 'windows', whenSignals: ['sig.x'], recommendsTechniqueId: 't', rank: 1, rationale: 'x', confidence: 'verified' },
      { id: 'rule.a', os: 'windows', whenSignals: ['sig.x'], recommendsTechniqueId: 't', rank: 1, rationale: 'x', confidence: 'verified' },
      { id: 'rule.c', os: 'windows', whenSignals: ['sig.x'], recommendsTechniqueId: 't', rank: 0, rationale: 'x', confidence: 'verified' },
    ];
    expect(advise(m, rules).map((r) => r.rule.id)).toEqual(['rule.c', 'rule.a', 'rule.b']);
  });

  it('is deterministic across two runs', () => {
    const a = JSON.stringify(advise(matches, RULES, { os: 'windows', buildNumber: 17763 }));
    const b = JSON.stringify(advise(matches, RULES, { os: 'windows', buildNumber: 17763 }));
    expect(a).toBe(b);
  });
});
