// src/types/tokens.v2.ts — ADDITIVE (v2). NEW --cph- KEYS only; frozen tokens.ts is
// untouched. Code declares KEYS; design supplies VALUES. NOT a frozen module.
export const TOKEN_KEYS_V2 = {
  ask:      ['--cph-ask-bg','--cph-ask-surface','--cph-ask-input-bg','--cph-ask-octo-halo',
             '--cph-ask-suggestion','--cph-ask-result-accent','--cph-ask-explain-fg',
             '--cph-intent-pin-accent','--cph-octo-large-glow'],
  advisor:  ['--cph-advisor-signal-detected','--cph-advisor-signal-strong','--cph-advisor-signal-weak',
             '--cph-advisor-signal-unverified','--cph-advisor-rank-1','--cph-advisor-rank-track'],
  decision: ['--cph-dec-node-check','--cph-dec-node-action','--cph-dec-node-outcome-system',
             '--cph-dec-node-outcome-da','--cph-dec-branch-if-found','--cph-dec-branch-if-absent',
             '--cph-dec-branch-else','--cph-dec-branch-manual','--cph-dec-trace'],
  tool:     ['--cph-tool-verified-src','--cph-tool-kali-path-bg','--cph-tool-fetch-warn'],
  cve:      ['--cph-cve-match-exact','--cph-cve-match-fuzzy','--cph-cve-degraded','--cph-cve-edb-bg'],
  nmap:     ['--cph-nmap-realm-ad','--cph-nmap-realm-windows','--cph-nmap-realm-linux',
             '--cph-nmap-confirm-bg','--cph-nmap-explain-fg'],
  shared:   ['--cph-unverified-badge-bg','--cph-unverified-badge-fg'],
} as const;
