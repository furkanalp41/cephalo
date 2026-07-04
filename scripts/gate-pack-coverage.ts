// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gatePackCoverage, report } from './gates';
report('gate-pack-coverage — every osce3 coverage id → technique + right pack + compiling command/reference', gatePackCoverage());
