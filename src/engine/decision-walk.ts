// src/engine/decision-walk.ts — F5 deterministic decision-tree walker (v2).
// PURE: pick the edge whose condition matches the observed signal set, else the
// `else` fallback. Never auto-runs anything; the view highlights matches and the
// human clicks the branch. `signalRef` reuses an F3 PrivilegeSignal so the
// "if output contains X" matcher is authored ONCE. No clock, no random, no network.
// Adapted verbatim from CODE-PROMPT-v2 §6.5.
import type { DecisionMap, DecisionEdge, DecisionStep, ObservableSignal } from '@/types/decision';
import type { PrivilegeSignal } from '@/types/advisor';

export function signalMatchesText(
  sig: ObservableSignal,
  text: string,
  privSignals: PrivilegeSignal[],
): boolean {
  const hay = (sig.caseInsensitive ?? true) ? text.toLowerCase() : text;
  if (sig.match === 'contains') {
    const needle = (sig.caseInsensitive ?? true) ? sig.value.toLowerCase() : sig.value;
    return hay.includes(needle.trim());
  }
  if (sig.match === 'regex') return new RegExp(sig.value, (sig.caseInsensitive ?? true) ? 'i' : '').test(text);
  // 'signalRef' ⇒ value is a PrivilegeSignal.id — DRY spine: F3 and F5 cannot disagree.
  const ps = privSignals.find((s) => s.id === sig.value);
  return ps ? new RegExp(ps.match.pattern, ps.match.flags ?? 'i').test(text) : false;
}

export function walkDecision(map: DecisionMap, nodeId: string, observed: Set<string>): DecisionStep | null {
  const outgoing = map.edges
    .filter((e) => e.source === nodeId)
    .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100) || a.id.localeCompare(b.id));
  // 1) if-found whose signal is observed; 2) if-absent whose signal is NOT observed; 3) else.
  for (const e of outgoing) {
    if (e.condition.kind === 'if-found' && observed.has(e.condition.signalId)) return step(nodeId, e);
  }
  for (const e of outgoing) {
    if (e.condition.kind === 'if-absent' && !observed.has(e.condition.signalId)) return step(nodeId, e);
  }
  const fallback = outgoing.find((e) => e.condition.kind === 'else');
  return fallback ? step(nodeId, fallback) : null; // outcome nodes legitimately return null
}

function step(fromNodeId: string, e: DecisionEdge): DecisionStep {
  return { fromNodeId, chosenEdge: e, nextNodeId: e.target };
}
