"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function StickyCTA() {
  async function handleCheckout() {
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url as string;
      }
    } catch (_) {}
  }
  return (
    <>
      {/* Mobile full-width bar */}
      <div className="fixed bottom-4 left-0 right-0 z-50 px-4 sm:hidden">
        <div className="section-container px-0">
          <div className="bg-white border border-neutral-200 shadow-2xl rounded-full p-2 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-800 ml-3">Empieza gratis en 15 min</span>
            <div className="flex items-center gap-2">
              <Link href="/plantilla-gratuita" className="btn-urgent rounded-full py-2 px-4">
                ¡Descargar!
              </Link>
              <button onClick={handleCheckout} className="btn-primary rounded-full py-2 px-4">
                $7.99 <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop compact pill */}
      <div className="hidden sm:flex fixed bottom-6 right-6 z-50">
        <div className="bg-white border border-neutral-200 shadow-2xl rounded-full p-2 pl-3 items-center gap-2 hidden md:flex">
          <span className="text-sm font-medium text-neutral-800">$7.99 oferta</span>
          <button onClick={handleCheckout} className="btn-primary rounded-full py-2 px-4">
            Comprar <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}


