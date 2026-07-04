// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateSideTable, report } from './gates';
report('Gate 9 — search side-table integrity', gateSideTable());
