// scripts/emit-heatmap.ts — prints the per-OS × per-phase coverage heatmap +
// orphan / required-readiness report from the generated bundle.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

type Heatmap = {
  perOsPhase: Record<string, Record<string, number>>;
  totals: { techniques: number; commands: number; requiredForOscpReadiness: number };
  orphanTechniques: string[];
  requiredUnresolved: string[];
};

const h = JSON.parse(
  readFileSync(path.join(ROOT, 'public', 'content', 'coverage-heatmap.json'), 'utf8'),
) as Heatmap;

console.log('Coverage heatmap (techniques per OS × phase):\n');
const phases = Object.keys(h.perOsPhase.linux ?? {});
const header = ['phase'.padEnd(22), ...Object.keys(h.perOsPhase).map((o) => o.padStart(8))].join('');
console.log(header);
for (const p of phases) {
  const row = [p.padEnd(22), ...Object.keys(h.perOsPhase).map((o) => String(h.perOsPhase[o]?.[p] ?? 0).padStart(8))].join('');
  console.log(row);
}
console.log(
  `\ntotals: ${h.totals.techniques} techniques · ${h.totals.commands} commands · ${h.totals.requiredForOscpReadiness} required-for-readiness`,
);
console.log(`orphan techniques (no command): ${h.orphanTechniques.length ? h.orphanTechniques.join(', ') : 'none'}`);
console.log(`required leaves unresolved: ${h.requiredUnresolved.length ? h.requiredUnresolved.join(', ') : 'none'}`);
