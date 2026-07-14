'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { trackPurchase } from '@/lib/track';

/** Puentea la carrera con el webhook: sondea el entitlement unos segundos. */
export default function GraciasPoller({
  plan,
  sessionId,
}: {
  plan: 'month' | 'year';
  sessionId?: string;
}) {
  const [status, setStatus] = useState<'waiting' | 'active' | 'slow'>('waiting');
  const tracked = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts++;
      try {
        const res = await fetch('/api/gps/entitlement', { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;
        if (data.entitlement === 'full') {
          setStatus('active');
          if (!tracked.current) {
            tracked.current = true;
            trackPurchase({
              value: plan === 'year' ? 59 : 6.99,
              currency: 'USD',
              transactionId: sessionId,
            });
          }
          return;
        }
      } catch {
        // reintenta
      }
      if (attempts < 10) {
        setTimeout(poll, 1500);
      } else {
        setStatus('slow');
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [plan, sessionId]);

  if (status === 'active') {
    return (
      <div className="text-center space-y-4 animate-gps-pop">
        <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto" />
        <h1 className="heading-md text-primary-900">¡Listo! Ya tienes el GPS completo.</h1>
        <p className="text-neutral-600">
          Tu Orden de Ataque, tu fecha de libertad y tus escenarios te están esperando.
        </p>
        <Link href="/diagnostico/panel" className="btn-primary">
          Ver mi plan de ataque <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    );
  }

  if (status === 'slow') {
    return (
      <div className="text-center space-y-4">
        <h1 className="heading-md text-primary-900">Tu pago fue recibido</h1>
        <p className="text-neutral-600">
          Estamos activando tu plan Full — a veces tarda un minuto. Entra a tu panel y si aún no
          lo ves, recarga la página.
        </p>
        <Link href="/diagnostico/panel" className="btn-primary">
          Ir a mi panel <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <Loader2 className="w-10 h-10 text-primary-600 mx-auto animate-spin" />
      <h1 className="heading-md text-primary-900">Activando tu plan Full…</h1>
      <p className="text-neutral-600">Puede tardar unos segundos. No cierres esta página.</p>
    </div>
  );
}
