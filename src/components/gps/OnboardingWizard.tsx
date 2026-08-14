'use client';

// Wizard de onboarding del GPS Anti-Deuda: 4 pasos, menos de 15 minutos.
// Cada paso persiste en el servidor (retomable si el usuario se va).

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, PartyPopper, Plus, Trash2 } from 'lucide-react';
import { saveExpenses, saveIncome, deleteDebt } from '@/app/diagnostico/actions';
import DebtForm, { type DebtFormValues } from '@/components/gps/DebtForm';
import IpdGauge from '@/components/gps/IpdGauge';
import { diagnose } from '@/lib/gps/calc';
import { getCopy } from '@/lib/gps/copy';
import { formatCents, formatIpd } from '@/lib/gps/format';
import { EXPENSE_FIELDS, type ExpenseField } from '@/lib/gps/schemas';
import type { DebtInput } from '@/lib/gps/types';
import type { Locale } from '@/lib/i18n';
import { trackEvent } from '@/lib/track';

export interface WizardInitialData {
  incomeDollars: number | null;
  grossIncomeDollars: number | null;
  expensesDollars: Partial<Record<ExpenseField, number>> | null;
  expensesTotalDollars: number | null;
  debts: DebtInput[];
}

type LocalDebt = DebtInput;

function fromFormValues(v: DebtFormValues, index: number): LocalDebt {
  const money = (s: string) => Math.round((parseFloat(s) || 0) * 100);
  return {
    id: `nueva-${index}`,
    name: v.name,
    type: v.type,
    balanceCents: money(v.balance),
    minPaymentCents: money(v.minPayment),
    apr: parseFloat(v.apr) || 0,
    creditLimitCents: v.creditLimit ? money(v.creditLimit) : null,
    isPromoZero: v.isPromoZero,
    promoEndDate: v.promoEndDate || null,
    employmentTied: v.employmentTied,
  };
}

const inputClass =
  'w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500';

export default function OnboardingWizard({
  locale,
  initial,
}: {
  locale: Locale;
  initial: WizardInitialData;
}) {
  const c = getCopy(locale);
  const hasSavedData = initial.incomeDollars !== null;
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paso 1
  const [income, setIncome] = useState(
    initial.incomeDollars !== null ? String(initial.incomeDollars) : '',
  );
  const [grossIncome, setGrossIncome] = useState(
    initial.grossIncomeDollars !== null ? String(initial.grossIncomeDollars) : '',
  );
  // Paso 2
  const [simpleMode, setSimpleMode] = useState(
    initial.expensesDollars === null && initial.expensesTotalDollars !== null,
  );
  const [expenseTotal, setExpenseTotal] = useState(
    initial.expensesTotalDollars !== null ? String(initial.expensesTotalDollars) : '',
  );
  const [expenses, setExpenses] = useState<Record<ExpenseField, string>>(() => {
    const base = {} as Record<ExpenseField, string>;
    for (const k of EXPENSE_FIELDS) {
      const v = initial.expensesDollars?.[k];
      base[k] = v !== undefined ? String(v) : '';
    }
    return base;
  });
  // Paso 3
  const [savedDebts, setSavedDebts] = useState<LocalDebt[]>(initial.debts);
  const [showDebtForm, setShowDebtForm] = useState(true);

  const breakdownSum = EXPENSE_FIELDS.reduce((sum, k) => sum + (parseFloat(expenses[k]) || 0), 0);
  const essentialsDollars = simpleMode ? parseFloat(expenseTotal) || 0 : breakdownSum;

  async function submitIncome(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await saveIncome({ netIncome: income, grossIncome });
    setBusy(false);
    if (!result.ok) return setError(result.error ?? 'Algo salió mal');
    setStep(2);
  }

  async function submitExpenses(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await saveExpenses(
      simpleMode
        ? { total: expenseTotal }
        : Object.fromEntries(EXPENSE_FIELDS.map((k) => [k, expenses[k]])),
    );
    setBusy(false);
    if (!result.ok) return setError(result.error ?? 'Algo salió mal');
    setStep(3);
  }

  async function removeDebt(id: string) {
    setSavedDebts((list) => list.filter((d) => d.id !== id));
    if (!id.startsWith('nueva-')) await deleteDebt(id);
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="flex justify-between gap-2 text-sm text-neutral-500 mb-2">
          <span>{c.onboarding.steps.progress(step, 4)}</span>
          <span className="text-right">{c.onboarding.timePromise}</span>
        </div>
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-600 rounded-full transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {hasSavedData && step === 1 && (
        <p className="text-sm text-primary-700 bg-primary-50 border border-primary-100 rounded-lg p-3 mb-6">
          {c.onboarding.steps.resume}
        </p>
      )}

      {step === 1 && (
        <form
          onSubmit={submitIncome}
          className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-4"
        >
          <h1 className="heading-md text-primary-900">{c.onboarding.steps.incomeQuestion}</h1>
          <p className="text-neutral-600">{c.onboarding.steps.incomeIntro}</p>
          <div>
            <label htmlFor="income" className="block text-sm font-medium text-neutral-700 mb-1">
              {c.onboarding.netIncome} (USD)
            </label>
            <input
              id="income"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="1"
              required
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="3,200"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="gross" className="block text-sm font-medium text-neutral-700 mb-1">
              {c.onboarding.grossIncome} (USD)
            </label>
            <input
              id="gross"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={grossIncome}
              onChange={(e) => setGrossIncome(e.target.value)}
              className={inputClass}
            />
            <p className="text-xs text-neutral-400 mt-1">{c.onboarding.grossIncomeHelp}</p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {c.onboarding.steps.continue} <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
              </>
            )}
          </button>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={submitExpenses}
          className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-4"
        >
          <h1 className="heading-md text-primary-900">{c.onboarding.steps.expensesQuestion}</h1>
          <p className="text-neutral-600">{c.onboarding.steps.expensesIntro}</p>
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={simpleMode}
              onChange={(e) => setSimpleMode(e.target.checked)}
              className="w-4 h-4"
            />
            {c.onboarding.steps.simpleMode}
          </label>

          {simpleMode ? (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {c.onboarding.expensesTotal} (USD)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="1"
                required
                value={expenseTotal}
                onChange={(e) => setExpenseTotal(e.target.value)}
                placeholder="1,800"
                className={inputClass}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EXPENSE_FIELDS.map((k) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    {c.onboarding.expenseFields[k]}
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={expenses[k]}
                    onChange={(e) => setExpenses((prev) => ({ ...prev, [k]: e.target.value }))}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          )}

          <p className="text-sm text-neutral-500">
            {c.onboarding.steps.totalEssential}:{' '}
            <strong>{formatCents(Math.round(essentialsDollars * 100))}</strong>{' '}
            {c.common.perMonth}
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-3 px-5 rounded-lg font-semibold text-neutral-500"
            >
              {c.onboarding.steps.back}
            </button>
            <button type="submit" disabled={busy} className="btn-primary flex-1 disabled:opacity-60">
              {busy ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {c.onboarding.steps.continue} <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-5">
          <h1 className="heading-md text-primary-900">{c.onboarding.steps.debtsQuestion}</h1>
          <p className="text-neutral-600">{c.onboarding.steps.debtsIntro}</p>

          {savedDebts.length > 0 && (
            <ul className="space-y-2">
              {savedDebts.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3"
                >
                  <div>
                    <span className="font-medium text-neutral-800">{d.name}</span>
                    <span className="text-sm text-neutral-500 ml-2">
                      {formatCents(d.balanceCents)} · APR {d.apr}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDebt(d.id)}
                    aria-label={`${c.debts.delete} ${d.name}`}
                    className="text-neutral-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showDebtForm ? (
            <DebtForm
              locale={locale}
              submitLabel={c.onboarding.steps.addThisDebt}
              onSaved={(v) => {
                setSavedDebts((list) => [...list, fromFormValues(v, list.length)]);
              }}
              onCancel={savedDebts.length > 0 ? () => setShowDebtForm(false) : undefined}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowDebtForm(true)}
              className="flex items-center gap-2 text-primary-700 font-semibold"
            >
              <Plus className="w-5 h-5" aria-hidden /> {c.onboarding.steps.addAnother}
            </button>
          )}

          <div className="flex gap-3 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="py-3 px-5 rounded-lg font-semibold text-neutral-500"
            >
              {c.onboarding.steps.back}
            </button>
            <button type="button" onClick={() => setStep(4)} className="btn-primary flex-1">
              {savedDebts.length === 0
                ? c.onboarding.steps.noDebts
                : c.onboarding.steps.calcIpd(savedDebts.length)}
              <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <ResultStep
          locale={locale}
          incomeDollars={parseFloat(income) || 0}
          essentialsDollars={essentialsDollars}
          debts={savedDebts}
        />
      )}
    </div>
  );
}

function ResultStep({
  locale,
  incomeDollars,
  essentialsDollars,
  debts,
}: {
  locale: Locale;
  incomeDollars: number;
  essentialsDollars: number;
  debts: LocalDebt[];
}) {
  const c = getCopy(locale);
  const summary = useMemo(
    () =>
      diagnose(
        {
          netIncomeCents: Math.round(incomeDollars * 100),
          essentialExpensesCents: Math.round(essentialsDollars * 100),
        },
        debts,
      ),
    [incomeDollars, essentialsDollars, debts],
  );

  useEffect(() => {
    trackEvent('gps_ipd_calculado', { fase: summary.phase, ipd: formatIpd(summary.ipd) });
  }, [summary.phase, summary.ipd]);

  const phase = c.phase[summary.phase];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 sm:p-8 text-center space-y-5">
      <div className="animate-gps-pop">
        <PartyPopper className="w-10 h-10 text-green-600 mx-auto mb-3" aria-hidden />
        <h1 className="heading-md text-primary-900">{c.common.firstVictory}</h1>
      </div>

      {summary.phase === 'SIN_DEUDAS' ? (
        <div className="animate-gps-rise space-y-3">
          <p className="text-lg text-neutral-700">{phase.headline}</p>
          <p className="text-neutral-600">{phase.message}</p>
        </div>
      ) : (
        <div className="animate-gps-rise space-y-4">
          <IpdGauge ipd={summary.ipd} locale={locale} />
          <div className="bg-neutral-50 rounded-xl p-4">
            <div className="text-sm text-neutral-500">{c.panel.yourPhase}</div>
            <div className="text-xl font-bold text-primary-900">{phase.name}</div>
            <p className="text-sm text-neutral-700 mt-1 font-medium">{phase.headline}</p>
            <p className="text-sm text-neutral-600 mt-1">{phase.message}</p>
          </div>
        </div>
      )}

      <Link href="/diagnostico/panel" className="btn-primary w-full">
        {c.onboarding.steps.seePanel} <ArrowRight className="w-5 h-5 ml-2" aria-hidden />
      </Link>
    </div>
  );
}
