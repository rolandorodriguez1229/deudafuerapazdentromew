'use client';

// El Panel de Oxígeno. Va en Free porque es la parte más útil y la que genera
// confianza: "pagar deuda es la palanca número seis, no la número uno".
//
// Se apoya en <details>/<summary> nativos para abrir y cerrar cada palanca:
// cero JavaScript para lo que el navegador ya sabe hacer. El 28% de nuestro
// público entra solo por teléfono y con conexión mala.

import { useState } from 'react';
import { Check, Loader2, Phone, TriangleAlert, Wind } from 'lucide-react';
import { saveLeverResult } from '@/app/diagnostico/actions';
import { airGainedCents, projectIpd } from '@/lib/gps/calc';
import { getCopy } from '@/lib/gps/copy';
import { formatCents, formatCentsWhole, formatIpd } from '@/lib/gps/format';
import {
  LEVER_EFFECT,
  LEVER_ORDER,
  type LeverState,
  type LeverStateMap,
  type LeverStatus as Status,
} from '@/lib/gps/levers';
import type { LeverId } from '@/lib/gps/types';
import type { Locale } from '@/lib/i18n';

const STATUS_ORDER: Status[] = ['pendiente', 'en_proceso', 'lograda', 'no_aplica'];

const STATUS_CLASS: Record<Status, string> = {
  pendiente: 'bg-neutral-100 text-neutral-500',
  en_proceso: 'bg-amber-100 text-amber-800',
  lograda: 'bg-green-100 text-green-800',
  no_aplica: 'bg-neutral-100 text-neutral-400',
};

export default function OxygenPanel({
  locale,
  initial,
  netIncomeCents,
  loadCents,
}: {
  locale: Locale;
  initial: LeverStateMap;
  /** Ingreso neto mensual — el denominador del IPD */
  netIncomeCents: number;
  /** Gastos esenciales + pagos mínimos — el numerador del IPD */
  loadCents: number;
}) {
  const c = getCopy(locale);
  const [levers, setLevers] = useState<LeverStateMap>(initial);
  const [savingId, setSavingId] = useState<LeverId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState<LeverId | null>(null);

  function gainCents(state: LeverState): number {
    if (state.status !== 'lograda') return 0;
    const n = Number(state.gain);
    return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
  }

  // El motor es la única fuente de verdad, también para el cálculo en vivo.
  const registered = LEVER_ORDER.map((id) => ({
    lever: id,
    monthlyGainCents: gainCents(levers[id]),
    effect: LEVER_EFFECT[id],
  }));
  const airCents = airGainedCents(registered);
  const projectedIpd = projectIpd(loadCents, netIncomeCents, registered);

  function update(id: LeverId, patch: Partial<LeverState>) {
    setLevers((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    setJustSaved(null);
  }

  async function save(id: LeverId) {
    setSavingId(id);
    setError(null);
    const state = levers[id];
    const result = await saveLeverResult({
      lever: id,
      status: state.status,
      monthlyGain: state.gain,
      note: state.note,
    });
    setSavingId(null);
    if (!result.ok) {
      setError(result.error ?? 'Algo salió mal');
      return;
    }
    setJustSaved(id);
  }

  const inputClass =
    'w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <section className="space-y-4">
      <header className="bg-primary-50 border border-primary-100 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Wind className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
          <div>
            <h2 className="font-bold text-primary-900">{c.oxygenPanel.header}</h2>
            <p className="text-sm text-primary-800/80 mt-1">{c.oxygenPanel.subtitle}</p>
          </div>
        </div>
      </header>

      {airCents > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-2">
          <p className="font-semibold text-green-900">
            {c.oxygenPanel.airGained(formatCents(airCents), formatCentsWhole(airCents * 12))}
          </p>
          {projectedIpd !== null && (
            <p className="text-sm text-green-800">
              {c.oxygenPanel.projectedIpd}:{' '}
              <span className="font-bold text-lg">{formatIpd(projectedIpd)}</span>
            </p>
          )}
          <p className="text-xs text-green-700/80">{c.oxygenPanel.projectionNote}</p>
        </div>
      )}

      <ol className="space-y-3">
        {LEVER_ORDER.map((id, index) => {
          const lever = c.levers[id];
          const state = levers[id];
          return (
            <li key={id}>
              {/* `open` se calcula sobre `initial`, que no cambia en toda la
                  vida del componente: si dependiera del estado en vivo, elegir
                  "lograda" cerraría el panel justo cuando el usuario va a
                  escribir el resultado. */}
              <details
                className="group bg-white rounded-xl border border-neutral-200 overflow-hidden"
                open={index === 0 && initial[id].status === 'pendiente'}
              >
                <summary className="cursor-pointer list-none p-4 flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-800 text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-neutral-900">{lever.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CLASS[state.status]}`}
                      >
                        {c.oxygenPanel.status[state.status]}
                      </span>
                    </span>
                    <span className="block text-sm text-neutral-600 mt-0.5">{lever.what}</span>
                    <span className="block text-xs text-neutral-400 mt-1">
                      {c.oxygenPanel.speedLabel}: {lever.speed}
                    </span>
                  </span>
                </summary>

                <div className="px-4 pb-4 pt-0 space-y-4 border-t border-neutral-100 mt-1">
                  <div className="pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-neutral-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" aria-hidden /> {c.oxygenPanel.whoToCall}
                    </h3>
                    <p className="text-sm text-neutral-700 mt-1">{lever.whoToCall}</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                      {c.oxygenPanel.whatToSay}
                    </h3>
                    <ul className="mt-1 space-y-2">
                      {lever.whatToSay.map((line) => (
                        <li
                          key={line}
                          className="text-sm text-neutral-700 bg-neutral-50 rounded-lg px-3 py-2 border-l-2 border-primary-300"
                        >
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 rounded-lg p-3">
                    <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                    <span>
                      <span className="font-medium">{c.oxygenPanel.heads}: </span>
                      {lever.heads}
                    </span>
                  </div>

                  <div className="space-y-3 bg-neutral-50 rounded-xl p-3">
                    <h3 className="text-sm font-semibold text-neutral-800">
                      {c.oxygenPanel.registerResult}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1" htmlFor={`st-${id}`}>
                          {c.oxygenPanel.status[state.status]}
                        </label>
                        <select
                          id={`st-${id}`}
                          value={state.status}
                          onChange={(e) => update(id, { status: e.target.value as Status })}
                          className={inputClass}
                        >
                          {STATUS_ORDER.map((s) => (
                            <option key={s} value={s}>
                              {c.oxygenPanel.status[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1" htmlFor={`gn-${id}`}>
                          {c.oxygenPanel.gainLabel} (USD {c.common.perMonth})
                        </label>
                        <input
                          id={`gn-${id}`}
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0"
                          value={state.gain}
                          onChange={(e) => update(id, { gain: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400">{c.oxygenPanel.gainHelp}</p>
                    <input
                      type="text"
                      maxLength={280}
                      value={state.note}
                      onChange={(e) => update(id, { note: e.target.value })}
                      placeholder={c.oxygenPanel.resultPlaceholder}
                      className={inputClass}
                      aria-label={c.oxygenPanel.registerResult}
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => save(id)}
                        disabled={savingId === id}
                        className="btn-primary text-sm py-2 px-4 disabled:opacity-60"
                      >
                        {savingId === id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {c.common.saving}
                          </>
                        ) : (
                          c.common.save
                        )}
                      </button>
                      {justSaved === id && (
                        <span className="flex items-center gap-1 text-sm text-green-700 font-medium">
                          <Check className="w-4 h-4" aria-hidden />
                          {gainCents(state) > 0
                            ? formatCents(gainCents(state)) + ' ' + c.common.perMonth
                            : c.common.save}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ol>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
