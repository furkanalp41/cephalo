// src/components/SourcesPopover.tsx — renders references[] with source-priority
// ordering + archive fallback. The [UNVERIFIED] badge is always paired with a
// Sources affordance (DESIGN §5.8).
import { useState } from 'react';
import { Icon } from './Icon';
import { useContent } from '@/stores/content';
import type { RefId, Reference } from '@/types/content';

// Source-priority ladder (lower = higher priority).
const SOURCE_RANK: Record<Reference['source'], number> = {
  'official-tool-docs': 0,
  microsoft: 1,
  'cve-nvd': 2,
  mitre: 3,
  rfc: 4,
  gtfobins: 5,
  lolbas: 5,
  'vendor-advisory': 6,
  exploitdb: 7,
  hacktricks: 8,
  payloadsallthethings: 8,
  'ad-cheatsheet': 8,
  viperone: 8,
  tjnull: 9,
  other: 10,
};

export function SourcesPopover({ refIds }: { refIds: RefId[] }) {
  const [open, setOpen] = useState(false);
  const referencesById = useContent((s) => s.referencesById);
  if (!refIds.length) return null;

  const refs = refIds
    .map((id) => referencesById.get(id))
    .filter((r): r is Reference => Boolean(r))
    .sort((a, b) => SOURCE_RANK[a.source] - SOURCE_RANK[b.source]);

  return (
    <div className="sources">
      <button type="button" className="btn btn--ghost" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Icon name="link" size={13} /> Sources ({refs.length})
      </button>
      {open && (
        <div className="sources-pop" role="region" aria-label="Sources">
          <ul>
            {refs.map((r) => (
              <li key={r.id}>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer nofollow">
                    {r.title}
                  </a>
                ) : (
                  r.title
                )}
                <span className="muted"> · {r.source}</span>
                {r.archiveUrl && (
                  <>
                    {' · '}
                    <a href={r.archiveUrl} target="_blank" rel="noopener noreferrer nofollow">
                      archive
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
