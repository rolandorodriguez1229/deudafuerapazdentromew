import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Check, Lock } from 'lucide-react';
import GpsNav from '@/components/gps/GpsNav';
import PlanSelector from '@/components/gps/PlanSelector';
import { requireUser } from '@/lib/gps/auth';
import { getEntitlement } from '@/lib/gps/entitlement';
import { getLocale } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Plan Full',
  alternates: { canonical: '/diagnostico/plan' },
  robots: { index: false },
};

const FREE_FEATURES = [
  'Tu IPD con velocímetro y tu fase: Déficit, Oxígeno, Tracción o Eficiencia',
  'El Panel de Oxígeno completo: las seis palancas, con qué decir y a quién llamar',
  'Tu Número de Paz y tu Meta de Oxígeno',
  'Diagnóstico de cada deuda con la columna ¿Renegociar?',
];

const FULL_FEATURES = [
  'Orden de Ataque completo: tu deuda objetivo y las que siguen',
  'Fecha libre de deudas e intereses que te ahorras',
  'Escenarios: ¿y si pago $100 más? ¿y si negocio el APR?',
  'La Prueba del Mes 12: si te cae un golpe, ¿sobrevives? (muy pronto)',
  'Alertas 7-3-1 por email antes de cada pago (muy pronto)',
  'Seguimiento mensual: tacha deudas y celebra (muy pronto)',
  'Modo pareja: 2 personas, 1 tablero (muy pronto)',
];

export const dynamic = 'force-dynamic';

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const { supabase } = await requireUser('/diagnostico/plan');
  const entitlement = await getEntitlement(supabase);
  if (entitlement === 'full') redirect('/diagnostico/cuenta');
  const [locale, params] = await Promise.all([getLocale(), searchParams]);

  return (
    <div className="section-container py-8 max-w-3xl mx-auto">
      <GpsNav active="/diagnostico/panel" locale={locale} />

      {params.canceled && (
        <p className="text-sm text-neutral-600 bg-neutral-100 rounded-lg p-3 mb-6 text-center">
          No se hizo ningún cargo. Tu plan gratuito sigue igual que siempre.
        </p>
      )}

      <div className="text-center mb-8">
        <h1 className="heading-lg text-primary-900 mb-2">
          Deja de adivinar. Ataca con precisión.
        </h1>
        <p className="text-neutral-600 max-w-xl mx-auto">
          El plan Full convierte tu diagnóstico en un plan de guerra: qué deuda atacar primero,
          cuándo quedas libre y cuántos intereses te ahorras.
        </p>
      </div>

      <PlanSelector />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <div className="bg-neutral-100 rounded-xl p-5">
          <h2 className="font-bold text-neutral-700 mb-3">Gratis (lo que ya tienes)</h2>
          <ul className="space-y-2">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-neutral-600">
                <Check className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl border-2 border-green-500 p-5">
          <h2 className="font-bold text-green-800 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Full (lo que desbloqueas)
          </h2>
          <ul className="space-y-2">
            {FULL_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-neutral-700">
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
