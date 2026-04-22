import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Términos de Uso | Deuda Fuera, Paz Dentro',
  description:
    'Términos y condiciones para el uso del sitio y de los productos digitales de Deuda Fuera, Paz Dentro.',
  alternates: { canonical: '/terminos' },
};

export default function TerminosPage() {
  return (
    <main>
      <Header />
      <section className="py-16 bg-white">
        <div className="section-container max-w-3xl">
          <h1 className="heading-lg text-neutral-900 mb-4">Términos de Uso</h1>
          <p className="text-sm text-neutral-500 mb-8">Última actualización: 22 de abril de 2026</p>

          <h2 className="font-semibold text-neutral-900 mt-6 mb-2">1. Licencia de uso</h2>
          <p className="text-neutral-700">
            Al comprar el eBook y los materiales, recibes una licencia personal, no transferible, para uso propio.
            No puedes redistribuir, revender ni compartir públicamente los archivos.
          </p>

          <h2 className="font-semibold text-neutral-900 mt-6 mb-2">2. Descargo de responsabilidad</h2>
          <p className="text-neutral-700">
            El contenido es informativo y educativo. No constituye asesoría financiera, legal ni fiscal profesional.
            Los resultados dependen de tu situación particular y del seguimiento del método.
          </p>

          <h2 className="font-semibold text-neutral-900 mt-6 mb-2">3. Pagos y reembolsos</h2>
          <p className="text-neutral-700">
            Los pagos se procesan a través de Stripe. Consulta nuestra{' '}
            <Link href="/garantia" className="text-primary-600 underline">
              política de reembolsos
            </Link>{' '}
            para conocer la garantía de 30 días.
          </p>

          <h2 className="font-semibold text-neutral-900 mt-6 mb-2">4. Propiedad intelectual</h2>
          <p className="text-neutral-700">
            Todos los textos, marcas (incluyendo el método IPD®), imágenes y plantillas son propiedad de Rolando
            Rodríguez y están protegidos por la ley.
          </p>

          <h2 className="font-semibold text-neutral-900 mt-6 mb-2">5. Limitación de responsabilidad</h2>
          <p className="text-neutral-700">
            En ningún caso seremos responsables por daños indirectos o consecuentes derivados del uso de la
            información publicada en este sitio o de los productos adquiridos.
          </p>

          <h2 className="font-semibold text-neutral-900 mt-6 mb-2">6. Contacto</h2>
          <p className="text-neutral-700">
            Para cualquier duda sobre estos términos, escríbenos a{' '}
            <a href="mailto:contacto@deudafuerapazdentro.com" className="text-primary-600 underline">
              contacto@deudafuerapazdentro.com
            </a>
            .
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
