// src/engine/privilege-advisor.ts — F3 deterministic rules engine (v2).
// PURE: a rule fires iff ALL whenSignals are present AND buildGate brackets the build;
// sort by rank then id. Each recommendation cites the exact SignalMatch.rawLine that
// triggered it. commandIds render via the FROZEN TemplateEngine at the view layer —
// the advisor never builds command strings. Adapted verbatim from CODE-PROMPT-v2 §6.3.
import type { PrivilegeRule, SignalMatch, AdvisorRecommendation, ParsedBuildInfo } from '@/types/advisor';

export function advise(
  matches: SignalMatch[],
  rules: PrivilegeRule[],
  build?: ParsedBuildInfo,
): AdvisorRecommendation[] {
  const present = new Set(matches.map((m) => m.signalId));
  const fired: AdvisorRecommendation[] = [];
  for (const r of rules) {
    if (!r.whenSignals.every((s) => present.has(s))) continue; // ALL present (AND)
    if (r.buildGate) {
      const b = build?.buildNumber;
      if (r.buildGate.minBuild != null && (b == null || b < r.buildGate.minBuild)) continue;
      if (r.buildGate.maxBuild != null && (b == null || b > r.buildGate.maxBuild)) continue;
    }
    const triggeredBy = matches.filter((m) => r.whenSignals.includes(m.signalId));
    fired.push({ rule: r, triggeredBy, unverified: r.confidence === 'unverified' });
  }
  return fired.sort((a, b) => a.rule.rank - b.rule.rank || a.rule.id.localeCompare(b.rule.id));
}
