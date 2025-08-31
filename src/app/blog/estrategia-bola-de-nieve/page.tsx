import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function PostBolaDeNieve() {
  return (
    <main>
      <Header />
      <article className="py-16 bg-white">
        <div className="section-container max-w-3xl">
          <header className="mb-8">
            <h1 className="heading-lg text-neutral-900 mb-3">Bola de Nieve: cuándo usar motivación y momentum</h1>
            <p className="text-neutral-600">IPD entre 0.45 y 0.70. Enfócate en deudas pequeñas para crear tracción emocional y constancia.</p>
          </header>

          <section className="prose prose-neutral max-w-none">
            <h2>Cómo funciona</h2>
            <ol>
              <li>Paga mínimos en todas.</li>
              <li>Enfoca todo el extra en la deuda más pequeña.</li>
              <li>Al tacharla, arrastra el pago liberado a la siguiente (la bola crece).</li>
            </ol>
            <h3>Señal de cambio</h3>
            <p>Cuando tu IPD baje de 0.45, migra a Avalancha para optimizar intereses.</p>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/plantilla-gratuita" className="btn-primary">Medir mi IPD</Link>
            <Link href="/comprar" className="btn-secondary">Ver paquetes</Link>
            <Link href="/guia-estrategias" className="btn-urgent">Descargar Gu\u00eda PDF</Link>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}


