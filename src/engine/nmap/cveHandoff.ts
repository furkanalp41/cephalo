// src/engine/nmap/cveHandoff.ts — F8 → F6 hand-off. PURE: only when a port carries a -sV
// version do we match its product+version against the curated CVE dataset (reusing the F6
// lookupCve matcher) → entryIds. Loose/range matches flag unverified. No version ⇒ no
// handoff (never guess). No clock, no random, no network. §6.6.
import type { NmapPort, CveHandoff } from '@/types/nmap';
import type { CveExploitEntry } from '@/types/cve';
import { lookupCve } from '@/engine/cve-lookup';

export function buildCveHandoff(port: NmapPort, cveEntries: CveExploitEntry[]): CveHandoff | null {
  if (!port.version) return null; // no -sV version → no handoff
  const product = port.product ?? port.service ?? '';
  if (!product) return null;
  const matches = lookupCve(product, port.version, cveEntries);
  if (matches.length === 0) return null;
  const query: CveHandoff['query'] = { port: port.port };
  if (port.product) query.product = port.product;
  if (port.version) query.version = port.version;
  if (port.service) query.service = port.service;
  return {
    query,
    entryIds: matches.map((m) => m.entry.id),
    unverified: matches.some((m) => m.unverified),
  };
}
