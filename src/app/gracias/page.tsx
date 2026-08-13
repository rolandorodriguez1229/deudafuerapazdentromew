import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, FileText } from 'lucide-react';
import PurchaseTracker from './PurchaseTracker';

export const metadata: Metadata = {
  title: '¡Gracias por tu compra!',
  description: 'Confirmación de compra de Deuda Fuera, Paz Dentro.',
  robots: { index: false, follow: false },
};

export default function GraciasPage() {
  return (
    <main>
      <PurchaseTracker />
      <section className="min-h-screen bg-gradient-to-br from-accent-50 to-primary-50 flex items-center">
        <div className="section-container py-16 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="heading-lg text-neutral-900 mb-2">¡Pago confirmado!</h1>
            <p className="text-neutral-600 mb-2">
              Gracias por tu compra. Te enviamos un correo con tu recibo y el enlace a tus
              descargas.
            </p>
            <p className="text-sm text-neutral-500 mb-6">
              Los archivos no se sirven desde esta página: viven en un área protegida y el enlace
              del correo es el que te da acceso. Si no te llega en unos minutos, mira en spam o
              respóndeme y lo resuelvo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Link href="/diagnostico" className="btn-primary inline-flex items-center justify-center">
                <FileText className="mr-2 h-5 w-5" /> Empieza: calcula tu IPD
              </Link>
            </div>
            <Link href="/" className="text-primary-600 font-semibold">Volver al inicio</Link>
          </div>
        </div>
      </section>
    </main>
  );
}


