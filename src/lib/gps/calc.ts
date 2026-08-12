// Fórmulas del libro "Deuda Fuera, Paz Dentro". Deben coincidir EXACTAMENTE.
// Funciones puras: sin I/O, sin Date.now(). La fecha de hoy siempre se recibe
// como parámetro para que el motor pueda correrse solo, sin interfaz.

import type {
  DebtDiagnosis,
  DebtInput,
  FinanceInput,
  GpsSummary,
  LeverResult,
  OrderStrategy,
  Phase,
  PromoAlert,
  RenegotiateTag,
  UtilizationBand,
} from './types';

export function totalMinPaymentsCents(debts: DebtInput[]): number {
  return debts.reduce((sum, d) => sum + d.minPaymentCents, 0);
}

export function totalDebtCents(debts: DebtInput[]): number {
  return debts.reduce((sum, d) => sum + d.balanceCents, 0);
}

/**
 * IPD = (gastos esenciales + pagos mínimos de deuda) ÷ ingreso neto mensual.
 * Siempre en decimal (0.89, nunca 89%). `null` si no hay ingreso: no dividimos
 * entre cero, la interfaz muestra un mensaje especial.
 */
export function computeIpd(f: FinanceInput, debts: DebtInput[]): number | null {
  if (f.netIncomeCents <= 0) return null;
  return (f.essentialExpensesCents + totalMinPaymentsCents(debts)) / f.netIncomeCents;
}

/**
 * DTI = pagos de deuda ÷ ingreso BRUTO. Es la regla del banco, no una métrica
 * nuestra; la interfaz debe etiquetarla como tal. `null` sin ingreso bruto.
 */
export function computeDti(f: FinanceInput, debts: DebtInput[]): number | null {
  const gross = f.grossIncomeCents ?? 0;
  if (gross <= 0) return null;
  return totalMinPaymentsCents(debts) / gross;
}

/** Flujo libre mensual = ingreso − esenciales − mínimos (puede ser negativo) */
export function freeCashFlowCents(f: FinanceInput, debts: DebtInput[]): number {
  return f.netIncomeCents - f.essentialExpensesCents - totalMinPaymentsCents(debts);
}

/**
 * Pregunta 1 del Selector: ¿en qué fase estás? La contesta el IPD.
 *  > 1.00 → DÉFICIT
 *  ≥ 0.70 (o flujo libre ≤ 5% del ingreso) → OXÍGENO
 *  0.45–0.70 → BOLA DE NIEVE
 *  < 0.45 → AVALANCHA
 */
export function classifyPhase(f: FinanceInput, debts: DebtInput[]): Phase {
  const active = debts.filter((d) => d.balanceCents > 0);
  if (active.length === 0) return 'SIN_DEUDAS';
  const ipd = computeIpd(f, active);
  if (ipd === null) return 'SIN_INGRESO';
  if (ipd > 1.0) return 'DEFICIT';
  const flujo = freeCashFlowCents(f, active);
  if (ipd >= 0.7 || flujo <= 0.05 * f.netIncomeCents) return 'OXIGENO';
  if (ipd >= 0.45) return 'BOLA_DE_NIEVE';
  return 'AVALANCHA';
}

/**
 * Pregunta 2 del Selector: ¿en qué orden pagas? Un criterio por fase.
 *
 * En Déficit y en Oxígeno manda el ROI de Flujo: son las dos posiciones más
 * críticas, y ahí lo único que cuenta es liberar el mayor pago mensual con el
 * menor capital posible. El dinero de una venta o de un gig se dirige al mismo
 * lugar. Después, con aire ya recuperado, el criterio cambia: impulso primero
 * (saldo menor) y costo al final (APR más alta).
 */
export function orderStrategyFor(phase: Phase): OrderStrategy | null {
  if (phase === 'DEFICIT' || phase === 'OXIGENO') return 'roi_flujo';
  if (phase === 'BOLA_DE_NIEVE') return 'saldo_menor';
  if (phase === 'AVALANCHA') return 'apr_mas_alta';
  return null;
}

/** Número de Paz = (gastos esenciales + pagos mínimos) × 1.05 */
export function numeroDePazCents(f: FinanceInput, debts: DebtInput[]): number {
  return Math.round((f.essentialExpensesCents + totalMinPaymentsCents(debts)) * 1.05);
}

/**
 * Meta de Oxígeno = Número de Paz − ingreso (si > 0), en dos etapas:
 * primero cubrir el mes (esenciales + mínimos), después el colchón del 5%.
 */
export function metaDeOxigeno(
  f: FinanceInput,
  debts: DebtInput[],
): GpsSummary['metaDeOxigeno'] {
  const paz = numeroDePazCents(f, debts);
  const total = paz - f.netIncomeCents;
  if (total <= 0) return null;
  const baseMes = f.essentialExpensesCents + totalMinPaymentsCents(debts);
  const stage1 = Math.min(total, Math.max(0, baseMes - f.netIncomeCents));
  return { totalCents: total, stage1Cents: stage1, stage2Cents: total - stage1 };
}

/** Fondo esbelto = 0.5–2 meses de gastos esenciales (en HYSA) */
export function fondoEsbeltoCents(f: FinanceInput): { minCents: number; maxCents: number } {
  return {
    minCents: Math.round(f.essentialExpensesCents * 0.5),
    maxCents: f.essentialExpensesCents * 2,
  };
}

/** Interés mensual = saldo × APR ÷ 12 (0 si la deuda está en promoción 0%) */
export function monthlyInterestCents(d: DebtInput): number {
  if (d.isPromoZero) return 0;
  return Math.round((d.balanceCents * d.apr) / 100 / 12);
}

/**
 * Fuga eterna: el pago mínimo no reduce capital (mínimo ≤ interés del mes).
 * Es el aviso más importante de toda la herramienta.
 */
export function isFugaEterna(d: DebtInput): boolean {
  if (d.isPromoZero || d.apr <= 0 || d.balanceCents <= 0) return false;
  return d.minPaymentCents <= monthlyInterestCents(d);
}

/** Utilización = saldo ÷ límite (null si no hay límite) */
export function utilization(d: DebtInput): number | null {
  if (!d.creditLimitCents || d.creditLimitCents <= 0) return null;
  return d.balanceCents / d.creditLimitCents;
}

/** Semáforo del crédito: <9% ideal, <30% aceptable, >80% crítica. Informativo:
 *  ya no reordena nada — el buen crédito es consecuencia de salir de deudas. */
export function utilizationBand(u: number): UtilizationBand {
  if (u < 0.09) return 'ideal';
  if (u < 0.3) return 'aceptable';
  if (u <= 0.8) return 'alta';
  return 'critica';
}

/**
 * ROI de Flujo = (pago mensual × 12) ÷ saldo. En decimal (0.48 = 48%).
 * Mientras más grande, más pago mensual te devuelve esa deuda por cada dólar
 * que necesitas para liquidarla. Es el criterio de orden de Déficit y Oxígeno.
 */
export function roiDeFlujo(d: DebtInput): number {
  if (d.balanceCents <= 0) return Infinity;
  return (d.minPaymentCents * 12) / d.balanceCents;
}

/** Payback = saldo ÷ pago mensual (meses) */
export function paybackMonths(d: DebtInput): number {
  if (d.minPaymentCents <= 0) return Infinity;
  return d.balanceCents / d.minPaymentCents;
}

/**
 * Mínimo estimado de tarjeta = máx( 1% del saldo + interés del mes , $25 ).
 * Solo para tarjetas: en préstamos a plazo se pide el pago fijo, no se estima.
 * Siempre debe presentarse marcado como estimación y ser corregible.
 */
export const MIN_PAYMENT_FLOOR_CENTS = 2500;

export function estimateCardMinPaymentCents(balanceCents: number, apr: number): number {
  if (balanceCents <= 0) return 0;
  const onePercent = balanceCents * 0.01;
  const interest = (balanceCents * Math.max(0, apr)) / 100 / 12;
  return Math.max(Math.round(onePercent + interest), MIN_PAYMENT_FLOOR_CENTS);
}

/**
 * Columna "¿Renegociar?": qué hacer con cada deuda ADEMÁS de pagarla —
 * renegociar, refinanciar o consolidar. No es el orden de pago; ese sale de
 * la fase (en Déficit y Oxígeno, del mismo ROI de Flujo que se calcula aquí).
 *
 * Precedencia: las dos primeras se solapan por álgebra (payback = 12 ÷ ROI,
 * así que payback ≤ 6 ⟺ ROI ≥ 200%, subconjunto de ROI ≥ 100%), y por eso
 * "se libera sola" se evalúa primero.
 */
export function renegotiateTag(d: DebtInput, totalDebt: number): RenegotiateTag | null {
  if (d.balanceCents <= 0) return null;
  const payback = paybackMonths(d);
  const roi = roiDeFlujo(d);
  if (payback <= 6) return 'se_libera_sola';
  if (roi >= 1.0) return 'te_esta_apretando';
  if (roi < 0.5 && totalDebt > 0 && d.balanceCents > 0.25 * totalDebt) return 'renegocia_esta';
  return null;
}

function utcDays(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / 86_400_000;
}

/**
 * Aviso de fin de promoción 0%: 60 / 30 / 7 días antes. `today` en ISO
 * yyyy-mm-dd — el motor nunca lee el reloj por su cuenta.
 */
export function promoAlert(d: DebtInput, today: string): PromoAlert | null {
  if (!d.isPromoZero || !d.promoEndDate) return null;
  const end = utcDays(d.promoEndDate);
  const now = utcDays(today);
  if (end === null || now === null) return null;
  const daysLeft = Math.round(end - now);
  if (daysLeft < 0) return null;
  const level = daysLeft <= 7 ? 7 : daysLeft <= 30 ? 30 : daysLeft <= 60 ? 60 : null;
  return level === null ? null : { daysLeft, level };
}

/** Tabla de diagnóstico por deuda (Free). */
export function diagnoseDebts(debts: DebtInput[], today: string): DebtDiagnosis[] {
  const total = totalDebtCents(debts);
  return debts.map((d) => {
    const u = utilization(d);
    return {
      debtId: d.id,
      roiDeFlujo: roiDeFlujo(d),
      paybackMonths: paybackMonths(d),
      monthlyInterestCents: monthlyInterestCents(d),
      utilization: u,
      utilizationBand: u === null ? null : utilizationBand(u),
      fugaEterna: isFugaEterna(d),
      employmentTied: Boolean(d.employmentTied) && d.balanceCents > 0,
      renegotiate: renegotiateTag(d, total),
      promoAlert: promoAlert(d, today),
    };
  });
}

/** Aire ganado (dólares/mes) registrado en el Panel de Oxígeno. */
export function airGainedCents(levers: LeverResult[]): number {
  return levers.reduce((sum, l) => sum + Math.max(0, l.monthlyGainCents), 0);
}

/**
 * IPD proyectado con las palancas registradas. Es una proyección hasta que el
 * usuario actualice sus números reales — la interfaz debe decirlo así.
 *
 * `load` = gastos esenciales + pagos mínimos (el numerador del IPD). El Panel
 * de Oxígeno llama a esta versión directamente para recalcular en vivo sin
 * volver a mandar las deudas al navegador.
 */
export function projectIpd(
  loadCents: number,
  netIncomeCents: number,
  levers: LeverResult[],
): number | null {
  let income = netIncomeCents;
  let load = loadCents;
  for (const l of levers) {
    const gain = Math.max(0, l.monthlyGainCents);
    if (l.effect === 'ingreso') income += gain;
    else load -= gain;
  }
  if (income <= 0) return null;
  return Math.max(0, load) / income;
}

export function ipdWithLevers(
  f: FinanceInput,
  debts: DebtInput[],
  levers: LeverResult[],
): number | null {
  return projectIpd(
    f.essentialExpensesCents + totalMinPaymentsCents(debts),
    f.netIncomeCents,
    levers,
  );
}

/** Resumen completo para el tablero (Free y Full). */
export function diagnose(f: FinanceInput, debts: DebtInput[]): GpsSummary {
  const phase = classifyPhase(f, debts);
  return {
    ipd: computeIpd(f, debts),
    phase,
    orderStrategy: orderStrategyFor(phase),
    dti: computeDti(f, debts),
    freeCashFlowCents: freeCashFlowCents(f, debts),
    numeroDePazCents: numeroDePazCents(f, debts),
    metaDeOxigeno: metaDeOxigeno(f, debts),
    fondoEsbelto: fondoEsbeltoCents(f),
    totalDebtCents: totalDebtCents(debts),
    totalMinPaymentsCents: totalMinPaymentsCents(debts),
  };
}
