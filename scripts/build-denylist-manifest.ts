// scripts/build-denylist-manifest.ts — AUTHOR-LOCAL ONLY (not a CI gate).
// Reads the gitignored denylist.local.json ({ names: string[], pdfPaths: string[] }),
// emits the COMMITTED hash-only ci/machine-denylist.manifest.json that Gate 10
// consumes. Plaintext machine names NEVER ship — only salted SHA-256 hashes.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const LOCAL = path.join(ROOT, 'denylist.local.json');
const OUT = path.join(ROOT, 'ci', 'machine-denylist.manifest.json');
const SALT = 'cephalo-denylist-v1-7f3a';

const normalize = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '');
const hashTok = (t: string) => createHash('sha256').update(SALT + normalize(t)).digest('hex');

async function main() {
  let local: { names?: string[]; pdfPaths?: string[] } = {};
  try {
    local = JSON.parse(await fs.readFile(LOCAL, 'utf8'));
  } catch {
    // no local denylist — emit empty sets (no machine names exist).
  }
  const denyHashes = [...new Set((local.names ?? []).map(hashTok))].sort();
  const pdfSha256: string[] = [];
  for (const p of local.pdfPaths ?? []) {
    try {
      const buf = await fs.readFile(path.isAbsolute(p) ? p : path.join(ROOT, p));
      pdfSha256.push(createHash('sha256').update(buf).digest('hex'));
    } catch {
      // missing PDF — skip (it must never be in the repo anyway)
    }
  }
  const manifest = {
    schemaVersion: 1,
    salt: SALT,
    note: 'Salted SHA-256 hashes ONLY — never plaintext machine names. Regenerate from denylist.local.json when it changes.',
    denyHashes,
    pdfSha256,
  };
  await fs.writeFile(OUT, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✓ wrote ${denyHashes.length} denyHashes + ${pdfSha256.length} pdf hashes`);
}
main();
