import type { Case } from '../types';

export function DeleteCaseConfirmationDialog({ caseItem, onConfirm, onClose }: { caseItem: Case; onConfirm: () => void; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation">
    <section className="modal confirm-dialog delete-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-case-title">
      <div className="modal-head">
        <h2 id="delete-case-title">Delete Case?</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close confirmation dialog" />
      </div>
      <p>This will permanently delete case <strong>{caseItem.case_number}</strong> and its activity log. This action cannot be undone.</p>
      <div className="actions end">
        <button type="button" className="secondary" onClick={onClose}>Cancel</button>
        <button type="button" className="danger-action" onClick={onConfirm}>Delete Case</button>
      </div>
    </section>
  </div>;
}
