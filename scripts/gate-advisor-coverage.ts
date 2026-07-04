// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateAdvisorCoverage, report } from './gates';
report('advisor-coverage — every signal→rule; rule FKs resolve; unverified carries refs', gateAdvisorCoverage());
