// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateFabrication, report } from './gates';
report('Gate 4 — hard-fact (anti-fabrication)', gateFabrication());
