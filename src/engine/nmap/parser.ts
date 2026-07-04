// src/engine/nmap/parser.ts — F8 parse orchestrator + format detection. The clock is
// INJECTED (no ambient Date.now — G21); the default is a fixed epoch so tests are
// deterministic. parsedAt is COSMETIC and EXCLUDED from test equality. Keeps only
// open + open|filtered ports. PURE, never throws. CODE-PROMPT-v2 §6.6.
import type { NmapParseResult, NmapInputFormat, NmapHost } from '@/types/nmap';
import { parseHuman } from './human';
import { parseGrep } from './grep';
import { parseXml } from './xml';

export function detectFormat(raw: string): NmapInputFormat {
  if (/<nmaprun[\s>]/.test(raw)) return 'xml';
  if (/^(# Nmap|Host:\s)/m.test(raw) && /Ports:/.test(raw)) return 'grep';
  if (/\bPORT\b|\/tcp\b|\/udp\b|Nmap scan report/.test(raw)) return 'human';
  return 'unknown';
}

export function parse(raw: string, now: () => string = () => '1970-01-01T00:00:00.000Z'): NmapParseResult {
  const warnings: string[] = [];
  const format = detectFormat(raw);
  let hosts: NmapHost[] = [];
  try {
    if (format === 'xml') hosts = parseXml(raw, warnings);
    else if (format === 'grep') hosts = parseGrep(raw, warnings);
    else if (format === 'human') hosts = parseHuman(raw, warnings);
    else warnings.push('Unrecognized nmap format; nothing parsed.');
  } catch (e) {
    warnings.push(`Parser degraded: ${(e as Error).message}`);
  }
  // keep only actionable ports (open + open|filtered)
  hosts = hosts.map((h) => ({ ...h, ports: h.ports.filter((p) => p.state === 'open' || p.state === 'open|filtered') }));
  return { format, hosts, warnings, rawLineCount: raw.split('\n').length, parsedAt: now() };
}
