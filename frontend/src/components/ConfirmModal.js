import React from 'react';

/**
 * ConfirmModal — accessible confirmation dialog
 *
 * <ConfirmModal
 *   open={open}
 *   title="Delete Community?"
 *   message="This action cannot be undone."
 *   confirmLabel="Delete"
 *   danger
 *   onConfirm={handleDelete}
 *   onCancel={() => setOpen(false)}
 * />
 */
export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
  children,
}) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div className="modal" style={{ maxWidth: 420 }}>
        <h3 className="modal-title" style={{ marginBottom: 10 }}>{title}</h3>

        {message && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>{message}</p>
        )}

        {children}

        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn btn-outline" disabled={loading}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            disabled={loading}
          >
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
