import { getCopy } from '@/lib/gps/copy';
import { formatCentsWhole, formatMonthYear } from '@/lib/gps/format';
import type { MonthRow } from '@/lib/gps/types';
import type { Locale } from '@/lib/i18n';

const W = 320;
const H = 150;
const PAD = { top: 10, right: 8, bottom: 22, left: 8 };

/** Curva del saldo total hacia cero — SVG puro, sin librerías. */
export default function ProjectionChart({
  months,
  startBalanceCents,
  locale,
}: {
  months: MonthRow[];
  startBalanceCents: number;
  locale: Locale;
}) {
  if (months.length === 0) return null;

  // Muestrear si la serie es muy larga para no inflar el HTML
  const step = Math.max(1, Math.ceil(months.length / 120));
  const sampled = months.filter((_, i) => i % step === 0 || i === months.length - 1);

  const maxY = Math.max(startBalanceCents, ...sampled.map((m) => m.totalBalanceCents));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const x = (i: number) => PAD.left + (i / months.length) * innerW;
  const y = (v: number) => PAD.top + innerH - (v / maxY) * innerH;

  const points = [
    { i: 0, v: startBalanceCents },
    ...sampled.map((m) => ({ i: m.index + 1, v: m.totalBalanceCents })),
  ];
  const line = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${x(p.i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ');
  const area = `${line} L ${x(points[points.length - 1].i).toFixed(1)} ${y(0).toFixed(1)} L ${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`;

  const last = months[months.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Proyección de tu deuda hacia cero">
        <path d={area} fill="#16a34a" opacity={0.12} />
        <path d={line} fill="none" stroke="#16a34a" strokeWidth={2.5} strokeLinejoin="round" />
        <line x1={PAD.left} y1={y(0)} x2={W - PAD.right} y2={y(0)} stroke="#e5e5e5" strokeWidth={1} />
        <text x={PAD.left} y={H - 6} fontSize={10} fill="#94a3b8">
          hoy · {formatCentsWhole(startBalanceCents)}
        </text>
        <text x={W - PAD.right} y={H - 6} fontSize={10} fill="#16a34a" textAnchor="end" fontWeight={600}>
          {formatMonthYear(last.date, getCopy(locale))} · $0
        </text>
      </svg>
    </div>
  );
}
