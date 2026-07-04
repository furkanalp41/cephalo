// src/engine/privilege-parser.ts — F3 deterministic enum-output parser (v2).
// PURE: (pasted enum text, source, curated signals) → SignalMatch[] + verbatim
// unrecognizedLines. Strips ANSI, normalizes whitespace (keeps raw for rawLine +
// case-preserving captures), token-priv fires whether Enabled OR Disabled (state is
// DISPLAY-only — the exploit ENABLES the held priv). No clock, no random, no network.
// Adapted from CODE-PROMPT-v2 §6.2 (regex captures + optional fields strict-guarded).
import type { EnumSource, PrivilegeSignal, SignalMatch, ParsedBuildInfo } from '@/types/advisor';
import type { OS } from '@/types/content';

// Stripping ANSI escape sequences legitimately requires the ESC control char.
// eslint-disable-next-line no-control-regex
const ANSI = /\x1b\[[0-9;]*m/g;
type PrivState = 'enabled' | 'disabled' | 'present';
const ALL_STATES: ReadonlyArray<PrivState> = ['enabled', 'disabled', 'present'];

export function preprocess(text: string): { lines: string[]; raw: string[] } {
  const clean = text.replace(ANSI, '').replace(/\r\n?/g, '\n');
  const raw = clean.split('\n');
  const lines = raw.map((l) => l.replace(/\s+/g, ' ').trim());
  return { lines, raw };
}

export function parseEnumOutput(
  text: string,
  source: EnumSource,
  signals: PrivilegeSignal[],
): { matches: SignalMatch[]; unrecognizedLines: string[] } {
  const { lines, raw } = preprocess(text);
  const matches: SignalMatch[] = [];
  const recognized = new Set<number>();
  const pool = signals.filter((s) => s.source === source || source === 'whoami-all');

  raw.forEach((rawLine, i) => {
    const norm = lines[i];
    if (!norm) return;
    for (const sig of pool) {
      const re = new RegExp(sig.match.pattern, sig.match.flags ?? 'i');
      const m = re.exec(rawLine);
      if (!m) continue;
      // token-priv: fire whether Enabled OR Disabled; record state for DISPLAY only.
      const stateRaw: PrivState = /(Enabled)/i.test(rawLine)
        ? 'enabled'
        : /(Disabled)/i.test(rawLine)
          ? 'disabled'
          : 'present';
      const allow = sig.actionableStates ?? ALL_STATES;
      if (!allow.includes(stateRaw)) continue;
      const captures: Record<string, string> = {};
      (sig.match.captures ?? []).forEach((name, idx) => {
        const g = m[idx + 1];
        if (g != null) captures[name] = g;
      });
      matches.push({ signalId: sig.id, source, rawLine, state: stateRaw, captures });
      recognized.add(i);
      break; // first signal wins per line (deterministic via pool order)
    }
  });

  const unrecognizedLines = raw.filter((l, i) => l.trim() !== '' && !recognized.has(i));
  // de-dup (signalId|rawLine) + stable sort by signalId then rawLine.
  const seen = new Set<string>();
  const out = matches
    .filter((m) => {
      const k = m.signalId + '|' + m.rawLine;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => a.signalId.localeCompare(b.signalId) || a.rawLine.localeCompare(b.rawLine));
  return { matches: out, unrecognizedLines };
}

export function parseBuildInfo(text: string): ParsedBuildInfo {
  const t = text.replace(ANSI, '');
  const win = /\[Version 10\.0\.(\d+)/.exec(t) || /OS Version:\s*\d+\.\d+\.(\d+)/.exec(t);
  const buildNumber = win && win[1] != null ? Number(win[1]) : undefined;
  const kernel = (/Linux\s+\S+\s+(\d+\.\d+\.\d+\S*)/.exec(t) || /(\d+\.\d+\.\d+-\S+)/.exec(t))?.[1];
  const productName = /OS Name:\s*(.+)/.exec(t)?.[1]?.trim();
  const os: OS = buildNumber || /Windows/i.test(t) ? 'windows' : 'linux';
  // exactOptionalPropertyTypes: only set optional fields when actually present.
  const result: ParsedBuildInfo = { os };
  if (buildNumber !== undefined && !Number.isNaN(buildNumber)) result.buildNumber = buildNumber;
  if (productName !== undefined) result.productName = productName;
  if (kernel !== undefined) result.kernel = kernel;
  return result;
}
