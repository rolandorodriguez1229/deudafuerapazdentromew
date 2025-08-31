import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function PostOxigenoRapido() {
  return (
    <main>
      <Header />
      <article className="py-16 bg-white">
        <div className="section-container max-w-3xl">
          <header className="mb-8">
            <h1 className="heading-lg text-neutral-900 mb-3">Estrategia Oxígeno Rápido: libera flujo cuando estás al límite</h1>
            <p className="text-neutral-600">Si tu IPD ≥ 0.70 o tu flujo libre ≤ 5%, necesitas oxígeno inmediato: ataca la deuda con mayor ROI de flujo.</p>
          </header>

          <section className="prose prose-neutral max-w-none">
            <h2>Cuándo usarla</h2>
            <ul>
              <li>IPD ≥ 0.70 o te falta dinero para cerrar el mes.</li>
              <li>Pagos mínimos “te ahogan” y temes atrasarte.</li>
            </ul>
            <h3>Cómo aplicarla</h3>
            <ol>
              <li>Ordena deudas por ROI de flujo: pago mensual × 12 ÷ saldo.</li>
              <li>Paga mínimos en todas y destina el extra a la de mayor ROI.</li>
              <li>Al eliminarla, redirige el pago liberado a la siguiente (bola de nieve de flujo).</li>
            </ol>
            <h3>Ejemplo breve</h3>
            <p>Deuda A: saldo $3,500, mínimo $150 → ROI ≈ 51%. Deuda B: saldo $5,000, mínimo $90 → ROI ≈ 22%.
            Prioriza A: liberas $150/mes, respiras y evitas atrasos.</p>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/plantilla-gratuita" className="btn-primary">Calcular mi IPD</Link>
            <Link href="/comprar" className="btn-secondary">Ver paquetes</Link>
            <Link href="/guia-estrategias" className="btn-urgent">Descargar Gu\u00eda PDF</Link>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}


