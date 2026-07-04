// @vitest-environment node
// Golden trace + determinism tests for the F5 decision walker. Fixture map mirrors a
// dec.win.tokenpriv shape (potato / hive / PowerUp-fallback subtrees). Frozen ordered
// node paths lock determinism; signalRef is proven equal to the F3 parser on one text.
import { describe, it, expect } from 'vitest';
import { walkDecision, signalMatchesText } from '@/engine/decision-walk';
import type { DecisionMap, ObservableSignal } from '@/types/decision';
import type { PrivilegeSignal } from '@/types/advisor';

const MAP: DecisionMap = {
  id: 'dec.win.tokenpriv',
  title: 'Windows token-privilege escalation',
  os: 'windows',
  phase: 'privilege-escalation',
  rootNodeId: 'whoami',
  nodes: [
    { id: 'whoami', kind: 'check', label: 'whoami /priv' },
    { id: 'potato', kind: 'action', label: 'PrintSpoofer/GodPotato' },
    { id: 'hive', kind: 'action', label: 'reg save SAM/SYSTEM → secretsdump' },
    { id: 'powerup', kind: 'action', label: 'PowerUp Invoke-AllChecks (fallback)' },
    { id: 'system', kind: 'outcome', label: 'SYSTEM', outcomeKind: 'system' },
  ],
  edges: [
    { id: 'e.imp', source: 'whoami', target: 'potato', condition: { kind: 'if-found', signalId: 'sig.win.seimpersonate' }, priority: 1 },
    { id: 'e.bak', source: 'whoami', target: 'hive', condition: { kind: 'if-found', signalId: 'sig.win.sebackup' }, priority: 2 },
    { id: 'e.else', source: 'whoami', target: 'powerup', condition: { kind: 'else' }, priority: 9 },
    { id: 'e.potato.sys', source: 'potato', target: 'system', condition: { kind: 'else' } },
    { id: 'e.hive.sys', source: 'hive', target: 'system', condition: { kind: 'else' } },
  ],
  packs: ['oscp'],
  confidence: 'verified',
};

function trace(start: string, observed: Set<string>): string[] {
  const path = [start];
  let cur = start;
  for (let guard = 0; guard < 50; guard++) {
    const stepR = walkDecision(MAP, cur, observed);
    if (!stepR) break;
    path.push(stepR.nextNodeId);
    cur = stepR.nextNodeId;
  }
  return path;
}

describe('decision-walk — golden traces', () => {
  it('SeImpersonate found → potato subtree → SYSTEM', () => {
    expect(trace('whoami', new Set(['sig.win.seimpersonate']))).toEqual(['whoami', 'potato', 'system']);
  });

  it('SeBackup found → hive subtree → SYSTEM', () => {
    expect(trace('whoami', new Set(['sig.win.sebackup']))).toEqual(['whoami', 'hive', 'system']);
  });

  it('nothing found → PowerUp fallback (else edge)', () => {
    expect(trace('whoami', new Set())).toEqual(['whoami', 'powerup']);
  });

  it('priority: SeImpersonate (p1) wins over SeBackup (p2) when both observed', () => {
    expect(trace('whoami', new Set(['sig.win.seimpersonate', 'sig.win.sebackup']))).toEqual([
      'whoami',
      'potato',
      'system',
    ]);
  });

  it('every non-outcome node yields a step; outcome node returns null', () => {
    expect(walkDecision(MAP, 'whoami', new Set())).not.toBeNull();
    expect(walkDecision(MAP, 'potato', new Set())).not.toBeNull();
    expect(walkDecision(MAP, 'hive', new Set())).not.toBeNull();
    expect(walkDecision(MAP, 'system', new Set())).toBeNull();
  });

  it('is deterministic across two runs', () => {
    const a = JSON.stringify(walkDecision(MAP, 'whoami', new Set(['sig.win.seimpersonate'])));
    const b = JSON.stringify(walkDecision(MAP, 'whoami', new Set(['sig.win.seimpersonate'])));
    expect(a).toBe(b);
  });
});

describe('decision-walk — signalMatchesText', () => {
  const priv: PrivilegeSignal = {
    id: 'sig.win.seimpersonate',
    os: 'windows',
    source: 'whoami-priv',
    label: 'SeImpersonate',
    match: { pattern: 'SeImpersonatePrivilege', flags: 'i' },
    severity: 'high',
    description: 'token impersonation',
    confidence: 'verified',
  };
  const text = 'SeImpersonatePrivilege            Enabled';

  it('contains / regex matchers', () => {
    const c: ObservableSignal = { id: 'o1', label: 'l', match: 'contains', value: 'seimpersonate' };
    const r: ObservableSignal = { id: 'o2', label: 'l', match: 'regex', value: 'Se\\w+Privilege' };
    expect(signalMatchesText(c, text, [])).toBe(true);
    expect(signalMatchesText(r, text, [])).toBe(true);
  });

  it('signalRef equals running the F3 priv-signal regex directly (DRY)', () => {
    const ref: ObservableSignal = { id: 'o3', label: 'l', match: 'signalRef', value: 'sig.win.seimpersonate' };
    const direct = new RegExp(priv.match.pattern, priv.match.flags ?? 'i').test(text);
    expect(signalMatchesText(ref, text, [priv])).toBe(direct);
    expect(signalMatchesText(ref, text, [priv])).toBe(true);
  });

  it('signalRef with no matching priv signal is false', () => {
    const ref: ObservableSignal = { id: 'o4', label: 'l', match: 'signalRef', value: 'sig.unknown' };
    expect(signalMatchesText(ref, text, [priv])).toBe(false);
  });
});
