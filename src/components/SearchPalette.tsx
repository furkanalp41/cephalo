// src/components/SearchPalette.tsx — "summon from the dark". Presentational palette
// (FROZEN SearchPaletteProps) + a store/router-wired host. Titles are resolved from
// the content store (SearchHit carries none); keyboard nav + highlight live here.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { SearchPaletteProps } from '@/types/components';
import type { SearchHit } from '@/types/engine';
import { useContent } from '@/stores/content';
import { useSearch } from '@/stores/search';
import { useVariables } from '@/stores/variables';
import { usePacks } from '@/stores/packs';
import { useUI } from '@/stores/ui';
import { VARIABLE_DEFS_BY_ID } from '@/data/variables';
import { templateEngine } from '@/engine/template';
import { Icon } from './Icon';

function Highlighted({
  text,
  ranges,
}: {
  text: string;
  ranges?: Array<[number, number]> | undefined;
}) {
  if (!ranges || !ranges.length) return <>{text}</>;
  const out: React.ReactNode[] = [];
  let cursor = 0;
  ranges
    .slice()
    .sort((a, b) => a[0] - b[0])
    .forEach(([s, e], i) => {
      if (s > cursor) out.push(<span key={`t${i}`}>{text.slice(cursor, s)}</span>);
      out.push(<mark key={`m${i}`}>{text.slice(s, e)}</mark>);
      cursor = Math.max(cursor, e);
    });
  if (cursor < text.length) out.push(<span key="tail">{text.slice(cursor)}</span>);
  return <>{out}</>;
}

export function SearchPalette(props: SearchPaletteProps) {
  const { query, hits, loading, onQueryChange, onSelectHit, onCopyHit, onClose } = props;
  const labelById = useContent((s) => s.labelById);
  const recent = useSearch((s) => s.recent);
  const inputRef = useRef<HTMLInputElement>(null);
  const [sel, setSel] = useState(0);
  const empty = query.trim() === '';

  useEffect(() => setSel(0), [hits]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = hits[sel];
      if (hit) {
        if ((e.metaKey || e.ctrlKey) && onCopyHit) onCopyHit(hit);
        else onSelectHit(hit);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="palette-backdrop" onClick={onClose} role="presentation">
      <div className="palette" role="dialog" aria-label="Search" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="palette__input"
          placeholder="type a port, service, or technique — try 445"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Search commands and techniques"
        />
        <div className="palette__results" role="listbox">
          {loading && <div className="palette__empty">searching…</div>}
          {empty && recent.length > 0 && (
            <>
              <div className="palette__group-title">Recent</div>
              {recent.map((hit) => {
                const label = labelById.get(hit.id);
                return (
                  <div
                    key={`recent-${hit.id}`}
                    className="hit"
                    role="option"
                    aria-selected={false}
                    data-testid={`recent-${hit.id}`}
                    onClick={() => onSelectHit(hit)}
                  >
                    <span className="hit__type">{hit.type}</span>
                    <span className="hit__title">{label?.title ?? hit.id}</span>
                    {label?.sub && <span className="hit__ctx">{label.sub}</span>}
                  </div>
                );
              })}
            </>
          )}
          {empty && recent.length === 0 && (
            <div className="palette__empty">type a port, service, or technique — try 445.</div>
          )}
          {!loading && !empty && hits.length === 0 && (
            <div className="palette__empty">nothing surfaced — try a port number or tool name.</div>
          )}
          {hits.map((hit, i) => {
            const label = labelById.get(hit.id);
            return (
              <div
                key={hit.id}
                className="hit"
                role="option"
                aria-selected={i === sel}
                data-active={i === sel}
                data-testid={`hit-${hit.id}`}
                onMouseEnter={() => setSel(i)}
                onClick={() => onSelectHit(hit)}
              >
                <span className="hit__type">{hit.type}</span>
                <span className="hit__title">
                  <Highlighted text={label?.title ?? hit.id} ranges={hit.highlights?.title} />
                </span>
                {label?.sub && <span className="hit__ctx">{label.sub}</span>}
              </div>
            );
          })}
        </div>
        <div className="palette__hint">
          <Icon name="search" size={12} /> ↑↓ move · Enter open · Ctrl/⌘-Enter copy filled · Esc close
        </div>
      </div>
    </div>
  );
}

// ---- store/router-wired host ----
export function SearchPaletteHost() {
  const navigate = useNavigate();
  const { open, query, hits, loading, setQuery, setFilters, closePalette, resolveTechniqueId, recordRecent } =
    useSearch();
  const octoState = useUI((s) => s.octoState);
  const content = useContent();
  const values = useVariables((s) => s.values);
  const showToast = useUI((s) => s.showToast);
  const enabledPacks = usePacks((s) => s.enabled);

  // Search honors the enabled content packs (the side-table/index filter via SearchFilters).
  useEffect(() => {
    setFilters({ packs: enabledPacks });
  }, [enabledPacks, setFilters]);

  if (!open) return null;

  const goToHit = (hit: SearchHit) => {
    recordRecent(hit);
    closePalette();
    if (hit.type === 'bloodhound') {
      void navigate({ to: '/bloodhound' });
      return;
    }
    if (hit.type === 'section') {
      const s = content.sectionsById.get(hit.id);
      if (s) void navigate({ to: '/$os', params: { os: s.os } });
      return;
    }
    const techniqueId = resolveTechniqueId(hit) ?? (hit.type === 'technique' ? hit.id : undefined);
    if (techniqueId) {
      const tech = content.techniquesById.get(techniqueId);
      const os = tech?.os[0] ?? 'linux';
      void navigate({ to: '/$os/technique/$techniqueId', params: { os, techniqueId } });
    }
  };

  const copyHit = (hit: SearchHit) => {
    const cmd = content.commandsById.get(hit.id);
    const tpl = cmd?.template ?? content.bloodhoundById.get(hit.id)?.cypher;
    if (!tpl) return;
    const r = templateEngine.render(tpl, { values, defs: VARIABLE_DEFS_BY_ID, mode: 'filled' });
    void navigator.clipboard?.writeText(r.filled).catch(() => undefined);
    showToast(r.allResolved ? 'Copied filled command' : 'Copied (some vars unset)');
  };

  return (
    <SearchPalette
      query={query}
      hits={hits}
      loading={loading}
      octoState={octoState}
      onQueryChange={setQuery}
      onSelectHit={goToHit}
      onCopyHit={copyHit}
      onClose={closePalette}
    />
  );
}
