// src/engine/nmap/index.ts — F8 triage orchestrator + barrel. PURE: parse → per-host
// {realm, port firings + technique ids + cve handoff, autofill} → NmapTriageResult. The
// theme switch is PROPOSED only (autoApplied is literally false; the human confirms).
// Clock is INJECTED. No random, no network. CODE-PROMPT-v2 §6.6.
import type { NmapTriageResult, HostTriage, PortTriage, ServiceRoute } from '@/types/nmap';
import type { CveExploitEntry } from '@/types/cve';
import { parse } from './parser';
import { route } from './router';
import { inferRealm } from './realm';
import { proposeAutofill } from './autofill';
import { buildCveHandoff } from './cveHandoff';

export { parse, detectFormat } from './parser';
export { route, explain } from './router';
export { inferRealm } from './realm';
export { proposeAutofill } from './autofill';
export { buildCveHandoff } from './cveHandoff';

export interface NmapTriageDeps {
  routes: ServiceRoute[];
  cveEntries: CveExploitEntry[];
  userValues?: Record<string, string>;
}

export function triageNmap(
  raw: string,
  deps: NmapTriageDeps,
  now: () => string = () => '1970-01-01T00:00:00.000Z',
): NmapTriageResult {
  const parseResult = parse(raw, now);
  const userValues = deps.userValues ?? {};

  const hosts: HostTriage[] = parseResult.hosts.map((host) => {
    const realm = inferRealm(host, deps.routes);
    const firingsAll = route(host, deps.routes);
    const ports: PortTriage[] = host.ports.map((p) => {
      const firings = firingsAll.filter((f) => f.port === p.port && f.proto === p.proto);
      const techniqueIds = [...new Set(firings.flatMap((f) => f.techniqueIds))];
      const cve = buildCveHandoff(p, deps.cveEntries);
      const pt: PortTriage = { port: p, firings, techniqueIds };
      if (cve) pt.cve = cve;
      return pt;
    });
    const autofill = proposeAutofill(host, realm, userValues);
    return { host, realm, ports, autofill };
  });

  const result: NmapTriageResult = { parse: parseResult, hosts, warnings: parseResult.warnings };
  const firstHost = hosts[0];
  if (firstHost) {
    result.themeSwitch = {
      proposedOs: firstHost.realm.os,
      reason: `Inferred ${firstHost.realm.os} realm (${firstHost.realm.confidence}). Confirm to apply the skin.`,
      autoApplied: false,
    };
  }
  return result;
}
