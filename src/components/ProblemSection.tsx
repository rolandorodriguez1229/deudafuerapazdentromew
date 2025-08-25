import { AlertCircle, CreditCard, TrendingDown, Clock } from 'lucide-react';

export default function ProblemSection() {
  const problems = [
    {
      icon: <CreditCard className="h-8 w-8 text-red-500" />,
      title: "Pagos Mínimos que Nunca Terminan",
      description: "Pagas mes tras mes pero el saldo casi no baja. Los intereses se comen todo tu esfuerzo."
    },
    {
      icon: <TrendingDown className="h-8 w-8 text-red-500" />,
      title: "Estrés Financiero Constante",
      description: "Cada mes es la misma lucha. No importa cuánto ganes, nunca parece ser suficiente."
    },
    {
      icon: <Clock className="h-8 w-8 text-red-500" />,
      title: "Sin Plan Claro",
      description: "Has intentado diferentes métodos pero no sabes cuál es el correcto para tu situación específica."
    }
  ];

  return (
    <section className="py-20 bg-neutral-50">
      <div className="section-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-full mb-6">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">El Problema Real</span>
          </div>
          
          <h2 className="heading-lg text-neutral-900 mb-6">
            ¿Te Sientes Atrapado en el{' '}
            <span className="text-red-600">Ciclo de la Deuda</span>?
          </h2>
          
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            No estás solo. Millones de familias hispanas viven la misma realidad: 
            trabajar duro pero sentir que el dinero se evapora antes de llegar a fin de mes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {problems.map((problem, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="mb-4">
                {problem.icon}
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                {problem.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>

        {/* The Cycle Visualization */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="heading-md text-neutral-900 mb-4">
              El Ciclo Que Mantiene a las Familias Atrapadas
            </h3>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 items-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h4 className="font-semibold text-neutral-900 mb-2">Gastas de Más</h4>
              <p className="text-sm text-neutral-600">Por necesidad o emergencias inesperadas</p>
            </div>
            
            <div className="hidden md:block text-center">
              <div className="text-3xl text-red-400">→</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h4 className="font-semibold text-neutral-900 mb-2">Usas Crédito</h4>
                              <p className="text-sm text-neutral-600">Tarjetas, préstamos, &quot;compra ahora, paga después&quot;</p>
            </div>
            
            <div className="hidden md:block text-center">
              <div className="text-3xl text-red-400">→</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h4 className="font-semibold text-neutral-900 mb-2">Pagas Intereses</h4>
              <p className="text-sm text-neutral-600">Que reducen aún más tu dinero disponible</p>
            </div>
            
            <div className="text-center md:col-span-4 mt-6">
              <div className="text-2xl text-red-400 mb-4">↓</div>
              <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
                <h4 className="font-semibold text-red-600 mb-2">Resultado:</h4>
                <p className="text-neutral-700">
                  Menos dinero disponible el próximo mes, lo que te obliga a repetir el ciclo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 