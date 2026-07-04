// src/engine/nmap/util.ts — shared, pure helpers for the F8 nmap parsers. No clock,
// no random, no network. Strict-safe (regex captures guarded).
import type { PortState, Transport } from '@/types/nmap';

// Stripping ANSI escape sequences legitimately requires the ESC control char.
// eslint-disable-next-line no-control-regex
export const ANSI = /\x1b\[[0-9;]*m/g;

const VALID_STATES: ReadonlyArray<PortState> = ['open', 'filtered', 'closed', 'open|filtered', 'closed|filtered', 'unfiltered'];

export function normState(s: string): PortState {
  return (VALID_STATES as readonly string[]).includes(s) ? (s as PortState) : 'filtered';
}

export function asTransport(s: string): Transport {
  return s === 'udp' || s === 'sctp' ? s : 'tcp';
}

// Best-effort split of a service/version blob into product + version (deterministic).
export function splitProductVersion(rest: string): { product?: string; version?: string } {
  const out: { product?: string; version?: string } = {};
  const vm = /\b(\d+(?:\.\d+)+[\w.-]*)\b/.exec(rest);
  if (vm && vm[1] != null) {
    out.version = vm[1];
    const prod = rest.slice(0, vm.index).trim();
    out.product = prod || rest;
  } else if (rest) {
    out.product = rest;
  }
  return out;
}
