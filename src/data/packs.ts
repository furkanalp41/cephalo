// src/data/packs.ts — the pack registry. OSCP is enabled by default; OSWE/OSEP
// are extensibility seams (separate bundles, lazy-loaded). See §6.
import type { Pack } from '@/types/content';

export const PACKS: Pack[] = [
  {
    id: 'oscp',
    label: 'OSCP / PEN-200',
    description:
      'Linux, Windows and Active Directory command-and-technique core for the OSCP kill chain.',
    enabledByDefault: true,
    os: ['linux', 'windows', 'ad'],
    version: '1',
  },
  {
    id: 'oswe',
    label: 'OSWE / WEB-300',
    description: 'White-box web exploitation: source-review → auth bypass → RCE (22 techniques).',
    enabledByDefault: false,
    os: ['linux'],
    version: '1',
  },
  {
    id: 'osep',
    label: 'OSEP / PEN-300',
    description: 'Evasion methodology + lateral movement, MSSQL, AD (16 techniques; reuses OSCP via cross-links).',
    enabledByDefault: false,
    os: ['windows', 'ad'],
    version: '1',
  },
  // osed/osee ride the (string & {}) PackId arm — ZERO frozen union edit.
  {
    id: 'osed',
    label: 'OSED / EXP-301',
    description: 'Windows user-mode exploit-dev reference pack (10 techniques; WinDbg/mona/nasm helpers; deep → Ringzero).',
    enabledByDefault: false,
    os: ['windows'],
    version: '1',
  },
  {
    id: 'osee',
    label: 'OSEE / EXP-401',
    description: 'Advanced Windows exploitation reference pack (5 techniques; concept + cited links; deep → Ringzero).',
    enabledByDefault: false,
    os: ['windows'],
    version: '1',
  },
];
