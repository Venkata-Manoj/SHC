import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem('cookie-consent');
      if (!accepted) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = useCallback(() => {
    try {
      localStorage.setItem('cookie-consent', 'true');
    } catch { /* ignore */ }
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    function onKeyDown(e) { if (e.key === 'Escape') accept(); }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible, accept]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="mx-auto max-w-2xl glass rounded-xl p-4 flex items-center justify-between gap-4" role="dialog" aria-modal="true" aria-label="Cookie consent">
        <p className="text-sm text-text-secondary">
          We use cookies for analytics. By continuing, you accept our{' '}
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={accept} className="bg-primary hover:bg-primary-hover text-background px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            Accept
          </button>
          <button onClick={accept} aria-label="Dismiss cookie consent" className="p-2 hover:bg-elevated rounded-lg"><X className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
