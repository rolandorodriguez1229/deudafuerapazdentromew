import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function GuaranteeStrip() {
  return (
    <section className="bg-gradient-to-r from-primary-800 to-primary-900 text-white">
      <div className="section-container py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent-400" />
            <p className="text-sm sm:text-base">Compra sin riesgo: 30 días de garantía. Si no ves resultados, te devolvemos tu dinero.</p>
          </div>
          <Link href="/comprar" className="btn-urgent py-2 px-4">Comprar ahora con garantía</Link>
        </div>
      </div>
    </section>
  );
}


