// @vitest-environment node
// Golden + determinism tests for the F8 triage tail: autofill, cveHandoff, triageNmap.
// Fixtures use RFC5737 198.51.100.x + example.lab (NO machine names). Reuses the real
// route + cve datasets.
import { describe, it, expect } from 'vitest';
import { proposeAutofill } from '@/engine/nmap/autofill';
import { buildCveHandoff } from '@/engine/nmap/cveHandoff';
import { triageNmap } from '@/engine/nmap';
import { NMAP_ROUTES } from '@/data/v2/nmapRoutes';
import { CVE_ENTRIES } from '@/data/v2/cve';
import type { NmapHost, NmapPort, RealmInference } from '@/types/nmap';

const realm = (os: RealmInference['os'], confidence: RealmInference['confidence'] = 'verified'): RealmInference => ({
  os,
  confidence,
  scores: { linux: 0, windows: 0, ad: 0 },
  evidence: [],
});

describe('nmap autofill — proposeAutofill', () => {
  const host: NmapHost = { ip: '198.51.100.10', hostname: 'dc.example.lab', ports: [] };

  it('proposes RHOST/TARGET from the host ip', () => {
    const ps = proposeAutofill(host, realm('linux'), {});
    expect(ps.find((p) => p.varId === 'RHOST')?.value).toBe('198.51.100.10');
    expect(ps.find((p) => p.varId === 'TARGET')?.value).toBe('198.51.100.10');
    expect(ps.every((p) => !p.conflictsWithUserValue)).toBe(true);
  });

  it('never overwrites a user-set RHOST (proposed but display-only)', () => {
    const ps = proposeAutofill(host, realm('linux'), { RHOST: '192.0.2.5' });
    const rhost = ps.find((p) => p.varId === 'RHOST');
    expect(rhost?.value).toBe('198.51.100.10'); // still proposed
    expect(rhost?.conflictsWithUserValue).toBe(true); // but Apply disabled
  });

  it('AD realm + hostname ⇒ DOMAIN + FQDN TARGET', () => {
    const ps = proposeAutofill(host, realm('ad'), {});
    expect(ps.find((p) => p.varId === 'DOMAIN')?.value).toBe('example.lab');
    expect(ps.some((p) => p.varId === 'TARGET' && p.value === 'dc.example.lab')).toBe(true);
  });

  it('NEVER proposes a sensitive var', () => {
    const ps = proposeAutofill(host, realm('ad'), { PASS: 'x', NTHASH: 'y', AESKEY: 'z' });
    expect(ps.some((p) => ['PASS', 'NTHASH', 'AESKEY'].includes(p.varId))).toBe(false);
  });
});

describe('nmap cveHandoff — buildCveHandoff', () => {
  it('no -sV version ⇒ no handoff', () => {
    const port: NmapPort = { port: 80, proto: 'tcp', state: 'open', service: 'http', product: 'Apache httpd' };
    expect(buildCveHandoff(port, CVE_ENTRIES)).toBeNull();
  });

  it('product + version ⇒ entryIds populated', () => {
    const port: NmapPort = { port: 80, proto: 'tcp', state: 'open', service: 'http', product: 'Apache httpd', version: '2.4.49' };
    const h = buildCveHandoff(port, CVE_ENTRIES);
    expect(h).not.toBeNull();
    expect(h?.entryIds).toContain('cve.apache.2449.traversal');
    expect(h?.query.version).toBe('2.4.49');
  });
});

describe('nmap triageNmap — orchestrator', () => {
  const RAW = [
    'Nmap scan report for example.lab (198.51.100.10)',
    '80/tcp  open http         Apache httpd 2.4.49',
    '445/tcp open microsoft-ds Samba smbd 4.6.2',
  ].join('\n');

  it('assembles parse → realm → port firings/cve → autofill; themeSwitch.autoApplied is literally false', () => {
    const r = triageNmap(RAW, { routes: NMAP_ROUTES, cveEntries: CVE_ENTRIES });
    expect(r.parse.format).toBe('human');
    expect(r.hosts[0]?.realm.os).toBe('linux'); // Samba override
    expect(r.themeSwitch?.autoApplied).toBe(false);
    expect(r.themeSwitch?.proposedOs).toBe('linux');
    const web = r.hosts[0]?.ports.find((p) => p.port.port === 80);
    expect(web?.cve?.entryIds).toContain('cve.apache.2449.traversal');
    expect(r.hosts[0]?.autofill.find((a) => a.varId === 'RHOST')?.value).toBe('198.51.100.10');
  });

  it('is deterministic across two runs (parsedAt fixed by injected clock)', () => {
    const a = JSON.stringify(triageNmap(RAW, { routes: NMAP_ROUTES, cveEntries: CVE_ENTRIES }));
    const b = JSON.stringify(triageNmap(RAW, { routes: NMAP_ROUTES, cveEntries: CVE_ENTRIES }));
    expect(a).toBe(b);
  });
});
