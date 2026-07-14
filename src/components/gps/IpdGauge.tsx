import { formatIpd } from '@/lib/gps/format';

const MAX_DISPLAY = 1.2;
const CX = 110;
const CY = 110;
const R = 88;

function polar(deg: number, r: number = R) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY - r * Math.sin(rad) };
}

function valueToDeg(v: number) {
  const clamped = Math.min(Math.max(v, 0), MAX_DISPLAY);
  return 180 - (clamped / MAX_DISPLAY) * 180;
}

function arcPath(fromValue: number, toValue: number) {
  const start = polar(valueToDeg(fromValue));
  const end = polar(valueToDeg(toValue));
  return `M ${start.x} ${start.y} A ${R} ${R} 0 0 1 ${end.x} ${end.y}`;
}

const SEGMENTS: { from: number; to: number; color: string }[] = [
  { from: 0, to: 0.45, color: '#16a34a' }, // verde: Avalancha
  { from: 0.45, to: 0.7, color: '#f59e0b' }, // amarillo: Bola de Nieve
  { from: 0.7, to: MAX_DISPLAY, color: '#dc2626' }, // rojo: Oxígeno Rápido / Déficit
];

/** Velocímetro del IPD. Sin hooks: sirve en Server y Client Components. */
export default function IpdGauge({ ipd }: { ipd: number }) {
  const deg = valueToDeg(Number.isFinite(ipd) ? ipd : MAX_DISPLAY);
  const needleColor =
    ipd >= 0.7 ? '#dc2626' : ipd >= 0.45 ? '#f59e0b' : '#16a34a';

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 220 132" className="w-full max-w-xs" role="img" aria-label={`IPD ${formatIpd(ipd)}`}>
        {SEGMENTS.map((s) => (
          <path
            key={s.color}
            d={arcPath(s.from, s.to)}
            fill="none"
            stroke={s.color}
            strokeWidth={16}
            strokeLinecap="butt"
            opacity={0.85}
          />
        ))}
        {/* marcas de umbral 0.45 y 0.70 */}
        {[0.45, 0.7].map((v) => {
          const a = valueToDeg(v);
          const p1 = polar(a, R - 12);
          const p2 = polar(a, R + 12);
          return (
            <line key={v} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#fff" strokeWidth={2.5} />
          );
        })}
        <g
          className="gps-needle"
          style={{ transform: `rotate(${180 - deg}deg)`, transformOrigin: '110px 110px' }}
        >
          <line x1={CX} y1={CY} x2={CX - 68} y2={CY} stroke="#1e293b" strokeWidth={4} strokeLinecap="round" />
        </g>
        <circle cx={CX} cy={CY} r={8} fill="#1e293b" />
        <text x={22} y={128} fontSize={11} fill="#94a3b8">0</text>
        <text x={188} y={128} fontSize={11} fill="#94a3b8">1.2+</text>
      </svg>
      <div className="text-center -mt-2">
        <div className="text-4xl font-bold" style={{ color: needleColor }}>
          {formatIpd(ipd)}
        </div>
        <div className="text-sm text-neutral-500">Tu Índice de Presión de Deuda (IPD)</div>
      </div>
    </div>
  );
}
