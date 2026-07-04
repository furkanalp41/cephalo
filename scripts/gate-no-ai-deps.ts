// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateNoAiDeps, report } from './gates';
report('G16 no-ai-deps — no AI/ML/inference or network/telemetry dependency', gateNoAiDeps());
