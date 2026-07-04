// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateNmapRouteCoverage, report } from './gates';
report('nmap-route-coverage — every catalog port has a route; route techniqueIds resolve', gateNmapRouteCoverage());
