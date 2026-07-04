// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateNoRuntimeNet, report } from './gates';
report('G17 no-runtime-net — no third-party fetch/XHR/WebSocket/EventSource/beacon at runtime', gateNoRuntimeNet());
