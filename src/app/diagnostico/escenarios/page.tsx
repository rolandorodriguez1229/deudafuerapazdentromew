import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import EscenariosClient from '@/components/gps/EscenariosClient';
import GpsNav from '@/components/gps/GpsNav';
import { requireUser } from '@/lib/gps/auth';
import { classifyZone } from '@/lib/gps/calc';
import { loadGpsData } from '@/lib/gps/data';
import { getEntitlement } from '@/lib/gps/entitlement';

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

  const data = await loadGpsData(supabase, householdId);
  if (!data.finances) redirect('/diagnostico/inicio');
  if (data.debts.length === 0) redirect('/diagnostico/panel');

  const zone = classifyZone(data.finances, data.debts);
  if (zone === 'DEFICIT') redirect('/diagnostico/panel');

  const now = new Date();

  return (
    <div className="section-container py-8 max-w-3xl mx-auto">
      <GpsNav active="/diagnostico/escenarios" />
      <div className="mb-6">
        <h1 className="heading-md text-primary-900">Escenarios: ¿qué pasa si…?</h1>
        <p className="text-neutral-600 text-sm mt-1">
          Juega con los números antes de mover un solo dólar.
        </p>
      </div>
      <EscenariosClient
        finances={data.finances}
        debts={data.debts}
        zone={zone}
        start={{ year: now.getFullYear(), month: now.getMonth() + 1 }}
      />
    </div>
  );
}
