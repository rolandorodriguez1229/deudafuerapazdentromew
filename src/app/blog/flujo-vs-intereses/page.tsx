import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function PostFlujoVsIntereses() {
  return (
    <main>
      <Header />
      <article className="py-16 bg-white">
        <div className="section-container max-w-3xl">
          <header className="mb-8">
            <h1 className="heading-lg text-neutral-900 mb-3">Flujo vs intereses: por qué “flujo primero” acelera tu salida</h1>
            <p className="text-neutral-600">Si estás ahogado, liberar flujo mensual te permite sobrevivir y avanzar. Luego optimizas intereses.</p>
          </header>

          <section className="prose prose-neutral max-w-none">
            <h2>La lógica</h2>
            <p>Eliminar la deuda con mayor pago mensual puede darte oxígeno inmediato. Ese oxígeno te permite sostener el plan y cambiar a estrategias más eficientes.</p>
            <h3>Ejemplo rápido</h3>
            <ul>
              <li>Tarjeta A (28% APR), mínimo $90</li>
              <li>Préstamo B (9% APR), pago $400</li>
            </ul>
            <p>Si eliminas B primero, liberas $400/mes. Ese flujo paga más deudas y evita atrasos.</p>
            <h3>Cuándo cambiar</h3>
            <p>Cuando tu IPD cae por debajo de 0.45, pasas a Avalancha para minimizar el costo total.</p>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/plantilla-gratuita" className="btn-primary">Empieza liberando flujo</Link>
            <Link href="/comprar" className="btn-secondary">Libro y paquete completo</Link>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}


