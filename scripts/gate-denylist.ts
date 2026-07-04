// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateDenylist, report } from './gates';
report('Gate 10 — no-machine-names denylist', gateDenylist());
