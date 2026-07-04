// src/data/v2/nmapRoutes.ts — F8 ServiceRoute dataset (v2). The nmap triage router fires
// these against parsed ports → REAL existing oscp Technique ids (zero duplication).
// realmWeight: AD-gate signals (kerberos/ldap) weigh 3, smb/rdp/winrm 2, lone ssh 0.5.
// cveCandidate:true where an F6 CveExploitEntry exists for the service. ServiceRoute.id is
// the Id string-alias (NOT a registered content id, HARD RULE 6). productRegex is stored
// plain; the router applies the case-insensitive flag. Validated by schema.v2.ts.
import type { ServiceRoute } from '@/types/nmap';

export const NMAP_ROUTES: ServiceRoute[] = [
  { id: 'route.ftp', label: 'FTP', match: { by: 'port', port: 21 }, techniqueIds: ['linux.enum.ftp-ssh'], realmCategory: 'nix', severity: 'medium', cveCandidate: true },
  { id: 'route.ssh', label: 'SSH', match: { by: 'port', port: 22 }, techniqueIds: ['linux.enum.ftp-ssh'], realmHint: 'linux', realmCategory: 'nix', realmWeight: 0.5, severity: 'low' },
  { id: 'route.telnet', label: 'Telnet', match: { by: 'port', port: 23 }, techniqueIds: ['linux.enum.legacy'], severity: 'low' },
  { id: 'route.smtp', label: 'SMTP', match: { by: 'port', port: 25 }, techniqueIds: ['ad.enum.smtp'], severity: 'low' },
  { id: 'route.dns', label: 'DNS', match: { by: 'port', port: 53 }, techniqueIds: ['linux.enum.dns'], severity: 'low' },
  { id: 'route.web', label: 'HTTP', match: { by: 'port', port: 80 }, techniqueIds: ['linux.enum.web'], severity: 'high', cveCandidate: true },
  { id: 'route.kerberos', label: 'Kerberos', match: { by: 'port', port: 88 }, techniqueIds: ['ad.enum.kerbrute'], realmHint: 'ad', realmCategory: 'kerberos', realmWeight: 3, severity: 'high' },
  { id: 'route.mail', label: 'POP3/IMAP', match: { by: 'port', port: 110 }, techniqueIds: ['linux.enum.mail'], severity: 'low' },
  { id: 'route.rpcbind', label: 'rpcbind', match: { by: 'port', port: 111 }, techniqueIds: ['linux.enum.nfs'], realmHint: 'linux', realmCategory: 'nix', severity: 'medium' },
  { id: 'route.msrpc', label: 'MSRPC', match: { by: 'port', port: 135 }, techniqueIds: ['ad.enum.smb'], realmHint: 'windows', realmCategory: 'smb', severity: 'medium' },
  { id: 'route.netbios', label: 'NetBIOS-SSN', match: { by: 'port', port: 139 }, techniqueIds: ['ad.enum.smb'], realmHint: 'windows', realmCategory: 'smb', severity: 'medium' },
  { id: 'route.snmp', label: 'SNMP', match: { by: 'port', port: 161 }, techniqueIds: ['linux.enum.snmp'], severity: 'medium' },
  { id: 'route.ldap', label: 'LDAP', match: { by: 'port', port: 389 }, techniqueIds: ['ad.enum.ldap'], realmHint: 'ad', realmCategory: 'ldap', realmWeight: 3, severity: 'high' },
  { id: 'route.https', label: 'HTTPS', match: { by: 'port', port: 443 }, techniqueIds: ['linux.enum.web'], severity: 'high', cveCandidate: true },
  { id: 'route.smb', label: 'SMB', match: { by: 'port', port: 445 }, techniqueIds: ['ad.enum.smb'], realmHint: 'windows', realmCategory: 'smb', realmWeight: 2, severity: 'high', cveCandidate: true },
  { id: 'route.smb.samba', label: 'Samba (SMB on *nix)', match: { by: 'product', productRegex: 'samba' }, techniqueIds: ['linux.enum.smb'], realmHint: 'linux', realmCategory: 'nix', severity: 'high', note: 'A Samba banner overrides 445→windows; treat the host as *nix.' },
  { id: 'route.ldaps', label: 'LDAPS', match: { by: 'port', port: 636 }, techniqueIds: ['ad.enum.ldap'], realmHint: 'ad', realmCategory: 'ldap', realmWeight: 3, severity: 'high' },
  { id: 'route.rsync', label: 'rsync', match: { by: 'port', port: 873 }, techniqueIds: ['linux.enum.legacy'], severity: 'low' },
  { id: 'route.mssql', label: 'MSSQL', match: { by: 'port', port: 1433 }, techniqueIds: ['linux.enum.db'], realmHint: 'windows', severity: 'high' },
  { id: 'route.nfs', label: 'NFS', match: { by: 'port', port: 2049 }, techniqueIds: ['linux.enum.nfs'], realmHint: 'linux', realmCategory: 'nix', severity: 'high' },
  { id: 'route.gc', label: 'LDAP Global Catalog', match: { by: 'port', port: 3268 }, techniqueIds: ['ad.enum.ldap'], realmHint: 'ad', realmCategory: 'ldap', realmWeight: 3, severity: 'high' },
  { id: 'route.mysql', label: 'MySQL', match: { by: 'port', port: 3306 }, techniqueIds: ['linux.enum.db'], severity: 'medium' },
  { id: 'route.rdp', label: 'RDP', match: { by: 'port', port: 3389 }, techniqueIds: ['linux.enum.rdpvnc'], realmHint: 'windows', realmCategory: 'rdp', realmWeight: 2, severity: 'medium' },
  { id: 'route.postgres', label: 'PostgreSQL', match: { by: 'port', port: 5432 }, techniqueIds: ['linux.enum.db'], severity: 'medium' },
  { id: 'route.vnc', label: 'VNC', match: { by: 'port', port: 5900 }, techniqueIds: ['linux.enum.rdpvnc'], severity: 'low' },
  { id: 'route.winrm', label: 'WinRM', match: { by: 'port', port: 5985 }, techniqueIds: ['ad.lateral.evil-winrm'], realmHint: 'windows', realmCategory: 'winrm', realmWeight: 2, severity: 'high' },
  { id: 'route.winrm-ssl', label: 'WinRM (TLS)', match: { by: 'port', port: 5986 }, techniqueIds: ['ad.lateral.evil-winrm'], realmHint: 'windows', realmCategory: 'winrm', realmWeight: 2, severity: 'high' },
  { id: 'route.redis', label: 'Redis', match: { by: 'port', port: 6379 }, techniqueIds: ['linux.enum.redis'], severity: 'medium' },
  { id: 'route.elastic', label: 'Elasticsearch', match: { by: 'port', port: 9200 }, techniqueIds: ['linux.enum.nosql'], severity: 'low' },
  { id: 'route.mongo', label: 'MongoDB', match: { by: 'port', port: 27017 }, techniqueIds: ['linux.enum.nosql'], severity: 'low' },
];
