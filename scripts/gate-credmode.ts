// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateCredmode, report } from './gates';
report('Gate 7 — credMode variant completeness', gateCredmode());
