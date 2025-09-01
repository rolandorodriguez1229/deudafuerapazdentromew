"use client";
import Header from '@/components/Header';
import TrustBar from '@/components/TrustBar';
import TestimonialsSection from '@/components/TestimonialsSection';
import GuaranteeSection from '@/components/GuaranteeSection';
import FAQSection from '@/components/FAQSection';
import FinalCTASection from '@/components/FinalCTASection';
import Footer from '@/components/Footer';
import { Book, CheckCircle, ArrowRight } from 'lucide-react';

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

            <div className="grid md:grid-cols-1 gap-8">
              {/* eBook Digital único */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
                <div className="text-center mb-6">
                  <Book className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">eBook Digital</h3>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className="text-3xl font-bold text-neutral-900">$7.99</span>
                    <span className="text-lg text-neutral-400 line-through">$19.99</span>
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
                    <span className="text-neutral-700">Bono: Plantilla exclusiva IPD (Excel/Sheets)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">Bono: Checklist 30-60-90 días</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">Bono: Scripts de llamada a acreedores (PDF)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">Acceso inmediato en tu cuenta privada</span>
                  </li>
                </ul>

                <button className="w-full btn-primary" onClick={async () => {
                  const res = await fetch('/api/checkout', { method: 'POST' });
                  const data = await res.json();
                  if (data?.url) window.location.href = data.url;
                }}>
                  Comprar ahora con garantía
                </button>
                <p className="text-xs text-neutral-500 text-center mt-3">Incluye garantía de 30 días • Procesamos reembolsos por el mismo método de pago (Stripe) en 3–5 días hábiles</p>
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

            {/* Temporary Message */}
            <div className="mt-16 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                ¡Sitio en Construcción!
              </h3>
              <p className="text-yellow-700 mb-4">
                Los botones de compra se conectarán pronto a la plataforma de pagos. 
                Mientras tanto, puedes descargar la plantilla gratuita.
              </p>
              <a
                href="/plantilla-gratuita"
                className="inline-flex items-center btn-primary"
              >
                Obtener Plantilla Gratuita
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>

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