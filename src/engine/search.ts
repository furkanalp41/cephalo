// src/engine/search.ts
// MiniSearch wrapper implementing the FROZEN `SearchEngine` contract.
//
// The index is built + serialized at COMPILE TIME (scripts/build-content.ts) and
// shipped as static JSON; at boot `load()` rehydrates it instantly — no network,
// no re-index.
//
// FROZEN ranking: field boosts title^6 tool^5 tags^4 services^3 ports^3
// template^2 body^1; fuzzy 0.2, prefix true; numeric query boosts exact ports;
// `verified` > `unverified` on ties; final tiebreak canonical Phase order then
// alpha by title.
//
// The `verified > unverified` tiebreak and command→technique node-highlight are
// NOT on the frozen SearchDoc/SearchHit — they are powered by a build-time SIDE
// TABLE (search-side.json) loaded here alongside the serialized index (§7.1).
// This adds ZERO fields to the frozen interfaces.

import MiniSearch from 'minisearch';
import type { SearchDoc, SearchEngine, SearchHit, SearchOptions } from '@/types/engine';
import type { Confidence, Id, Phase } from '@/types/content';

// ---- side table (non-frozen; external to SearchDoc/SearchHit) ----
export interface SearchSideEntry {
  confidence: Confidence;
  phaseOrder: number;
  techniqueId?: Id;
}
export type SearchSideTable = Record<string, SearchSideEntry>;

/** The payload `load()` accepts (an `object` per the frozen signature). */
export interface SerializedSearch {
  index: string; // MiniSearch.toJSON() stringified
  side: SearchSideTable;
}

// ---- FROZEN canonical Phase order (the side table's phaseOrder index) ----
export const CANONICAL_PHASE_ORDER: readonly Phase[] = [
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
];
export function phaseOrderOf(phase: Phase | undefined): number {
  if (!phase) return CANONICAL_PHASE_ORDER.length;
  const i = CANONICAL_PHASE_ORDER.indexOf(phase);
  return i === -1 ? CANONICAL_PHASE_ORDER.length : i;
}

// ---- index configuration (shared by build + load so they stay in lockstep) ----
export const SEARCH_INDEX_FIELDS = [
  'title',
  'tool',
  'tags',
  'services',
  'ports',
  'template',
  'body',
] as const;
export const SEARCH_STORE_FIELDS = ['type', 'title', 'ports', 'phase', 'os', 'packs'] as const;
export const SEARCH_BOOST: Record<string, number> = {
  title: 6,
  tool: 5,
  tags: 4,
  services: 3,
  ports: 3,
  template: 2,
  body: 1,
};

/** Arrays → space-joined strings; everything else → String. Applied to both
 *  indexed and stored fields (MiniSearch runs stored fields through extractField),
 *  so re-rank reads them back as strings. */
function extractField(doc: SearchDoc, field: string): string {
  const v = (doc as unknown as Record<string, unknown>)[field];
  if (Array.isArray(v)) return v.join(' ');
  if (v === undefined || v === null) return '';
  return String(v);
}

export function searchIndexOptions() {
  return {
    fields: [...SEARCH_INDEX_FIELDS],
    storeFields: [...SEARCH_STORE_FIELDS],
    idField: 'id',
    extractField,
  };
}

/** Build-time: create a fresh index from docs. */
export function createSearchIndex(docs: SearchDoc[]): MiniSearch<SearchDoc> {
  const mini = new MiniSearch<SearchDoc>(searchIndexOptions());
  mini.addAll(docs);
  return mini;
}

/** Build-time: serialize an index to a JSON string for shipping. */
export function serializeSearchIndex(mini: MiniSearch<SearchDoc>): string {
  return JSON.stringify(mini.toJSON());
}

// ---- helpers ----
function toPortList(stored: unknown): number[] {
  if (Array.isArray(stored)) return stored.map(Number).filter((n) => !Number.isNaN(n));
  if (stored === undefined || stored === null) return [];
  return String(stored)
    .split(/[\s,]+/)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}
function toStrList(stored: unknown): string[] {
  if (Array.isArray(stored)) return stored.map(String);
  if (stored === undefined || stored === null) return [];
  return String(stored).split(/[\s,]+/).filter(Boolean);
}

function confidenceRank(c: Confidence | undefined): number {
  return c === 'verified' ? 0 : 1; // verified sorts BEFORE unverified
}

// MiniSearch result is the stored fields + id/score/terms/match.
type RankedResult = {
  id: Id;
  score: number;
  terms: string[];
  match: Record<string, string[]>;
  type: SearchDoc['type'];
  title: string;
  ports: number[];
  os: string[];
  packs: string[];
  phase?: string;
};

function computeHighlights(title: string, terms: string[]): Record<string, Array<[number, number]>> {
  const ranges: Array<[number, number]> = [];
  const lower = title.toLowerCase();
  for (const term of terms) {
    const t = term.toLowerCase();
    if (!t) continue;
    let from = 0;
    let idx = lower.indexOf(t, from);
    while (idx !== -1) {
      ranges.push([idx, idx + t.length]);
      from = idx + t.length;
      idx = lower.indexOf(t, from);
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  return ranges.length ? { title: ranges } : {};
}

class SearchEngineImpl implements SearchEngine {
  private mini: MiniSearch<SearchDoc> | null = null;
  private side: SearchSideTable = {};

  load(serialized: string | object): void {
    // Accept: a SerializedSearch object, a JSON string of one, or a bare
    // serialized index (side table then defaults to empty — degraded but safe).
    let payload: Partial<SerializedSearch>;
    if (typeof serialized === 'string') {
      const parsed: unknown = JSON.parse(serialized);
      payload = (parsed && typeof parsed === 'object' ? parsed : {}) as Partial<SerializedSearch>;
    } else {
      payload = serialized as Partial<SerializedSearch>;
    }

    const indexJson = payload.index;
    if (indexJson === undefined) {
      throw new Error('SearchEngine.load: missing serialized `index` payload');
    }
    const indexStr = typeof indexJson === 'string' ? indexJson : JSON.stringify(indexJson);
    this.mini = MiniSearch.loadJSON<SearchDoc>(indexStr, searchIndexOptions());
    this.side = payload.side ?? {};
  }

  /** Exposed for the store/components so a command hit can resolve its owning
   *  technique for MindMap node highlighting (§7.1). */
  sideEntry(id: Id): SearchSideEntry | undefined {
    return this.side[id];
  }

  search(o: SearchOptions): SearchHit[] {
    if (!this.mini) throw new Error('SearchEngine.search called before load()');
    const query = o.query.trim();
    if (!query) return [];

    const raw = this.mini.search(query, {
      fuzzy: 0.2,
      prefix: true,
      boost: SEARCH_BOOST,
    }) as unknown as RankedResult[];

    const isNumeric = /^\d+$/.test(query);
    const queryPort = isNumeric ? Number(query) : null;

    // Numeric-port boost: exact-port docs win.
    const ranked = raw.map((r) => {
      const ports = toPortList(r.ports);
      let score = r.score;
      if (queryPort !== null && ports.includes(queryPort)) score += 1_000_000;
      return { r, ports, score };
    });

    // Apply frozen filters using stored fields.
    const filtered = ranked.filter(({ r, ports }) => {
      const f = o.filters;
      if (!f) return true;
      if (f.type && f.type.length && !f.type.includes(r.type)) return false;
      if (f.os && f.os.length) {
        const docOs = toStrList(r.os);
        if (!f.os.some((x) => docOs.includes(x))) return false;
      }
      if (f.packs && f.packs.length) {
        const docPacks = toStrList(r.packs);
        if (!f.packs.some((x) => docPacks.includes(x))) return false;
      }
      if (f.phase && f.phase.length) {
        if (!r.phase || !f.phase.includes(r.phase as Phase)) return false;
      }
      void ports;
      return true;
    });

    // FROZEN tie-break: score desc → confidence(verified<unverified) →
    // canonical phaseOrder asc → alpha by title.
    filtered.sort((a, b) => {
      if (Math.abs(a.score - b.score) > 1e-9) return b.score - a.score;
      const sa = this.side[a.r.id];
      const sb = this.side[b.r.id];
      const ca = confidenceRank(sa?.confidence);
      const cb = confidenceRank(sb?.confidence);
      if (ca !== cb) return ca - cb;
      const pa = sa?.phaseOrder ?? CANONICAL_PHASE_ORDER.length;
      const pb = sb?.phaseOrder ?? CANONICAL_PHASE_ORDER.length;
      if (pa !== pb) return pa - pb;
      return (a.r.title || '').localeCompare(b.r.title || '');
    });

    const limit = o.limit ?? 50;
    return filtered.slice(0, limit).map(({ r }) => {
      const matchedFields = Array.from(
        new Set(Object.values(r.match ?? {}).flat()),
      );
      const highlights = computeHighlights(r.title || '', r.terms ?? []);
      const hit: SearchHit = {
        id: r.id,
        type: r.type,
        score: r.score,
        matchedFields,
      };
      if (Object.keys(highlights).length) hit.highlights = highlights;
      return hit;
    });
  }
}

/** Shared singleton search engine. */
export const searchEngine = new SearchEngineImpl();
export type { SearchEngineImpl };
