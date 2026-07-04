// src/data/pack-manifests.ts — per-pack descriptors (NON-frozen; a local interface that
// references frozen PackId/OS/RefId). Consumed by PackSwitcher + the coverage audit.
import type { PackId, OS, RefId } from '@/types/content';

export interface PackManifest {
  id: PackId;
  label: string;
  blurb: string;
  defaultOsSkin: OS; // which data-os skin the realm wears when this pack is focused
  techniqueRoots: string[]; // dotted-id prefixes, e.g. ['oswe.']
  kind: 'command-pack' | 'reference-pack';
  primaryRefs: RefId[];
  ringzeroLink?: RefId; // osed/osee only → ref.ringzero
  badgeTokenKey: string; // --cph-pack-<id>
}

export const PACK_MANIFESTS: PackManifest[] = [
  {
    id: 'oswe',
    label: 'OSWE / WEB-300',
    blurb: 'White-box web exploitation: source-review → auth bypass → RCE.',
    defaultOsSkin: 'linux',
    techniqueRoots: ['oswe.'],
    kind: 'command-pack',
    primaryRefs: ['ref.oswe.timip', 'ref.ysoserialnet', 'ref.offsec.web300'],
    badgeTokenKey: '--cph-pack-oswe',
  },
  {
    id: 'osep',
    label: 'OSEP / PEN-300',
    blurb: 'Evasion methodology + lateral movement, MSSQL, AD. Reuses OSCP AD via cross-links.',
    defaultOsSkin: 'ad',
    techniqueRoots: ['osep.'],
    kind: 'command-pack',
    primaryRefs: ['ref.osep.chvancooten', 'ref.offsec.pen300'],
    badgeTokenKey: '--cph-pack-osep',
  },
  {
    id: 'osed',
    label: 'OSED / EXP-301',
    blurb: 'Windows user-mode exploit-dev reference (WinDbg/mona/nasm). Deep hands-on → Ringzero.',
    defaultOsSkin: 'windows',
    techniqueRoots: ['osed.'],
    kind: 'reference-pack',
    primaryRefs: ['ref.osed.epi052', 'ref.corelan', 'ref.offsec.exp301'],
    ringzeroLink: 'ref.ringzero',
    badgeTokenKey: '--cph-pack-osed',
  },
  {
    id: 'osee',
    label: 'OSEE / EXP-401',
    blurb: 'Advanced Windows exploitation reference (concept + cited links). Deep hands-on → Ringzero.',
    defaultOsSkin: 'windows',
    techniqueRoots: ['osee.'],
    kind: 'reference-pack',
    primaryRefs: ['ref.osee.nccmitigations', 'ref.offsec.exp401'],
    ringzeroLink: 'ref.ringzero',
    badgeTokenKey: '--cph-pack-osee',
  },
];

export const PACK_MANIFEST_BY_ID: Record<string, PackManifest> = Object.fromEntries(
  PACK_MANIFESTS.map((m) => [m.id, m]),
);
