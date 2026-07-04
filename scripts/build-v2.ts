// scripts/build-v2.ts — assembles the v2 (arsenal) datasets into a CephaloV2Bundle,
// Zod-validates it (throws with field path + reason on drift), and emits the per-dataset
// JSON artifacts + the aggregate to public/content/. Build-time only; `zod` never enters
// the app bundle. generatedAt is a build-time stamp (NOT a runtime/engine clock).
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOL_BINARIES } from '@/data/v2/toolBinaries';
import { SIGNALS } from '@/data/v2/signals';
import { RULES } from '@/data/v2/rules';
import { INTENT_ALIASES, PHRASEBOOK } from '@/data/v2/intents';
import { CVE_ENTRIES } from '@/data/v2/cve';
import { DECISIONS } from '@/data/v2/decisions';
import { NMAP_ROUTES } from '@/data/v2/nmapRoutes';
import { CephaloV2BundleSchema } from '@/data/schema.v2';
import type { CephaloV2Bundle } from '@/types/bundle.v2';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'content');

async function main(): Promise<void> {
  const bundle: CephaloV2Bundle = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    toolBinaries: TOOL_BINARIES,
    signals: SIGNALS,
    rules: RULES,
    intentAliases: INTENT_ALIASES,
    phrasebook: PHRASEBOOK,
    cve: CVE_ENTRIES,
    decisions: DECISIONS,
    nmapRoutes: NMAP_ROUTES,
  };

  // hard-validate: any drift from the v2 type contract fails the build with a path+reason.
  const parsed = CephaloV2BundleSchema.parse(bundle);

  await fs.mkdir(OUT_DIR, { recursive: true });
  const write = (name: string, data: unknown) =>
    fs.writeFile(path.join(OUT_DIR, name), JSON.stringify(data) + '\n', 'utf8');

  await Promise.all([
    write('arsenal.json', parsed.toolBinaries),
    write('signals.json', parsed.signals),
    write('rules.json', parsed.rules),
    write('intents.json', { intentAliases: parsed.intentAliases, phrasebook: parsed.phrasebook }),
    write('cve.json', parsed.cve),
    write('decisions.json', parsed.decisions),
    write('nmap-routes.json', parsed.nmapRoutes),
    write('cephalo-v2.json', parsed),
  ]);

  console.log(
    `v2 build ✓ — ${parsed.toolBinaries.length} tools, ${parsed.signals.length} signals, ` +
      `${parsed.rules.length} rules, ${parsed.intentAliases.length} aliases, ${parsed.phrasebook.length} phrases, ` +
      `${parsed.cve.length} cve, ${parsed.decisions.length} decisions, ${parsed.nmapRoutes.length} routes → public/content/`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
