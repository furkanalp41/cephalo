// scripts/build-overlap-fingerprints.ts — AUTHOR-LOCAL ONLY (not a CI gate).
// Reads the gitignored reference-scratch/*.txt, computes hash-only 8-gram shingle
// fingerprints, and writes the COMMITTED ci/overlap-fingerprints.json that Gate 8
// consumes. The plaintext reference prose NEVER enters git — only the hashes do.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SCRATCH = path.join(ROOT, 'reference-scratch');
const OUT = path.join(ROOT, 'ci', 'overlap-fingerprints.json');
const THRESHOLD = 0.25;

function shingles(text: string, n = 8): string[] {
  const words = text.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i + n <= words.length; i++)
    out.push(createHash('sha1').update(words.slice(i, i + n).join(' ')).digest('hex').slice(0, 16));
  return out;
}

async function main() {
  const fingerprints = new Set<string>();
  try {
    const files = await fs.readdir(SCRATCH, { recursive: true });
    for (const rel of files) {
      if (!rel.endsWith('.txt') && !rel.endsWith('.md')) continue;
      const text = await fs.readFile(path.join(SCRATCH, rel), 'utf8');
      for (const h of shingles(text)) fingerprints.add(h);
    }
  } catch {
    // reference-scratch absent — emit an empty set (all prose original).
  }
  const manifest = {
    schemaVersion: 1,
    threshold: THRESHOLD,
    note: 'Hash-only 8-gram shingle fingerprints (no prose). Regenerate when reference-scratch changes.',
    fingerprints: [...fingerprints].sort(),
  };
  await fs.writeFile(OUT, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✓ wrote ${manifest.fingerprints.length} fingerprints to ci/overlap-fingerprints.json`);
}
main();
