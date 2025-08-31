import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function FinalCTASection() {
  return (
    <section className="py-16 bg-white">
      <div className="section-container">
        <div className="text-center bg-primary-950 text-white rounded-2xl p-10">
          <h2 className="heading-lg mb-4">Empieza Hoy y Recupera tu Paz</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">Descarga la plantilla gratuita o llévate el paquete completo. Cada día cuenta: el interés no espera.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/plantilla-gratuita" className="btn-urgent">
              Descargar Plantilla Gratis
            </Link>
            <Link href="/comprar" className="btn-primary">
              Ver Paquetes <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


