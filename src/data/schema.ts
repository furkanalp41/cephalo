// src/data/schema.ts — Zod schemas in LOCKSTEP with the FROZEN interfaces
// (src/types/content.ts §10). Build-time validation only; NOT imported by any
// runtime component, so `zod` never enters the app bundle. A parity test
// (src/types/schema-parity.test.ts) asserts schema ↔ type agreement.
import { z } from 'zod';

export const OSSchema = z.enum(['linux', 'windows', 'ad']);
export const PackIdSchema = z.string().min(1); // 'oscp' | 'oswe' | 'osep' | (string & {})
export const PhaseSchema = z.enum([
  'recon',
  'enumeration',
  'web',
  'initial-access',
  'exploitation',
  'foothold',
  'privilege-escalation',
  'lateral-movement',
  'credential-access',
  'persistence',
  'post-exploitation',
  'pivoting',
  'exfiltration',
  'cleanup',
]);
export const ConfidenceSchema = z.enum(['verified', 'unverified']);
export const SeveritySchema = z.enum(['info', 'low', 'medium', 'high', 'critical']);
export const ShellSchema = z.enum(['bash', 'powershell', 'cmd', 'sql', 'text']);
export const CredModeSchema = z.enum(['password', 'nthash', 'kerberos']);
export const ArchetypeBandSchema = z.enum(['core', 'high', 'medium', 'low']);
export const VarGroupSchema = z.enum(['network', 'target', 'auth', 'ad', 'web', 'files', 'misc']);

export const VariableValidationSchema = z
  .object({
    kind: z.enum([
      'ip',
      'ipv6',
      'port',
      'domain',
      'fqdn',
      'hash-ntlm',
      'hash-aes',
      'path',
      'url',
      'spn',
      'string',
    ]),
    pattern: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    message: z.string().optional(),
  })
  .strict();

export const VariableDefSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    group: VarGroupSchema,
    placeholder: z.string(),
    default: z.string().optional(),
    example: z.string(),
    validation: VariableValidationSchema.optional(),
    description: z.string().optional(),
    sensitive: z.boolean().optional(),
    aliases: z.array(z.string()).optional(),
  })
  .strict();

export const CommandVariantSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    template: z.string(),
    shell: ShellSchema.optional(),
    os: z.array(OSSchema).optional(),
    credMode: CredModeSchema.optional(),
  })
  .strict();

export const CommandSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    template: z.string(),
    shell: ShellSchema.optional(),
    description: z.string().optional(),
    notes: z.array(z.string()).optional(),
    tool: z.string().optional(),
    requiresVars: z.array(z.string()).optional(),
    os: z.array(OSSchema).min(1),
    phase: PhaseSchema.optional(),
    tags: z.array(z.string()).optional(),
    confidence: ConfidenceSchema,
    references: z.array(z.string()).optional(),
    danger: SeveritySchema.optional(),
    credMode: CredModeSchema.optional(),
    variants: z.array(CommandVariantSchema).optional(),
    packs: z.array(PackIdSchema).min(1),
  })
  .strict();

export const TechniqueSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    os: z.array(OSSchema).min(1),
    phase: PhaseSchema,
    summary: z.string(),
    body: z.string().optional(),
    commands: z.array(z.string()),
    prerequisites: z.array(z.string()).optional(),
    tags: z.array(z.string()),
    ports: z.array(z.number()).optional(),
    services: z.array(z.string()).optional(),
    mitre: z.array(z.string()).optional(),
    archetypeBand: ArchetypeBandSchema.optional(),
    requiredForOscpReadiness: z.boolean().optional(),
    references: z.array(z.string()),
    confidence: ConfidenceSchema,
    packs: z.array(PackIdSchema).min(1),
    relatedIds: z.array(z.string()).optional(),
    parent: z.string().optional(),
    children: z.array(z.string()).optional(),
  })
  .strict();

export const SectionSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    os: OSSchema,
    phase: PhaseSchema.optional(),
    order: z.number(),
    description: z.string().optional(),
    techniques: z.array(z.string()),
    parent: z.string().optional(),
    children: z.array(z.string()).optional(),
    packs: z.array(PackIdSchema).min(1),
  })
  .strict();

export const TagSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    os: z.array(OSSchema).optional(),
    category: z
      .enum(['service', 'protocol', 'tool', 'phase', 'concept', 'port', 'vuln-class'])
      .optional(),
    colorTokenKey: z.string().optional(),
  })
  .strict();

export const MindMapNodeSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    kind: z.enum(['phase', 'decision', 'technique', 'outcome', 'note']),
    techniqueId: z.string().optional(),
    sectionId: z.string().optional(),
    os: OSSchema.optional(),
    severity: SeveritySchema.optional(),
    position: z.object({ x: z.number(), y: z.number() }).optional(),
    data: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const MindMapEdgeSchema = z
  .object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    label: z.string().optional(),
    kind: z.enum(['then', 'or', 'requires', 'escalates']).optional(),
  })
  .strict();

export const MindMapSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    os: OSSchema,
    phase: PhaseSchema.optional(),
    nodes: z.array(MindMapNodeSchema),
    edges: z.array(MindMapEdgeSchema),
    layout: z.enum(['dagre', 'tree', 'manual']).optional(),
    packs: z.array(PackIdSchema).min(1),
  })
  .strict();

export const BloodHoundQuerySchema = z
  .object({
    id: z.string(),
    title: z.string(),
    cypher: z.string(),
    category: z.enum(['enumeration', 'attack-path', 'edge-abuse', 'recon', 'cleanup']),
    edge: z.string().optional(),
    description: z.string(),
    abuse: z.string().optional(),
    abuseTechniqueId: z.string().optional(),
    legacyUI: z.boolean().optional(),
    references: z.array(z.string()),
    confidence: ConfidenceSchema,
    tags: z.array(z.string()).optional(),
  })
  .strict();

export const ReferenceSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    url: z.string().optional(),
    source: z.enum([
      'official-tool-docs',
      'hacktricks',
      'payloadsallthethings',
      'gtfobins',
      'lolbas',
      'ad-cheatsheet',
      'tjnull',
      'viperone',
      'microsoft',
      'mitre',
      'cve-nvd',
      'rfc',
      'vendor-advisory',
      'exploitdb',
      'other',
    ]),
    author: z.string().optional(),
    note: z.string().optional(),
    archiveUrl: z.string().optional(),
    retrieved: z.string().optional(),
  })
  .strict();

export const PackSchema = z
  .object({
    id: PackIdSchema,
    label: z.string(),
    description: z.string(),
    enabledByDefault: z.boolean(),
    os: z.array(OSSchema),
    version: z.string().optional(),
  })
  .strict();

export const ContentBundleSchema = z
  .object({
    schemaVersion: z.number(),
    generatedAt: z.string(),
    packs: z.array(PackSchema),
    variables: z.array(VariableDefSchema),
    tags: z.array(TagSchema),
    sections: z.array(SectionSchema),
    techniques: z.array(TechniqueSchema),
    commands: z.array(CommandSchema),
    mindmaps: z.array(MindMapSchema),
    bloodhound: z.array(BloodHoundQuerySchema),
    references: z.array(ReferenceSchema),
  })
  .strict();

// ---- authoring-file shapes (a section-bundle YAML or a bloodhound/mindmap file) ----
export const SectionBundleFileSchema = z
  .object({
    section: SectionSchema.optional(),
    sections: z.array(SectionSchema).optional(),
    techniques: z.array(TechniqueSchema).optional(),
    commands: z.array(CommandSchema).optional(),
    mindmaps: z.array(MindMapSchema).optional(),
    bloodhound: z.array(BloodHoundQuerySchema).optional(),
  })
  .strict();

export type SectionBundleFile = z.infer<typeof SectionBundleFileSchema>;
