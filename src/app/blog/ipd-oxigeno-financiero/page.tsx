import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function PostIPD() {
  return (
    <main>
      <Header />
      <article className="py-16 bg-white">
        <div className="section-container max-w-3xl">
          <header className="mb-8">
            <h1 className="heading-lg text-neutral-900 mb-3">IPD: cómo calcular tu oxígeno financiero en 15 minutos</h1>
            <p className="text-neutral-600">Tu IPD (Índice de Presión de Deuda) es tu brújula. Te dice si necesitas oxígeno inmediato, motivación o eficiencia.</p>
          </header>

          <section className="prose prose-neutral max-w-none">
            <h2>¿Qué es el IPD?</h2>
            <p>Es la relación entre tus pagos mínimos y tu ingreso mensual. Mientras más alto, más “ahogado” estás.</p>
            <pre><code>IPD = Pagos mínimos ÷ Ingreso mensual</code></pre>
            <h3>Umbrales y estrategia</h3>
            <ul>
              <li>IPD ≥ 0.70 → Oxígeno Rápido (liberar flujo)</li>
              <li>0.45 ≤ IPD &lt; 0.70 → Bola de Nieve (momentum)</li>
              <li>IPD &lt; 0.45 → Avalancha (eficiencia de intereses)</li>
            </ul>
            <h3>Cómo medirlo en 15 minutos</h3>
            <ol>
              <li>Suma pagos mínimos de todas tus deudas.</li>
              <li>Toma tu ingreso mensual neto.</li>
              <li>Divide y compara con los umbrales.</li>
            </ol>
            <p>Consejo: recalcula tu IPD cada vez que elimines una deuda; puede que cambie tu estrategia.</p>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/plantilla-gratuita" className="btn-primary">Calcular mi IPD ahora</Link>
            <Link href="/comprar" className="btn-secondary">Ver paquetes</Link>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}


