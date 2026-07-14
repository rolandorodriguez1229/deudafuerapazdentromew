import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, BookOpen, Compass, ListChecks, Timer } from 'lucide-react';
import IpdGauge from '@/components/gps/IpdGauge';
import { createClient, hasSupabaseEnv } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'GPS Anti-Deuda — Calcula tu IPD gratis',
  description:
    'La herramienta oficial del libro Deuda Fuera, Paz Dentro. Calcula tu Índice de Presión de Deuda (IPD), descubre tu zona y tu estrategia: tu plan de rescate en 15 minutos.',
  alternates: { canonical: '/diagnostico' },
};

const ZONAS = [
  {
    color: 'bg-red-100 text-red-800 border-red-200',
    dot: 'bg-red-500',
    name: 'Zona roja · IPD ≥ 0.70',
    strategy: 'Oxígeno Rápido (Liberación de Cash)',
    desc: 'Tu mes está apretado: primero libera flujo, después ataca.',
  },
  {
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    name: 'Zona amarilla · IPD 0.45–0.69',
    strategy: 'Bola de Nieve',
    desc: 'Necesitas momentum: tacha primero la deuda más pequeña.',
  },
  {
    color: 'bg-green-100 text-green-800 border-green-200',
    dot: 'bg-green-500',
    name: 'Zona verde · IPD < 0.45',
    strategy: 'Avalancha',
    desc: 'Ya respiras: ataca el APR más alto y ahorra el máximo en intereses.',
  },
];

const PASOS = [
  {
    icon: Timer,
    title: '15 minutos, 3 números',
    desc: 'Tu ingreso, tus gastos esenciales y tus deudas. Nada más.',
  },
  {
    icon: Compass,
    title: 'Tu IPD y tu zona',
    desc: 'El velocímetro te dice cuánta presión carga tu mes — sin culpa, con estrategia.',
  },
  {
    icon: ListChecks,
    title: 'Tu estrategia exacta',
    desc: 'Oxígeno Rápido, Bola de Nieve o Avalancha: la que tu situación necesita hoy.',
  },
];

export const dynamic = 'force-dynamic';

export default async function DiagnosticoPage() {
  // Si ya tiene sesión, directo a su tablero.
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: fin } = await supabase.from('finances').select('household_id').maybeSingle();
      redirect(fin ? '/diagnostico/panel' : '/diagnostico/inicio');
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-hero-pattern text-white">
        <div className="section-container py-14 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center max-w-4xl mx-auto">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-medium bg-white/10 rounded-full px-3 py-1 mb-4">
                <BookOpen className="w-4 h-4" /> La herramienta oficial del libro
              </p>
              <h1 className="heading-xl text-balance mb-4">GPS Anti-Deuda</h1>
              <p className="text-lg text-primary-100 mb-6">
                Deja de caminar a ciegas. Calcula tu Índice de Presión de Deuda (IPD) y recibe tu
                estrategia exacta — <strong>tu plan de rescate en 15 minutos</strong>, gratis.
              </p>
              <Link href="/diagnostico/entrar" className="btn-primary text-lg">
                Calcula tu IPD gratis <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <p className="text-sm text-primary-200 mt-3">
                Solo necesitas tu correo. Sin tarjeta, sin contraseñas.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <IpdGauge ipd={0.62} />
              <p className="text-center text-sm text-neutral-500 mt-2">
                Ejemplo: IPD 0.62 → estrategia <strong>Bola de Nieve</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="section-container py-14">
        <h2 className="heading-lg text-primary-900 text-center mb-10">
          Aquí no hay culpa, hay estrategia
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {PASOS.map((p) => (
            <div key={p.title} className="bg-white rounded-2xl border border-neutral-200 p-6 text-center">
              <p.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <h3 className="font-bold text-neutral-800 mb-2">{p.title}</h3>
              <p className="text-sm text-neutral-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Las 3 zonas */}
      <section className="bg-white border-y border-neutral-200">
        <div className="section-container py-14">
          <h2 className="heading-lg text-primary-900 text-center mb-3">
            Tu zona decide tu estrategia
          </h2>
          <p className="text-neutral-600 text-center max-w-xl mx-auto mb-10">
            El mismo selector del libro <em>Deuda Fuera, Paz Dentro</em>: tu IPD te ubica en una
            zona, y cada zona tiene su jugada.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {ZONAS.map((z) => (
              <div key={z.name} className={`rounded-2xl border p-5 ${z.color}`}>
                <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${z.dot}`} /> {z.name}
                </div>
                <div className="font-bold mb-1">{z.strategy}</div>
                <p className="text-sm opacity-80">{z.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="section-container py-14 text-center">
        <h2 className="heading-lg text-primary-900 mb-4">
          Tu primera victoria está a 15 minutos
        </h2>
        <p className="text-neutral-600 max-w-lg mx-auto mb-6">
          Miles de números en tu cabeza se convierten en un solo plan claro. Empieza gratis hoy.
        </p>
        <Link href="/diagnostico/entrar" className="btn-primary text-lg">
          Empezar mi diagnóstico <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
        <p className="text-sm text-neutral-400 mt-4">
          ¿Aún no tienes el libro?{' '}
          <Link href="/comprar" className="text-primary-700 underline">
            Consíguelo aquí
          </Link>
        </p>
      </section>
    </div>
  );
}
