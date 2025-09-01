import { Star } from 'lucide-react';
import Image from 'next/image';

type Testimonial = {
  name: string;
  location?: string;
  text: string;
  rating: number;
  avatarSrc?: string;
};

const testimonials: Testimonial[] = [
  {
    name: 'María S.',
    location: 'Dallas',
    text: 'Estaba ahogada pagando $450 en mínimos. Con el método Oxígeno liberé $180/mes en solo 3 semanas. ¡Por fin pude respirar!',
    rating: 5,
    avatarSrc: '/testimonials/maria-dallas.png',
  },
  {
    name: 'Jorge R.',
    location: 'Phoenix',
    text: 'El IPD me dijo por dónde empezar. En 4 semanas recuperé $600/mes y taché 2 deudas pequeñas.',
    rating: 5,
    avatarSrc: '/testimonials/jorge-phoenix.png',
  },
  {
    name: 'Laura F.',
    location: 'Miami',
    text: 'El capítulo de psicología me quitó la culpa. En 6 semanas pagué 2 tarjetas y bajó mi ansiedad.',
    rating: 5,
    avatarSrc: '/testimonials/laura-miami.png',
  },
  {
    name: 'Luis G.',
    location: 'San Antonio',
    text: 'Reduje intereses y recargos en $120/mes en 2 meses. Por fin un plan que se adapta a mi situación.',
    rating: 5,
    avatarSrc: '/testimonials/luis-san-antonio.png',
  },
  {
    name: 'Fernanda',
    location: 'Chicago',
    text: 'Turnos + niños pequeños: en 30 días recorté $250 en no esenciales y armé rutina. Más paz y control.',
    rating: 5,
    avatarSrc: '/testimonials/fernanda-chicago.png',
  },
  {
    name: 'Carlos',
    location: 'Houston',
    text: 'Ingresos variables y 5 deudas. En 8 semanas, con IPD, prioricé pagos y liberé $220/mes.',
    rating: 5,
    avatarSrc: '/testimonials/carlos-houston.png',
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
                  {t.avatarSrc ? (
                    <Image
                      src={t.avatarSrc}
                      alt={`Foto de ${t.name}`}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center font-semibold">
                      {initials}
                    </div>
                  )}
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
        <div className="text-center mt-10">
          <div className="flex flex-col items-center gap-1">
            <a href="/checkout" className="btn-urgent">Sí, quiero mi paz financiera – Solo $7.99</a>
            <span className="text-xs text-neutral-500">Oferta de lanzamiento válida hasta el 1 de noviembre o primeras 100 compras</span>
          </div>
        </div>
      </div>
    </section>
  );
}


