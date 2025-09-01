import { Star } from 'lucide-react';

type Testimonial = {
  name: string;
  location?: string;
  text: string;
  rating: number;
};

const testimonials: Testimonial[] = [
  {
    name: 'María S.',
    location: 'Dallas',
    text: 'Con el método Oxígeno liberé $380/mes en 5 semanas. Por fin duermo tranquila y dejé de usar tarjetas para sobrevivir.',
    rating: 5,
  },
  {
    name: 'Jorge R.',
    location: 'Phoenix',
    text: 'Con el IPD entendí por dónde empezar. En el primer mes recuperé $600 de flujo y pagué 2 deudas pequeñas.',
    rating: 5,
  },
  {
    name: 'Laura F.',
    location: 'Miami',
    text: 'El capítulo de psicología me quitó la culpa. En 6 semanas tenía un plan claro y menos ansiedad.',
    rating: 5,
  },
  {
    name: 'Luis G.',
    location: 'San Antonio',
    text: 'Por primera vez tengo un plan que se adapta a mi situación. Vale cada centavo.',
    rating: 5,
  },
  {
    name: 'Fernanda',
    location: 'Chicago',
    text: 'Turnos + niños pequeños: el plan paso a paso me dio estructura. En 3 meses sentí paz y control.',
    rating: 5,
  },
  {
    name: 'Carlos',
    location: 'Houston',
    text: 'Ingresos variables y muchas deudas pequeñas. En 60 días el IPD priorizó todo sin dolores de cabeza.',
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => {
            const initials = t.name
              .split(' ')
              .map((p) => p.charAt(0))
              .join('')
              .slice(0, 2)
              .toUpperCase();
            return (
              <div key={t.name} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center font-semibold">
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">{t.name}{t.location ? `, ${t.location}` : ''}</div>
                    <div className="flex">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-neutral-700">“{t.text}”</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


