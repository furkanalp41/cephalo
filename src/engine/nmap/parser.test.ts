// @vitest-environment node
// Golden + determinism tests for the F8 nmap parsing layer (human/grep/xml + orchestrator).
// Fixtures use RFC5737 198.51.100.x + example.lab (NO machine names). parsedAt is excluded
// from cross-clock equality; closed/filtered ports are dropped; Samba banner is preserved.
import { describe, it, expect } from 'vitest';
import { parse, detectFormat } from '@/engine/nmap/parser';
import type { NmapParseResult } from '@/types/nmap';

const HUMAN = [
  'Nmap scan report for example.lab (198.51.100.10)',
  'Host is up (0.010s latency).',
  'PORT     STATE  SERVICE       VERSION',
  '22/tcp   open   ssh           OpenSSH 8.2p1 Ubuntu',
  '80/tcp   open   http          Apache httpd 2.4.49 ((Ubuntu))',
  '445/tcp  open   microsoft-ds  Samba smbd 4.6.2',
  '3389/tcp closed ms-wbt-server',
].join('\n');

const GREP = [
  '# Nmap 7.94 scan initiated',
  'Host: 198.51.100.10 (example.lab)\tStatus: Up',
  'Host: 198.51.100.10 (example.lab)\tPorts: 22/open/tcp//ssh//OpenSSH 8.2p1/, 80/open/tcp//http//Apache httpd 2.4.49/, 445/open/tcp//microsoft-ds//Samba smbd 4.6.2/\tIgnored State: closed (997)',
].join('\n');

const XML = [
  '<?xml version="1.0"?>',
  '<nmaprun>',
  '<host><status state="up"/><address addr="198.51.100.20" addrtype="ipv4"/><hostnames><hostname name="dc.example.lab"/></hostnames>',
  '<ports>',
  '<port protocol="tcp" portid="88"><state state="open"/><service name="kerberos-sec" product="Microsoft Windows Kerberos"/></port>',
  '<port protocol="tcp" portid="389"><state state="open"/><service name="ldap"/></port>',
  '<port protocol="tcp" portid="445"><state state="open"/><service name="microsoft-ds"/></port>',
  '<port protocol="tcp" portid="135"><state state="filtered"/><service name="msrpc"/></port>',
  '</ports></host>',
  '</nmaprun>',
].join('\n');

describe('nmap parser — detectFormat', () => {
  it('classifies each input format', () => {
    expect(detectFormat(HUMAN)).toBe('human');
    expect(detectFormat(GREP)).toBe('grep');
    expect(detectFormat(XML)).toBe('xml');
    expect(detectFormat('just some random text')).toBe('unknown');
  });
});

describe('nmap parser — human', () => {
  const r = parse(HUMAN);
  it('parses host + open ports, drops closed', () => {
    expect(r.format).toBe('human');
    expect(r.hosts).toHaveLength(1);
    expect(r.hosts[0]?.ip).toBe('198.51.100.10');
    expect(r.hosts[0]?.hostname).toBe('example.lab');
    expect(r.hosts[0]?.ports.map((p) => p.port)).toEqual([22, 80, 445]); // 3389 closed dropped
  });
  it('preserves the Samba banner/product on 445', () => {
    const smb = r.hosts[0]?.ports.find((p) => p.port === 445);
    expect(smb?.product).toMatch(/samba/i);
    expect(smb?.version).toBe('4.6.2');
  });
});

describe('nmap parser — grep', () => {
  it('parses Host/Ports fields', () => {
    const r = parse(GREP);
    expect(r.format).toBe('grep');
    expect(r.hosts[0]?.ip).toBe('198.51.100.10');
    expect(r.hosts[0]?.ports.map((p) => p.port)).toEqual([22, 80, 445]);
    expect(r.hosts[0]?.ports.find((p) => p.port === 445)?.product).toMatch(/samba/i);
  });
});

describe('nmap parser — xml', () => {
  it('parses host/ports/service, drops filtered', () => {
    const r = parse(XML);
    expect(r.format).toBe('xml');
    expect(r.hosts[0]?.ip).toBe('198.51.100.20');
    expect(r.hosts[0]?.hostname).toBe('dc.example.lab');
    expect(r.hosts[0]?.ports.map((p) => p.port)).toEqual([88, 389, 445]); // 135 filtered dropped
    expect(r.hosts[0]?.ports.find((p) => p.port === 88)?.service).toBe('kerberos-sec');
  });
});

describe('nmap parser — clock + determinism', () => {
  it('uses the injected clock for parsedAt (default fixed epoch)', () => {
    expect(parse(HUMAN).parsedAt).toBe('1970-01-01T00:00:00.000Z');
    expect(parse(HUMAN, () => '2026-01-01T00:00:00.000Z').parsedAt).toBe('2026-01-01T00:00:00.000Z');
  });
  it('is deterministic ignoring parsedAt across different clocks', () => {
    const strip = (r: NmapParseResult) => ({ ...r, parsedAt: '' });
    expect(strip(parse(HUMAN, () => 'X'))).toEqual(strip(parse(HUMAN, () => 'Y')));
  });
});
