import { Crosshair } from 'lucide-react';
import { getCopy } from '@/lib/gps/copy';
import { formatCents, formatMonthYear } from '@/lib/gps/format';
import type { RankedDebt, YearMonth } from '@/lib/gps/types';
import type { Locale } from '@/lib/i18n';

/**
 * Regla de concentración: la #1 va grande y destacada, el resto en gris.
 * Nunca sugerimos repartir el excedente.
 */
export default function AttackOrderList({
  order,
  locale,
  payoffByDebt,
}: {
  order: RankedDebt[];
  locale: Locale;
  payoffByDebt?: Map<string, YearMonth | null>;
}) {
  const c = getCopy(locale);
  return (
    <ol className="space-y-3">
      {order.map((d, i) => {
        const payoff = payoffByDebt?.get(d.id) ?? null;
        const isTarget = i === 0;
        return (
          <li
            key={d.id}
            className={
              isTarget
                ? 'rounded-xl border-2 border-green-500 bg-green-50 p-4'
                : 'rounded-xl border border-neutral-200 bg-white p-4 opacity-70'
            }
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  isTarget ? 'bg-green-600 text-white' : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="font-semibold text-neutral-800 flex items-center gap-2">
                    {isTarget && <Crosshair className="w-4 h-4 text-green-700" aria-hidden />}
                    {isTarget ? `${c.panel.targetDebt}: ${d.name}` : d.name}
                  </div>
                  <div className="font-bold text-neutral-900">{formatCents(d.balanceCents)}</div>
                </div>
                <div className="text-sm text-neutral-500 mt-0.5">
                  {c.attackReason[d.reason]}
                  {payoff && (
                    <span className="text-green-700 font-medium">
                      {' · '}
                      {formatMonthYear(payoff, c)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
