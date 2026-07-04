// src/engine/template.ts
// The templating engine — pure, framework-free TS. Imported BOTH at runtime
// (React components) and at build time (the content validator), so it must not
// touch React or the DOM. btoa / TextEncoder / encodeURIComponent are Web APIs
// available globally in both Node 20 and the browser.
//
// Implements the FROZEN `TemplateEngine` contract (src/types/engine.ts §2).
//
// Grammar (FROZEN): {{VAR}} | {{VAR:198.51.100.10}} (inline fallback) | {{VAR|quote}} (filter)
// Regex   (FROZEN): /\{\{\s*([A-Z0-9_]+)(?::([^}|]*))?(?:\|\s*(\w+))?\s*\}\}/g
//
// filled chain (FROZEN, §5.2): values[name] ?? fallback ?? defs[name].placeholder
//   — `default` is NEVER read here; it is seeded into `values` at store init,
//     so a defaulted var arrives as a real `values[name]` and resolves normally.

import type {
  TemplateAST,
  ParsedToken,
  TokenFilter,
  RenderOptions,
  RenderResult,
  RenderSpan,
  TemplateEngine,
} from '@/types/engine';
import type { VariableValidation, VariableDef } from '@/types/content';

/** The single FROZEN token grammar. A fresh RegExp is minted per parse because
 *  the `g` flag makes `lastIndex` stateful. */
export const TOKEN_PATTERN = '\\{\\{\\s*([A-Z0-9_]+)(?::([^}|]*))?(?:\\|\\s*(\\w+))?\\s*\\}\\}';

const KNOWN_FILTERS: ReadonlySet<string> = new Set([
  'quote',
  'upper',
  'lower',
  'urlencode',
  'b64',
]);

function uniquePreserveOrder(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const n of names) {
    if (!seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

// ---------- filters ----------

/** Bash/POSIX single-quote escaping ONLY (the engine has no shell context — §5.3).
 *  Each `'` becomes `'\''` (close-quote, escaped-quote, re-open-quote); the whole
 *  value is wrapped in single quotes. NOT valid for powershell/cmd/sql. */
export function bashQuote(value: string): string {
  return `'` + value.replace(/'/g, `'\\''`) + `'`;
}

/** UTF-8 → standard base64, universal across Node 20 + browser. */
function toBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export function applyFilter(value: string, filter: TokenFilter | undefined): string {
  switch (filter) {
    case 'quote':
      return bashQuote(value);
    case 'upper':
      return value.toUpperCase();
    case 'lower':
      return value.toLowerCase();
    case 'urlencode':
      return encodeURIComponent(value);
    case 'b64':
      return toBase64(value);
    default:
      return value;
  }
}

// ---------- validation ----------

const IPV4_RE =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
// Pragmatic IPv6 matcher (covers full + compressed `::` forms incl. IPv4-mapped tails).
const IPV6_RE =
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d))$/;
const DOMAIN_RE = /^(?=.{1,253}$)([a-z0-9](-?[a-z0-9])*)(\.[a-z0-9](-?[a-z0-9])*)+$/i;
const NTLM_RE = /^[0-9a-fA-F]{32}$/;
const AES_RE = /^[0-9a-fA-F]{64}$/;
const SPN_RE = /^[^/\s]+\/[^/\s:]+(?::\d+)?$/;

/** Non-blocking validation. Returns true when the value satisfies the kind
 *  (and any optional custom `pattern`). Used by the engine for `display` state
 *  and re-exported for the VariableBar store. */
export function validateValue(value: string, validation: VariableValidation): boolean {
  if (validation.pattern) {
    try {
      if (!new RegExp(validation.pattern).test(value)) return false;
    } catch {
      // a malformed author-supplied pattern never hard-fails validation
    }
  }
  switch (validation.kind) {
    case 'ip':
      return IPV4_RE.test(value);
    case 'ipv6':
      return IPV6_RE.test(value);
    case 'port': {
      if (!/^\d+$/.test(value)) return false;
      const n = Number(value);
      const min = validation.min ?? 1;
      const max = validation.max ?? 65535;
      return n >= min && n <= max;
    }
    case 'domain':
    case 'fqdn':
      return DOMAIN_RE.test(value);
    case 'hash-ntlm':
      return NTLM_RE.test(value);
    case 'hash-aes':
      return AES_RE.test(value);
    case 'path':
      return value.length > 0 && !value.includes('\0');
    case 'url':
      try {
        const u = new URL(value);
        return !!u.protocol;
      } catch {
        return false;
      }
    case 'spn':
      return SPN_RE.test(value);
    case 'string':
      return true;
    default:
      return true;
  }
}

// ---------- the engine ----------

class TemplateEngineImpl implements TemplateEngine {
  parse(template: string): TemplateAST {
    const re = new RegExp(TOKEN_PATTERN, 'g');
    const tokens: ParsedToken[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(template)) !== null) {
      const name = m[1] as string;
      const rawFallback = m[2];
      const rawFilter = m[3];
      const token: ParsedToken = {
        raw: m[0],
        name,
        start: m.index,
        end: m.index + m[0].length,
      };
      if (rawFallback !== undefined) token.fallback = rawFallback;
      if (rawFilter !== undefined && KNOWN_FILTERS.has(rawFilter)) {
        token.filter = rawFilter as TokenFilter;
      }
      tokens.push(token);
      // Guard against zero-length matches (cannot happen with this grammar, but
      // keeps the loop provably terminating).
      if (m.index === re.lastIndex) re.lastIndex++;
    }
    return {
      template,
      tokens,
      varNames: uniquePreserveOrder(tokens.map((t) => t.name)),
    };
  }

  detectVars(template: string): string[] {
    return this.parse(template).varNames;
  }

  render(t: string | TemplateAST, o: RenderOptions): RenderResult {
    const ast = typeof t === 'string' ? this.parse(t) : t;
    const tpl = ast.template;
    const { values, defs } = o;

    // `raw` is the verbatim template, regardless of mode (idempotent).
    if (o.mode === 'raw') {
      return {
        spans: [{ type: 'text', text: tpl }],
        filled: tpl,
        raw: tpl,
        missing: [],
        invalid: [],
        allResolved: true,
      };
    }

    const spans: RenderSpan[] = [];
    const missing: string[] = [];
    const invalid: string[] = [];
    let filled = '';
    let cursor = 0;

    for (const tok of ast.tokens) {
      if (tok.start > cursor) {
        const text = tpl.slice(cursor, tok.start);
        spans.push({ type: 'text', text });
        filled += text;
      }

      const def: VariableDef | undefined = defs[tok.name];
      const userVal = values[tok.name];
      const hasUser = userVal !== undefined; // seeded defaults arrive here too
      const hasFallback = tok.fallback !== undefined;

      let resolved: string;
      let state: RenderSpan['state'];

      if (hasUser) {
        resolved = userVal;
        state = 'set';
      } else if (hasFallback) {
        resolved = tok.fallback as string;
        state = 'set';
      } else {
        // FROZEN chain falls through to the DEFANG placeholder. Never blank,
        // never a real host. This is the only path that flags `missing`.
        resolved = def ? def.placeholder : `<${tok.name.toLowerCase()}>`;
        state = 'unset';
        missing.push(tok.name);
      }

      // Validate only concrete (set) values — placeholders are inert and must
      // never read as "invalid".
      if (state === 'set' && def?.validation && !validateValue(resolved, def.validation)) {
        state = 'invalid';
        invalid.push(tok.name);
      }

      const out = applyFilter(resolved, tok.filter);
      filled += out;
      spans.push({ type: 'var', text: out, varName: tok.name, state });
      cursor = tok.end;
    }

    if (cursor < tpl.length) {
      const text = tpl.slice(cursor);
      spans.push({ type: 'text', text });
      filled += text;
    }

    const missingU = uniquePreserveOrder(missing);
    return {
      spans,
      filled,
      raw: tpl,
      missing: missingU,
      invalid: uniquePreserveOrder(invalid),
      allResolved: missingU.length === 0,
    };
  }
}

/** The shared singleton engine instance. */
export const templateEngine: TemplateEngine = new TemplateEngineImpl();

/** `affectedVars = command.requiresVars ?? detectVars(template)` (FROZEN §5). */
export function affectedVars(template: string, requiresVars?: string[]): string[] {
  return requiresVars ?? templateEngine.detectVars(template);
}
