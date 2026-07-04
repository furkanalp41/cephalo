// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateUnverifiedRefs, report } from './gates';
report('Gate 3 — unverified requires references', gateUnverifiedRefs());
