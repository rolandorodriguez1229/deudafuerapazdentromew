import Link from 'next/link';
import { CheckCircle, Navigation, Target, Zap } from 'lucide-react';

export default function SolutionSection() {
  const features = [
    {
      icon: <Navigation className="h-8 w-8 text-accent-500" />,
      title: "Tu GPS Anti-Deuda Personal",
      description: "El sistema IPD calcula exactamente qué estrategia usar según tu situación específica"
    },
    {
      icon: <Target className="h-8 w-8 text-accent-500" />,
      title: "Plan Paso a Paso",
      description: "No más confusión. Sabrás exactamente qué hacer cada mes para salir de deudas"
    },
    {
      icon: <Zap className="h-8 w-8 text-accent-500" />,
      title: "Resultados Inmediatos",
      description: "Verás progreso real desde el primer mes, no en años como otros métodos"
    }
  ];

  const strategies = [
    {
      name: "Oxígeno Rápido",
      description: "Para cuando necesitas respirar YA",
      bestFor: "Situaciones de emergencia financiera"
    },
    {
      name: "Bola de Nieve",
      description: "Motivación y momentum constante",
      bestFor: "Personas que necesitan ver victorias rápidas"
    },
    {
      name: "Avalancha",
      description: "Máximo ahorro en intereses",
      bestFor: "Optimización matemática del proceso"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="section-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-accent-100 text-accent-700 px-4 py-2 rounded-full mb-6">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">La Solución</span>
          </div>
          
          <h2 className="heading-lg text-neutral-900 mb-6">
            Conoce el Sistema{' '}
            <span className="text-accent-500">&quot;Deudas Inteligentes&quot;</span>
          </h2>
          
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            No todas las deudas son iguales, ni todas las personas tienen la misma situación. 
            Por eso creé el <strong>Índice de Presión de Deuda (IPD®)</strong> - 
            tu GPS personal para navegar hacia la libertad financiera.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="bg-accent-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* IPD System Explanation */}
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8 md:p-12 mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="heading-md text-neutral-900 mb-6">
                ¿Qué es el <span className="text-primary-600">IPD®</span>?
              </h3>
              <p className="text-lg text-neutral-700 mb-6 leading-relaxed">
                El Índice de Presión de Deuda es una fórmula que              desarrollé después de analizar 
                 cientos de casos reales. Te dice exactamente cuánto &quot;oxígeno financiero&quot; tienes 
                 y qué estrategia usar para recuperar tu paz.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent-500 mt-1 flex-shrink-0" />
                  <span className="text-neutral-700">Calcula tu nivel de presión en minutos</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent-500 mt-1 flex-shrink-0" />
                  <span className="text-neutral-700">Identifica automáticamente tu estrategia óptima</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent-500 mt-1 flex-shrink-0" />
                  <span className="text-neutral-700">Te da un plan mes a mes hasta la libertad total</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h4 className="font-semibold text-neutral-900 mb-4 text-center">
                Nivel de Oxígeno Financiero
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Crítico (0-30%)</span>
                  <div className="w-24 h-2 bg-red-200 rounded-full">
                    <div className="w-1/4 h-full bg-red-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Bajo (31-60%)</span>
                  <div className="w-24 h-2 bg-yellow-200 rounded-full">
                    <div className="w-1/2 h-full bg-yellow-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Saludable (61-100%)</span>
                  <div className="w-24 h-2 bg-green-200 rounded-full">
                    <div className="w-3/4 h-full bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-4 text-center">
                Tu IPD determina qué estrategia usar
              </p>
            </div>
          </div>
        </div>

        {/* Three Strategies */}
        <div className="mb-12">
          <h3 className="heading-md text-neutral-900 text-center mb-12">
            Las 3 Estrategias del Sistema
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {strategies.map((strategy, index) => (
              <div key={index} className="bg-neutral-50 p-8 rounded-xl hover:shadow-lg transition-shadow duration-300">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold">{index + 1}</span>
                  </div>
                  <h4 className="text-xl font-semibold text-neutral-900 mb-2">
                    {strategy.name}
                  </h4>
                  <p className="text-accent-600 font-medium text-sm">
                    {strategy.description}
                  </p>
                </div>
                <div className="border-t border-neutral-200 pt-4">
                  <p className="text-sm text-neutral-600">
                    <strong>Ideal para:</strong> {strategy.bestFor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/plantilla-gratuita"
            className="btn-primary inline-flex items-center"
          >
            Descubre Tu Estrategia Ideal Gratis
          </Link>
          <p className="text-sm text-neutral-500 mt-4">
            Calcula tu IPD® en 15 minutos y obtén tu plan personalizado
          </p>
        </div>
      </div>
    </section>
  );
} 