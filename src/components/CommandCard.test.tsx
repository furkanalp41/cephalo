import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommandCard } from './CommandCard';
import { templateEngine } from '@/engine/template';
import { VARIABLE_DEFS_BY_ID } from '@/data/variables';
import type { Command } from '@/types/content';

const cmd: Command = {
  id: 'test.cmd',
  title: 'Test command',
  template: 'nc {{LHOST}} {{LPORT}}',
  os: ['linux'],
  confidence: 'unverified',
  references: ['ref.nmap'],
  danger: 'high',
  packs: ['oscp'],
  tags: ['nmap'],
};

function renderCard(values: Record<string, string>) {
  const r = templateEngine.render(cmd.template, { values, defs: VARIABLE_DEFS_BY_ID, mode: 'display' });
  const onCopyFilled = vi.fn();
  const onCopyRaw = vi.fn();
  render(
    <CommandCard
      command={cmd}
      render={r}
      affectedVars={['LHOST', 'LPORT']}
      theme="linux"
      confidence={cmd.confidence}
      danger={cmd.danger!}
      onCopyFilled={onCopyFilled}
      onCopyRaw={onCopyRaw}
    />,
  );
  return { onCopyFilled, onCopyRaw };
}

describe('CommandCard', () => {
  it('disables Copy filled while a variable is unset (LHOST missing), Copy raw stays enabled', () => {
    renderCard({ LPORT: '4444' }); // LHOST unset
    const filled = screen.getByRole('button', { name: /copy filled/i });
    const raw = screen.getByRole('button', { name: /copy raw/i });
    expect(filled).toBeDisabled();
    expect(raw).not.toBeDisabled();
  });

  it('enables Copy filled once all vars resolve and emits the filled string', () => {
    const { onCopyFilled } = renderCard({ LHOST: '198.51.100.10', LPORT: '4444' });
    const filled = screen.getByRole('button', { name: /copy filled/i });
    expect(filled).not.toBeDisabled();
    filled.click();
    expect(onCopyFilled).toHaveBeenCalledWith('test.cmd', 'nc 198.51.100.10 4444');
  });

  it('renders the literal [UNVERIFIED] badge for unverified commands', () => {
    renderCard({ LHOST: '198.51.100.10', LPORT: '4444' });
    expect(screen.getByText('[UNVERIFIED]')).toBeInTheDocument();
  });

  it('mounts a non-dismissible responsible-use note (no close control)', () => {
    renderCard({});
    const note = screen.getByTestId('responsible-use-note');
    expect(note).toBeInTheDocument();
    // no dismiss/close affordance anywhere in the note
    expect(note.querySelector('button')).toBeNull();
    expect(screen.queryByRole('button', { name: /dismiss|close/i })).toBeNull();
  });
});
