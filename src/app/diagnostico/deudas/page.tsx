import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import DeudasManager from '@/components/gps/DeudasManager';
import GpsNav from '@/components/gps/GpsNav';
import { requireUser } from '@/lib/gps/auth';
import { loadGpsData } from '@/lib/gps/data';
import { centsToDollars } from '@/lib/gps/format';
import { getLocale } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Tus deudas',
  alternates: { canonical: '/diagnostico/deudas' },
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

export default async function DeudasPage() {
  const { supabase, householdId } = await requireUser('/diagnostico/deudas');
  const [locale, data] = await Promise.all([getLocale(), loadGpsData(supabase, householdId)]);
  if (!data.finances) redirect('/diagnostico/inicio');

  return (
    <div className="section-container py-8 max-w-3xl mx-auto">
      <GpsNav active="/diagnostico/deudas" locale={locale} />
      <DeudasManager
        locale={locale}
        incomeDollars={centsToDollars(data.finances.netIncomeCents)}
        grossIncomeDollars={
          data.finances.grossIncomeCents ? centsToDollars(data.finances.grossIncomeCents) : null
        }
        expensesTotalDollars={centsToDollars(data.finances.essentialExpensesCents)}
        debts={data.debts}
      />
    </div>
  );
}
