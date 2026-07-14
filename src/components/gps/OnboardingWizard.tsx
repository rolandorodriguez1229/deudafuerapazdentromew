'use client';

// Wizard de onboarding del GPS Anti-Deuda: 4 pasos, < 15 minutos.
// Cada paso persiste en el servidor (retomable si el usuario se va).

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, PartyPopper, Plus, Trash2 } from 'lucide-react';
import { saveExpenses, saveIncome, deleteDebt } from '@/app/diagnostico/actions';
import DebtForm, { type DebtFormValues } from '@/components/gps/DebtForm';
import IpdGauge from '@/components/gps/IpdGauge';
import { diagnose } from '@/lib/gps/calc';
import { FIRST_VICTORY, ZONE_INFO } from '@/lib/gps/copy';
import { formatCents, formatIpd } from '@/lib/gps/format';
import { EXPENSE_FIELDS, type ExpenseField } from '@/lib/gps/schemas';
import type { DebtInput } from '@/lib/gps/types';
import { trackEvent } from '@/lib/track';

const EXPENSE_LABEL: Record<ExpenseField, string> = {
  vivienda: 'Vivienda (renta/hipoteca)',
  comida: 'Comida (súper, no restaurantes)',
  transporte: 'Transporte (gasolina, seguro, bus)',
  servicios: 'Servicios (luz, agua, teléfono)',
  salud: 'Salud (medicinas, seguro médico)',
  otros: 'Otros esenciales',
};

export interface WizardInitialData {
  incomeDollars: number | null;
  expensesDollars: Partial<Record<ExpenseField, number>> | null;
  expensesTotalDollars: number | null;
  debts: DebtInput[];
}

interface LocalDebt {
  id: string;
  name: string;
  balanceCents: number;
  minPaymentCents: number;
  apr: number;
  creditLimitCents: number | null;
  isPromoZero: boolean;
  promoEndDate: string | null;
}

function fromFormValues(v: DebtFormValues, index: number): LocalDebt {
  const money = (s: string) => Math.round((parseFloat(s) || 0) * 100);
  return {
    id: `nueva-${index}`,
    name: v.name,
    balanceCents: money(v.balance),
    minPaymentCents: money(v.minPayment),
    apr: parseFloat(v.apr) || 0,
    creditLimitCents: v.creditLimit ? money(v.creditLimit) : null,
    isPromoZero: v.isPromoZero,
    promoEndDate: v.promoEndDate || null,
  };
}

const inputClass =
  'w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500';

export default function OnboardingWizard({ initial }: { initial: WizardInitialData }) {
  const hasSavedData = initial.incomeDollars !== null;
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paso 1
  const [income, setIncome] = useState(
    initial.incomeDollars !== null ? String(initial.incomeDollars) : '',
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
  const [savedDebts, setSavedDebts] = useState<LocalDebt[]>(
    initial.debts.map((d) => ({
      id: d.id,
      name: d.name,
      balanceCents: d.balanceCents,
      minPaymentCents: d.minPaymentCents,
      apr: d.apr,
      creditLimitCents: d.creditLimitCents ?? null,
      isPromoZero: d.isPromoZero ?? false,
      promoEndDate: d.promoEndDate ?? null,
    })),
  );
  const [showDebtForm, setShowDebtForm] = useState(true);

  const breakdownSum = EXPENSE_FIELDS.reduce(
    (sum, k) => sum + (parseFloat(expenses[k]) || 0),
    0,
  );
  const essentialsDollars = simpleMode ? parseFloat(expenseTotal) || 0 : breakdownSum;

  async function submitIncome(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await saveIncome({ netIncome: income });
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
        : {
            vivienda: expenses.vivienda,
            comida: expenses.comida,
            transporte: expenses.transporte,
            servicios: expenses.servicios,
            salud: expenses.salud,
            otros: expenses.otros,
          },
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
        <div className="flex justify-between text-sm text-neutral-500 mb-2">
          <span>Paso {step} de 4</span>
          <span>Tu plan de rescate en 15 minutos</span>
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
          Ya tienes datos guardados — puedes revisarlos y continuar donde te quedaste.
        </p>
      )}

      {step === 1 && (
        <form onSubmit={submitIncome} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-4">
          <h1 className="heading-md text-primary-900">¿Cuánto entra a tu casa cada mes?</h1>
          <p className="text-neutral-600">
            Tu ingreso neto mensual: lo que de verdad llega a tu bolsillo después de impuestos,
            sumando todos tus trabajos. Sin culpa, sin juicio — solo el número.
          </p>
          <div>
            <label htmlFor="income" className="block text-sm font-medium text-neutral-700 mb-1">
              Ingreso neto mensual (USD)
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
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continuar <ArrowRight className="w-5 h-5 ml-2" /></>}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={submitExpenses} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-4">
          <h1 className="heading-md text-primary-900">Tus gastos esenciales del mes</h1>
          <p className="text-neutral-600">
            Solo lo necesario para vivir: vivienda, comida, transporte, servicios y salud. Los
            gustos y suscripciones NO van aquí — no entran en el cálculo del IPD.
          </p>
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={simpleMode}
              onChange={(e) => setSimpleMode(e.target.checked)}
              className="w-4 h-4"
            />
            Prefiero poner un solo total
          </label>

          {simpleMode ? (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Total de gastos esenciales (USD)
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
                    {EXPENSE_LABEL[k]}
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
            Total esencial: <strong>{formatCents(Math.round(essentialsDollars * 100))}</strong> al mes
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="py-3 px-5 rounded-lg font-semibold text-neutral-500">
              Atrás
            </button>
            <button type="submit" disabled={busy} className="btn-primary flex-1 disabled:opacity-60">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continuar <ArrowRight className="w-5 h-5 ml-2" /></>}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-5">
          <h1 className="heading-md text-primary-900">Ahora, tus deudas — una por una</h1>
          <p className="text-neutral-600">
            Ten a la mano tus estados de cuenta. Aquí no hay culpa, hay estrategia: cada deuda
            que anotas es una deuda que deja de ser invisible.
          </p>

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
                    aria-label={`Eliminar ${d.name}`}
                    className="text-neutral-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showDebtForm ? (
            <DebtForm
              submitLabel="Agregar esta deuda"
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
              <Plus className="w-5 h-5" /> Agregar otra deuda
            </button>
          )}

          <div className="flex gap-3 pt-2 border-t border-neutral-100">
            <button type="button" onClick={() => setStep(2)} className="py-3 px-5 rounded-lg font-semibold text-neutral-500">
              Atrás
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="btn-primary flex-1"
            >
              {savedDebts.length === 0 ? 'No tengo deudas' : `Calcular mi IPD (${savedDebts.length} ${savedDebts.length === 1 ? 'deuda' : 'deudas'})`}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <ResultStep
          incomeDollars={parseFloat(income) || 0}
          essentialsDollars={essentialsDollars}
          debts={savedDebts}
        />
      )}
    </div>
  );
}

function ResultStep({
  incomeDollars,
  essentialsDollars,
  debts,
}: {
  incomeDollars: number;
  essentialsDollars: number;
  debts: LocalDebt[];
}) {
  const summary = useMemo(
    () =>
      diagnose(
        {
          netIncomeCents: Math.round(incomeDollars * 100),
          essentialExpensesCents: Math.round(essentialsDollars * 100),
        },
        debts.map((d) => ({ ...d })),
      ),
    [incomeDollars, essentialsDollars, debts],
  );

  useEffect(() => {
    trackEvent('gps_ipd_calculado', { zone: summary.zone, ipd: formatIpd(summary.ipd) });
  }, [summary.zone, summary.ipd]);

  const zone = ZONE_INFO[summary.zone];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 text-center space-y-5">
      <div className="animate-gps-pop">
        <PartyPopper className="w-10 h-10 text-green-600 mx-auto mb-3" />
        <h1 className="heading-md text-primary-900">{FIRST_VICTORY}</h1>
      </div>

      {summary.zone === 'SIN_DEUDAS' ? (
        <div className="animate-gps-rise space-y-3">
          <p className="text-lg text-neutral-700">{zone.short}</p>
        </div>
      ) : (
        <div className="animate-gps-rise space-y-4">
          <IpdGauge ipd={summary.ipd} />
          <div className="bg-neutral-50 rounded-xl p-4">
            <div className="text-sm text-neutral-500">Tu zona</div>
            <div className="text-xl font-bold text-primary-900">
              {zone.strategyName ?? zone.name}
            </div>
            <p className="text-sm text-neutral-600 mt-1">{zone.short}</p>
          </div>
        </div>
      )}

      <Link href="/diagnostico/panel" className="btn-primary w-full">
        Ver mi panel completo <ArrowRight className="w-5 h-5 ml-2" />
      </Link>
    </div>
  );
}
