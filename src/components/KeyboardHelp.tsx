// src/components/KeyboardHelp.tsx — the `?` shortcut cheat-sheet.
const SHORTCUTS: [string, string][] = [
  ['Ctrl / ⌘ + K', 'Open search palette'],
  ['/', 'Focus search'],
  ['↑ / ↓', 'Move in palette / mindmap'],
  ['Enter', 'Open selected hit'],
  ['Ctrl / ⌘ + Enter', 'Copy-filled the top hit'],
  ['c', 'Copy-filled the focused card'],
  ['r', 'Copy-raw the focused card'],
  ['?', 'Toggle this cheat-sheet'],
  ['Esc', 'Close palette / dialog'],
];

export function KeyboardHelp({ onClose }: { onClose: () => void }) {
  return (
    <div className="palette-backdrop" role="presentation" onClick={onClose}>
      <div
        className="palette"
        role="dialog"
        aria-label="Keyboard shortcuts"
        style={{ padding: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="section-title">Keyboard shortcuts</h2>
        <div className="kbd-help">
          {SHORTCUTS.map(([k, desc]) => (
            <div key={k} style={{ display: 'contents' }}>
              <kbd>{k}</kbd>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
