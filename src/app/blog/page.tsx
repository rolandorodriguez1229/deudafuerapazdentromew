import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const posts = [
  {
    slug: 'ipd-oxigeno-financiero',
    title: 'IPD: cómo calcular tu oxígeno financiero en 15 minutos',
    excerpt:
      'Tu IPD (Índice de Presión de Deuda) es tu brújula. Conócelo y sabrás si usar Oxígeno, Nieve o Avalancha.',
  },
  {
    slug: 'flujo-vs-intereses',
    title: 'Flujo vs intereses: por qué “flujo primero” acelera tu salida',
    excerpt:
      'Si estás ahogado, recuperar flujo mensual vence a optimizar intereses. Te muestro cuándo cambiar.',
  },
  {
    slug: 'diagnostico-360-sin-dolor',
    title: 'Diagnóstico 360° sin dolor: tu tablero en 30 minutos',
    excerpt:
      'Campos mínimos, KPIs (IPD, PCR, ROI) y calendario 7/3/1 para no pagar tarde.',
  },
  {
    slug: 'estrategia-oxigeno-rapido',
    title: 'Estrategia Oxígeno Rápido: libera flujo cuando estás al límite',
    excerpt:
      'IPD ≥ 0.70: prioriza ROI de flujo para respirar y evitar atrasos. Te explico cómo.',
  },
  {
    slug: 'estrategia-bola-de-nieve',
    title: 'Bola de Nieve: cuándo usar motivación y momentum',
    excerpt:
      'IPD entre 0.45 y 0.70: deudas pequeñas primero para disparar tu constancia.',
  },
  {
    slug: 'estrategia-avalancha',
    title: 'Avalancha: eficiencia matemática cuando ya respiras',
    excerpt:
      'IPD < 0.45: reduce el costo total atacando primero las APR más altas.',
  },
];

export default function BlogIndex() {
  return (
    <main>
      <Header />
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h1 className="heading-lg text-neutral-900 mb-3">Blog</h1>
            <p className="text-neutral-600">Guías prácticas para eliminar deudas con el sistema IPD</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((p) => (
              <article key={p.slug} className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                </h2>
                <p className="text-neutral-700 mb-4">{p.excerpt}</p>
                <div className="flex items-center gap-2">
                  <Link href={`/blog/${p.slug}`} className="btn-secondary">Leer</Link>
                  <Link href="/plantilla-gratuita" className="btn-primary">Calcular IPD</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}


