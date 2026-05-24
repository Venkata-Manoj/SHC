import { useEffect, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, variant, onConfirm, onCancel }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onCancel();
  }, [onCancel]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
      <div className="glass rounded-xl p-6 max-w-sm w-full shadow-xl" role="dialog" aria-modal="true" aria-label={title}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${variant === 'danger' ? 'bg-error/10' : 'bg-primary/10'}`}>
              <AlertTriangle className={`h-5 w-5 ${variant === 'danger' ? 'text-error' : 'text-primary'}`} />
            </div>
            <h3 className="font-heading font-semibold text-lg">{title}</h3>
          </div>
          <button onClick={onCancel} aria-label="Close dialog" className="p-1 hover:bg-elevated rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-text-secondary text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel}
            className="border border-border px-4 py-2 rounded-lg text-sm font-semibold hover:bg-surface transition-colors">
            {cancelLabel || 'Cancel'}
          </button>
          <button onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              variant === 'danger'
                ? 'bg-error hover:bg-error/80 text-white'
                : 'bg-primary hover:bg-primary-hover text-background'
            }`}>
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
