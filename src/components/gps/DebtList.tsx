import { AlertTriangle, Percent } from 'lucide-react';
import { isFugaEterna, utilization, utilizationBand } from '@/lib/gps/calc';
import { FUGA_ETERNA_WARNING, UTILIZATION_LABEL } from '@/lib/gps/copy';
import type { DebtRecord } from '@/lib/gps/data';
import { formatCents, formatRatio } from '@/lib/gps/format';
import { DEBT_KIND_LABEL } from '@/lib/gps/schemas';

const BAND_CLASS: Record<string, string> = {
  ideal: 'bg-green-100 text-green-800',
  aceptable: 'bg-green-50 text-green-700',
  alta: 'bg-orange-100 text-orange-800',
  critica: 'bg-red-100 text-red-800',
};

export default function DebtList({ debts }: { debts: DebtRecord[] }) {
  return (
    <ul className="space-y-3">
      {debts.map((d) => {
        const u = utilization(d);
        const band = u !== null ? utilizationBand(u) : null;
        const fuga = isFugaEterna(d);
        return (
          <li key={d.id} className="bg-white border border-neutral-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="font-semibold text-neutral-800">{d.name}</div>
                <div className="text-sm text-neutral-500">
                  {DEBT_KIND_LABEL[d.kind as keyof typeof DEBT_KIND_LABEL] ?? d.kind}
                  {' · '}mínimo {formatCents(d.minPaymentCents)}
                  {' · '}APR {d.apr}%
                </div>
              </div>
              <div className="text-lg font-bold text-neutral-900">
                {formatCents(d.balanceCents)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {d.isPromoZero && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-primary-50 text-primary-700">
                  <Percent className="w-3 h-3" /> Promo 0%
                  {d.promoEndDate ? ` hasta ${d.promoEndDate}` : ''}
                </span>
              )}
              {band && (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${BAND_CLASS[band]}`}
                >
                  Utilización {formatRatio(u!)} — {UTILIZATION_LABEL[band]}
                </span>
              )}
              {fuga && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-800">
                  <AlertTriangle className="w-3 h-3" /> {FUGA_ETERNA_WARNING}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
