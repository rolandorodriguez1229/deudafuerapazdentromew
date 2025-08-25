import Link from 'next/link';
import { Download, Clock, Calculator, CheckCircle } from 'lucide-react';

export default function LeadMagnetSection() {
  const benefits = [
    "Calcula tu IPD® automáticamente en minutos",
    "Identifica tu nivel de oxígeno financiero actual", 
    "Descubre qué estrategia usar (Oxígeno, Bola de Nieve o Avalancha)",
    "Obtén un plan mes a mes personalizado para tu situación",
    "Incluye hoja de seguimiento de progreso",
    "Formato Excel fácil de usar y actualizar"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-accent-50 to-primary-50">
      <div className="section-container">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-accent-500 text-white px-4 py-2 rounded-full mb-6">
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Herramienta Gratuita</span>
            </div>
            
            <h2 className="heading-lg text-neutral-900 mb-6">
              Tu Plan de Rescate en{' '}
              <span className="text-accent-500">15 Minutos</span>
            </h2>
            
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Obtén la misma plantilla que uso con mis clientes privados. 
              Calcula tu IPD® y descubre exactamente qué hacer para recuperar tu paz financiera.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Plantilla Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="border-b border-neutral-200 pb-4 mb-6">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                    Plantilla de Diagnóstico 360°
                  </h3>
                  <p className="text-accent-600 font-medium">
                    Sistema IPD® Incluido
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-neutral-900">Nivel de Oxígeno:</span>
                      <span className="text-accent-500 font-bold">Calculado automáticamente</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-accent-400 to-accent-600 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-primary-900 mb-2">Tu Estrategia Recomendada:</h4>
                    <p className="text-primary-700">Bola de Nieve Modificada</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Plan de Acción:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Mes 1-3: Construir fondo de emergencia</li>
                      <li>• Mes 4-12: Eliminar deuda más pequeña</li>
                      <li>• Año 2: Atacar deuda principal</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center space-x-4">
                  <Calculator className="h-6 w-6 text-accent-500" />
                  <span className="text-sm text-neutral-600">Fórmulas automáticas incluidas</span>
                </div>
              </div>
              
              {/* Badge */}
              <div className="absolute -top-4 -right-4 bg-accent-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                ¡GRATIS!
              </div>
            </div>

            {/* Benefits & CTA */}
            <div className="space-y-8">
              <div>
                <h3 className="heading-md text-neutral-900 mb-6">
                  Qué Incluye Tu Plantilla:
                </h3>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-accent-500 mt-1 flex-shrink-0" />
                      <span className="text-neutral-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-accent-500">15</div>
                    <div className="text-xs text-neutral-600">Minutos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent-500">100%</div>
                    <div className="text-xs text-neutral-600">Personalizado</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent-500">0$</div>
                    <div className="text-xs text-neutral-600">Costo</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-4">
                <Link
                  href="/plantilla-gratuita"
                  className="btn-primary w-full text-center text-lg py-6 block"
                >
                  Descargar Mi Plantilla Gratis
                </Link>
                
                <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500">
                  <Clock className="h-4 w-4" />
                  <span>Descarga instantánea • No spam • 100% gratis</span>
                </div>
              </div>

              {/* Testimonial quote */}
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-accent-500">
                <p className="text-neutral-700 italic mb-2">
                  &quot;En 15 minutos supe exactamente qué hacer. Por primera vez en años, 
                  tengo un plan claro para salir de mis deudas.&quot;
                </p>
                <p className="text-sm text-neutral-500">
                  - María S., usuaria de la plantilla
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 