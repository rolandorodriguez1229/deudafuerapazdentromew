import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'IPD: cómo calcular tu oxígeno financiero en 15 minutos',
  description:
    'El Índice de Presión de Deuda (IPD) te dice si aplicar Oxígeno Rápido, Bola de Nieve o Avalancha. Aprende a calcularlo paso a paso.',
  alternates: { canonical: '/blog/ipd-oxigeno-financiero' },
};

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
            <p>Es la parte de tu ingreso que ya está comprometida antes de empezar el mes: tus gastos esenciales más los pagos mínimos de tus deudas. Mientras más alto, más “ahogado” estás. Los gastos NO esenciales no entran en el cálculo.</p>
            <pre><code>IPD = (Gastos esenciales + Pagos mínimos) ÷ Ingreso neto mensual</code></pre>
            <h3>Umbrales y estrategia</h3>
            <ul>
              <li>IPD ≥ 0.70 → Oxígeno Rápido (liberar flujo)</li>
              <li>0.45 ≤ IPD &lt; 0.70 → Bola de Nieve (momentum)</li>
              <li>IPD &lt; 0.45 → Avalancha (eficiencia de intereses)</li>
            </ul>
            <h3>Cómo medirlo en 15 minutos</h3>
            <ol>
              <li>Suma tus gastos esenciales del mes (vivienda, comida, transporte, servicios, salud).</li>
              <li>Suma los pagos mínimos de todas tus deudas.</li>
              <li>Divide el total entre tu ingreso mensual neto y compara con los umbrales.</li>
            </ol>
            <p>Consejo: recalcula tu IPD cada vez que elimines una deuda; puede que cambie tu estrategia.</p>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/diagnostico" className="btn-primary">Calcular mi IPD ahora</Link>
            <Link href="/comprar" className="btn-secondary">Ver paquetes</Link>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}


