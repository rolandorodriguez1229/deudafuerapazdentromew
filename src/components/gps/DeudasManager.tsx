'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteDebt, saveExpenses, saveIncome } from '@/app/diagnostico/actions';
import DebtForm, { type DebtFormValues } from '@/components/gps/DebtForm';
import type { DebtRecord } from '@/lib/gps/data';
import { formatCents } from '@/lib/gps/format';
import { DEBT_KIND_LABEL } from '@/lib/gps/schemas';

function toFormValues(d: DebtRecord): DebtFormValues {
  return {
    id: d.id,
    name: d.name,
    kind: d.kind,
    balance: String(d.balanceCents / 100),
    minPayment: String(d.minPaymentCents / 100),
    apr: String(d.apr),
    creditLimit: d.creditLimitCents ? String(d.creditLimitCents / 100) : '',
    dueDay: d.dueDay ? String(d.dueDay) : '',
    statementDay: d.statementDay ? String(d.statementDay) : '',
    isPromoZero: d.isPromoZero ?? false,
    promoEndDate: d.promoEndDate ?? '',
  };
}

export default function DeudasManager({
  incomeDollars,
  expensesTotalDollars,
  debts,
}: {
  incomeDollars: number;
  expensesTotalDollars: number;
  debts: DebtRecord[];
}) {
  const router = useRouter();
  const [income, setIncome] = useState(String(incomeDollars));
  const [expensesTotal, setExpensesTotal] = useState(String(expensesTotalDollars));
  const [savingFinances, setSavingFinances] = useState(false);
  const [financesMsg, setFinancesMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(debts.length === 0);

  async function submitFinances(e: React.FormEvent) {
    e.preventDefault();
    setSavingFinances(true);
    setFinancesMsg(null);
    const r1 = await saveIncome({ netIncome: income });
    const r2 = r1.ok ? await saveExpenses({ total: expensesTotal }) : r1;
    setSavingFinances(false);
    if (!r1.ok || !r2.ok) {
      setFinancesMsg(r1.error ?? r2.error ?? 'Algo salió mal');
      return;
    }
    setFinancesMsg('Guardado ✓ — tu IPD se recalculó');
    router.refresh();
  }

  async function onDelete(d: DebtRecord) {
    if (!window.confirm(`¿Eliminar "${d.name}"? Esta acción no se puede deshacer.`)) return;
    await deleteDebt(d.id);
    router.refresh();
  }

  const inputClass =
    'w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="space-y-8">
      {/* Ingreso y gastos */}
      <form
        onSubmit={submitFinances}
        className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4"
      >
        <h2 className="heading-md text-primary-900">Tu ingreso y gastos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Ingreso neto mensual (USD)
            </label>
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
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Gastos esenciales del mes (USD)
            </label>
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
          </div>
        </div>
        {financesMsg && <p className="text-sm text-neutral-600">{financesMsg}</p>}
        <button type="submit" disabled={savingFinances} className="btn-primary disabled:opacity-60">
          {savingFinances ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar cambios'}
        </button>
      </form>

      {/* Deudas */}
      <section className="space-y-4">
        <h2 className="heading-md text-primary-900">Tus deudas</h2>

        {debts.length === 0 && !adding && (
          <p className="text-neutral-500">No tienes deudas registradas.</p>
        )}

        <ul className="space-y-3">
          {debts.map((d) => (
            <li key={d.id} className="bg-white border border-neutral-200 rounded-xl p-4">
              {editingId === d.id ? (
                <DebtForm
                  initial={toFormValues(d)}
                  submitLabel="Guardar cambios"
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
                      {DEBT_KIND_LABEL[d.kind as keyof typeof DEBT_KIND_LABEL] ?? d.kind}
                      {' · '}
                      {formatCents(d.balanceCents)}
                      {' · '}mínimo {formatCents(d.minPaymentCents)}
                      {' · '}APR {d.apr}%
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(d.id)}
                      className="p-2 text-neutral-400 hover:text-primary-700"
                      aria-label={`Editar ${d.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(d)}
                      className="p-2 text-neutral-400 hover:text-red-600"
                      aria-label={`Eliminar ${d.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
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
              submitLabel="Agregar deuda"
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
            <Plus className="w-5 h-5" /> Agregar deuda
          </button>
        )}
      </section>
    </div>
  );
}
