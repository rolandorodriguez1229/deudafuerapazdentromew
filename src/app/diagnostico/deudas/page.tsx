import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import DeudasManager from '@/components/gps/DeudasManager';
import GpsNav from '@/components/gps/GpsNav';
import { requireUser } from '@/lib/gps/auth';
import { loadGpsData } from '@/lib/gps/data';

export const metadata: Metadata = {
  title: 'Tus deudas',
  alternates: { canonical: '/diagnostico/deudas' },
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

export default async function DeudasPage() {
  const { supabase, householdId } = await requireUser('/diagnostico/deudas');
  const data = await loadGpsData(supabase, householdId);
  if (!data.finances) redirect('/diagnostico/inicio');

  return (
    <div className="section-container py-8 max-w-3xl mx-auto">
      <GpsNav active="/diagnostico/deudas" />
      <DeudasManager
        incomeDollars={data.finances.netIncomeCents / 100}
        expensesTotalDollars={data.finances.essentialExpensesCents / 100}
        debts={data.debts}
      />
    </div>
  );
}
