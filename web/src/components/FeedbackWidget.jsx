import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import api from '../services/api';

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '', type: 'FEEDBACK' });
  const [sent, setSent] = useState(false);

  const close = useCallback(() => { setOpen(false); }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) { if (e.key === 'Escape') close(); }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post('/feedback', form);
      setSent(true);
      setTimeout(() => { setOpen(false); setSent(false); setForm({ name: '', email: '', message: '', type: 'FEEDBACK' }); }, 2000);
    } catch { /* ignore */ }
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary-hover text-background p-3 rounded-full shadow-lg transition-colors"
        aria-label="Open feedback form">
        <MessageSquare className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-40 w-80 glass rounded-xl p-4 shadow-xl" role="dialog" aria-modal="true" aria-label="Feedback form">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold">Feedback</h3>
            <button onClick={() => setOpen(false)} aria-label="Close feedback form"><X className="h-4 w-4" /></button>
          </div>
          {sent ? (
            <div className="text-success text-center py-8">Thanks for your feedback!</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                <option value="FEEDBACK">Feedback</option>
                <option value="FEATURE_REQUEST">Feature Request</option>
                <option value="BUG_REPORT">Bug Report</option>
              </select>
              <input placeholder="Name (optional)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              <textarea placeholder="Your message..." required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[80px]" />
              <button type="submit" className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-background py-2 rounded-lg font-semibold text-sm transition-colors">
                <Send className="h-4 w-4" /> Send
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
