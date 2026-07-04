// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateOverlap, report } from './gates';
report('Gate 8 — prose overlap guard', gateOverlap());
