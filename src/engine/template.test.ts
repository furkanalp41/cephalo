// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { templateEngine, applyFilter, bashQuote, validateValue, affectedVars } from './template';
import type { VariableDef } from '@/types/content';
import type { RenderOptions } from '@/types/engine';

const def = (id: string, extra: Partial<VariableDef> = {}): VariableDef => ({
  id,
  label: id,
  group: 'misc',
  placeholder: `<${id.toLowerCase()}>`,
  example: 'x',
  ...extra,
});

const DEFS: Record<string, VariableDef> = {
  LHOST: def('LHOST', { placeholder: '<tun0-ip>', validation: { kind: 'ip' } }),
  LPORT: def('LPORT', { placeholder: '<lport>', default: '4444', validation: { kind: 'port' } }),
  RHOST: def('RHOST', { placeholder: '<target-ip>', validation: { kind: 'ip' } }),
  NTHASH: def('NTHASH', { placeholder: '<nthash>', sensitive: true, validation: { kind: 'hash-ntlm' } }),
  DOMAIN: def('DOMAIN', { placeholder: '<domain.local>', validation: { kind: 'domain' } }),
  USER: def('USER', { placeholder: '<user>' }),
};

const opts = (values: Record<string, string>, mode: RenderOptions['mode'] = 'filled'): RenderOptions => ({
  values,
  defs: DEFS,
  mode,
});

describe('parse — the three FROZEN grammar forms', () => {
  it('parses a plain token', () => {
    const ast = templateEngine.parse('nc {{LHOST}} {{LPORT}}');
    expect(ast.tokens.map((t) => t.name)).toEqual(['LHOST', 'LPORT']);
    expect(ast.tokens[0]?.fallback).toBeUndefined();
    expect(ast.tokens[0]?.filter).toBeUndefined();
    expect(ast.tokens[0]?.raw).toBe('{{LHOST}}');
  });

  it('parses an inline fallback', () => {
    const ast = templateEngine.parse('ping {{RHOST:198.51.100.10}}');
    expect(ast.tokens[0]?.name).toBe('RHOST');
    expect(ast.tokens[0]?.fallback).toBe('198.51.100.10');
  });

  it('parses a filter', () => {
    const ast = templateEngine.parse("echo {{USER|quote}}");
    expect(ast.tokens[0]?.filter).toBe('quote');
  });

  it('parses fallback + filter together', () => {
    const ast = templateEngine.parse('{{USER:guest|upper}}');
    expect(ast.tokens[0]?.fallback).toBe('guest');
    expect(ast.tokens[0]?.filter).toBe('upper');
  });

  it('tolerates inner whitespace', () => {
    const ast = templateEngine.parse('{{  LHOST  }}');
    expect(ast.tokens[0]?.name).toBe('LHOST');
  });

  it('records correct char ranges', () => {
    const tpl = 'a {{LHOST}} b';
    const ast = templateEngine.parse(tpl);
    const tok = ast.tokens[0]!;
    expect(tpl.slice(tok.start, tok.end)).toBe('{{LHOST}}');
  });

  it('ignores an unknown filter (passes value through)', () => {
    const ast = templateEngine.parse('{{USER|bogus}}');
    expect(ast.tokens[0]?.filter).toBeUndefined();
  });
});

describe('detectVars — unique UPPER_SNAKE in source order', () => {
  it('dedupes and preserves order', () => {
    expect(templateEngine.detectVars('{{LHOST}} {{LPORT}} {{LHOST}}')).toEqual(['LHOST', 'LPORT']);
  });
  it('ignores lowercase (not tokens)', () => {
    expect(templateEngine.detectVars('{{var}} {{LHOST}}')).toEqual(['LHOST']);
  });
});

describe('render filled — the FROZEN value > fallback > placeholder chain', () => {
  it('uses the user value when present', () => {
    const r = templateEngine.render('nc {{LHOST}}', opts({ LHOST: '198.51.100.10' }));
    expect(r.filled).toBe('nc 198.51.100.10');
    expect(r.allResolved).toBe(true);
    expect(r.missing).toEqual([]);
  });

  it('falls through to placeholder when unset → not allResolved, name is missing', () => {
    const r = templateEngine.render('nc {{LHOST}}', opts({}));
    expect(r.filled).toBe('nc <tun0-ip>');
    expect(r.allResolved).toBe(false);
    expect(r.missing).toEqual(['LHOST']);
  });

  it('uses the inline fallback when unset → not missing', () => {
    const r = templateEngine.render('ping {{RHOST:198.51.100.10}}', opts({}));
    expect(r.filled).toBe('ping 198.51.100.10');
    expect(r.allResolved).toBe(true);
    expect(r.missing).toEqual([]);
  });

  it('precedence: value beats fallback beats placeholder', () => {
    const tpl = '{{RHOST:198.51.100.10}}';
    expect(templateEngine.render(tpl, opts({ RHOST: '203.0.113.5' })).filled).toBe('203.0.113.5');
    expect(templateEngine.render(tpl, opts({})).filled).toBe('198.51.100.10');
  });

  it('never emits a blank for an unset var', () => {
    const r = templateEngine.render('{{USER}}', opts({}));
    expect(r.filled.length).toBeGreaterThan(0);
    expect(r.filled).toBe('<user>');
  });
});

describe('SEEDED default behaviour — §5.2 (default acts via the values map, NOT via the chain)', () => {
  it('a defaulted var that was SEEDED into values resolves to its real default and is NOT missing', () => {
    // Store seeds LPORT=4444 into `values` at init.
    const r = templateEngine.render('-p {{LPORT}}', opts({ LPORT: '4444' }));
    expect(r.filled).toBe('-p 4444');
    expect(r.missing).toEqual([]);
    expect(r.allResolved).toBe(true);
  });

  it('proves the engine NEVER reads defs[name].default — an unseeded defaulted var is still missing', () => {
    // DEFS.LPORT carries default:'4444' but values is empty (not seeded here).
    const r = templateEngine.render('-p {{LPORT}}', opts({}));
    expect(r.filled).toBe('-p <lport>'); // placeholder, NOT the default
    expect(r.missing).toEqual(['LPORT']);
    expect(r.allResolved).toBe(false);
  });
});

describe('filters', () => {
  it('quote performs bash single-quote escaping', () => {
    expect(applyFilter("it's", 'quote')).toBe("'it'\\''s'");
    expect(bashQuote('abc')).toBe("'abc'");
  });
  it('upper / lower', () => {
    expect(applyFilter('Abc', 'upper')).toBe('ABC');
    expect(applyFilter('Abc', 'lower')).toBe('abc');
  });
  it('urlencode', () => {
    expect(applyFilter('a b&c', 'urlencode')).toBe('a%20b%26c');
  });
  it('b64 encodes UTF-8 to standard base64', () => {
    expect(applyFilter('hello', 'b64')).toBe('aGVsbG8=');
    expect(applyFilter('héllo', 'b64')).toBe('aMOpbGxv');
  });
  it('applies the filter to the resolved value in render()', () => {
    const r = templateEngine.render('{{USER|upper}}', opts({ USER: 'admin' }));
    expect(r.filled).toBe('ADMIN');
  });
});

describe('render display — per-token spans with set/unset/invalid state', () => {
  it('marks set / unset states', () => {
    const r = templateEngine.render('{{LHOST}}/{{RHOST}}', opts({ LHOST: '198.51.100.10' }, 'display'));
    const vars = r.spans.filter((s) => s.type === 'var');
    expect(vars.find((s) => s.varName === 'LHOST')?.state).toBe('set');
    expect(vars.find((s) => s.varName === 'RHOST')?.state).toBe('unset');
  });

  it('marks invalid when a SET value fails validation, but unset placeholders are never invalid', () => {
    const r = templateEngine.render('{{LHOST}}', opts({ LHOST: 'not-an-ip' }, 'display'));
    const v = r.spans.find((s) => s.type === 'var');
    expect(v?.state).toBe('invalid');
    expect(r.invalid).toEqual(['LHOST']);
    // invalid does NOT inflate missing/allResolved (allResolved gates on missing only)
    expect(r.missing).toEqual([]);
    expect(r.allResolved).toBe(true);
  });

  it('text spans interleave with var spans and reconstruct the filled string', () => {
    const r = templateEngine.render('nc {{LHOST}} {{LPORT}}', opts({ LHOST: '198.51.100.10', LPORT: '4444' }, 'display'));
    expect(r.spans.map((s) => s.text).join('')).toBe(r.filled);
  });
});

describe('render raw — verbatim + idempotent', () => {
  it('returns the template unchanged', () => {
    const tpl = 'impacket-secretsdump {{DOMAIN}}/{{USER}}@{{RHOST}}';
    const r = templateEngine.render(tpl, opts({ DOMAIN: 'corp.local' }, 'raw'));
    expect(r.raw).toBe(tpl);
    expect(r.filled).toBe(tpl);
  });
  it('is idempotent', () => {
    const tpl = '{{LHOST}}';
    const once = templateEngine.render(tpl, opts({}, 'raw')).raw;
    const twice = templateEngine.render(once, opts({}, 'raw')).raw;
    expect(twice).toBe(tpl);
  });
});

describe('validation kinds', () => {
  it('ip', () => {
    expect(validateValue('198.51.100.10', { kind: 'ip' })).toBe(true);
    expect(validateValue('999.1.1.1', { kind: 'ip' })).toBe(false);
  });
  it('port range', () => {
    expect(validateValue('4444', { kind: 'port' })).toBe(true);
    expect(validateValue('70000', { kind: 'port' })).toBe(false);
    expect(validateValue('0', { kind: 'port' })).toBe(false);
  });
  it('hash-ntlm = 32 hex', () => {
    expect(validateValue('a'.repeat(32), { kind: 'hash-ntlm' })).toBe(true);
    expect(validateValue('a'.repeat(31), { kind: 'hash-ntlm' })).toBe(false);
  });
  it('hash-aes = 64 hex', () => {
    expect(validateValue('f'.repeat(64), { kind: 'hash-aes' })).toBe(true);
    expect(validateValue('f'.repeat(63), { kind: 'hash-aes' })).toBe(false);
  });
  it('spn', () => {
    expect(validateValue('MSSQLSvc/host:1433', { kind: 'spn' })).toBe(true);
    expect(validateValue('nodomain', { kind: 'spn' })).toBe(false);
  });
  it('domain / fqdn', () => {
    expect(validateValue('corp.local', { kind: 'domain' })).toBe(true);
    expect(validateValue('dc01.corp.local', { kind: 'fqdn' })).toBe(true);
    expect(validateValue('nope', { kind: 'domain' })).toBe(false);
  });
  it('url', () => {
    expect(validateValue('http://198.51.100.10/', { kind: 'url' })).toBe(true);
    expect(validateValue('not a url', { kind: 'url' })).toBe(false);
  });
  it('string always valid', () => {
    expect(validateValue('anything at all', { kind: 'string' })).toBe(true);
  });
});

describe('affectedVars helper', () => {
  it('uses requiresVars when provided', () => {
    expect(affectedVars('{{LHOST}}', ['LHOST', 'LPORT'])).toEqual(['LHOST', 'LPORT']);
  });
  it('auto-detects from the template otherwise', () => {
    expect(affectedVars('{{LHOST}} {{LPORT}}')).toEqual(['LHOST', 'LPORT']);
  });
});
