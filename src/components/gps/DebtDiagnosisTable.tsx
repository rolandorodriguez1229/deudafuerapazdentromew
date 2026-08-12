// Tabla de diagnóstico por deuda. Está armada como lista de tarjetas y no como
// <table>: el 28% de nuestro público entra solo por teléfono, y una tabla de
// seis columnas en un teléfono se convierte en scroll horizontal.
//
// La columna "¿Renegociar?" NUNCA es un orden de pago. Es una lista de qué
// renegociar; a quién pagar lo decide la fase.

import { AlertTriangle, CalendarClock, Percent, ShieldAlert } from 'lucide-react';
import { diagnoseDebts } from '@/lib/gps/calc';
import { getCopy } from '@/lib/gps/copy';
import type { DebtRecord } from '@/lib/gps/data';
import { formatCents, formatMonths, formatRatio } from '@/lib/gps/format';
import type { DebtDiagnosis, Phase } from '@/lib/gps/types';
import type { Locale } from '@/lib/i18n';

const BAND_CLASS: Record<string, string> = {
  ideal: 'bg-green-100 text-green-800',
  aceptable: 'bg-green-50 text-green-700',
  alta: 'bg-orange-100 text-orange-800',
  critica: 'bg-red-100 text-red-800',
};

const TAG_CLASS: Record<string, string> = {
  se_libera_sola: 'bg-green-50 border-green-200 text-green-900',
  te_esta_apretando: 'bg-orange-50 border-orange-200 text-orange-900',
  renegocia_esta: 'bg-accent-50 border-accent-200 text-accent-900',
};

function renegotiateLine(
  d: DebtRecord,
  dx: DebtDiagnosis,
  c: ReturnType<typeof getCopy>,
): { label: string; message: string } | null {
  switch (dx.renegotiate) {
    case 'se_libera_sola':
      return {
        label: c.renegotiate.se_libera_sola.label,
        message: c.renegotiate.se_libera_sola.message(
          Math.ceil(dx.paybackMonths),
          formatCents(d.minPaymentCents),
        ),
      };
    case 'renegocia_esta':
      return {
        label: c.renegotiate.renegocia_esta.label,
        message: c.renegotiate.renegocia_esta.message(formatCents(d.balanceCents)),
      };
    case 'te_esta_apretando':
      return {
        label: c.renegotiate.te_esta_apretando.label,
        message: c.renegotiate.te_esta_apretando.message(),
      };
    default:
      return null;
  }
}

export default function DebtDiagnosisTable({
  locale,
  debts,
  today,
  phase,
  highlightId,
}: {
  locale: Locale;
  debts: DebtRecord[];
  /** ISO yyyy-mm-dd — el motor nunca lee el reloj por su cuenta */
  today: string;
  /** Cambia qué se le dice al usuario sobre una fuga eterna */
  phase: Phase;
  /** La deuda objetivo va destacada; las demás, en gris (regla de concentración) */
  highlightId?: string | null;
}) {
  const c = getCopy(locale);
  const diagnoses = diagnoseDebts(debts, today);
  // En Déficit y Oxígeno una fuga eterna no se puede out-pagar: la salida es
  // llamar. Ya en Bola de Nieve, si la llamada no dio resultado, va primero.
  const fugaAdvice =
    phase === 'DEFICIT' || phase === 'OXIGENO'
      ? c.alerts.fugaEternaLlamar
      : c.alerts.fugaEternaPrimero;
  const byId = new Map(diagnoses.map((d) => [d.debtId, d]));

  if (debts.length === 0) {
    return <p className="text-sm text-neutral-500">{c.debts.empty}</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-500">
        <span className="font-bold text-neutral-700">{c.renegotiate.title}</span>{' '}
        {c.renegotiate.subtitle}
      </p>
      <ul className="space-y-3">
        {debts.map((d) => {
          const dx = byId.get(d.id)!;
          const line = renegotiateLine(d, dx, c);
          const dimmed = highlightId != null && highlightId !== d.id;
          return (
            <li
              key={d.id}
              className={`rounded-xl border p-4 ${
                highlightId === d.id
                  ? 'border-primary-400 bg-white ring-2 ring-primary-100'
                  : 'border-neutral-200 bg-white'
              } ${dimmed ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold text-neutral-900">{d.name}</div>
                  <div className="text-sm text-neutral-500">
                    {c.debts.typeOptions[d.type]}
                    {' · '}
                    {c.debts.minPayment} {formatCents(d.minPaymentCents)}
                    {' · '}APR {d.apr}%
                  </div>
                </div>
                <div className="text-lg font-bold text-neutral-900">
                  {formatCents(d.balanceCents)}
                </div>
              </div>

              <dl className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div className="bg-neutral-50 rounded-lg py-2">
                  <dt className="text-[11px] uppercase tracking-wide text-neutral-400">
                    {c.debts.roi}
                  </dt>
                  <dd className="font-semibold text-neutral-800">
                    {formatRatio(dx.roiDeFlujo)}
                  </dd>
                </div>
                <div className="bg-neutral-50 rounded-lg py-2">
                  <dt className="text-[11px] uppercase tracking-wide text-neutral-400">
                    {c.debts.payback}
                  </dt>
                  <dd className="font-semibold text-neutral-800">
                    {formatMonths(dx.paybackMonths, c)}
                  </dd>
                </div>
                <div className="bg-neutral-50 rounded-lg py-2">
                  <dt className="text-[11px] uppercase tracking-wide text-neutral-400">
                    {c.debts.monthlyInterest}
                  </dt>
                  <dd className="font-semibold text-neutral-800">
                    {formatCents(dx.monthlyInterestCents)}
                  </dd>
                </div>
              </dl>

              {line && (
                <div
                  className={`mt-3 rounded-lg border px-3 py-2 text-sm ${TAG_CLASS[dx.renegotiate!]}`}
                >
                  <span className="font-bold">{line.label}. </span>
                  {line.message}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {dx.promoAlert && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-900">
                    <CalendarClock className="w-3 h-3" aria-hidden />
                    {c.renegotiate.promo.label} — {c.renegotiate.promo.message(dx.promoAlert.daysLeft)}
                  </span>
                )}
                {d.isPromoZero && !dx.promoAlert && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-primary-50 text-primary-700">
                    <Percent className="w-3 h-3" aria-hidden /> 0%
                    {d.promoEndDate ? ` · ${d.promoEndDate}` : ''}
                  </span>
                )}
                {dx.utilizationBand && (
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${BAND_CLASS[dx.utilizationBand]}`}
                  >
                    {c.utilization.label} {formatRatio(dx.utilization)} —{' '}
                    {c.utilization[dx.utilizationBand]}
                  </span>
                )}
                {dx.utilization !== null && dx.utilization > 1 && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-800">
                    {c.alerts.balanceOverLimit}
                  </span>
                )}
                {d.minPaymentCents > d.balanceCents && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-neutral-100 text-neutral-600">
                    {c.alerts.minOverBalance}
                  </span>
                )}
                {dx.employmentTied && (
                  <span className="inline-flex items-start gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-amber-100 text-amber-900">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden />
                    {c.attackReason.atada_al_empleo}
                  </span>
                )}
                {dx.fugaEterna && (
                  <span className="inline-flex items-start gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-red-100 text-red-900">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden />
                    <span>
                      {c.alerts.fugaEterna} {fugaAdvice}
                    </span>
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
