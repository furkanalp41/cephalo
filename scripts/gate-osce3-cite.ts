// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateOsce3Cite, report } from './gates';
report('gate-osce3-cite — every OSCE3 node carries ref.osce3.joas + ≥1 primary source', gateOsce3Cite());
