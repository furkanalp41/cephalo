// src/components/VariableBar.tsx — the RevShells loop, made physical. Presentational
// (FROZEN VariableBarProps) — internal UI state only (reveal/collapse/focus-pulse).
// Ported to the "Cephalo Core Loop" design fidelity: group glyphs, per-field state
// dot + accent bar, hold-to-reveal masked sensitive fields, set/unset summary,
// collapse toggle, focus pulse. Editing any field live re-interpolates every
// visible CommandCard via the shared store. Hosts a non-dismissible ResponsibleUseNote.
import { useRef, useState } from 'react';
import type { VariableBarProps } from '@/types/components';
import type { VariableDef, VarGroup } from '@/types/content';
import { ResponsibleUseNote } from './ResponsibleUseNote';
import { Icon, GROUP_ICON } from './Icon';
import { useVariables } from '@/stores/variables';
import { VARIABLE_REGISTRY, PRIMARY_VAR_IDS, VAR_GROUP_ORDER } from '@/data/variables';

function fieldState(def: VariableDef, value: string | undefined, valid: boolean | undefined): string {
  if (value === undefined || value === '') return 'unset';
  if (def.validation && valid === false) return 'invalid';
  return 'set';
}
const STATE_COLOR: Record<string, string> = {
  set: 'var(--cph-var-set)',
  unset: 'var(--cph-var-unset)',
  invalid: 'var(--cph-var-invalid)',
};

export function VariableBar({
  defs,
  values,
  validity,
  groups,
  onChange,
  onReset,
  onClearSensitive,
  onFocusVar,
}: VariableBarProps) {
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(true);
  const [focused, setFocused] = useState<string | null>(null);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const byGroup = (g: VarGroup) => defs.filter((d) => d.group === g);
  const setCount = defs.filter((d) => (values[d.id] ?? '') !== '').length;

  const pulse = (id: string) => {
    if (focusTimer.current) clearTimeout(focusTimer.current);
    setFocused(id);
    focusTimer.current = setTimeout(() => setFocused(null), 1400);
  };

  return (
    <section className="var-bar" aria-label="Variables">
      <div className="var-bar__head">
        <div className="var-bar__title">
          <span>Variable Bar</span>
          <span className="muted">
            {setCount} of {defs.length} set
          </span>
        </div>
        <div className="var-bar__actions">
          <button type="button" className="btn btn--ghost" onClick={() => onReset()}>
            <Icon name="reset" size={14} /> Reset to defaults
          </button>
          {onClearSensitive && (
            <button type="button" className="btn btn--ghost" onClick={onClearSensitive}>
              <Icon name="eraser" size={14} /> Clear sensitive
            </button>
          )}
          <button
            type="button"
            className="btn btn--ghost"
            aria-label={open ? 'Collapse variable bar' : 'Expand variable bar'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name="caret" size={16} className={open ? 'rot180' : undefined} />
          </button>
        </div>
      </div>

      {open && (
        <div className="var-bar__groups">
          {groups.map((g) => {
            const groupDefs = byGroup(g);
            if (!groupDefs.length) return null;
            return (
              <div className="var-group" key={g}>
                <div className="var-group__label">
                  <span className="var-group__icon">
                    <Icon name={GROUP_ICON[g] ?? 'info'} size={14} />
                  </span>
                  {g}
                </div>
                <div className="var-group__fields">
                  {groupDefs.map((def) => {
                    const value = values[def.id];
                    const state = fieldState(def, value, validity[def.id]);
                    const revealed = !!reveal[def.id];
                    return (
                      <div
                        className="var-field"
                        data-state={state}
                        data-focused={focused === def.id ? 'true' : undefined}
                        style={{ borderLeftColor: STATE_COLOR[state] }}
                        key={def.id}
                      >
                        <label className="var-field__label" htmlFor={`var-${def.id}`}>
                          <span>{def.label}</span>
                          {def.sensitive && (
                            <span className="var-field__lock" title="Session-only — never saved">
                              <Icon name="lock" size={12} />
                            </span>
                          )}
                          <span className="var-field__dot" style={{ background: STATE_COLOR[state] }} />
                        </label>
                        <div className="var-field__row">
                          <input
                            id={`var-${def.id}`}
                            className="var-input"
                            type={def.sensitive && !revealed ? 'password' : 'text'}
                            autoComplete={def.sensitive ? 'new-password' : 'off'}
                            spellCheck={false}
                            placeholder={def.placeholder}
                            value={value ?? ''}
                            aria-invalid={state === 'invalid'}
                            onFocus={() => {
                              onFocusVar?.(def.id);
                              pulse(def.id);
                            }}
                            onChange={(e) => onChange(def.id, e.target.value)}
                          />
                          {def.sensitive && (
                            <button
                              type="button"
                              className="var-field__reveal"
                              aria-label="Hold to reveal"
                              onMouseDown={() => setReveal((r) => ({ ...r, [def.id]: true }))}
                              onMouseUp={() => setReveal((r) => ({ ...r, [def.id]: false }))}
                              onMouseLeave={() => setReveal((r) => ({ ...r, [def.id]: false }))}
                              onTouchStart={() => setReveal((r) => ({ ...r, [def.id]: true }))}
                              onTouchEnd={() => setReveal((r) => ({ ...r, [def.id]: false }))}
                            >
                              <Icon name="eye" size={14} />
                            </button>
                          )}
                        </div>
                        {state === 'invalid' && (
                          <span className="var-field__msg">
                            <Icon name="triangle" size={11} /> {def.validation?.message ?? 'Invalid value'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ResponsibleUseNote />
    </section>
  );
}

// ---- store-wired host (the bar instance the app mounts) ----
const PRIMARY = new Set<string>(PRIMARY_VAR_IDS);
const PRIMARY_DEFS = VARIABLE_REGISTRY.filter((d) => PRIMARY.has(d.id));

export function VariableBarHost() {
  const values = useVariables((s) => s.values);
  const validity = useVariables((s) => s.validity);
  const setValue = useVariables((s) => s.setValue);
  const reset = useVariables((s) => s.reset);
  const clearSensitive = useVariables((s) => s.clearSensitive);
  return (
    <VariableBar
      defs={PRIMARY_DEFS}
      values={values}
      validity={validity}
      groups={VAR_GROUP_ORDER}
      onChange={setValue}
      onReset={reset}
      onClearSensitive={clearSensitive}
      onFocusVar={(id) => document.getElementById(`var-${id}`)?.focus()}
    />
  );
}
