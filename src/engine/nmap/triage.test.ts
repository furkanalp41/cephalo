// @vitest-environment node
// Golden + determinism tests for the F8 router + realm inference, run against the REAL
// shipped route dataset (src/data/v2/nmapRoutes.ts). Fixtures use RFC5737 198.51.100.x
// (NO machine names). Realm matrix per CODE-PROMPT-v2 §6.6.
import { describe, it, expect } from 'vitest';
import { route, explain } from '@/engine/nmap/router';
import { inferRealm } from '@/engine/nmap/realm';
import { NMAP_ROUTES } from '@/data/v2/nmapRoutes';
import type { NmapHost, NmapPort } from '@/types/nmap';

const p = (port: number, opts: Partial<NmapPort> = {}): NmapPort => ({ port, proto: 'tcp', state: 'open', ...opts });
const host = (ports: NmapPort[]): NmapHost => ({ ip: '198.51.100.10', ports });

describe('nmap router — route() + explain()', () => {
  it('fires the SMB route on 445', () => {
    const f = route(host([p(445)]), NMAP_ROUTES);
    expect(f.some((x) => x.route.id === 'route.smb')).toBe(true);
    expect(f[0]?.techniqueIds).toContain('ad.enum.smb');
  });

  it('product precedence: a Samba banner on 445 sorts route.smb.samba before route.smb', () => {
    const f = route(host([p(445, { service: 'netbios-ssn', product: 'Samba smbd 4.6.2', banner: 'Samba smbd 4.6.2' })]), NMAP_ROUTES);
    const ids = f.filter((x) => x.port === 445).map((x) => x.route.id);
    expect(ids[0]).toBe('route.smb.samba'); // product (high) before port (high)
    expect(ids).toContain('route.smb');
  });

  it('explain() names the matched rule + techniques', () => {
    const f = route(host([p(88)]), NMAP_ROUTES);
    const k = f.find((x) => x.route.id === 'route.kerberos');
    expect(k && explain(k)).toMatch(/Kerberos.*port 88\/tcp.*ad\.enum\.kerbrute/);
  });

  it('is deterministic across two runs', () => {
    const a = JSON.stringify(route(host([p(445), p(389)]), NMAP_ROUTES));
    const b = JSON.stringify(route(host([p(445), p(389)]), NMAP_ROUTES));
    expect(a).toBe(b);
  });
});

describe('nmap realm — inferRealm() matrix', () => {
  const realm = (ports: NmapPort[]) => inferRealm(host(ports), NMAP_ROUTES).os;

  it('88 ⇒ ad (kerberos AD-gate)', () => {
    const r = inferRealm(host([p(88)]), NMAP_ROUTES);
    expect(r.os).toBe('ad');
    expect(r.confidence).toBe('verified');
  });

  it('389/636/3268 + 445 ⇒ ad (ldap+smb AD-gate)', () => {
    expect(realm([p(389), p(636), p(3268), p(445)])).toBe('ad');
  });

  it('445 + 3389 + 5985 ⇒ windows (no AD-gate → ad folds into windows)', () => {
    const r = inferRealm(host([p(445), p(3389), p(5985)]), NMAP_ROUTES);
    expect(r.os).toBe('windows');
    expect(r.confidence).toBe('verified');
  });

  it('22 + 111 + 2049 ⇒ linux (nix category counted once)', () => {
    expect(realm([p(22), p(111), p(2049)])).toBe('linux');
  });

  it('Samba 445 ⇒ linux override (smb→windows suppressed)', () => {
    expect(realm([p(445, { product: 'Samba smbd 4.6.2', banner: 'Samba smbd 4.6.2', service: 'netbios-ssn' })])).toBe('linux');
  });

  it('is deterministic across two runs', () => {
    const a = JSON.stringify(inferRealm(host([p(88), p(445)]), NMAP_ROUTES));
    const b = JSON.stringify(inferRealm(host([p(88), p(445)]), NMAP_ROUTES));
    expect(a).toBe(b);
  });
});
