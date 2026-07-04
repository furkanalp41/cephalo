// src/engine/nmap/realm.ts — F8 realm inference. PURE: category-deduped weighted scores
// (each realmCategory counted once via a seenCat Set). AD wins ONLY if kerberos OR
// (ldap AND smb) is present; otherwise the AD score folds into windows. A Samba product
// banner overrides 445 → linux (suppresses the smb→windows signal). confidence:'verified'
// only on margin ≥ 2 (and a real AD-gate for the ad realm). CODE-PROMPT-v2 §6.6.
import type { NmapHost, ServiceRoute, RealmInference } from '@/types/nmap';
import type { OS, Confidence } from '@/types/content';
import { route } from './router';

export function inferRealm(host: NmapHost, routes: ServiceRoute[]): RealmInference {
  const firings = route(host, routes);
  const scores: Record<OS, number> = { linux: 0, windows: 0, ad: 0 };
  const evidence: string[] = [];
  const seenCat = new Set<string>();
  const sambaOverride = firings.some((f) => f.matchedOn === 'product' && /samba/i.test(f.matchedText));

  for (const f of firings) {
    const cat = f.route.realmCategory;
    const hint = f.route.realmHint;
    const weight = f.route.realmWeight ?? 1;
    if (sambaOverride && cat === 'smb') continue; // Samba: 445 is NOT a windows/AD smb signal
    if (cat) {
      if (seenCat.has(cat)) continue; // each category counts once
      seenCat.add(cat);
    }
    if (hint) {
      scores[hint] += weight;
      evidence.push(`${f.port}/${f.route.label} → ${hint} (+${weight})`);
    }
  }

  const adGate = seenCat.has('kerberos') || (seenCat.has('ldap') && seenCat.has('smb'));
  if (!adGate && scores.ad > 0) {
    evidence.push(`AD-gate not met → folding ad(${scores.ad}) into windows`);
    scores.windows += scores.ad;
    scores.ad = 0;
  }

  const ranked = (Object.keys(scores) as OS[])
    .map((os) => [os, scores[os]] as [OS, number])
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const top = ranked[0];
  const second = ranked[1];
  const os: OS = top && top[1] > 0 ? top[0] : 'linux';
  const margin = (top?.[1] ?? 0) - (second?.[1] ?? 0);
  const confidence: Confidence = margin >= 2 && (os !== 'ad' || adGate) ? 'verified' : 'unverified';
  return { os, confidence, scores, evidence };
}
