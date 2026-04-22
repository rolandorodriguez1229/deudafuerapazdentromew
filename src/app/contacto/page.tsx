import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, MessageCircle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contacto | Deuda Fuera, Paz Dentro',
  description:
    'Escríbenos para soporte de tu compra, reembolsos o preguntas sobre el método IPD. Respondemos en menos de 24 horas hábiles.',
  alternates: { canonical: '/contacto' },
};

export default function ContactoPage() {
  return (
    <main>
      <Header />
      <section className="py-16 bg-white">
        <div className="section-container max-w-2xl">
          <h1 className="heading-lg text-neutral-900 mb-4">Contacto</h1>
          <p className="text-neutral-700 mb-8">
            ¿Tienes una pregunta sobre el libro, tu compra o el método IPD? Escríbenos. Respondemos en menos de 24 horas hábiles.
          </p>

          <div className="space-y-4">
            <a
              href="mailto:contacto@deudafuerapazdentro.com"
              className="flex items-start gap-4 bg-neutral-50 border border-neutral-200 rounded-xl p-5 hover:bg-neutral-100 transition-colors"
            >
              <Mail className="h-6 w-6 text-primary-600 mt-1" />
              <div>
                <div className="font-semibold text-neutral-900">Email</div>
                <div className="text-neutral-700">contacto@deudafuerapazdentro.com</div>
              </div>
            </a>

            <div className="flex items-start gap-4 bg-neutral-50 border border-neutral-200 rounded-xl p-5">
              <MessageCircle className="h-6 w-6 text-primary-600 mt-1" />
              <div>
                <div className="font-semibold text-neutral-900">Soporte de compra</div>
                <div className="text-neutral-700">
                  Incluye tu número de pedido de Stripe y el email con el que compraste.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-neutral-50 border border-neutral-200 rounded-xl p-5">
              <Clock className="h-6 w-6 text-primary-600 mt-1" />
              <div>
                <div className="font-semibold text-neutral-900">Horario</div>
                <div className="text-neutral-700">Lunes a viernes, 9:00–18:00 (CT).</div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link href="/garantia" className="text-primary-600 underline">Ver política de reembolsos</Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
