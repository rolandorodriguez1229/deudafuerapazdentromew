'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteDebt, saveExpenses, saveIncome } from '@/app/diagnostico/actions';
import DebtForm, { type DebtFormValues } from '@/components/gps/DebtForm';
import { getCopy } from '@/lib/gps/copy';
import type { DebtRecord } from '@/lib/gps/data';
import { centsToDollars, formatCents } from '@/lib/gps/format';
import type { Locale } from '@/lib/i18n';

function toFormValues(d: DebtRecord): DebtFormValues {
  return {
    id: d.id,
    name: d.name,
    type: d.type,
    balance: String(centsToDollars(d.balanceCents)),
    minPayment: String(centsToDollars(d.minPaymentCents)),
    apr: String(d.apr),
    creditLimit: d.creditLimitCents ? String(centsToDollars(d.creditLimitCents)) : '',
    dueDay: d.dueDay ? String(d.dueDay) : '',
    statementDay: d.statementDay ? String(d.statementDay) : '',
    isPromoZero: d.isPromoZero ?? false,
    promoEndDate: d.promoEndDate ?? '',
    employmentTied: d.employmentTied ?? false,
  };
}

export default function DeudasManager({
  locale,
  incomeDollars,
  grossIncomeDollars,
  expensesTotalDollars,
  debts,
}: {
  locale: Locale;
  incomeDollars: number;
  grossIncomeDollars: number | null;
  expensesTotalDollars: number;
  debts: DebtRecord[];
}) {
  const c = getCopy(locale);
  const router = useRouter();
  const [income, setIncome] = useState(String(incomeDollars));
  const [grossIncome, setGrossIncome] = useState(
    grossIncomeDollars === null ? '' : String(grossIncomeDollars),
  );
  const [expensesTotal, setExpensesTotal] = useState(String(expensesTotalDollars));
  const [savingFinances, setSavingFinances] = useState(false);
  const [financesMsg, setFinancesMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(debts.length === 0);

  async function submitFinances(e: React.FormEvent) {
    e.preventDefault();
    setSavingFinances(true);
    setFinancesMsg(null);
    const r1 = await saveIncome({ netIncome: income, grossIncome });
    const r2 = r1.ok ? await saveExpenses({ total: expensesTotal }) : r1;
    setSavingFinances(false);
    if (!r1.ok || !r2.ok) {
      setFinancesMsg(r1.error ?? r2.error ?? 'Algo salió mal');
      return;
    }
    setFinancesMsg(
      locale === 'es' ? 'Guardado — tu IPD se recalculó' : 'Saved — your DPI was recalculated',
    );
    router.refresh();
  }

  async function onDelete(d: DebtRecord) {
    if (!window.confirm(`${d.name} — ${c.debts.deleteConfirm}`)) return;
    await deleteDebt(d.id);
    router.refresh();
  }

  const inputClass =
    'w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500';
  const labelClass = 'block text-sm font-medium text-neutral-700 mb-1';

  return (
    <div className="space-y-8">
      {/* Ingreso y gastos */}
      <form
        onSubmit={submitFinances}
        className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4"
      >
        <h2 className="heading-md text-primary-900">{c.onboarding.incomeTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{c.onboarding.netIncome} (USD)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="1"
              required
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className={inputClass}
            />
            <p className="text-xs text-neutral-400 mt-1">{c.onboarding.netIncomeHelp}</p>
          </div>
          <div>
            <label className={labelClass}>{c.onboarding.grossIncome} (USD)</label>
            <input
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
          <div className="sm:col-span-2">
            <label className={labelClass}>{c.onboarding.expensesTitle} (USD)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="1"
              required
              value={expensesTotal}
              onChange={(e) => setExpensesTotal(e.target.value)}
              className={inputClass}
            />
            <p className="text-xs text-neutral-400 mt-1">{c.onboarding.expensesHelp}</p>
          </div>
        </div>
        {financesMsg && <p className="text-sm text-neutral-600">{financesMsg}</p>}
        <button type="submit" disabled={savingFinances} className="btn-primary disabled:opacity-60">
          {savingFinances ? <Loader2 className="w-5 h-5 animate-spin" /> : c.common.save}
        </button>
      </form>

      {/* Deudas */}
      <section className="space-y-4">
        <h2 className="heading-md text-primary-900">{c.debts.title}</h2>

        {debts.length === 0 && !adding && <p className="text-neutral-500">{c.debts.empty}</p>}

        <ul className="space-y-3">
          {debts.map((d) => (
            <li key={d.id} className="bg-white border border-neutral-200 rounded-xl p-4">
              {editingId === d.id ? (
                <DebtForm
                  locale={locale}
                  initial={toFormValues(d)}
                  submitLabel={c.common.save}
                  onSaved={() => {
                    setEditingId(null);
                    router.refresh();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-semibold text-neutral-800">{d.name}</div>
                    <div className="text-sm text-neutral-500">
                      {c.debts.typeOptions[d.type]}
                      {' · '}
                      {formatCents(d.balanceCents)}
                      {' · '}
                      {c.debts.minPayment} {formatCents(d.minPaymentCents)}
                      {' · '}APR {d.apr}%
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(d.id)}
                      className="p-2 text-neutral-400 hover:text-primary-700"
                      aria-label={`${c.common.edit} ${d.name}`}
                    >
                      <Pencil className="w-4 h-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(d)}
                      className="p-2 text-neutral-400 hover:text-red-600"
                      aria-label={`${c.debts.delete} ${d.name}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {adding ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <DebtForm
              locale={locale}
              submitLabel={c.debts.add}
              onSaved={() => {
                setAdding(false);
                router.refresh();
              }}
              onCancel={() => setAdding(false)}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 text-primary-700 font-semibold"
          >
            <Plus className="w-5 h-5" aria-hidden /> {c.debts.add}
          </button>
        )}
      </section>
    </div>
  );
}
