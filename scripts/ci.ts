// scripts/ci.ts — `pnpm ci`. Runs every SHIP-BLOCKING gate (1–14) in order and
// exits non-zero on the first failure. Mirrors .github/workflows/ci.yml. The
// Playwright e2e (Gate 14) requires browser binaries and runs as a separate CI
// job (pnpm test:e2e), not here.
import { execSync } from 'node:child_process';

const steps: [string, string][] = [
  ['Gates 1,2 — Zod-validate + template-var registry (build:content)', 'pnpm build:content'],
  ['v2 datasets — Zod-validate + emit (build:v2)', 'pnpm build:v2'],
  ['Gate 11 — tsc --strict --noEmit', 'pnpm tsc'],
  ['Gate 11 — eslint', 'pnpm lint'],
  ['Engine/parity/search unit tests', 'pnpm test'],
  ['Gate 3 — unverified requires references', 'pnpm gate:unverified-refs'],
  ['Gate 4 — hard-fact (anti-fabrication)', 'pnpm gate:fabrication'],
  ['Gate 5 — routable-IP reject', 'pnpm gate:routable-ip'],
  ['Gate 6 — defang placeholder shape', 'pnpm gate:placeholder'],
  ['Gate 7 — credMode variant completeness', 'pnpm gate:credmode'],
  ['Gate 8 — prose overlap guard', 'pnpm gate:overlap'],
  ['Gate 9 — search side-table integrity', 'pnpm gate:side-table'],
  ['Gate 10 — no-machine-names denylist', 'pnpm gate:denylist'],
  ['Gate 12 — token-key completeness', 'pnpm gate:tokens'],
  ['Gate 13 — coverage + completeness', 'pnpm gate:coverage'],
  ['v2 — tool-provenance', 'pnpm gate:tool-provenance'],
  ['v2 — advisor-coverage', 'pnpm gate:advisor-coverage'],
  ['v2 — intent-resolves', 'pnpm gate:intent-resolves'],
  ['v2 — decision-reachability', 'pnpm gate:decision-reachability'],
  ['v2 — nmap-route-coverage', 'pnpm gate:nmap-route-coverage'],
  ['G21 — no-ambient-clock', 'pnpm gate:no-ambient-clock'],
  ['G15 — cve-antifab', 'pnpm gate:cve-antifab'],
  ['G20 — unverified-citation', 'pnpm gate:unverified-citation'],
  ['G16 — no-ai-deps', 'pnpm gate:no-ai-deps'],
  ['G17 — no-runtime-net', 'pnpm gate:no-runtime-net'],
  ['G18 — csp', 'pnpm gate:csp'],
  ['v3 — pack-coverage', 'pnpm gate:pack-coverage'],
  ['v3 — osce3-cite', 'pnpm gate:osce3-cite'],
  ['v3 — evasion-methodology-only', 'pnpm gate:evasion-methodology-only'],
];

let failed = false;
for (const [name, cmd] of steps) {
  console.log(`\n▶ ${name}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch {
    console.error(`✗ FAILED: ${name}`);
    failed = true;
    break;
  }
}
if (failed) {
  console.error('\n✗ CI failed.');
  process.exit(1);
}
console.log('\n✓ All ship-blocking gates passed.');
