'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/track';

export default function PlanSelector() {
  const [loading, setLoading] = useState<'month' | 'year' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function goToCheckout(interval: 'month' | 'year') {
    setLoading(interval);
    setError(null);
    trackEvent('gps_initiate_checkout', {
      value: interval === 'year' ? 59 : 6.99,
      currency: 'USD',
      plan: interval,
    });
    try {
      const res = await fetch('/api/gps/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? 'No pudimos abrir el pago. Intenta de nuevo.');
    } catch {
      setError('No pudimos abrir el pago. Intenta de nuevo.');
    }
    setLoading(null);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col">
          <div className="text-sm font-medium text-neutral-500">Mensual</div>
          <div className="text-3xl font-bold text-primary-900 mt-1">
            $6.99<span className="text-base font-normal text-neutral-500">/mes</span>
          </div>
          <p className="text-sm text-neutral-500 mt-2 flex-1">
            Cancela cuando quieras, sin permanencia.
          </p>
          <button
            onClick={() => goToCheckout('month')}
            disabled={loading !== null}
            className="btn-secondary w-full mt-4 disabled:opacity-60"
          >
            {loading === 'month' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Elegir mensual'}
          </button>
        </div>

        <div className="bg-white rounded-2xl border-2 border-green-500 p-6 flex flex-col relative">
          <span className="absolute -top-3 left-6 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            2 MESES GRATIS
          </span>
          <div className="text-sm font-medium text-neutral-500">Anual</div>
          <div className="text-3xl font-bold text-primary-900 mt-1">
            $59<span className="text-base font-normal text-neutral-500">/año</span>
          </div>
          <p className="text-sm text-neutral-500 mt-2 flex-1">
            Menos de $5 al mes — el precio de un café por tu paz mental.
          </p>
          <button
            onClick={() => goToCheckout('year')}
            disabled={loading !== null}
            className="btn-primary w-full mt-4 disabled:opacity-60"
          >
            {loading === 'year' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Elegir anual'}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      <p className="text-xs text-neutral-400 text-center">
        Pago seguro con Stripe. Cancela en un clic desde tu cuenta.
      </p>
    </div>
  );
}
