// src/engine/nmap/autofill.ts — F8 variable autofill proposals. PURE. NEVER overwrites a
// user-set var (conflicts are still PROPOSED but flagged display-only) and NEVER proposes
// a sensitive var (PASS/NTHASH/AESKEY/…). No clock, no random, no network. §6.6.
import type { NmapHost, AutofillProposal, RealmInference } from '@/types/nmap';
import type { Confidence } from '@/types/content';

const SENSITIVE = new Set(['PASS', 'NTHASH', 'AESKEY', 'SESSION', 'DB_PASS', 'KRB_TICKET']);

function deriveDomain(hostname: string): string | undefined {
  const parts = hostname.split('.').filter(Boolean);
  if (parts.length >= 3) return parts.slice(1).join('.'); // dc.example.lab → example.lab
  if (parts.length === 2) return hostname; // example.lab → example.lab
  return undefined; // bare hostname → no domain
}

export function proposeAutofill(
  host: NmapHost,
  realm: RealmInference,
  userValues: Record<string, string>,
): AutofillProposal[] {
  const out: AutofillProposal[] = [];
  const propose = (varId: string, value: string, source: string, confidence: Confidence): void => {
    if (SENSITIVE.has(varId) || !value) return; // never propose sensitive vars / empties
    const existing = userValues[varId];
    const conflictsWithUserValue = existing != null && existing !== '' && existing !== value;
    out.push({ varId, value, source, confidence, conflictsWithUserValue });
  };

  if (host.ip) {
    propose('RHOST', host.ip, 'nmap host ip', 'verified');
    propose('TARGET', host.ip, 'nmap host ip', 'verified');
  }
  if (realm.os === 'ad' && host.hostname) {
    propose('TARGET', host.hostname, 'nmap hostname (FQDN)', realm.confidence);
    const domain = deriveDomain(host.hostname);
    if (domain) propose('DOMAIN', domain, 'hostname parent domain', realm.confidence);
  }
  return out;
}
