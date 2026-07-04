// src/data/tags.ts — curated tag vocabulary. Tags are first-class search docs and
// drive CommandCard / palette chips. `category` styles the chip; colorTokenKey (if
// set) references a --cph- KEY (design owns the value).
import type { Tag } from '@/types/content';

export const TAGS: Tag[] = [
  // services
  { id: 'smb', label: 'SMB', category: 'service' },
  { id: 'ldap', label: 'LDAP', category: 'service', os: ['ad', 'windows'] },
  { id: 'kerberos', label: 'Kerberos', category: 'service', os: ['ad', 'windows'] },
  { id: 'http', label: 'HTTP', category: 'service' },
  { id: 'mssql', label: 'MSSQL', category: 'service', os: ['windows', 'ad'] },
  { id: 'winrm', label: 'WinRM', category: 'service', os: ['windows', 'ad'] },
  { id: 'rdp', label: 'RDP', category: 'service', os: ['windows', 'ad'] },
  { id: 'ssh', label: 'SSH', category: 'service', os: ['linux'] },
  { id: 'ftp', label: 'FTP', category: 'service' },
  { id: 'nfs', label: 'NFS', category: 'service', os: ['linux'] },
  { id: 'snmp', label: 'SNMP', category: 'service' },
  { id: 'dns', label: 'DNS', category: 'service' },
  { id: 'rpc', label: 'RPC/MSRPC', category: 'service', os: ['windows', 'ad'] },

  // protocols / concepts
  { id: 'ntlm', label: 'NTLM', category: 'protocol', os: ['windows', 'ad'] },
  { id: 'krb5', label: 'Kerberos v5', category: 'protocol', os: ['ad'] },

  // tools
  { id: 'nmap', label: 'nmap', category: 'tool' },
  { id: 'netexec', label: 'netexec', category: 'tool' },
  { id: 'impacket', label: 'impacket', category: 'tool' },
  { id: 'rubeus', label: 'Rubeus', category: 'tool', os: ['ad', 'windows'] },
  { id: 'bloodhound', label: 'BloodHound', category: 'tool', os: ['ad'] },
  { id: 'hashcat', label: 'hashcat', category: 'tool' },
  { id: 'responder', label: 'Responder', category: 'tool' },
  { id: 'evil-winrm', label: 'Evil-WinRM', category: 'tool', os: ['windows', 'ad'] },
  { id: 'certipy', label: 'Certipy', category: 'tool', os: ['ad'] },
  { id: 'mimikatz', label: 'mimikatz', category: 'tool', os: ['windows', 'ad'] },

  // concepts (attack techniques)
  { id: 'kerberoasting', label: 'Kerberoasting', category: 'concept', os: ['ad'] },
  { id: 'asreproasting', label: 'AS-REP Roasting', category: 'concept', os: ['ad'] },
  { id: 'pass-the-hash', label: 'Pass-the-Hash', category: 'concept', os: ['windows', 'ad'] },
  { id: 'pass-the-ticket', label: 'Pass-the-Ticket', category: 'concept', os: ['ad'] },
  { id: 'overpass-the-hash', label: 'Overpass-the-Hash', category: 'concept', os: ['ad'] },
  { id: 'dcsync', label: 'DCSync', category: 'concept', os: ['ad'] },
  { id: 'unconstrained-delegation', label: 'Unconstrained Delegation', category: 'concept', os: ['ad'] },
  { id: 'rbcd', label: 'RBCD', category: 'concept', os: ['ad'] },
  { id: 'acl-abuse', label: 'ACL Abuse', category: 'concept', os: ['ad'] },
  { id: 'token-impersonation', label: 'Token Impersonation', category: 'concept', os: ['windows'] },
  { id: 'sudo', label: 'sudo', category: 'concept', os: ['linux'] },
  { id: 'suid', label: 'SUID/SGID', category: 'concept', os: ['linux'] },
  { id: 'cron', label: 'cron', category: 'concept', os: ['linux'] },
  { id: 'enumeration', label: 'enumeration', category: 'phase' },
  { id: 'credential-access', label: 'credential access', category: 'phase', os: ['ad'] },
  { id: 'persistence', label: 'persistence', category: 'phase' },
  { id: 'privesc', label: 'privilege escalation', category: 'phase' },
  { id: 'lateral-movement', label: 'lateral movement', category: 'phase', os: ['ad', 'windows'] },
  { id: 'pivoting', label: 'pivoting', category: 'phase' },
  { id: 'web-enum', label: 'web enumeration', category: 'phase' },
  { id: 'cross-cutting', label: 'cross-cutting', category: 'concept' },

  // vuln classes (methodology-only)
  { id: 'lfi', label: 'LFI', category: 'vuln-class' },
  { id: 'sqli', label: 'SQL Injection', category: 'vuln-class' },
  { id: 'file-upload', label: 'File Upload', category: 'vuln-class' },
  { id: 'ssti', label: 'SSTI', category: 'vuln-class' },
];
