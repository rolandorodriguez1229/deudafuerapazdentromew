import Link from 'next/link';

export default function MicroCTASection() {
  return (
    <section className="py-12 bg-accent-50">
      <div className="section-container max-w-4xl text-center">
        <h3 className="heading-md text-neutral-900 mb-2">¿Aún no estás listo para comprar?</h3>
        <p className="text-neutral-700 mb-4">Calcula tu IPD gratis en 15 minutos y descubre tu primera estrategia ideal.</p>
        <Link href="/plantilla-gratuita" className="btn-urgent">Calcular mi IPD gratis</Link>
      </div>
    </section>
  );
}


