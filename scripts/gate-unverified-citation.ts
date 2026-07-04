// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateUnverifiedCitation, report } from './gates';
report('G20 unverified-citation — every unverified v2 record carries resolving references[]', gateUnverifiedCitation());
