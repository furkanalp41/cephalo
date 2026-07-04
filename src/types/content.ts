// FROZEN MERGE SEAM — single source of truth. DESIGN imports, never edits. Do not modify field names/enums.
// ============================================================
// src/types/content.ts  —  FROZEN. DESIGN imports, never edits.
// ============================================================
export type OS = 'linux' | 'windows' | 'ad';
export type PackId = 'oscp' | 'oswe' | 'osep' | (string & {});
export type Id = string; // dotted slug: 'ad.kerberoast.rubeus'
export type RefId = string;

export type Phase =
  | 'recon'
  | 'enumeration'
  | 'web'
  | 'initial-access'
  | 'exploitation'
  | 'foothold'
  | 'privilege-escalation'
  | 'lateral-movement'
  | 'credential-access'
  | 'persistence'
  | 'post-exploitation'
  | 'pivoting'
  | 'exfiltration'
  | 'cleanup';

export type Confidence = 'verified' | 'unverified';
export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type Shell = 'bash' | 'powershell' | 'cmd' | 'sql' | 'text';
export type CredMode = 'password' | 'nthash' | 'kerberos';
export type ArchetypeBand = 'core' | 'high' | 'medium' | 'low';

export type VarGroup = 'network' | 'target' | 'auth' | 'ad' | 'web' | 'files' | 'misc';

export interface VariableValidation {
  kind:
    | 'ip'
    | 'ipv6'
    | 'port'
    | 'domain'
    | 'fqdn'
    | 'hash-ntlm'
    | 'hash-aes'
    | 'path'
    | 'url'
    | 'spn'
    | 'string';
  pattern?: string;
  min?: number;
  max?: number;
  message?: string;
}
export interface VariableDef {
  id: string; // UPPER_SNAKE token: 'LHOST'
  label: string; // 'Attacker IP (tun0)'
  group: VarGroup;
  placeholder: string; // DEFANG token when unset: '<tun0-ip>'
  default?: string; // optional non-routable default (RFC5737/3849); usually undefined
  example: string; // '198.51.100.10' (TEST-NET; never a real host)
  validation?: VariableValidation;
  description?: string;
  sensitive?: boolean; // PASS/NTHASH/AESKEY -> masked, NOT persisted
  aliases?: string[]; // ['ATTACKER_IP']
}

export interface CommandVariant {
  id: Id;
  label: string; // 'PtH (nthash)'
  template: string;
  shell?: Shell;
  os?: OS[];
  credMode?: CredMode; // marks which auth rendering this variant is
}
export interface Command {
  id: Id;
  title: string;
  template: string; // raw with {{TOKENS}} — canonical tool syntax only
  shell?: Shell; // default 'bash'
  description?: string;
  notes?: string[]; // gotchas (e.g. lockout policy, signing, clock skew)
  tool?: string; // 'rubeus','impacket','netexec'
  requiresVars?: string[]; // explicit; if omitted, engine auto-detects from template
  os: OS[];
  phase?: Phase;
  tags?: string[];
  confidence: Confidence; // 'unverified' MUST carry references
  references?: RefId[];
  danger?: Severity; // destructiveness / OPSEC noise
  credMode?: CredMode; // if set, card exposes the password|nthash|kerberos switch
  variants?: CommandVariant[];
  packs: PackId[];
}

export interface Technique {
  id: Id;
  title: string;
  os: OS[];
  phase: Phase;
  summary: string; // one-liner (cards + search)
  body?: string; // markdown PROSE (original synthesis, never copied verbatim)
  commands: Id[]; // ordered = step-by-step
  prerequisites?: string[];
  tags: string[];
  ports?: number[]; // first-class searchable facet
  services?: string[]; // 'smb','ldap','http'
  mitre?: string[]; // verified only
  archetypeBand?: ArchetypeBand;
  requiredForOscpReadiness?: boolean;
  references: RefId[];
  confidence: Confidence;
  packs: PackId[];
  relatedIds?: Id[]; // cross-links (e.g. Linux 445 -> AD lens)
  parent?: Id;
  children?: Id[];
}

export interface Section {
  id: Id;
  title: string;
  os: OS;
  phase?: Phase;
  order: number;
  description?: string;
  techniques: Id[];
  parent?: Id;
  children?: Id[];
  packs: PackId[];
}

export interface Tag {
  id: string;
  label: string;
  os?: OS[];
  category?: 'service' | 'protocol' | 'tool' | 'phase' | 'concept' | 'port' | 'vuln-class';
  colorTokenKey?: string; // references a --cph- KEY; design owns the VALUE
}

export interface MindMapNode {
  id: string;
  label: string;
  kind: 'phase' | 'decision' | 'technique' | 'outcome' | 'note';
  techniqueId?: Id;
  sectionId?: Id;
  os?: OS;
  severity?: Severity;
  position?: { x: number; y: number };
  data?: Record<string, unknown>;
}
export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  label?: string; // 'if creds found' / 'no creds'
  kind?: 'then' | 'or' | 'requires' | 'escalates';
}
export interface MindMap {
  id: Id;
  title: string;
  os: OS;
  phase?: Phase;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  layout?: 'dagre' | 'tree' | 'manual';
  packs: PackId[];
}

export interface BloodHoundQuery {
  id: Id;
  title: string;
  cypher: string; // may contain {{DOMAIN}} tokens (engine interpolates)
  category: 'enumeration' | 'attack-path' | 'edge-abuse' | 'recon' | 'cleanup';
  edge?: string; // 'GenericAll' | 'WriteDacl' | 'DCSync' | 'AddKeyCredentialLink' ...
  description: string; // original prose
  abuse?: string; // how to abuse (prose)
  abuseTechniqueId?: Id; // FK to the weaponizing technique (no command duplication)
  legacyUI?: boolean; // BH legacy vs BH CE schema divergence -> render [UNVERIFIED] note
  references: RefId[];
  confidence: Confidence;
  tags?: string[];
}

export interface Reference {
  id: RefId;
  title: string;
  url?: string;
  source:
    | 'official-tool-docs'
    | 'hacktricks'
    | 'payloadsallthethings'
    | 'gtfobins'
    | 'lolbas'
    | 'ad-cheatsheet'
    | 'tjnull'
    | 'viperone'
    | 'microsoft'
    | 'mitre'
    | 'cve-nvd'
    | 'rfc'
    | 'vendor-advisory'
    | 'exploitdb'
    | 'other';
  author?: string;
  note?: string;
  archiveUrl?: string; // web.archive.org link-rot fallback
  retrieved?: string; // ISO date
}

export interface Pack {
  id: PackId;
  label: string;
  description: string;
  enabledByDefault: boolean;
  os: OS[];
  version?: string;
}

export interface ContentBundle {
  schemaVersion: number;
  generatedAt: string;
  packs: Pack[];
  variables: VariableDef[];
  tags: Tag[];
  sections: Section[];
  techniques: Technique[];
  commands: Command[];
  mindmaps: MindMap[];
  bloodhound: BloodHoundQuery[];
  references: Reference[];
}
