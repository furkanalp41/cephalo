// src/engine/nmap/xml.ts — F8 dep-free XML (-oX) parser (regex over <host>/<port>/
// <service>). No XML/DOM dependency, no network. PURE, never throws. CODE-PROMPT-v2 §6.6.
import type { NmapHost, NmapPort } from '@/types/nmap';
import { normState, asTransport } from './util';

const PORT_RE = /<port\s+protocol="(tcp|udp|sctp)"\s+portid="(\d+)">([\s\S]*?)<\/port>/g;

export function parseXml(raw: string, warnings: string[]): NmapHost[] {
  const hosts: NmapHost[] = [];
  const hostBlocks = raw.match(/<host\b[\s\S]*?<\/host>/g) ?? [];

  for (const block of hostBlocks) {
    const host: NmapHost = { ports: [] };
    const ip =
      /<address\s+addr="([^"]+)"\s+addrtype="ipv4"/.exec(block)?.[1] ?? /<address\s+addr="([^"]+)"/.exec(block)?.[1];
    const hostname = /<hostname\s+name="([^"]+)"/.exec(block)?.[1];
    const statusState = /<status\s+state="([^"]+)"/.exec(block)?.[1];
    if (ip) host.ip = ip;
    if (hostname) host.hostname = hostname;
    if (statusState === 'up' || statusState === 'down') host.status = statusState;

    for (const pm of block.matchAll(PORT_RE)) {
      const proto = asTransport(pm[1] ?? 'tcp');
      const port = Number(pm[2] ?? 0);
      const inner = pm[3] ?? '';
      const np: NmapPort = { port, proto, state: normState(/<state\s+state="([^"]+)"/.exec(inner)?.[1] ?? 'filtered') };
      const svc = /<service\s+([^>]*?)\/?>/.exec(inner)?.[1] ?? '';
      const name = /name="([^"]+)"/.exec(svc)?.[1];
      const product = /product="([^"]+)"/.exec(svc)?.[1];
      const version = /version="([^"]+)"/.exec(svc)?.[1];
      if (name) np.service = name;
      if (product) {
        np.product = product;
        np.banner = version ? `${product} ${version}` : product;
      }
      if (version) np.version = version;
      host.ports.push(np);
    }
    hosts.push(host);
  }
  if (hosts.length === 0) warnings.push('xml parser: no <host> blocks found.');
  return hosts;
}
