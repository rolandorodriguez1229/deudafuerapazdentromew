import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Política de Privacidad | Deuda Fuera, Paz Dentro',
  description:
    'Cómo recopilamos, usamos y protegemos tu información personal cuando compras o te suscribes a los materiales de Deuda Fuera, Paz Dentro.',
  alternates: { canonical: '/privacidad' },
};

export default function PrivacidadPage() {
  return (
    <main>
      <Header />
      <section className="py-16 bg-white">
        <div className="section-container max-w-3xl prose prose-neutral">
          <h1 className="heading-lg text-neutral-900 mb-4">Política de Privacidad</h1>
          <p className="text-sm text-neutral-500 mb-8">Última actualización: 22 de abril de 2026</p>

          <h2 className="font-semibold text-neutral-900 mt-8 mb-2">1. Quiénes somos</h2>
          <p className="text-neutral-700">
            Este sitio web es operado por Rolando Rodríguez. Contacto:{' '}
            <a href="mailto:contacto@deudafuerapazdentro.com" className="text-primary-600 underline">
              contacto@deudafuerapazdentro.com
            </a>.
          </p>

          <h2 className="font-semibold text-neutral-900 mt-8 mb-2">2. Qué información recopilamos</h2>
          <ul className="list-disc pl-5 text-neutral-700 space-y-1">
            <li>Nombre y correo electrónico que ingresas en nuestros formularios.</li>
            <li>Datos de pago procesados por Stripe (no almacenamos tu tarjeta).</li>
            <li>Datos de uso anónimos del sitio (cookies de analítica).</li>
          </ul>

          <h2 className="font-semibold text-neutral-900 mt-8 mb-2">3. Cómo usamos tu información</h2>
          <ul className="list-disc pl-5 text-neutral-700 space-y-1">
            <li>Entregarte los productos y materiales que compraste o solicitaste.</li>
            <li>Enviarte correos con contenido relacionado al método (puedes cancelar cuando quieras).</li>
            <li>Mejorar el sitio y prevenir fraude.</li>
          </ul>

          <h2 className="font-semibold text-neutral-900 mt-8 mb-2">4. Terceros</h2>
          <p className="text-neutral-700">
            Usamos Stripe para pagos, proveedores de email marketing y analítica (Google Analytics, Meta). Estos
            terceros procesan datos bajo sus propias políticas.
          </p>

          <h2 className="font-semibold text-neutral-900 mt-8 mb-2">5. Tus derechos</h2>
          <p className="text-neutral-700">
            Puedes solicitar acceso, corrección o eliminación de tus datos escribiendo a{' '}
            <a href="mailto:contacto@deudafuerapazdentro.com" className="text-primary-600 underline">
              contacto@deudafuerapazdentro.com
            </a>.
          </p>

          <h2 className="font-semibold text-neutral-900 mt-8 mb-2">6. Cambios</h2>
          <p className="text-neutral-700">
            Podemos actualizar esta política. La versión vigente siempre estará publicada en esta página.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
