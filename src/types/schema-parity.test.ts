// @vitest-environment node
// Asserts the Zod schemas (src/data/schema.ts) stay in lockstep with the FROZEN
// interfaces. Strategy per entity:
//   1. a sample typed as the FROZEN interface is assignable to z.infer<Schema>
//      (compile-time) — catches a schema MISSING a required field or wrong enum;
//   2. Schema.parse(sample) succeeds at runtime — and `.strict()` rejects unknown
//      keys, catching a schema that ADDED a required field the type lacks.
import { describe, it, expect } from 'vitest';
import type { z } from 'zod';
import * as S from '@/data/schema';
import type {
  Command,
  Technique,
  Section,
  MindMap,
  BloodHoundQuery,
  VariableDef,
  Reference,
  Tag,
  Pack,
} from '@/types/content';

const command: Command = {
  id: 'ad.kerberoast.rubeus',
  title: 'Kerberoast with Rubeus',
  template: 'Rubeus.exe kerberoast /domain:{{DOMAIN}}',
  shell: 'powershell',
  os: ['ad'],
  phase: 'credential-access',
  confidence: 'verified',
  references: ['ref.rubeus'],
  packs: ['oscp'],
};
const _commandInfer: z.infer<typeof S.CommandSchema> = command;

const technique: Technique = {
  id: 'ad.kerberoast',
  title: 'Kerberoasting',
  os: ['ad'],
  phase: 'credential-access',
  summary: 'Request TGS tickets for SPN accounts and crack offline.',
  commands: ['ad.kerberoast.rubeus'],
  tags: ['kerberoasting'],
  references: ['ref.rubeus'],
  confidence: 'verified',
  packs: ['oscp'],
};
const _techniqueInfer: z.infer<typeof S.TechniqueSchema> = technique;

const section: Section = {
  id: 'ad.p10',
  title: 'Active Directory',
  os: 'ad',
  phase: 'credential-access',
  order: 100,
  techniques: ['ad.kerberoast'],
  packs: ['oscp'],
};
const _sectionInfer: z.infer<typeof S.SectionSchema> = section;

const mindmap: MindMap = {
  id: 'ad.mm.credaccess',
  title: 'AD credential access',
  os: 'ad',
  nodes: [{ id: 'n1', label: 'Have creds?', kind: 'decision' }],
  edges: [{ id: 'e1', source: 'n1', target: 'n1', kind: 'then' }],
  layout: 'dagre',
  packs: ['oscp'],
};
const _mindmapInfer: z.infer<typeof S.MindMapSchema> = mindmap;

const bh: BloodHoundQuery = {
  id: 'bh.kerberoastable',
  title: 'Kerberoastable users',
  cypher: 'MATCH (u:User {hasspn:true}) RETURN u',
  category: 'attack-path',
  description: 'Find users with an SPN.',
  references: ['ref.bloodhound'],
  confidence: 'verified',
};
const _bhInfer: z.infer<typeof S.BloodHoundQuerySchema> = bh;

const variable: VariableDef = {
  id: 'LHOST',
  label: 'Attacker IP',
  group: 'network',
  placeholder: '<tun0-ip>',
  example: '198.51.100.10',
  validation: { kind: 'ip' },
};
const _variableInfer: z.infer<typeof S.VariableDefSchema> = variable;

const reference: Reference = { id: 'ref.x', title: 'X', source: 'rfc' };
const _referenceInfer: z.infer<typeof S.ReferenceSchema> = reference;

const tag: Tag = { id: 'smb', label: 'SMB', category: 'service' };
const _tagInfer: z.infer<typeof S.TagSchema> = tag;

const pack: Pack = {
  id: 'oscp',
  label: 'OSCP',
  description: 'core',
  enabledByDefault: true,
  os: ['linux', 'windows', 'ad'],
};
const _packInfer: z.infer<typeof S.PackSchema> = pack;

describe('schema ↔ frozen-type parity', () => {
  it('every frozen-typed sample parses against its Zod schema', () => {
    expect(() => S.CommandSchema.parse(command)).not.toThrow();
    expect(() => S.TechniqueSchema.parse(technique)).not.toThrow();
    expect(() => S.SectionSchema.parse(section)).not.toThrow();
    expect(() => S.MindMapSchema.parse(mindmap)).not.toThrow();
    expect(() => S.BloodHoundQuerySchema.parse(bh)).not.toThrow();
    expect(() => S.VariableDefSchema.parse(variable)).not.toThrow();
    expect(() => S.ReferenceSchema.parse(reference)).not.toThrow();
    expect(() => S.TagSchema.parse(tag)).not.toThrow();
    expect(() => S.PackSchema.parse(pack)).not.toThrow();
  });

  it('strict schemas reject unknown keys', () => {
    expect(() => S.CommandSchema.parse({ ...command, bogus: 1 })).toThrow();
  });

  it('schemas reject invalid enum values', () => {
    expect(() => S.CommandSchema.parse({ ...command, confidence: 'maybe' })).toThrow();
    expect(() => S.SectionSchema.parse({ ...section, os: 'active-directory' })).toThrow();
  });

  // reference the compile-time assignability bindings so they are not elided
  it('compile-time type→infer assignability holds', () => {
    expect([
      _commandInfer,
      _techniqueInfer,
      _sectionInfer,
      _mindmapInfer,
      _bhInfer,
      _variableInfer,
      _referenceInfer,
      _tagInfer,
      _packInfer,
    ]).toHaveLength(9);
  });
});
