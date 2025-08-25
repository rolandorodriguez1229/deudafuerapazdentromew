import Link from 'next/link';
import { ArrowRight, Award, Users, TrendingUp } from 'lucide-react';

export default function AuthorSection() {
  const achievements = [
    {
      icon: <TrendingUp className="h-6 w-6 text-accent-500" />,
      stat: "$90,000",
      label: "En deudas eliminadas"
    },
    {
      icon: <Users className="h-6 w-6 text-accent-500" />,
      stat: "5,000+",
      label: "Familias ayudadas"
    },
    {
      icon: <Award className="h-6 w-6 text-accent-500" />,
      stat: "15+",
      label: "Años de experiencia"
    }
  ];

  return (
    <section className="py-20 bg-neutral-50">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Author Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl p-8">
              {/* Placeholder for author photo */}
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="w-48 h-48 bg-primary-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-primary-600 text-6xl font-bold">RR</span>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                    Rolando Rodríguez
                  </h3>
                  <p className="text-primary-600 font-medium">
                    Autor de &quot;Deuda Fuera, Paz Dentro&quot;
                  </p>
                </div>
              </div>
              
              {/* Quote */}
              <div className="bg-white rounded-lg p-6 shadow-lg mt-6 relative">
                <div className="text-6xl text-accent-200 absolute -top-4 -left-2">&quot;</div>
                <p className="text-neutral-700 italic relative z-10">
                  Si yo pude salir de $90,000 en deudas con un salario normal, 
                  tú también puedes hacerlo.
                </p>
              </div>
            </div>
          </div>

          {/* Author Story */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-6">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Mi Historia</span>
              </div>
              
              <h2 className="heading-lg text-neutral-900 mb-6">
                Yo También Estuve{' '}
                <span className="text-primary-600">Donde Tú Estás</span>
              </h2>
            </div>

            <div className="space-y-6 text-lg text-neutral-700 leading-relaxed">
              <p>
                En 2010, me encontré con <strong>casi $90,000 en deudas</strong>. 
                Tarjetas de crédito, préstamos estudiantiles, un auto que no podía pagar... 
                La ansiedad me mantenía despierto por las noches.
              </p>
              
              <p>
                Probé todos los métodos populares: la bola de nieve, la avalancha, 
                apps de presupuesto. Algunos ayudaban, pero ninguno consideraba mi 
                <em>situación específica</em>. Como inmigrante hispano, tenía gastos 
                únicos que los métodos &quot;tradicionales&quot; no contemplaban.
              </p>
              
              <p>
                Fue entonces cuando desarrollé el <strong>Sistema IPD®</strong>. 
                No solo me ayudó a eliminar todas mis deudas, sino que me dio algo 
                más valioso: <span className="text-accent-600 font-semibold">paz mental</span>.
              </p>
              
              <p>
                Desde entonces, he ayudado a más de 5,000 familias hispanas a 
                recuperar su libertad financiera usando este mismo sistema.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center">
                  <div className="bg-accent-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    {achievement.icon}
                  </div>
                  <div className="text-2xl font-bold text-neutral-900 mb-1">
                    {achievement.stat}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {achievement.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Link
                href="/sobre-mi"
                className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200"
              >
                Conoce más sobre mi historia
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 