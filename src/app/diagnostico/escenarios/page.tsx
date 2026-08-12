import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import EscenariosClient from '@/components/gps/EscenariosClient';
import GpsNav from '@/components/gps/GpsNav';
import { requireUser } from '@/lib/gps/auth';
import { classifyPhase } from '@/lib/gps/calc';
import { loadGpsData } from '@/lib/gps/data';
import { getEntitlement } from '@/lib/gps/entitlement';
import { getLocale } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Escenarios',
  alternates: { canonical: '/diagnostico/escenarios' },
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

export default async function EscenariosPage() {
  const { supabase, householdId } = await requireUser('/diagnostico/escenarios');

  // Gate del lado del servidor: Free nunca recibe estos datos.
  const entitlement = await getEntitlement(supabase);
  if (entitlement !== 'full') redirect('/diagnostico/plan');

  const [locale, data] = await Promise.all([getLocale(), loadGpsData(supabase, householdId)]);
  if (!data.finances) redirect('/diagnostico/inicio');
  if (data.debts.length === 0) redirect('/diagnostico/panel');

  const phase = classifyPhase(data.finances, data.debts);
  if (phase === 'DEFICIT' || phase === 'SIN_INGRESO') redirect('/diagnostico/panel');

  const now = new Date();

  return (
    <div className="section-container py-8 max-w-3xl mx-auto">
      <GpsNav active="/diagnostico/escenarios" locale={locale} />
      <div className="mb-6">
        <h1 className="heading-md text-primary-900">Escenarios: ¿qué pasa si…?</h1>
        <p className="text-neutral-600 text-sm mt-1">
          Juega con los números antes de mover un solo dólar.
        </p>
      </div>
      <EscenariosClient
        locale={locale}
        finances={data.finances}
        debts={data.debts}
        phase={phase}
        start={{ year: now.getFullYear(), month: now.getMonth() + 1 }}
      />
    </div>
  );
}
