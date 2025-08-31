import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function PostAvalancha() {
  return (
    <main>
      <Header />
      <article className="py-16 bg-white">
        <div className="section-container max-w-3xl">
          <header className="mb-8">
            <h1 className="heading-lg text-neutral-900 mb-3">Avalancha: eficiencia matemática cuando ya respiras</h1>
            <p className="text-neutral-600">IPD &lt; 0.45. Ataca primero las deudas con mayor APR para reducir el costo total.</p>
          </header>

          <section className="prose prose-neutral max-w-none">
            <h2>Cómo aplicarla</h2>
            <ol>
              <li>Ordena deudas por APR (de mayor a menor).</li>
              <li>Paga mínimos y enfoca el extra en la APR más alta.</li>
              <li>Repite hasta liquidar. Tu flujo ya es estable.</li>
            </ol>
            <h3>Tip</h3>
            <p>Tu motivación vendrá de ver caer los intereses pagados mes a mes.</p>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/plantilla-gratuita" className="btn-primary">Confirmar si ya voy a Avalancha</Link>
            <Link href="/comprar" className="btn-secondary">Ver paquetes</Link>
            <Link href="/guia-estrategias" className="btn-urgent">Descargar Gu\u00eda PDF</Link>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}


