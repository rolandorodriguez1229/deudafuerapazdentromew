import type { Metadata } from 'next';
import OnboardingWizard, { type WizardInitialData } from '@/components/gps/OnboardingWizard';
import { requireUser } from '@/lib/gps/auth';
import { loadGpsData } from '@/lib/gps/data';
import { EXPENSE_FIELDS, type ExpenseField } from '@/lib/gps/schemas';
import { getLocale } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Tu diagnóstico',
  alternates: { canonical: '/diagnostico/inicio' },
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

export default async function InicioPage() {
  const { supabase, householdId } = await requireUser('/diagnostico/inicio');
  const [locale, data] = await Promise.all([getLocale(), loadGpsData(supabase, householdId)]);

  const breakdown: Partial<Record<ExpenseField, number>> | null = data.expensesBreakdownCents
    ? Object.fromEntries(
        Object.entries(data.expensesBreakdownCents)
          .filter(([k]) => (EXPENSE_FIELDS as readonly string[]).includes(k))
          .map(([k, cents]) => [k, Number(cents) / 100]),
      )
    : null;

  const initial: WizardInitialData = {
    incomeDollars: data.finances ? data.finances.netIncomeCents / 100 : null,
    grossIncomeDollars: data.finances?.grossIncomeCents
      ? data.finances.grossIncomeCents / 100
      : null,
    expensesDollars: breakdown,
    expensesTotalDollars:
      data.finances && data.finances.essentialExpensesCents > 0
        ? data.finances.essentialExpensesCents / 100
        : null,
    debts: data.debts,
  };

  return (
    <div className="section-container py-8 sm:py-12">
      <OnboardingWizard locale={locale} initial={initial} />
    </div>
  );
}
