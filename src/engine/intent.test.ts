// @vitest-environment node
// Golden + determinism tests for the F4 intent engine. Most cases use a STUB search so
// the golden ids are independent of bundle drift; one MANDATORY seam test binds the
// REAL frozen SearchEngine (rehydrated from the shipped serialized index) so the
// search({query}) OBJECT contract is type-checked and exercised end-to-end.
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolveIntent, tokenize, type IntentDeps } from '@/engine/intent';
import { searchEngine } from '@/engine/search';
import type { IntentAlias, PhrasebookEntry } from '@/types/ask';
import type { SearchHit, SearchOptions } from '@/types/engine';

const ALIASES: IntentAlias[] = [
  { id: 'alias.kerberoast', canonical: 'kerberoast', aliases: ['kerberoasting', 'roast spns', 'tgs crack'], techniqueIds: ['ad.credaccess.kerberoast'] },
  { id: 'alias.asreproast', canonical: 'asreproast', aliases: ['as-rep roast', 'asrep roasting'], techniqueIds: ['ad.credaccess.asreproast'] },
  { id: 'alias.seimpersonate', canonical: 'seimpersonate', aliases: ['seimpersonateprivilege'], signalKey: 'sig.win.seimpersonate', techniqueIds: ['win.privesc.token'] },
];
const PHRASEBOOK: PhrasebookEntry[] = [
  { id: 'phrase.dump-hashes-powershell', phrasings: ['dump hashes powershell', 'dump hashes with powershell', 'invoke mimikatz dump'], requireAll: ['dump', 'powershell'], intent: 'Dump hashes (PowerShell)', techniqueIds: ['ad.credaccess.dcsync'], minOverlap: 0.5, rationale: 'x', confidence: 'verified' },
  { id: 'phrase.seimpersonate', phrasings: ['what can i do with seimpersonate', 'seimpersonate privilege exploit'], requireAll: ['seimpersonate'], intent: 'SeImpersonate exploitation', techniqueIds: ['win.privesc.token'], requiresSignals: ['sig.win.seimpersonate'], minOverlap: 0.3, rationale: 'x', confidence: 'verified' },
];

// deterministic stub honoring the FROZEN SearchOptions object contract.
const stubSearch = {
  search: (_o: SearchOptions): SearchHit[] => [
    { id: 'ad.enum.smb', type: 'technique', score: 5, matchedFields: ['title'] },
    { id: 'linux.enum.smb', type: 'technique', score: 3, matchedFields: ['title'] },
  ],
};
const deps: IntentDeps = { aliases: ALIASES, phrasebook: PHRASEBOOK, search: stubSearch };

describe('intent — golden resolution', () => {
  it('alias: "kerberoast" / "roast spns" / "asreproast"', () => {
    const k = resolveIntent('kerberoast', deps);
    expect(k.matchVia).toBe('alias');
    expect(k.matchedRecordId).toBe('alias.kerberoast');
    expect(k.techniqueIds).toEqual(['ad.credaccess.kerberoast']);
    expect(resolveIntent('roast spns', deps).matchedRecordId).toBe('alias.kerberoast');
    expect(resolveIntent('asreproast', deps).matchedRecordId).toBe('alias.asreproast');
  });

  it('phrasebook: "find a way to dump hashes with powershell"', () => {
    const r = resolveIntent('find a way to dump hashes with powershell', deps);
    expect(r.matchVia).toBe('phrasebook');
    expect(r.matchedRecordId).toBe('phrase.dump-hashes-powershell');
    expect(r.techniqueIds).toEqual(['ad.credaccess.dcsync']);
    expect(r.searchFallbackUsed).toBe(false);
  });

  it('privilege bridge: "what can I do with SeImpersonate" → signalIds include sig.win.seimpersonate', () => {
    const r = resolveIntent('what can I do with SeImpersonate', deps);
    expect(r.matchVia).toBe('phrasebook'); // deterministic: phrase wins over alias here
    expect(r.signalIds).toContain('sig.win.seimpersonate');
  });

  it('alias-miss falls back to the index (id-sorted)', () => {
    const r = resolveIntent('smb null session enumeration', deps);
    expect(r.matchVia).toBe('search');
    expect(r.searchFallbackUsed).toBe(true);
    expect(r.techniqueIds).toEqual(['ad.enum.smb', 'linux.enum.smb']);
  });

  it('is deterministic across two runs', () => {
    const a = JSON.stringify(resolveIntent('what can I do with SeImpersonate', deps));
    const b = JSON.stringify(resolveIntent('what can I do with SeImpersonate', deps));
    expect(a).toBe(b);
  });
});

describe('intent — stoplist keeps load-bearing short tokens', () => {
  it('ad/sam/spn/smb/rce/suid/db/ca survive tokenize', () => {
    expect(tokenize('ad sam spn smb rce suid db ca')).toEqual(['ad', 'sam', 'spn', 'smb', 'rce', 'suid', 'db', 'ca']);
  });
});

describe('intent — REAL frozen SearchEngine seam', () => {
  beforeAll(() => {
    // rehydrate the shipped serialized index ({ index, side }) into the frozen engine
    const serialized: unknown = JSON.parse(
      readFileSync(new URL('../../public/content/search-index.json', import.meta.url), 'utf8'),
    );
    searchEngine.load(serialized as object);
  });

  it('binds the REAL engine; search({query}) object contract type-checks + fallback returns ordered ids', () => {
    // `search: searchEngine` is the compile-time proof of the SearchOptions-object seam.
    const realDeps: IntentDeps = { aliases: [], phrasebook: [], search: searchEngine };
    const r = resolveIntent('smb', realDeps);
    expect(r.matchVia).toBe('search');
    expect(r.searchFallbackUsed).toBe(true);
    expect(r.techniqueIds.length).toBeGreaterThan(0);
    // ids are deterministically ordered (id-sorted dedup)
    expect([...r.techniqueIds]).toEqual([...r.techniqueIds].sort((a, b) => a.localeCompare(b)));
    // determinism on the real engine
    const r2 = resolveIntent('smb', realDeps);
    expect(JSON.stringify(r)).toBe(JSON.stringify(r2));
  });
});
