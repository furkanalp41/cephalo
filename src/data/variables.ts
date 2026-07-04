// src/data/variables.ts — the FROZEN canonical Variable Registry (§10-§4, expanded
// per §5.2). This is the single source for the VariableBar defs AND for the
// store-init default seeding. build-content emits it into the bundle so the
// runtime reads it from generated JSON (offline, no TS content import at runtime).
//
// RULES (Gate 6): every `placeholder` is an inert non-routable token. Only LPORT
// and INTERFACE carry a real seeded `default`. Sensitive vars (PASS/NTHASH/AESKEY/
// KRBTGT_NTHASH) NEVER carry a default and are NEVER seeded/persisted. Examples are
// RFC5737/RFC3849 or clearly-illustrative non-secrets.

import type { VariableDef, VarGroup } from '@/types/content';

// Primary vars shown in the sticky VariableBar (in this order, grouped).
export const PRIMARY_VAR_IDS = [
  'LHOST',
  'LPORT',
  'RHOST',
  'RPORT',
  'TARGET',
  'INTERFACE',
  'URL',
  'WORDLIST',
  'DOMAIN',
  'DC_IP',
  'USER',
  'PASS',
  'NTHASH',
  'AESKEY',
  'SPN',
  'SHARE',
] as const;

// Groups, in display order, for the VariableBar clusters.
export const VAR_GROUP_ORDER: VarGroup[] = ['network', 'target', 'auth', 'ad', 'web', 'files', 'misc'];

export const VARIABLE_REGISTRY: VariableDef[] = [
  // ---- network ----
  {
    id: 'LHOST',
    label: 'Attacker IP (tun0)',
    group: 'network',
    placeholder: '<tun0-ip>',
    example: '198.51.100.10',
    validation: { kind: 'ip', message: 'Dotted IPv4, e.g. 198.51.100.10' },
    description: 'Your VPN/tun0 address — where reverse shells and captures call back.',
    aliases: ['ATTACKER_IP'],
  },
  {
    id: 'LPORT',
    label: 'Listener port',
    group: 'network',
    placeholder: '<lport>',
    default: '4444',
    example: '4444',
    validation: { kind: 'port', message: 'Port 1–65535' },
    description: 'Local listener port for reverse shells / handlers.',
  },
  {
    id: 'INTERFACE',
    label: 'Interface',
    group: 'network',
    placeholder: '<interface>',
    default: 'tun0',
    example: 'tun0',
    description: 'Local network interface (responder, tcpdump, etc.).',
  },
  // ---- target ----
  {
    id: 'RHOST',
    label: 'Target IP',
    group: 'target',
    placeholder: '<target-ip>',
    example: '198.51.100.10',
    validation: { kind: 'ip', message: 'Dotted IPv4, e.g. 198.51.100.10' },
    description: 'The host you are enumerating / attacking.',
  },
  {
    id: 'RPORT',
    label: 'Target port',
    group: 'target',
    placeholder: '<rport>',
    example: '445',
    validation: { kind: 'port', message: 'Port 1–65535' },
    description: 'A specific service port on the target.',
  },
  {
    id: 'TARGET',
    label: 'Target host (IP or FQDN)',
    group: 'target',
    placeholder: '<target-ip>',
    example: '198.51.100.10',
    description: 'Target host — IP or FQDN. Equals RHOST for AD work.',
    aliases: ['HOST'],
  },
  // ---- web ----
  {
    id: 'URL',
    label: 'Target URL',
    group: 'web',
    placeholder: 'http://<target-ip>',
    example: 'http://198.51.100.10',
    validation: { kind: 'url', message: 'Full URL incl. scheme' },
    description: 'Base URL of the target web application.',
  },
  // ---- files ----
  {
    id: 'WORDLIST',
    label: 'Wordlist path',
    group: 'files',
    placeholder: '<rockyou.txt>',
    example: '/usr/share/wordlists/rockyou.txt',
    validation: { kind: 'path' },
    description: 'Path to the wordlist for brute/spray/crack.',
  },
  {
    id: 'SHARE',
    label: 'SMB share',
    group: 'files',
    placeholder: '<share>',
    example: 'SYSVOL',
    description: 'An SMB share name.',
  },
  // ---- ad ----
  {
    id: 'DOMAIN',
    label: 'AD domain',
    group: 'ad',
    placeholder: '<domain.local>',
    example: 'corp.local',
    validation: { kind: 'domain', message: 'e.g. corp.local' },
    description: 'Active Directory domain (FQDN form).',
  },
  {
    id: 'DC_IP',
    label: 'Domain Controller IP',
    group: 'ad',
    placeholder: '<dc-ip>',
    example: '198.51.100.10',
    validation: { kind: 'ip', message: 'Dotted IPv4' },
    description: 'IP of a Domain Controller (LDAP/Kerberos).',
  },
  {
    id: 'SPN',
    label: 'Service Principal Name',
    group: 'ad',
    placeholder: '<spn>',
    example: 'MSSQLSvc/dc01.corp.local:1433',
    validation: { kind: 'spn', message: 'service/host[:port]' },
    description: 'Target SPN for Kerberoasting / silver tickets.',
  },
  // ---- auth ----
  {
    id: 'USER',
    label: 'Username',
    group: 'auth',
    placeholder: '<user>',
    example: 'jdoe',
    description: 'A domain or local username.',
  },
  {
    id: 'PASS',
    label: 'Password',
    group: 'auth',
    placeholder: '<password>',
    example: 'Autumn2024!',
    sensitive: true,
    description: 'Password (session-only, never saved).',
  },
  {
    id: 'NTHASH',
    label: 'NT hash',
    group: 'auth',
    placeholder: '<nthash>',
    // The empty-password NT hash — a public, well-known constant, not a secret.
    example: '31d6cfe0d16ae931b73c59d7e0c089c0',
    sensitive: true,
    validation: { kind: 'hash-ntlm', message: '32 hex chars' },
    description: 'NTLM hash for Pass-the-Hash (session-only, never saved).',
  },
  {
    id: 'AESKEY',
    label: 'AES256 key',
    group: 'auth',
    placeholder: '<aeskey>',
    example: '0000000000000000000000000000000000000000000000000000000000000000',
    sensitive: true,
    validation: { kind: 'hash-aes', message: '64 hex chars' },
    description: 'AES256 key for Pass-the-Key / overpass-the-hash (session-only).',
  },

  // ---- secondary / derived (NOT in the main bar; inline-prompted from cards) ----
  {
    id: 'DOMAIN_SID',
    label: 'Domain SID',
    group: 'ad',
    placeholder: '<domain-sid>',
    example: 'S-1-5-21-1004336348-1177238915-682003330',
    description: 'Domain SID (for golden/silver ticket forging).',
  },
  {
    id: 'KRBTGT_NTHASH',
    label: 'krbtgt NT hash',
    group: 'auth',
    placeholder: '<krbtgt-nthash>',
    example: '31d6cfe0d16ae931b73c59d7e0c089c0',
    sensitive: true,
    validation: { kind: 'hash-ntlm', message: '32 hex chars' },
    description: 'krbtgt account NT hash (golden ticket). Session-only.',
  },
  {
    id: 'CA',
    label: 'CA name',
    group: 'ad',
    placeholder: '<ca-name>',
    example: 'corp-DC01-CA',
    description: 'Enterprise CA name (ADCS / certipy).',
  },
  {
    id: 'CA_HOST',
    label: 'CA host',
    group: 'ad',
    placeholder: '<ca-host>',
    example: 'dc01.corp.local',
    description: 'Hostname of the CA server.',
  },
  {
    id: 'TEMPLATE',
    label: 'Certificate template',
    group: 'ad',
    placeholder: '<template-name>',
    example: 'UserTemplate',
    description: 'Vulnerable certificate template (ADCS ESC).',
  },
  {
    id: 'GROUP',
    label: 'Group name',
    group: 'ad',
    placeholder: '<group>',
    example: 'Domain Admins',
    description: 'Target group (AddMember, ACL abuse).',
  },
  {
    id: 'TARGET_USER',
    label: 'Target user',
    group: 'ad',
    placeholder: '<target-user>',
    example: 'svc_sql',
    description: 'A specific principal you are abusing/targeting.',
  },
  {
    id: 'COMPUTER',
    label: 'Computer account',
    group: 'ad',
    placeholder: '<computer>',
    example: 'WS01$',
    description: 'A computer account (RBCD, machine quota).',
  },
  // ---- OSCE3 secondary tokens (NOT in the primary bar; inline-prompted by content) ----
  { id: 'SOURCE_DIR', label: 'Source root (white-box)', group: 'files', placeholder: '<source-dir>', example: '/var/www/app', description: 'White-box source-code review root (OSWE).' },
  { id: 'POST_DATA', label: 'POST body', group: 'web', placeholder: '<post-data>', example: 'user=admin&pw=changeme', description: 'Request body for an injected parameter.' },
  { id: 'SESSION', label: 'Session token', group: 'auth', placeholder: '<session-token>', example: 'sess=abc123', sensitive: true, description: 'Captured session/cookie value (session-only, masked).' },
  { id: 'COLLAB', label: 'OOB collaborator host', group: 'web', placeholder: '<collab-host>', example: 'abc123.oob.example', description: 'Out-of-band exfil host (defanged).' },
  { id: 'DBUSER', label: 'DB user', group: 'auth', placeholder: '<db-user>', example: 'postgres', description: 'Database account.' },
  { id: 'DBPASS', label: 'DB password', group: 'auth', placeholder: '<db-pass>', example: 'changeme', sensitive: true, description: 'Database password (session-only, masked).' },
  { id: 'OID', label: 'Object id (pgsql)', group: 'misc', placeholder: '<oid>', example: '16388', description: 'PostgreSQL large-object OID.' },
  { id: 'SO_PATH', label: 'Shared object path', group: 'files', placeholder: '<so-path>', example: '/tmp/lib.so', description: 'UDF shared-object path.' },
  { id: 'REMOTE_FILE', label: 'Remote file path', group: 'files', placeholder: '<remote-file>', example: '/etc/passwd', description: 'Target file to read/import.' },
  { id: 'CMD', label: 'Command to run', group: 'misc', placeholder: '<cmd>', example: 'id', description: 'OS command for an exec primitive.' },
  { id: 'LINKED', label: 'MSSQL linked server', group: 'misc', placeholder: '<linked-server>', example: 'linkedsrv', description: 'Linked-server name for EXECUTE AT.' },
  { id: 'MODULE', label: 'Module (exploit-dev)', group: 'misc', placeholder: '<module>', example: 'libeay32.dll', description: 'A loaded module for ROP/SEH gadget hunting.' },
  { id: 'MODULES', label: 'Modules (exploit-dev)', group: 'misc', placeholder: '<modules>', example: 'mod1.dll,mod2.dll', description: 'Comma-separated modules for mona ROP.' },
  { id: 'LENGTH', label: 'Pattern length', group: 'misc', placeholder: '<length>', example: '2000', description: 'Cyclic-pattern length.' },
  { id: 'EIP', label: 'EIP value', group: 'misc', placeholder: '<eip>', example: 'deadbeef', description: 'Crash EIP value (pattern_offset input).' },
  { id: 'BADCHARS', label: 'Bad characters', group: 'misc', placeholder: '<badchars>', example: '\\x00\\x0a\\x0d', description: 'Bytes to exclude from shellcode/ROP.' },
  { id: 'PAYLOAD', label: 'Payload file', group: 'files', placeholder: '<payload>', example: 'payload.bin', description: 'Generated payload artifact path.' },
];

/** Fast lookup map keyed by var id. */
export const VARIABLE_DEFS_BY_ID: Record<string, VariableDef> = Object.fromEntries(
  VARIABLE_REGISTRY.map((v) => [v.id, v]),
);

/** Every var id the templating engine may legitimately see. */
export const KNOWN_VAR_IDS: ReadonlySet<string> = new Set(VARIABLE_REGISTRY.map((v) => v.id));

/** Seed map: only non-sensitive vars carrying a real `default` (§5.2). */
export function seededDefaults(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const v of VARIABLE_REGISTRY) {
    if (v.default !== undefined && !v.sensitive) out[v.id] = v.default;
  }
  return out;
}
