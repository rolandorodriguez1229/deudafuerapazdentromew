import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function PostDiagnostico() {
  return (
    <main>
      <Header />
      <article className="py-16 bg-white">
        <div className="section-container max-w-3xl">
          <header className="mb-8">
            <h1 className="heading-lg text-neutral-900 mb-3">Diagnóstico 360° sin dolor: tu tablero en 30 minutos</h1>
            <p className="text-neutral-600">Campos mínimos y KPIs para ver todo en un solo lugar: IPD, PCR, ROI y calendario 7/3/1.</p>
          </header>

          <section className="prose prose-neutral max-w-none">
            <h2>Campos imprescindibles</h2>
            <ul>
              <li>Deuda: saldo, mínimo, APR, fechas de corte/pago (opcional).</li>
              <li>Gastos esenciales: vivienda, servicios, transporte, comida, seguros.</li>
              <li>KPIs: IPD, PCR, ROI liberado.</li>
            </ul>
            <h3>Calendario 7/3/1</h3>
            <p>7, 3 y 1 días antes del pago: revisa, programa y verifica. Evita cargos por descuido.</p>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/plantilla-gratuita" className="btn-primary">Descargar plantilla</Link>
            <Link href="/downloads/calendario-7-3-1.ics" className="btn-secondary">Descargar calendario 7/3/1</Link>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}


