// src/engine/nmap/router.ts — F8 service router. PURE: fires ServiceRoute[] against a
// host's ports with precedence product > service > portService > port; de-dupes technique
// ids; sorts severity → specificity → port → id (final tiebreak). explain() names the
// matched rule. No clock, no random, no network. CODE-PROMPT-v2 §6.6.
import type { NmapHost, NmapPort, ServiceRoute, RouteFiring } from '@/types/nmap';
import type { Severity } from '@/types/content';

const SEV_RANK: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
const SPEC_RANK: Record<RouteFiring['matchedOn'], number> = { product: 0, service: 1, portService: 2, port: 3 };

function matchRoute(route: ServiceRoute, port: NmapPort): { matchedOn: RouteFiring['matchedOn']; matchedText: string } | null {
  const m = route.match;
  if (m.by === 'product') {
    const hay = port.product ?? port.banner ?? '';
    if (hay && new RegExp(m.productRegex, 'i').test(hay)) return { matchedOn: 'product', matchedText: hay };
    return null;
  }
  if (m.by === 'service') {
    const hay = port.service ?? '';
    if (hay && new RegExp(m.serviceRegex, 'i').test(hay)) return { matchedOn: 'service', matchedText: hay };
    return null;
  }
  if (m.by === 'portService') {
    if (port.port === m.port && port.service && new RegExp(m.serviceRegex, 'i').test(port.service))
      return { matchedOn: 'portService', matchedText: `${port.port}/${port.service}` };
    return null;
  }
  // by 'port'
  if (port.port === m.port && (m.proto == null || m.proto === port.proto))
    return { matchedOn: 'port', matchedText: `${port.port}/${port.proto}` };
  return null;
}

function sortFirings(a: RouteFiring, b: RouteFiring): number {
  return (
    SEV_RANK[a.severity] - SEV_RANK[b.severity] ||
    SPEC_RANK[a.matchedOn] - SPEC_RANK[b.matchedOn] ||
    a.port - b.port ||
    a.route.id.localeCompare(b.route.id)
  );
}

export function route(host: NmapHost, routes: ServiceRoute[]): RouteFiring[] {
  const firings: RouteFiring[] = [];
  const hostKey = host.ip ?? host.hostname ?? '';
  for (const port of host.ports) {
    for (const r of routes) {
      const hit = matchRoute(r, port);
      if (!hit) continue;
      firings.push({
        route: r,
        host: hostKey,
        port: port.port,
        proto: port.proto,
        matchedOn: hit.matchedOn,
        matchedText: hit.matchedText,
        techniqueIds: [...new Set(r.techniqueIds)],
        severity: r.severity,
      });
    }
  }
  return firings.sort(sortFirings);
}

export function explain(f: RouteFiring): string {
  const how =
    f.matchedOn === 'product'
      ? `product banner "${f.matchedText}"`
      : f.matchedOn === 'service'
        ? `service "${f.matchedText}"`
        : f.matchedOn === 'portService'
          ? `port+service ${f.matchedText}`
          : `port ${f.matchedText}`;
  return `${f.route.label} (${f.severity}) fired on ${how} → ${f.techniqueIds.join(', ')}`;
}
