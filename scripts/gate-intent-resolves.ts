// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateIntentResolves, report } from './gates';
report('intent-resolves — every alias/phrase FK targets a live id', gateIntentResolves());
