// src/components/Icon.tsx — bespoke line-icon set (1.5px stroke, rounded joins).
// NO emoji anywhere in chrome (DESIGN anti-slop ban). Icons carry meaning
// redundantly with text/color so CVD users lose nothing. Each icon declares its
// own viewBox (the foundational set is on a 16-grid; the group/utility icons
// ported from the Cephalo Core Loop design are on a 24-grid).
import type { ReactElement } from 'react';

export type IconName =
  | 'shield'
  | 'info'
  | 'chevron'
  | 'chevrons'
  | 'triangle'
  | 'octagon'
  | 'check'
  | 'caret'
  | 'copy'
  | 'search'
  | 'link'
  | 'diamond'
  | 'globe'
  | 'crosshair'
  | 'key'
  | 'sitemap'
  | 'folder'
  | 'eye'
  | 'lock'
  | 'reset'
  | 'eraser';

// icons whose paths are authored on a 24×24 grid (default is 16×16)
const VB24: ReadonlySet<IconName> = new Set<IconName>([
  'globe',
  'crosshair',
  'key',
  'sitemap',
  'folder',
  'eye',
  'lock',
  'reset',
  'eraser',
]);

const paths: Record<IconName, ReactElement> = {
  shield: <path d="M8 1.5l5 2v4c0 3.2-2.1 5.6-5 7-2.9-1.4-5-3.8-5-7v-4l5-2z" />,
  info: (
    <>
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.2v4M8 4.8v.01" />
    </>
  ),
  chevron: <path d="M5 4l4 4-4 4" />,
  chevrons: <path d="M4 4l4 4-4 4M8 4l4 4-4 4" />,
  triangle: (
    <>
      <path d="M8 2l6.5 11.5H1.5L8 2z" />
      <path d="M8 6.5v3.5M8 12v.01" />
    </>
  ),
  octagon: (
    <>
      <path d="M5.2 1.8h5.6L14.2 5.2v5.6L10.8 14.2H5.2L1.8 10.8V5.2L5.2 1.8z" />
      <path d="M8 5v4M8 11v.01" />
    </>
  ),
  check: <path d="M3 8.5l3.5 3.5L13 4.5" />,
  caret: <path d="M4 6l4 4 4-4" />,
  copy: (
    <>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 5.5V4a1.5 1.5 0 00-1.5-1.5H4A1.5 1.5 0 002.5 4v5A1.5 1.5 0 004 10.5h1.5" />
    </>
  ),
  search: (
    <>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 1 0-6-6l-1 1" />
      <path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 1 0 6 6l1-1" />
    </>
  ),
  diamond: <path d="M8 1.5l6.5 6.5L8 14.5 1.5 8 8 1.5z" />,

  // ---- 24-grid (ported from the design support.js) ----
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c3 3.2 3 14.8 0 18" />
      <path d="M12 3c-3 3.2-3 14.8 0 18" />
    </>
  ),
  crosshair: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="8" r="4" />
      <path d="M11 11l9 9" />
      <path d="M16 16l2-2" />
      <path d="M19 19l2-2" />
    </>
  ),
  sitemap: (
    <>
      <rect x="9" y="3" width="6" height="5" rx="1" />
      <rect x="3" y="16" width="6" height="5" rx="1" />
      <rect x="15" y="16" width="6" height="5" rx="1" />
      <path d="M12 8v4M6 16v-3h12v3" />
    </>
  ),
  folder: (
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  ),
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  reset: (
    <>
      <path d="M4 9a8 8 0 1 1-1.6 4.7" />
      <path d="M4 4v5h5" />
    </>
  ),
  eraser: (
    <>
      <path d="M9 12l7-7a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L13 17H7l-3-3z" />
      <path d="M5 21h14" />
    </>
  ),
};

export function Icon({
  name,
  size = 16,
  className,
  title,
}: {
  name: IconName;
  size?: number;
  className?: string | undefined;
  title?: string | undefined;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={VB24.has(name) ? '0 0 24 24' : '0 0 16 16'}
      fill="none"
      stroke="currentColor"
      strokeWidth={VB24.has(name) ? 1.5 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}

// group → glyph (used by the VariableBar clusters)
export const GROUP_ICON: Record<string, IconName> = {
  network: 'globe',
  target: 'crosshair',
  auth: 'key',
  ad: 'sitemap',
  web: 'link',
  files: 'folder',
  misc: 'info',
};
