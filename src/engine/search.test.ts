// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import {
  createSearchIndex,
  serializeSearchIndex,
  searchEngine,
  phaseOrderOf,
  type SearchSideTable,
} from './search';
import type { SearchDoc } from '@/types/engine';
import type { Confidence } from '@/types/content';

function doc(p: Partial<SearchDoc> & Pick<SearchDoc, 'id' | 'type' | 'title'>): SearchDoc {
  return {
    body: '',
    tags: [],
    os: ['linux'],
    ports: [],
    services: [],
    packs: ['oscp'],
    ...p,
  };
}

const DOCS: SearchDoc[] = [
  doc({ id: 'smb.enum', type: 'technique', title: 'SMB enumeration', body: 'enumerate shares', ports: [445, 139], services: ['smb'], phase: 'enumeration', tool: 'netexec' }),
  doc({ id: 'smb.null', type: 'command', title: 'SMB null session', body: 'null bind', ports: [445], services: ['smb'], phase: 'enumeration', tool: 'smbclient' }),
  doc({ id: 'web.445text', type: 'technique', title: 'Service running on port 445 note', body: 'mentions 445 in text', ports: [8080], services: ['http'], phase: 'web' }),
  doc({ id: 'rubeus.title', type: 'command', title: 'rubeus kerberoast', body: 'irrelevant', phase: 'credential-access', os: ['ad'], tool: 'rubeus' }),
  doc({ id: 'rubeus.body', type: 'technique', title: 'AD credential access', body: 'uses rubeus here', phase: 'credential-access', os: ['ad'] }),
  // Forced score-tie pair: identical indexed content, differ only by side-table confidence.
  doc({ id: 'tie.unverified', type: 'command', title: 'Kerberoast', body: 'roast tgs tickets', phase: 'credential-access', os: ['ad'] }),
  doc({ id: 'tie.verified', type: 'command', title: 'Kerberoast', body: 'roast tgs tickets', phase: 'credential-access', os: ['ad'] }),
];

const CONFIDENCE: Record<string, Confidence> = {
  'smb.enum': 'verified',
  'smb.null': 'verified',
  'web.445text': 'verified',
  'rubeus.title': 'verified',
  'rubeus.body': 'verified',
  'tie.unverified': 'unverified',
  'tie.verified': 'verified',
};

const SIDE: SearchSideTable = Object.fromEntries(
  DOCS.map((d) => [
    d.id,
    {
      confidence: CONFIDENCE[d.id] ?? 'verified',
      phaseOrder: phaseOrderOf(d.phase),
      techniqueId: d.type === 'command' ? `${d.id}.tech` : d.id,
    },
  ]),
);

beforeAll(() => {
  const mini = createSearchIndex(DOCS);
  const index = serializeSearchIndex(mini);
  searchEngine.load({ index, side: SIDE });
});

describe('numeric port query', () => {
  it('floats the SMB cluster (exact port 445) to the top, above a text-only "445" mention', () => {
    const hits = searchEngine.search({ query: '445' });
    const ids = hits.map((h) => h.id);
    expect(ids.slice(0, 2).sort()).toEqual(['smb.enum', 'smb.null']);
    // the doc that only mentions 445 in title text ranks below the exact-port docs
    expect(ids.indexOf('web.445text')).toBeGreaterThan(ids.indexOf('smb.null'));
  });
});

describe('field-boost ordering', () => {
  it('title match outranks body match for the same term', () => {
    const hits = searchEngine.search({ query: 'rubeus' });
    const ids = hits.map((h) => h.id);
    expect(ids.indexOf('rubeus.title')).toBeLessThan(ids.indexOf('rubeus.body'));
  });
});

describe('FROZEN tiebreak — verified beats unverified on equal score', () => {
  it('orders the tied pair verified-first via the side table', () => {
    const hits = searchEngine.search({ query: 'kerberoast' });
    const ids = hits.map((h) => h.id);
    // both tie.* share identical content; only the side table differs
    const vi = ids.indexOf('tie.verified');
    const ui = ids.indexOf('tie.unverified');
    expect(vi).toBeGreaterThanOrEqual(0);
    expect(ui).toBeGreaterThanOrEqual(0);
    expect(vi).toBeLessThan(ui);
  });
});

describe('hit shape + side table node-highlight resolution', () => {
  it('returns matchedFields and resolves a techniqueId for node highlighting', () => {
    const hits = searchEngine.search({ query: 'kerberoast' });
    const hit = hits.find((h) => h.id === 'rubeus.title');
    expect(hit?.matchedFields).toContain('title');
    expect(searchEngine.sideEntry('rubeus.title')?.techniqueId).toBe('rubeus.title.tech');
  });

  it('produces title highlight ranges', () => {
    const hits = searchEngine.search({ query: 'kerberoast' });
    const hit = hits.find((h) => h.id === 'rubeus.title');
    expect(hit?.highlights?.title?.length).toBeGreaterThan(0);
  });
});

describe('filters', () => {
  it('filters by os', () => {
    const hits = searchEngine.search({ query: 'kerberoast', filters: { os: ['ad'] } });
    expect(hits.length).toBeGreaterThan(0);
    const linuxOnly = searchEngine.search({ query: 'kerberoast', filters: { os: ['linux'] } });
    expect(linuxOnly.length).toBe(0);
  });
  it('filters by type', () => {
    const hits = searchEngine.search({ query: 'kerberoast', filters: { type: ['command'] } });
    expect(hits.every((h) => h.type === 'command')).toBe(true);
  });
});

describe('empty query', () => {
  it('returns no hits', () => {
    expect(searchEngine.search({ query: '   ' })).toEqual([]);
  });
});
