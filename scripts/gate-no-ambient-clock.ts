// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateNoAmbientClock, report } from './gates';
report('G21 no-ambient-clock — no Date.now/new Date/Math.random in engine+store logic', gateNoAmbientClock());
