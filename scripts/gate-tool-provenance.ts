// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateToolProvenance, report } from './gates';
report('tool-provenance — ToolBinary link-only (officialRef + fetchNote, no binaryUrl/blob)', gateToolProvenance());
