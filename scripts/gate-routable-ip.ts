// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateRoutableIp, report } from './gates';
report('Gate 5 — routable-IP reject', gateRoutableIp());
