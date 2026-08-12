"use client";
import Header from '@/components/Header';
import TrustBar from '@/components/TrustBar';
import TestimonialsSection from '@/components/TestimonialsSection';
import GuaranteeSection from '@/components/GuaranteeSection';
import FAQSection from '@/components/FAQSection';
import FinalCTASection from '@/components/FinalCTASection';
import Footer from '@/components/Footer';
import PriceX from '@/components/PriceX';
import { Book, CheckCircle } from 'lucide-react';
import { EBOOK_SALES_PAUSED, WAITLIST_CTA_LABEL, WAITLIST_PATH } from '@/config/sales';

export default function ComprarPage() {
  return (
    <main>
      <Header />
      <TrustBar />
      
      <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50 min-h-screen">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="heading-xl text-neutral-900 mb-6">
                Obtén &quot;Deuda Fuera, Paz Dentro&quot;
              </h1>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Elige el paquete perfecto para iniciar tu camino hacia la libertad financiera
              </p>
            </div>

            <div className="grid md:grid-cols-1 gap-8 place-items-center">
              {/* eBook Digital único */}
              <div className="bg-white rounded-2xl shadow-lg p-10 border border-neutral-200 w-full max-w-2xl">
                <div className="text-center mb-6">
                  <Book className="h-14 w-14 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-neutral-900 mb-2">eBook Digital</h3>
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <span className="text-4xl font-bold text-neutral-900">$7.99</span>
                    <span className="text-xl"><PriceX text="$19.99" /></span>
                  </div>
                  <p className="text-green-600 font-medium">Oferta de lanzamiento</p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">eBook completo en formato digital</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">🎁 Plantilla IPD 360° (Valorada en $29.99)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">🎁 Checklist 30-60-90 días (Valorada en $19.99)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">🎁 Scripts para negociar con acreedores (Valorados en $24.99)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">Acceso inmediato en tu cuenta privada</span>
                  </li>
                </ul>

                {EBOOK_SALES_PAUSED ? (
                  <>
                    <a className="w-full btn-primary block text-center" href={WAITLIST_PATH}>
                      {WAITLIST_CTA_LABEL}
                    </a>
                    <p className="text-xs text-neutral-500 text-center mt-3">
                      El libro está terminado y en preparación digital. Todavía no está a la venta:
                      déjame tu correo y te aviso el día que salga.
                    </p>
                  </>
                ) : (
                  <>
                    <a className="w-full btn-primary block text-center" href="/checkout">
                      Comprar ahora con garantía
                    </a>
                    <p className="text-xs text-neutral-500 text-center mt-3">Antes <PriceX text="$19.99" size="sm" /> · Hoy $7.99 (lanzamiento) • Incluye garantía de 30 días • Reembolsos por Stripe en 3–5 días hábiles</p>
                    <p className="text-xs text-neutral-500 text-center mt-1"><a className="underline" href="/garantia">Ver política de reembolsos</a></p>
                  </>
                )}
              </div>
            </div>

            {/* Social Proof inline */}
            <div className="mt-10">
              <TestimonialsSection />
            </div>

            {/* Guarantee */}
            <GuaranteeSection />

            {/* FAQ */}
            <FAQSection />

            {/* Final CTA */}
            <FinalCTASection />

            {/* Guarantee */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Garantía de satisfacción de 30 días
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 