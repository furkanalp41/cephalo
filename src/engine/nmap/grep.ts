// src/engine/nmap/grep.ts — F8 greppable (-oG) nmap parser. Splits `Host:`/`Ports:`
// fields; each port entry is port/state/proto/owner/service/rpc/version. Multi-host
// (merges by ip). PURE, never throws. CODE-PROMPT-v2 §6.6.
import type { NmapHost, NmapPort } from '@/types/nmap';
import { normState, asTransport, splitProductVersion } from './util';

export function parseGrep(raw: string, warnings: string[]): NmapHost[] {
  const hosts: NmapHost[] = [];
  const byIp = new Map<string, NmapHost>();

  for (const line of raw.split(/\r?\n/)) {
    if (!line.startsWith('Host:')) continue;
    const head = /^Host:\s+(\S+)(?:\s+\(([^)]*)\))?/.exec(line);
    const ip = head?.[1];
    if (!ip) continue;
    const hostname = head?.[2];
    let host = byIp.get(ip);
    if (!host) {
      host = { ports: [] };
      host.ip = ip;
      if (hostname) host.hostname = hostname;
      byIp.set(ip, host);
      hosts.push(host);
    } else if (hostname && !host.hostname) {
      host.hostname = hostname;
    }

    const portsM = /Ports:\s+([^\t]+)/.exec(line);
    const portsField = portsM?.[1];
    if (!portsField) continue;
    for (const entry of portsField.split(',')) {
      const f = entry.trim().split('/');
      const portStr = f[0];
      const stateStr = f[1];
      const protoStr = f[2];
      if (!portStr || !stateStr || !protoStr) continue;
      const np: NmapPort = { port: Number(portStr), proto: asTransport(protoStr), state: normState(stateStr) };
      const service = f[4];
      if (service) np.service = service;
      const versionBlob = f[6];
      if (versionBlob) {
        np.banner = versionBlob;
        const pv = splitProductVersion(versionBlob);
        if (pv.product) np.product = pv.product;
        if (pv.version) np.version = pv.version;
      }
      host.ports.push(np);
    }
  }
  if (hosts.length === 0) warnings.push('grep parser: no "Host:" lines found.');
  return hosts;
}
