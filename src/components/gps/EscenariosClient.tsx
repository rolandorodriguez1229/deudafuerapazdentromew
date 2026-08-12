'use client';

// Escenarios "qué pasa si" — el motor es TypeScript puro, así que los
// cálculos corren al instante en el navegador (la página ya está gateada
// en el servidor para cuentas Full).

import { useMemo, useState } from 'react';
import { CalendarCheck, TrendingDown, Zap } from 'lucide-react';
import { getCopy } from '@/lib/gps/copy';
import { formatCents, formatCentsWhole, formatMonthYear } from '@/lib/gps/format';
import { runScenario, type ScenarioMod } from '@/lib/gps/scenarios';
import type { DebtInput, FinanceInput, YearMonth, Phase } from '@/lib/gps/types';
import type { Locale } from '@/lib/i18n';
import { trackEvent } from '@/lib/track';

type Tab = 'extra' | 'unico' | 'apr';

export default function EscenariosClient({
  finances,
  debts,
  phase,
  start,
  locale,
}: {
  finances: FinanceInput;
  debts: DebtInput[];
  phase: Phase;
  start: YearMonth;
  locale: Locale;
}) {
  const [tab, setTab] = useState<Tab>('extra');
  const [extraAmount, setExtraAmount] = useState('100');
  const [lumpAmount, setLumpAmount] = useState('500');
  const [aprDebtId, setAprDebtId] = useState(debts[0]?.id ?? '');
  const [newApr, setNewApr] = useState('15');
  const [mod, setMod] = useState<ScenarioMod | null>(null);

  const comparison = useMemo(() => {
    if (!mod) return null;
    try {
      return runScenario(finances, debts, phase, start, mod);
    } catch {
      return null;
    }
  }, [mod, finances, debts, phase, start]);

  function simulate() {
    let next: ScenarioMod | null = null;
    if (tab === 'extra') {
      const amount = Math.round((parseFloat(extraAmount) || 0) * 100);
      if (amount > 0) next = { kind: 'extra_mensual', amountCents: amount };
    } else if (tab === 'unico') {
      const amount = Math.round((parseFloat(lumpAmount) || 0) * 100);
      if (amount > 0) next = { kind: 'pago_unico', amountCents: amount };
    } else {
      const apr = parseFloat(newApr);
      if (aprDebtId && !Number.isNaN(apr) && apr >= 0) {
        next = { kind: 'reduccion_apr', debtId: aprDebtId, newApr: apr };
      }
    }
    setMod(next);
    if (next) trackEvent('gps_escenario', { kind: next.kind });
  }

  const inputClass =
    'w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500';

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'extra', label: '+$ al mes', icon: <Zap className="w-4 h-4" /> },
    { key: 'unico', label: 'Pago único', icon: <TrendingDown className="w-4 h-4" /> },
    { key: 'apr', label: 'Negociar APR', icon: <CalendarCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setMod(null);
            }}
            className={
              tab === t.key
                ? 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 text-white text-sm font-medium'
                : 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 text-neutral-600 text-sm font-medium hover:border-primary-300'
            }
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
        {tab === 'extra' && (
          <>
            <h2 className="font-bold text-primary-900">
              ¿Qué pasa si pago $X extra cada mes?
            </h2>
            <p className="text-sm text-neutral-500">
              Un turno extra, un gasto recortado, un gig de fin de semana — mira cuánto vale.
            </p>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Extra mensual (USD)
              </label>
              <input
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                value={extraAmount}
                onChange={(e) => setExtraAmount(e.target.value)}
                className={inputClass}
              />
            </div>
          </>
        )}
        {tab === 'unico' && (
          <>
            <h2 className="font-bold text-primary-900">
              ¿Qué pasa si hago un pago único de $X?
            </h2>
            <p className="text-sm text-neutral-500">
              Un bono, un tax refund, la venta de algo que ya no usas.
            </p>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Pago único (USD)
              </label>
              <input
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                value={lumpAmount}
                onChange={(e) => setLumpAmount(e.target.value)}
                className={inputClass}
              />
            </div>
          </>
        )}
        {tab === 'apr' && (
          <>
            <h2 className="font-bold text-primary-900">
              ¿Qué pasa si negocio una tasa más baja?
            </h2>
            <p className="text-sm text-neutral-500">
              Una llamada puede bajar tu APR. Simula el resultado antes de marcar.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Deuda</label>
                <select
                  value={aprDebtId}
                  onChange={(e) => setAprDebtId(e.target.value)}
                  className={inputClass}
                >
                  {debts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} (APR actual {d.apr}%)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nuevo APR (%)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="300"
                  step="0.01"
                  value={newApr}
                  onChange={(e) => setNewApr(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </>
        )}

        <button onClick={simulate} className="btn-primary w-full sm:w-auto">
          Simular
        </button>
      </div>

      {comparison && (
        <div className="bg-white rounded-2xl border-2 border-green-500 p-6 animate-gps-pop">
          <h3 className="font-bold text-primary-900 mb-4">Resultado del escenario</h3>
          {comparison.result.feasible && comparison.result.debtFreeDate ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-neutral-500">Nueva fecha libre de deudas</div>
                <div className="text-lg font-bold text-green-700">
                  {formatMonthYear(comparison.result.debtFreeDate, getCopy(locale))}
                </div>
                {comparison.base.debtFreeDate && (
                  <div className="text-xs text-neutral-400">
                    antes: {formatMonthYear(comparison.base.debtFreeDate, getCopy(locale))}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-neutral-500">Meses que te ahorras</div>
                <div className="text-lg font-bold text-green-700">
                  {comparison.monthsSaved !== null ? comparison.monthsSaved : '—'}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-500">Intereses que te ahorras</div>
                <div className="text-lg font-bold text-green-700">
                  {comparison.interestSavedCents !== null
                    ? formatCentsWhole(comparison.interestSavedCents)
                    : '—'}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-600">
              Con este escenario el plan aún no cierra — la deuda no baja lo suficiente. Prueba
              con un monto mayor o combina estrategias.
            </p>
          )}
          {tab === 'extra' && comparison.result.feasible && (
            <p className="text-xs text-neutral-500 mt-3">
              Cada {formatCents(Math.round((parseFloat(extraAmount) || 0) * 100))} extra al mes
              trabaja directo contra tu deuda objetivo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
