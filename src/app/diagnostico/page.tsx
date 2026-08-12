import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, BookOpen, Compass, ListChecks, Timer } from 'lucide-react';
import IpdGauge from '@/components/gps/IpdGauge';
import { getCopy } from '@/lib/gps/copy';
import { getLocale } from '@/lib/i18n/server';
import { createClient, hasSupabaseEnv } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'GPS Anti-Deuda — Calcula tu IPD gratis',
  description:
    'La herramienta oficial del libro Deuda Fuera, Paz Dentro. Calcula tu Índice de Presión de Deuda (IPD), descubre tu fase y tu estrategia: tu plan de rescate en 15 minutos.',
  alternates: { canonical: '/diagnostico' },
};

const STEP_ICONS = [Timer, Compass, ListChecks] as const;

const PHASE_STYLE = {
  DEFICIT: { card: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-600' },
  OXIGENO: { card: 'bg-red-50 text-red-800 border-red-200', dot: 'bg-red-400' },
  BOLA_DE_NIEVE: { card: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  AVALANCHA: { card: 'bg-green-100 text-green-800 border-green-200', dot: 'bg-green-500' },
} as const;

const PHASE_ORDER = ['DEFICIT', 'OXIGENO', 'BOLA_DE_NIEVE', 'AVALANCHA'] as const;

export const dynamic = 'force-dynamic';

export default async function DiagnosticoPage() {
  const locale = await getLocale();
  const c = getCopy(locale);

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
                <BookOpen className="w-4 h-4" aria-hidden /> {c.landing.badge}
              </p>
              <h1 className="heading-xl text-balance mb-4">GPS Anti-Deuda</h1>
              <p className="text-lg text-primary-100 mb-6">
                {c.landing.lead} <strong>{c.landing.leadStrong}</strong>
                {c.landing.leadEnd}
              </p>
              <Link href="/diagnostico/entrar" className="btn-primary text-lg">
                {c.landing.cta} <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
              </Link>
              <p className="text-sm text-primary-200 mt-3">{c.landing.ctaNote}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <IpdGauge ipd={0.62} locale={locale} />
              <p className="text-center text-sm text-neutral-500 mt-2">
                {c.landing.gaugeExample(c.phase.BOLA_DE_NIEVE.name)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="section-container py-14">
        <h2 className="heading-lg text-primary-900 text-center mb-10">{c.landing.howTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {c.landing.steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div
                key={step.title}
                className="bg-white rounded-2xl border border-neutral-200 p-6 text-center"
              >
                <Icon className="w-8 h-8 text-primary-600 mx-auto mb-3" aria-hidden />
                <h3 className="font-bold text-neutral-800 mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-500">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Las 4 fases */}
      <section className="bg-white border-y border-neutral-200">
        <div className="section-container py-14">
          <h2 className="heading-lg text-primary-900 text-center mb-3">{c.landing.phasesTitle}</h2>
          <p className="text-neutral-600 text-center max-w-xl mx-auto mb-10">
            {c.landing.phasesIntro}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {PHASE_ORDER.map((key) => {
              const style = PHASE_STYLE[key];
              const card = c.landing.phaseCards[key];
              return (
                <div key={key} className={`rounded-2xl border p-5 ${style.card}`}>
                  <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} aria-hidden />
                    {c.phase[key].name} · {card.range}
                  </div>
                  <div className="font-bold mb-1">{card.play}</div>
                  <p className="text-sm opacity-80">{c.phase[key].headline}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="section-container py-14 text-center">
        <h2 className="heading-lg text-primary-900 mb-4">{c.landing.finalTitle}</h2>
        <p className="text-neutral-600 max-w-lg mx-auto mb-6">{c.landing.finalBody}</p>
        <Link href="/diagnostico/entrar" className="btn-primary text-lg">
          {c.landing.finalCta} <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
        </Link>
        <p className="text-sm text-neutral-400 mt-4">
          {c.landing.bookNote}{' '}
          <Link href="/comprar" className="text-primary-700 underline">
            {c.landing.bookLink}
          </Link>
        </p>
      </section>
    </div>
  );
}
