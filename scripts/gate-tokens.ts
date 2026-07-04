// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateTokens, report } from './gates';
report('Gate 12 — token-key completeness', gateTokens());
