// Fórmulas del libro "Deuda Fuera, Paz Dentro". Deben coincidir EXACTAMENTE.
// Funciones puras: sin I/O, sin Date.now().

import type {
  DebtInput,
  FinanceInput,
  GpsSummary,
  UtilizationBand,
  Zone,
} from './types';

export function totalMinPaymentsCents(debts: DebtInput[]): number {
  return debts.reduce((sum, d) => sum + d.minPaymentCents, 0);
}

export function totalDebtCents(debts: DebtInput[]): number {
  return debts.reduce((sum, d) => sum + d.balanceCents, 0);
}

/** IPD = (gastos esenciales + pagos mínimos de deuda) ÷ ingreso neto mensual */
export function computeIpd(f: FinanceInput, debts: DebtInput[]): number {
  if (f.netIncomeCents <= 0) return Infinity;
  return (f.essentialExpensesCents + totalMinPaymentsCents(debts)) / f.netIncomeCents;
}

/** DTI = pagos de deuda ÷ ingreso */
export function computeDti(f: FinanceInput, debts: DebtInput[]): number {
  if (f.netIncomeCents <= 0) return Infinity;
  return totalMinPaymentsCents(debts) / f.netIncomeCents;
}

/** Flujo libre mensual = ingreso − esenciales − mínimos (puede ser negativo) */
export function freeCashFlowCents(f: FinanceInput, debts: DebtInput[]): number {
  return f.netIncomeCents - f.essentialExpensesCents - totalMinPaymentsCents(debts);
}

/**
 * Zonas del Selector (GPS Anti-Deuda):
 *  IPD > 1.0 → DÉFICIT · IPD ≥ 0.70 (o flujo libre ≤ 5% del ingreso) → Oxígeno Rápido
 *  0.45 ≤ IPD < 0.70 → Bola de Nieve · IPD < 0.45 → Avalancha
 */
export function classifyZone(f: FinanceInput, debts: DebtInput[]): Zone {
  if (debts.length === 0) return 'SIN_DEUDAS';
  const ipd = computeIpd(f, debts);
  if (ipd > 1.0) return 'DEFICIT';
  const flujo = freeCashFlowCents(f, debts);
  if (ipd >= 0.7 || flujo <= 0.05 * f.netIncomeCents) return 'OXIGENO_RAPIDO';
  if (ipd >= 0.45) return 'BOLA_DE_NIEVE';
  return 'AVALANCHA';
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

/** Interés mensual = saldo × APR/12 (0 si la deuda está en promoción 0%) */
export function monthlyInterestCents(d: DebtInput): number {
  if (d.isPromoZero) return 0;
  return Math.round((d.balanceCents * d.apr) / 100 / 12);
}

/** Fuga eterna: el pago mínimo no reduce capital (mínimo ≤ interés mensual) */
export function isFugaEterna(d: DebtInput): boolean {
  if (d.isPromoZero || d.apr <= 0 || d.balanceCents <= 0) return false;
  return d.minPaymentCents <= monthlyInterestCents(d);
}

/** Utilización = saldo ÷ límite (null si no hay límite) */
export function utilization(d: DebtInput): number | null {
  if (!d.creditLimitCents || d.creditLimitCents <= 0) return null;
  return d.balanceCents / d.creditLimitCents;
}

/** Semáforo: <9% ideal, <30% aceptable, >80% dispara el override */
export function utilizationBand(u: number): UtilizationBand {
  if (u < 0.09) return 'ideal';
  if (u < 0.3) return 'aceptable';
  if (u <= 0.8) return 'alta';
  return 'critica';
}

/** Override siempre activo: APR ≥ 30% o utilización > 80% se ataca primero */
export function isOverride(d: DebtInput): boolean {
  if (d.balanceCents <= 0) return false;
  if (d.apr >= 30) return true;
  const u = utilization(d);
  return u !== null && u > 0.8;
}

/** ROI de Flujo = (pago mensual × 12) ÷ saldo */
export function roiDeFlujo(d: DebtInput): number {
  if (d.balanceCents <= 0) return Infinity;
  return (d.minPaymentCents * 12) / d.balanceCents;
}

/** Payback = saldo ÷ pago mensual (meses) */
export function paybackMonths(d: DebtInput): number {
  if (d.minPaymentCents <= 0) return Infinity;
  return d.balanceCents / d.minPaymentCents;
}

/** Resumen completo para el tablero (Free y Full). */
export function diagnose(f: FinanceInput, debts: DebtInput[]): GpsSummary {
  return {
    ipd: computeIpd(f, debts),
    zone: classifyZone(f, debts),
    dti: computeDti(f, debts),
    freeCashFlowCents: freeCashFlowCents(f, debts),
    numeroDePazCents: numeroDePazCents(f, debts),
    metaDeOxigeno: metaDeOxigeno(f, debts),
    fondoEsbelto: fondoEsbeltoCents(f),
    totalDebtCents: totalDebtCents(debts),
    totalMinPaymentsCents: totalMinPaymentsCents(debts),
  };
}
