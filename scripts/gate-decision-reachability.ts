// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateDecisionReachability, report } from './gates';
report('decision-reachability — roots/edges/observes/fallbacks/outcomes + FK resolution', gateDecisionReachability());
