import Image from 'next/image';
import { Star } from 'lucide-react';

export default function TestimonialsHighlightSection() {
  const items = [
    {
      name: 'María S.',
      location: 'Dallas',
      text: 'Estaba ahogada pagando $450 en mínimos. Con el método Oxígeno liberé $180/mes en solo 3 semanas. ¡Por fin pude respirar!',
      avatarSrc: '/testimonials/maria-dallas.png',
    },
    {
      name: 'Jorge R.',
      location: 'Phoenix',
      text: 'El IPD me dijo por dónde empezar. En 4 semanas recuperé $600/mes y taché 2 deudas pequeñas.',
      avatarSrc: '/testimonials/jorge-phoenix.png',
    },
  ];

  return (
    <section className="py-10 bg-white">
      <div className="section-container max-w-5xl">
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {items.map((t) => (
            <div
              key={t.name}
              className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <Image
                  src={t.avatarSrc}
                  alt={`Foto de ${t.name}`}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover object-top"
                />
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{t.name}, {t.location}</div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-neutral-700">“{t.text}”</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


