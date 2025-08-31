import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function StickyCTA() {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 sm:hidden">
      <div className="section-container px-0">
        <div className="bg-white border border-neutral-200 shadow-2xl rounded-full p-2 flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-800 ml-3">Empieza gratis en 15 min</span>
          <div className="flex items-center gap-2">
            <Link href="/plantilla-gratuita" className="btn-urgent rounded-full py-2 px-4">
              ¡Descargar!
            </Link>
            <Link href="/comprar" className="btn-primary rounded-full py-2 px-4">
              Paquetes <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


