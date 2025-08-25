import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Book, Star, CheckCircle, ArrowRight } from 'lucide-react';

export default function ComprarPage() {
  return (
    <main>
      <Header />
      
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

            <div className="grid md:grid-cols-2 gap-8">
              {/* eBook Digital */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
                <div className="text-center mb-6">
                  <Book className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">eBook Digital</h3>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className="text-3xl font-bold text-neutral-900">$19</span>
                    <span className="text-lg text-neutral-400 line-through">$29</span>
                  </div>
                  <p className="text-green-600 font-medium">Ahorra $10</p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">210 páginas de contenido práctico</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">Sistema IPD® completo</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">Plantillas incluidas</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">Acceso inmediato</span>
                  </li>
                </ul>

                <button className="w-full btn-secondary">
                  Comprar eBook ($19)
                </button>
              </div>

              {/* Paquete Completo */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-accent-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-accent-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    MÁS POPULAR
                  </div>
                </div>

                <div className="text-center mb-6">
                  <Star className="h-12 w-12 text-accent-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">Paquete Completo</h3>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className="text-3xl font-bold text-neutral-900">$47</span>
                    <span className="text-lg text-neutral-400 line-through">$97</span>
                  </div>
                  <p className="text-green-600 font-medium">Ahorra $50</p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">eBook Digital completo</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">Audiolibro (próximamente)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">Curso en video (5 horas)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">Plantillas avanzadas</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">Soporte por email 90 días</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">Garantía de 30 días</span>
                  </li>
                </ul>

                <button className="w-full btn-primary">
                  Obtener Paquete Completo ($47)
                </button>
              </div>
            </div>

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