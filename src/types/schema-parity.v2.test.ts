// @vitest-environment node
// ADDITIVE (v2) parity: asserts the v2 Zod schemas (src/data/schema.v2.ts) stay in
// lockstep with the NEW v2 type modules. Same strategy as the frozen parity test:
//   1. a sample typed as the v2 interface is assignable to z.infer<Schema> (compile);
//   2. Schema.parse(sample) succeeds and .strict() rejects unknown keys.
// The frozen schema-parity.test.ts stays byte-identical and untouched.
import { describe, it, expect } from 'vitest';
import type { z } from 'zod';
import * as S2 from '@/data/schema.v2';
import type { ToolBinary } from '@/types/arsenal';
import type { PrivilegeSignal, PrivilegeRule } from '@/types/advisor';
import type { IntentAlias, PhrasebookEntry } from '@/types/ask';
import type { CveExploitEntry } from '@/types/cve';
import type { DecisionMap } from '@/types/decision';
import type { ServiceRoute } from '@/types/nmap';
import type { CephaloV2Bundle } from '@/types/bundle.v2';

const toolBinary: ToolBinary = {
  id: 'tool.rubeus',
  name: 'Rubeus',
  category: 'ad-cred',
  format: ['exe'],
  runsOn: ['windows', 'ad'],
  officialRef: 'ref.rubeus',
  shipsOnKali: false,
  fetchNote: 'You fetch this yourself. Nothing is bundled or hosted by Cephalo.',
  confidence: 'verified',
};
const _toolBinaryInfer: z.infer<typeof S2.ToolBinarySchema> = toolBinary;

const privilegeSignal: PrivilegeSignal = {
  id: 'sig.win.seimpersonate',
  os: 'windows',
  source: 'whoami-priv',
  label: 'SeImpersonatePrivilege (held)',
  match: { pattern: 'SeImpersonatePrivilege', flags: 'i' },
  actionableStates: ['enabled', 'disabled', 'present'],
  severity: 'high',
  description: 'Token impersonation privilege; fires whether Enabled or Disabled.',
  confidence: 'verified',
};
const _privilegeSignalInfer: z.infer<typeof S2.PrivilegeSignalSchema> = privilegeSignal;

const privilegeRule: PrivilegeRule = {
  id: 'rule.win.seimpersonate.printspoofer',
  os: 'windows',
  whenSignals: ['sig.win.seimpersonate'],
  buildGate: { minBuild: 17763 },
  recommendsTechniqueId: 'win.privesc.token',
  commandId: 'win.privesc.token.printspoofer',
  toolBinaryId: 'tool.printspoofer',
  rank: 1,
  rationale: 'Held SeImpersonate on a recent build → PrintSpoofer to SYSTEM.',
  confidence: 'verified',
};
const _privilegeRuleInfer: z.infer<typeof S2.PrivilegeRuleSchema> = privilegeRule;

const intentAlias: IntentAlias = {
  id: 'alias.kerberoast',
  canonical: 'kerberoast',
  aliases: ['kerberoasting', 'roast spns', 'tgs crack'],
  techniqueIds: ['ad.credaccess.kerberoast'],
  weight: 1,
};
const _intentAliasInfer: z.infer<typeof S2.IntentAliasSchema> = intentAlias;

const phrasebookEntry: PhrasebookEntry = {
  id: 'phrase.seimpersonate',
  phrasings: ['what can i do with seimpersonate'],
  requireAll: ['seimpersonate'],
  intent: 'SeImpersonate exploitation',
  requiresSignals: ['sig.win.seimpersonate'],
  minOverlap: 0.6,
  rationale: 'Bridges the question to the advisor signal.',
  confidence: 'verified',
};
const _phrasebookEntryInfer: z.infer<typeof S2.PhrasebookEntrySchema> = phrasebookEntry;

const cveEntry: CveExploitEntry = {
  id: 'cve.proftpd.135.modcopy',
  product: 'proftpd',
  versionRange: { exact: '1.3.5' },
  cveId: 'CVE-2015-3306',
  title: 'ProFTPD mod_copy unauthenticated RCE',
  edbId: '36803',
  searchsploitTerm: 'proftpd 1.3.5',
  exploitType: 'remote',
  platform: 'linux',
  ref: 'ref.nvd',
  confidence: 'verified',
};
const _cveEntryInfer: z.infer<typeof S2.CveExploitEntrySchema> = cveEntry;

const decisionMap: DecisionMap = {
  id: 'dec.win.tokenpriv',
  title: 'Windows token-privilege escalation',
  os: 'windows',
  phase: 'privilege-escalation',
  rootNodeId: 'dec.win.tokenpriv.whoami',
  nodes: [
    {
      id: 'dec.win.tokenpriv.whoami',
      kind: 'check',
      label: 'whoami /priv',
      observes: [
        {
          id: 'obs.seimpersonate',
          label: 'SeImpersonate held',
          match: 'signalRef',
          value: 'sig.win.seimpersonate',
        },
      ],
    },
    { id: 'dec.win.tokenpriv.system', kind: 'outcome', label: 'SYSTEM', outcomeKind: 'system' },
  ],
  edges: [
    {
      id: 'e1',
      source: 'dec.win.tokenpriv.whoami',
      target: 'dec.win.tokenpriv.system',
      condition: { kind: 'if-found', signalId: 'sig.win.seimpersonate' },
    },
    {
      id: 'e2',
      source: 'dec.win.tokenpriv.whoami',
      target: 'dec.win.tokenpriv.system',
      condition: { kind: 'else' },
    },
  ],
  packs: ['oscp'],
  confidence: 'verified',
};
const _decisionMapInfer: z.infer<typeof S2.DecisionMapSchema> = decisionMap;

const serviceRoute: ServiceRoute = {
  id: 'route.smb',
  label: 'SMB',
  match: { by: 'port', port: 445 },
  techniqueIds: ['ad.enum.smb'],
  realmHint: 'windows',
  realmCategory: 'smb',
  severity: 'high',
};
const _serviceRouteInfer: z.infer<typeof S2.ServiceRouteSchema> = serviceRoute;

const bundle: CephaloV2Bundle = {
  schemaVersion: 1,
  generatedAt: '1970-01-01T00:00:00.000Z',
  toolBinaries: [toolBinary],
  signals: [privilegeSignal],
  rules: [privilegeRule],
  intentAliases: [intentAlias],
  phrasebook: [phrasebookEntry],
  cve: [cveEntry],
  decisions: [decisionMap],
  nmapRoutes: [serviceRoute],
};
const _bundleInfer: z.infer<typeof S2.CephaloV2BundleSchema> = bundle;

describe('v2 schema ↔ type parity', () => {
  it('every v2-typed sample parses against its Zod schema', () => {
    expect(() => S2.ToolBinarySchema.parse(toolBinary)).not.toThrow();
    expect(() => S2.PrivilegeSignalSchema.parse(privilegeSignal)).not.toThrow();
    expect(() => S2.PrivilegeRuleSchema.parse(privilegeRule)).not.toThrow();
    expect(() => S2.IntentAliasSchema.parse(intentAlias)).not.toThrow();
    expect(() => S2.PhrasebookEntrySchema.parse(phrasebookEntry)).not.toThrow();
    expect(() => S2.CveExploitEntrySchema.parse(cveEntry)).not.toThrow();
    expect(() => S2.DecisionMapSchema.parse(decisionMap)).not.toThrow();
    expect(() => S2.ServiceRouteSchema.parse(serviceRoute)).not.toThrow();
    expect(() => S2.CephaloV2BundleSchema.parse(bundle)).not.toThrow();
  });

  it('strict schemas reject unknown keys', () => {
    expect(() => S2.ToolBinarySchema.parse({ ...toolBinary, bogus: 1 })).toThrow();
    expect(() => S2.PrivilegeRuleSchema.parse({ ...privilegeRule, bogus: 1 })).toThrow();
  });

  it('IntentAlias rejects the removed expandsTo key (expansion is via canonical only)', () => {
    expect(() => S2.IntentAliasSchema.parse({ ...intentAlias, expandsTo: ['x'] })).toThrow();
  });

  it('schemas reject invalid enum values', () => {
    expect(() => S2.ToolBinarySchema.parse({ ...toolBinary, confidence: 'maybe' })).toThrow();
    expect(() => S2.ToolBinarySchema.parse({ ...toolBinary, category: 'bogus-cat' })).toThrow();
    expect(() => S2.ServiceRouteSchema.parse({ ...serviceRoute, severity: 'extreme' })).toThrow();
  });

  it('discriminated unions reject an unknown branch tag', () => {
    expect(() =>
      S2.DecisionEdgeSchema.parse({
        id: 'eX',
        source: 'a',
        target: 'b',
        condition: { kind: 'if-maybe', signalId: 's' },
      }),
    ).toThrow();
    expect(() =>
      S2.RouteMatchSchema.parse({ by: 'banner', value: 'x' }),
    ).toThrow();
  });

  // reference the compile-time assignability bindings so they are not elided
  it('compile-time type→infer assignability holds', () => {
    expect([
      _toolBinaryInfer,
      _privilegeSignalInfer,
      _privilegeRuleInfer,
      _intentAliasInfer,
      _phrasebookEntryInfer,
      _cveEntryInfer,
      _decisionMapInfer,
      _serviceRouteInfer,
      _bundleInfer,
    ]).toHaveLength(9);
  });
});
