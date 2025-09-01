"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ExitIntentModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // No mostrar en pantallas pequeñas si estorba mucho
    if (typeof window === 'undefined') return;
    const already = localStorage.getItem('exit_intent_shown');
    if (already === '1') return;

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 10) {
        setOpen(true);
        localStorage.setItem('exit_intent_shown', '1');
        window.removeEventListener('mouseout', onMouseOut);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setOpen(true);
        localStorage.setItem('exit_intent_shown', '1');
        document.removeEventListener('visibilitychange', onVisibility);
      }
    };

    window.addEventListener('mouseout', onMouseOut);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('mouseout', onMouseOut);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl p-6">
        <div className="text-center mb-4">
          <h3 className="heading-md text-neutral-900 mb-2">¿Te vas? Llévate esto GRATIS</h3>
          <p className="text-neutral-700">Descarga la Plantilla IPD 360° y descubre tu estrategia ideal en 15 minutos.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/plantilla-gratuita" className="btn-urgent w-full text-center" onClick={() => setOpen(false)}>
            Descargar plantilla gratis
          </Link>
          <button className="btn-primary w-full" onClick={() => setOpen(false)}>Seguir en la página</button>
        </div>
        <div className="text-xs text-neutral-500 text-center mt-3">Sin spam • Cancela cuando quieras</div>
      </div>
    </div>
  );
}


