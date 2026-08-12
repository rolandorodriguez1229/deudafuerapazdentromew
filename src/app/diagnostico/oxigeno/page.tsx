import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import GpsNav from '@/components/gps/GpsNav';
import OxygenPanel from '@/components/gps/OxygenPanel';
import { requireUser } from '@/lib/gps/auth';
import { totalMinPaymentsCents } from '@/lib/gps/calc';
import { getCopy } from '@/lib/gps/copy';
import { loadGpsData } from '@/lib/gps/data';
import { leverStateFromRecords } from '@/lib/gps/levers';
import { getLocale } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Panel de Oxígeno',
  alternates: { canonical: '/diagnostico/oxigeno' },
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

export default async function OxigenoPage() {
  const { supabase, householdId } = await requireUser('/diagnostico/oxigeno');
  const [locale, data] = await Promise.all([
    getLocale(),
    loadGpsData(supabase, householdId),
  ]);
  if (!data.finances) redirect('/diagnostico/inicio');

  const c = getCopy(locale);

  return (
    <div className="section-container py-8 max-w-3xl mx-auto">
      <GpsNav active="/diagnostico/oxigeno" locale={locale} />
      <h1 className="heading-md text-primary-900 mb-4">{c.oxygenPanel.title}</h1>
      <OxygenPanel
        locale={locale}
        initial={leverStateFromRecords(data.levers)}
        netIncomeCents={data.finances.netIncomeCents}
        loadCents={data.finances.essentialExpensesCents + totalMinPaymentsCents(data.debts)}
      />
    </div>
  );
}
