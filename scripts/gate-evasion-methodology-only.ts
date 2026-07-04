// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateEvasionMethodologyOnly, report } from './gates';
report('gate-evasion-methodology-only — no working bypass payload on any `evasion`-tagged node', gateEvasionMethodologyOnly());
