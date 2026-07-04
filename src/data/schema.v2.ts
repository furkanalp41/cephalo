// src/data/schema.v2.ts — ADDITIVE (v2). Zod schemas in LOCKSTEP with the NEW v2
// type modules (src/types/{arsenal,advisor,ask,cve,decision,nmap,bundle.v2}.ts).
// Build-time validation only; never imported by a runtime component, so `zod` never
// enters the app bundle. Parity asserted by src/types/schema-parity.v2.test.ts.
// Reuses the frozen enum schemas from src/data/schema.ts (no re-declaration).
import { z } from 'zod';
import {
  OSSchema,
  SeveritySchema,
  ConfidenceSchema,
  ShellSchema,
  PhaseSchema,
  PackIdSchema,
} from '@/data/schema';

// ============================================================
// F1/F2 — arsenal.ts → ToolBinary
// ============================================================
export const ToolFormatSchema = z.enum([
  'exe', 'ps1', 'py', 'elf', 'jar', 'dll', 'so', 'script', 'msi',
]);
export const ToolCategorySchema = z.enum([
  'ad-enum', 'ad-cred', 'ad-lateral', 'adcs', 'bloodhound',
  'win-privesc', 'win-enum', 'potato',
  'linux-privesc', 'linux-enum',
  'recon', 'web', 'relay', 'pivot', 'transfer', 'cracking', 'powershell-offensive',
]);
export const ToolBinarySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    aliases: z.array(z.string()).optional(),
    category: ToolCategorySchema,
    format: z.array(ToolFormatSchema),
    runsOn: z.array(OSSchema),
    officialRef: z.string(),
    releaseRef: z.string().optional(),
    shipsOnKali: z.boolean(),
    kaliPath: z.string().optional(),
    fetchNote: z.string(),
    relatedTechniqueIds: z.array(z.string()).optional(),
    relatedSignalIds: z.array(z.string()).optional(),
    confidence: ConfidenceSchema,
    references: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  })
  .strict();

// ============================================================
// F3 — advisor.ts → PrivilegeSignal + PrivilegeRule
// ============================================================
export const EnumSourceSchema = z.enum([
  'whoami-priv', 'whoami-groups', 'whoami-all',
  'sudo-l', 'id', 'getcap', 'suid-find', 'systeminfo', 'uname', 'ad-misc',
]);
export const PrivilegeSignalSchema = z
  .object({
    id: z.string(),
    os: OSSchema,
    source: EnumSourceSchema,
    label: z.string(),
    match: z
      .object({
        pattern: z.string(),
        flags: z.string().optional(),
        captures: z.array(z.string()).optional(),
      })
      .strict(),
    actionableStates: z.array(z.enum(['enabled', 'disabled', 'present'])).optional(),
    sids: z.array(z.string()).optional(),
    severity: SeveritySchema,
    description: z.string(),
    references: z.array(z.string()).optional(),
    confidence: ConfidenceSchema,
  })
  .strict();
export const BuildGateSchema = z
  .object({ minBuild: z.number().optional(), maxBuild: z.number().optional() })
  .strict();
export const PrivilegeRuleSchema = z
  .object({
    id: z.string(),
    os: OSSchema,
    whenSignals: z.array(z.string()),
    buildGate: BuildGateSchema.optional(),
    recommendsTechniqueId: z.string(),
    commandId: z.string().optional(),
    toolBinaryId: z.string().optional(),
    rank: z.number(),
    rationale: z.string(),
    unverifiedReason: z.string().optional(),
    decisionNodeId: z.string().optional(),
    cveLookupHint: z.string().optional(),
    confidence: ConfidenceSchema,
    references: z.array(z.string()).optional(),
  })
  .strict();

// ============================================================
// F4 — ask.ts → IntentAlias + PhrasebookEntry   (NO expandsTo key — .strict() rejects it)
// ============================================================
export const IntentAliasSchema = z
  .object({
    id: z.string(),
    canonical: z.string(),
    aliases: z.array(z.string()),
    techniqueIds: z.array(z.string()).optional(),
    commandIds: z.array(z.string()).optional(),
    toolBinaryIds: z.array(z.string()).optional(),
    signalKey: z.string().optional(),
    os: z.array(OSSchema).optional(),
    weight: z.number().optional(),
  })
  .strict();
export const PhrasebookEntrySchema = z
  .object({
    id: z.string(),
    phrasings: z.array(z.string()),
    requireAll: z.array(z.string()).optional(),
    intent: z.string(),
    techniqueIds: z.array(z.string()).optional(),
    commandIds: z.array(z.string()).optional(),
    requiresSignals: z.array(z.string()).optional(),
    shell: ShellSchema.optional(),
    os: z.array(OSSchema).optional(),
    minOverlap: z.number().optional(),
    rationale: z.string(),
    confidence: ConfidenceSchema,
  })
  .strict();

// ============================================================
// F6 — cve.ts → CveExploitEntry
// ============================================================
export const VersionRangeSchema = z
  .object({
    exact: z.string().optional(),
    introduced: z.string().optional(),
    fixedExclusive: z.string().optional(),
    prefix: z.string().optional(),
    any: z.boolean().optional(),
    expression: z.string().optional(),
  })
  .strict();
export const ExploitTypeSchema = z.enum([
  'remote', 'local', 'webapps', 'dos', 'priv-esc', 'shellcode', 'hardware',
]);
export const CveExploitEntrySchema = z
  .object({
    id: z.string(),
    product: z.string(),
    productAliases: z.array(z.string()).optional(),
    versionRange: VersionRangeSchema,
    cveId: z.string().optional(),
    title: z.string(),
    edbId: z.string().optional(),
    searchsploitTerm: z.string(),
    exploitType: ExploitTypeSchema,
    platform: z
      .enum(['linux', 'windows', 'unix', 'multiple', 'php', 'java', 'hardware'])
      .optional(),
    requiresAuth: z.boolean().optional(),
    ref: z.string(),
    references: z.array(z.string()).optional(),
    relatedTechniqueId: z.string().optional(),
    notes: z.string().optional(),
    confidence: ConfidenceSchema,
  })
  .strict();

// ============================================================
// F5/F7 — decision.ts → DecisionMap (+ DecisionNode/Edge/ObservableSignal)
// ============================================================
export const ObservableSignalSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    match: z.enum(['contains', 'regex', 'signalRef']),
    value: z.string(),
    caseInsensitive: z.boolean().optional(),
  })
  .strict();
export const DecisionNodeSchema = z
  .object({
    id: z.string(),
    kind: z.enum(['start', 'check', 'branch', 'action', 'outcome', 'note']),
    label: z.string(),
    checkCommandId: z.string().optional(),
    inlineTemplate: z.string().optional(),
    techniqueId: z.string().optional(),
    actionCommandId: z.string().optional(),
    toolBinaryId: z.string().optional(),
    os: OSSchema.optional(),
    severity: SeveritySchema.optional(),
    observes: z.array(ObservableSignalSchema).optional(),
    outcomeKind: z.enum(['system', 'root', 'da', 'creds', 'dead-end']).optional(),
    confidence: ConfidenceSchema.optional(),
    unverified: z.boolean().optional(),
    references: z.array(z.string()).optional(),
    position: z.object({ x: z.number(), y: z.number() }).strict().optional(),
  })
  .strict();
export const DecisionEdgeSchema = z
  .object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    label: z.string().optional(),
    condition: z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('if-found'), signalId: z.string() }).strict(),
      z.object({ kind: z.literal('if-absent'), signalId: z.string() }).strict(),
      z.object({ kind: z.literal('else') }).strict(),
    ]),
    priority: z.number().optional(),
    confidence: ConfidenceSchema.optional(),
  })
  .strict();
export const DecisionMapSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    os: OSSchema,
    phase: PhaseSchema.optional(),
    rootNodeId: z.string(),
    nodes: z.array(DecisionNodeSchema),
    edges: z.array(DecisionEdgeSchema),
    legend: z.string().optional(),
    layout: z.enum(['dagre', 'tree', 'manual']).optional(),
    packs: z.array(PackIdSchema),
    references: z.array(z.string()).optional(),
    confidence: ConfidenceSchema,
  })
  .strict();

// ============================================================
// F8 — nmap.ts → ServiceRoute (+ RouteMatch)
// ============================================================
export const TransportSchema = z.enum(['tcp', 'udp', 'sctp']);
export const RouteMatchSchema = z.discriminatedUnion('by', [
  z.object({ by: z.literal('port'), port: z.number(), proto: TransportSchema.optional() }).strict(),
  z.object({ by: z.literal('service'), serviceRegex: z.string() }).strict(),
  z.object({ by: z.literal('product'), productRegex: z.string() }).strict(),
  z.object({ by: z.literal('portService'), port: z.number(), serviceRegex: z.string() }).strict(),
]);
export const ServiceRouteSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    match: RouteMatchSchema,
    techniqueIds: z.array(z.string()),
    realmHint: OSSchema.optional(),
    realmWeight: z.number().optional(),
    realmCategory: z.enum(['kerberos', 'ldap', 'smb', 'rdp', 'winrm', 'nix']).optional(),
    severity: SeveritySchema,
    cveCandidate: z.boolean().optional(),
    note: z.string().optional(),
    references: z.array(z.string()).optional(),
  })
  .strict();

// ============================================================
// bundle.v2.ts → CephaloV2Bundle
// ============================================================
export const CephaloV2BundleSchema = z
  .object({
    schemaVersion: z.number(),
    generatedAt: z.string(),
    toolBinaries: z.array(ToolBinarySchema),
    signals: z.array(PrivilegeSignalSchema),
    rules: z.array(PrivilegeRuleSchema),
    intentAliases: z.array(IntentAliasSchema),
    phrasebook: z.array(PhrasebookEntrySchema),
    cve: z.array(CveExploitEntrySchema),
    decisions: z.array(DecisionMapSchema),
    nmapRoutes: z.array(ServiceRouteSchema),
  })
  .strict();
