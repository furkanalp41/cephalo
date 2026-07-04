// src/components/CommandCard.tsx — the "specimen tube". Presentational: it takes a
// render-state stream (props === FROZEN CommandCardProps) and emits raw events.
// Copy-raw is ALWAYS enabled; copy-filled is gated on
// render.allResolved && render.invalid.length === 0 (HARD RULE §13.3). credMode is
// variant SELECTION (§5.1) — the card never rewrites one string into three.
import { useState, useCallback } from 'react';
import type { CommandCardProps } from '@/types/components';
import { SeverityChip, ConfidenceBadge } from './bits';
import { CredModeSwitch } from './CredModeSwitch';
import { SourcesPopover } from './SourcesPopover';
import { ResponsibleUseNote } from './ResponsibleUseNote';
import { Icon } from './Icon';
import { applyFilter } from '@/engine/template';
import { TAGS } from '@/data/tags';
import type { Tag } from '@/types/content';

// Static category → token-color map (chips are border-tinted by category).
const CATEGORY_COLOR: Record<NonNullable<Tag['category']>, string> = {
  service: 'var(--cph-color-accent)',
  protocol: 'var(--cph-node-lateral)',
  tool: 'var(--cph-color-primary)',
  concept: 'var(--cph-node-decision)',
  phase: 'var(--cph-sev-info)',
  port: 'var(--cph-node-recon)',
  'vuln-class': 'var(--cph-color-danger)',
};
const TAG_CATEGORY = new Map<string, Tag['category']>(TAGS.map((t) => [t.id, t.category]));
function tagBorderColor(id: string): string {
  const cat = TAG_CATEGORY.get(id);
  return (cat && CATEGORY_COLOR[cat]) || 'var(--cph-color-border)';
}

function focusVar(name: string) {
  const el = document.getElementById(`var-${name}`);
  if (el) {
    el.focus();
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// PowerShell -EncodedCommand = base64 of UTF-16LE bytes.
function psEncoded(s: string): string {
  let bin = '';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    bin += String.fromCharCode(c & 0xff, c >> 8);
  }
  return btoa(bin);
}

export function CommandCard(props: CommandCardProps) {
  const { command, render, affectedVars, confidence, danger, credMode } = props;
  const [copied, setCopied] = useState(false);
  const [announce, setAnnounce] = useState('');

  const canCopyFilled = render.allResolved && render.invalid.length === 0;

  const flash = useCallback((msg: string) => {
    setCopied(true);
    setAnnounce(msg);
    window.setTimeout(() => setCopied(false), 700);
  }, []);

  const copyFilled = () => {
    if (!canCopyFilled) return;
    props.onCopyFilled(command.id, render.filled);
    flash('Copied filled command');
  };
  const copyRaw = () => {
    props.onCopyRaw(command.id, render.raw);
    flash('Copied raw command');
  };
  const copyTransform = (kind: 'b64' | 'urlencode' | 'ps') => {
    if (!canCopyFilled) return;
    const out = kind === 'ps' ? psEncoded(render.filled) : applyFilter(render.filled, kind);
    props.onCopyFilled(command.id, out);
    flash(`Copied ${kind === 'ps' ? 'PowerShell -EncodedCommand' : kind}`);
  };

  // credMode-only commands show the switch (no separate variant chooser).
  const nonCredVariants = (command.variants ?? []).filter((v) => !v.credMode);
  const showVariantChooser = !command.credMode && nonCredVariants.length > 0;

  return (
    <article className="cmd-card" data-testid={`cmd-${command.id}`}>
      <div className="cmd-card__head">
        <h3 className="cmd-title">{command.title}</h3>
        <span className="cmd-card__head-spacer" />
        {danger && <SeverityChip severity={danger} />}
        <ConfidenceBadge confidence={confidence} />
      </div>

      {command.tags && command.tags.length > 0 && (
        <div className="cmd-chips">
          {command.tags.map((t) => (
            <span key={t} className="chip" style={{ borderColor: tagBorderColor(t) }}>
              {t}
            </span>
          ))}
          {command.tool && <span className="chip">{command.tool}</span>}
        </div>
      )}

      {command.description && <p className="cmd-desc">{command.description}</p>}

      {/* credMode switch (AD auth axis) OR general variant chooser */}
      {command.credMode && props.onSetCredMode && (
        <div style={{ margin: '8px 0' }}>
          <CredModeSwitch id={command.id} active={credMode ?? command.credMode} onSetCredMode={props.onSetCredMode} />
        </div>
      )}
      {showVariantChooser && props.onSelectVariant && (
        <div className="variant-select" style={{ margin: '8px 0' }}>
          <span className="cmd-uses__label">variant:</span>
          {nonCredVariants.map((v) => (
            <button
              key={v.id}
              type="button"
              className="btn btn--ghost"
              onClick={() => props.onSelectVariant?.(command.id, v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      {/* the code block — the visual centerpiece */}
      <pre className={`cmd-code${copied ? ' is-copied' : ''}`} data-testid="cmd-code">
        {copied ? (
          <code>{render.filled}</code>
        ) : (
          <code>
            {render.spans.map((s, i) =>
              s.type === 'text' ? (
                <span key={i}>{s.text}</span>
              ) : (
                <span key={i} className={`tok tok--${s.state ?? 'set'}`}>
                  {s.state === 'unset' ? `<${s.varName}>` : s.text}
                </span>
              ),
            )}
          </code>
        )}
      </pre>

      {/* "uses VAR" chips → focus the matching VariableBar field */}
      {affectedVars.length > 0 && (
        <div className="cmd-uses">
          <span className="cmd-uses__label">uses</span>
          {affectedVars.map((name) => (
            <button key={name} type="button" className="chip chip--uses" onClick={() => focusVar(name)}>
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="cmd-actions">
        <button
          type="button"
          className={`btn btn--primary${canCopyFilled ? ' is-ready' : ''}`}
          onClick={copyFilled}
          disabled={!canCopyFilled}
          title={
            canCopyFilled
              ? 'Copy the fully-substituted command'
              : `Set ${render.missing.join(', ') || 'all variables'} to copy filled${render.invalid.length ? ' · fix invalid values' : ''}`
          }
        >
          <Icon name="copy" size={14} /> Copy filled
        </button>
        <button type="button" className="btn" onClick={copyRaw}>
          <Icon name="copy" size={14} /> Copy raw
        </button>
        <details className="transform">
          <summary className="btn btn--ghost">transform</summary>
          <div className="sources-pop">
            <button type="button" className="btn btn--ghost" disabled={!canCopyFilled} onClick={() => copyTransform('b64')}>
              base64
            </button>{' '}
            <button type="button" className="btn btn--ghost" disabled={!canCopyFilled} onClick={() => copyTransform('urlencode')}>
              URL-encode
            </button>{' '}
            <button type="button" className="btn btn--ghost" disabled={!canCopyFilled} onClick={() => copyTransform('ps')}>
              PS -EncodedCommand
            </button>
          </div>
        </details>
        <SourcesPopover refIds={command.references ?? []} />
      </div>

      {command.notes && command.notes.length > 0 && (
        <ul className="cmd-notes">
          {command.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      )}

      <ResponsibleUseNote />

      {/* copy success is announced for screen readers — never animation-only */}
      <span className="visually-hidden" aria-live="polite">
        {announce}
      </span>
    </article>
  );
}
