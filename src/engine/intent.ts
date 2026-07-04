// src/engine/intent.ts — F4 deterministic intent resolution OVER the frozen MiniSearch
// (v2). PURE: normalize → alias-expand → phrasebook/alias short-circuit → index
// fallback. No AI, no clock, no random, no NLP/ML lib; `id` is the final stable
// tiebreak. The index fallback calls the FROZEN SearchEngine via a SearchOptions
// OBJECT (search({query})), never a bare string. Adapted from CODE-PROMPT-v2 §6.1.
import type { IntentAlias, PhrasebookEntry, IntentResolution } from '@/types/ask';
import type { SearchEngine } from '@/types/engine';

// CURATED stoplist: NEVER includes load-bearing short tokens (ad/sam/spn/smb/rce/suid/db/ca).
const STOPLIST = new Set([
  'a', 'an', 'the', 'to', 'of', 'for', 'with', 'how', 'do', 'i', 'can', 'what', 'in', 'on',
  'using', 'use', 'my', 'me', 'find', 'way', 'get', 'please', 'want', 'need', 'some', 'this',
  'that', 'via', 'and',
]);

// tiny table-driven stemmer, applied once, longest-first
const STEM_TABLE: ReadonlyArray<[RegExp, string]> = [
  [/ing$/, ''],
  [/ers$/, 'er'],
  [/s$/, ''],
  [/ed$/, ''],
];

export function normalize(q: string): string {
  return q
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stem(t: string): string {
  if (t.length <= 3) return t; // protect short load-bearing tokens
  for (const [re, rep] of STEM_TABLE) {
    if (re.test(t)) return t.replace(re, rep);
  }
  return t;
}

export function tokenize(norm: string): string[] {
  return norm
    .split(' ')
    .filter(Boolean)
    .filter((t) => !STOPLIST.has(t))
    .map(stem);
}

function jaccard(a: string[], b: string[]): number {
  const A = new Set(a),
    B = new Set(b);
  let inter = 0;
  A.forEach((x) => {
    if (B.has(x)) inter++;
  });
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : inter / union;
}

function maxAliasLen(a: IntentAlias): number {
  return Math.max(a.canonical.length, ...a.aliases.map((s) => s.length));
}

function dedup<T>(xs: T[]): T[] {
  return [...new Set(xs)].sort((a, b) => String(a).localeCompare(String(b)));
}

// SEAM: typed against the FROZEN engine; search consumes a SearchOptions OBJECT.
export interface IntentDeps {
  aliases: IntentAlias[];
  phrasebook: PhrasebookEntry[];
  search: Pick<SearchEngine, 'search'>; // search(o: SearchOptions): SearchHit[]
}

export function resolveIntent(query: string, deps: IntentDeps): IntentResolution {
  const normalized = normalize(query);
  const tokens = tokenize(normalized);

  // (2) greedy longest-match alias expansion (sorted longest alias first → deterministic)
  const aliasHits: IntentAlias[] = [];
  const expanded = new Set(tokens);
  const sortedAliases = [...deps.aliases].sort(
    (x, y) => maxAliasLen(y) - maxAliasLen(x) || x.id.localeCompare(y.id),
  );
  for (const al of sortedAliases) {
    const phrases = [al.canonical, ...al.aliases].map(normalize);
    if (phrases.some((p) => normalized.includes(p))) {
      aliasHits.push(al);
      tokenize(al.canonical).forEach((t) => expanded.add(t)); // expand via canonical only (no expandsTo)
    }
  }
  const expandedTokens = [...expanded];

  // (3) privilege short-circuit
  const signalIds = aliasHits.flatMap((al) => (al.signalKey ? [al.signalKey] : []));

  // (4) phrasebook match (requireAll gate + Jaccard ≥ minOverlap), rank 0
  let best: { entry: PhrasebookEntry; score: number } | null = null;
  for (const e of deps.phrasebook) {
    if (e.requireAll && !e.requireAll.every((r) => expandedTokens.includes(stem(normalize(r))))) continue;
    const minOverlap = e.minOverlap ?? 0.6;
    let score = 0;
    for (const ph of e.phrasings) score = Math.max(score, jaccard(expandedTokens, tokenize(ph)));
    if (
      score >= minOverlap &&
      (!best || score > best.score || (score === best.score && e.id.localeCompare(best.entry.id) < 0))
    ) {
      best = { entry: e, score };
    }
  }
  if (best) {
    return {
      query,
      normalized,
      matchVia: 'phrasebook',
      matchedRecordId: best.entry.id,
      techniqueIds: dedup(best.entry.techniqueIds ?? []),
      commandIds: dedup(best.entry.commandIds ?? []),
      signalIds: dedup([...(best.entry.requiresSignals ?? []), ...signalIds]),
      searchFallbackUsed: false,
      explanation: `Matched phrasebook "${best.entry.intent}" (overlap ${best.score.toFixed(2)} ≥ ${best.entry.minOverlap ?? 0.6}).`,
    };
  }
  if (aliasHits.length) {
    const top = [...aliasHits].sort((x, y) => (y.weight ?? 0) - (x.weight ?? 0) || x.id.localeCompare(y.id))[0];
    if (top) {
      return {
        query,
        normalized,
        matchVia: 'alias',
        matchedRecordId: top.id,
        techniqueIds: dedup(top.techniqueIds ?? []),
        commandIds: dedup(top.commandIds ?? []),
        signalIds: dedup(signalIds),
        searchFallbackUsed: false,
        explanation: `Matched alias "${top.canonical}".`,
      };
    }
  }

  // (5) index fallback over expanded query — FROZEN SearchOptions object, not a string
  const hits = deps.search.search({ query: expandedTokens.join(' ') });
  return {
    query,
    normalized,
    matchVia: 'search',
    techniqueIds: dedup(hits.map((h) => h.id)),
    commandIds: [],
    signalIds: dedup(signalIds),
    searchFallbackUsed: true,
    explanation: `No alias/phrase pinned; fell back to offline index over the expanded query.`,
  };
}
