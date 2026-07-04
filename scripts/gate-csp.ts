// Auto-thin wrapper — runs one SHIP-BLOCKING gate (see scripts/gates.ts).
import { gateCsp, report } from './gates';
report("G18 csp — index.html ships a strict offline CSP (default/connect/script 'self', object/base none)", gateCsp());
