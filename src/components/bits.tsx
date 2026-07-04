// src/components/bits.tsx — tiny shared presentational bits. Every color-coded
// signal pairs hue with an icon + text label (CVD-safe, never hue-only).
import { Icon, type IconName } from './Icon';
import type { Severity, Confidence } from '@/types/content';

const SEV_ICON: Record<Severity, IconName> = {
  info: 'info',
  low: 'chevron',
  medium: 'chevrons',
  high: 'triangle',
  critical: 'octagon',
};

export function SeverityChip({ severity, label = 'danger' }: { severity: Severity; label?: string }) {
  return (
    <span className={`sev sev--${severity}`} title={`${label}: ${severity}`}>
      <Icon name={SEV_ICON[severity]} size={12} />
      {severity}
    </span>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  if (confidence === 'verified') {
    return (
      <span className="badge-verified" title="verified">
        <Icon name="check" size={12} /> verified
      </span>
    );
  }
  // The literal, frozen [UNVERIFIED] badge — never hidden or restyled away.
  return (
    <span className="badge-unverified" title="unverified — check the cited sources">
      <Icon name="caret" size={12} /> [UNVERIFIED]
    </span>
  );
}

export function TagChip({ children }: { children: React.ReactNode }) {
  return <span className="chip">{children}</span>;
}
