// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateCoverage, report } from './gates';
report('Gate 13 — coverage + completeness', gateCoverage());
