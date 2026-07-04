// src/components/LiveCommandCard.tsx — container: wires the presentational
// CommandCard to the variables store, credMode/variant SELECTION state, the
// templating engine, and the clipboard. credMode selects the authored variant
// whose credMode === mode; the engine then renders THAT variant's template (§5.1).
import { useMemo, useState } from 'react';
import { CommandCard } from './CommandCard';
import { useVariables } from '@/stores/variables';
import { useTheme } from '@/stores/theme';
import { useUI } from '@/stores/ui';
import { VARIABLE_DEFS_BY_ID } from '@/data/variables';
import { templateEngine, affectedVars as detectAffected } from '@/engine/template';
import type { Command, CredMode, Id } from '@/types/content';

async function copyText(text: string) {
  try {
    await navigator.clipboard?.writeText(text);
  } catch {
    // clipboard unavailable (e.g. headless/jsdom) — the value is still surfaced
    // via the toast + aria-live; copy is best-effort.
  }
}

export function LiveCommandCard({ command }: { command: Command }) {
  const values = useVariables((s) => s.values);
  const theme = useTheme((s) => s.os);
  const { flashOcto, showToast, setOcto } = useUI();

  const [credMode, setCredMode] = useState<CredMode>(command.credMode ?? 'password');
  const [variantId, setVariantId] = useState<Id | undefined>(undefined);

  const activeTemplate = useMemo(() => {
    if (command.credMode) {
      const v = (command.variants ?? []).find((x) => x.credMode === credMode);
      return v?.template ?? command.template;
    }
    if (variantId) {
      const v = (command.variants ?? []).find((x) => x.id === variantId);
      return v?.template ?? command.template;
    }
    return command.template;
  }, [command, credMode, variantId]);

  const render = useMemo(
    () =>
      templateEngine.render(activeTemplate, {
        values,
        defs: VARIABLE_DEFS_BY_ID,
        mode: 'display',
      }),
    [activeTemplate, values],
  );

  const affected = useMemo(
    () => detectAffected(activeTemplate, command.requiresVars),
    [activeTemplate, command.requiresVars],
  );

  return (
    <CommandCard
      command={command}
      render={render}
      affectedVars={affected}
      theme={theme}
      confidence={command.confidence}
      {...(command.danger ? { danger: command.danger } : {})}
      credMode={credMode}
      onCopyFilled={(_id, text) => {
        void copyText(text);
        flashOcto('copied');
        showToast('Copied filled command');
      }}
      onCopyRaw={(_id, text) => {
        void copyText(text);
        showToast('Copied raw command');
      }}
      onSetCredMode={(_id, mode) => setCredMode(mode)}
      onSelectVariant={(_id, vId) => setVariantId(vId)}
      onOpenReference={() => setOcto('idle')}
    />
  );
}
