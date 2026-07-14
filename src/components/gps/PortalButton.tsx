'use client';

import { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';

export default function PortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gps/portal', { method: 'POST' });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? 'No pudimos abrir el portal.');
    } catch {
      setError('No pudimos abrir el portal.');
    }
    setLoading(false);
  }

  return (
    <div>
      <button onClick={openPortal} disabled={loading} className="btn-secondary disabled:opacity-60">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Administrar suscripción <ExternalLink className="w-4 h-4 ml-2" />
          </>
        )}
      </button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
