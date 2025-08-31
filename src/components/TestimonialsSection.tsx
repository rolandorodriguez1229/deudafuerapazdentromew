import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'María S.',
    text: 'En solo 3 meses pagué dos tarjetas y por fin duermo tranquila. La claridad del plan me cambió la vida.',
    rating: 5,
  },
  {
    name: 'Jorge R.',
    text: 'Pensé que necesitaba ganar más. Con el IPD supe exactamente qué hacer y en el primer mes recuperé $600 de flujo.',
    rating: 5,
  },
  {
    name: 'Ana M.',
    text: 'La plantilla me dio control total. Ya no me siento perdido con mis pagos.',
    rating: 5,
  },
  {
    name: 'Luis G.',
    text: 'Por primera vez tengo un plan que se adapta a mi situación. Vale cada centavo.',
    rating: 5,
  },
  // Personas específicas
  {
    name: 'Fernanda (madre de 2)',
    text: 'Con turnos y niños pequeños no tenía tiempo. El plan paso a paso me dio paz y estructura.',
    rating: 5,
  },
  {
    name: 'Carlos (autónomo)',
    text: 'Ingresos variables y muchas deudas pequeñas. En 60 días el IPD priorizó todo sin dolores de cabeza.',
    rating: 5,
  },
  {
    name: 'Sofía (inmigrante)',
    text: 'El sistema considera mi realidad. Por fin un método que entiende mis gastos y metas.',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-neutral-50">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="heading-lg text-neutral-900 mb-4">Resultados Reales</h2>
          <p className="text-neutral-600">Personas como tú ya están saliendo de deudas</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-neutral-700 mb-4">“{t.text}”</p>
              <p className="text-sm font-semibold text-neutral-900">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


