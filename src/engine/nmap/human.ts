// src/engine/nmap/human.ts — F8 human-readable nmap parser. Multi-host, ANSI/noise-
// tolerant, never throws (degrades into warnings[]). PURE. CODE-PROMPT-v2 §6.6.
import type { NmapHost, NmapPort } from '@/types/nmap';
import { ANSI, normState, asTransport, splitProductVersion } from './util';

const PORT_RE = /^(\d+)\/(tcp|udp|sctp)\s+(\S+)\s+(\S+)\s*(.*)$/;
const HOST_RE = /Nmap scan report for\s+(?:([^\s()]+)\s+\(([\d.]+)\)|([\d.]+))/;

export function parseHuman(raw: string, warnings: string[]): NmapHost[] {
  const lines = raw.replace(ANSI, '').split(/\r?\n/);
  const hosts: NmapHost[] = [];
  let current: NmapHost | null = null;

  for (const line of lines) {
    const hostM = HOST_RE.exec(line);
    if (hostM) {
      if (current) hosts.push(current);
      current = { ports: [] };
      const hostname = hostM[1];
      const ip = hostM[2] ?? hostM[3];
      if (ip) current.ip = ip;
      if (hostname) current.hostname = hostname;
      continue;
    }
    const m = PORT_RE.exec(line.trim());
    if (!m || !current) continue;
    const port = Number(m[1] ?? 0);
    const proto = asTransport(m[2] ?? 'tcp');
    const state = normState(m[3] ?? '');
    const service = m[4] ?? '';
    const rest = (m[5] ?? '').trim();
    const np: NmapPort = { port, proto, state };
    if (service && service !== 'unknown') np.service = service;
    if (rest) {
      np.banner = rest;
      const pv = splitProductVersion(rest);
      if (pv.product) np.product = pv.product;
      if (pv.version) np.version = pv.version;
    }
    current.ports.push(np);
  }
  if (current) hosts.push(current);
  if (hosts.length === 0) warnings.push('human parser: no "Nmap scan report for" host found.');
  return hosts;
}
