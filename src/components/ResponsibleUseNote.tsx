// src/components/ResponsibleUseNote.tsx — persistent, unobtrusive, NON-DISMISSIBLE
// note mounted on every hands-on surface (CommandCard, VariableBar, MindMap).
// HARD RULE §13.1 + Gate 13d: there is NO dismiss/close control in the DOM.
import { Icon } from './Icon';

export function ResponsibleUseNote() {
  return (
    <p className="resp-note" role="note" data-testid="responsible-use-note">
      <Icon name="shield" size={14} />
      <span>
        Authorized testing only — learner-owned labs, HackTheBox/Proving-Grounds, the exam.
      </span>
    </p>
  );
}
