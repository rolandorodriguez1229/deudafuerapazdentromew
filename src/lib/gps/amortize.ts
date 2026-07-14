// Proyección de libertad: amortización mes a mes con cascada (los mínimos
// liberados y el extra se vierten en la primera deuda del orden de ataque).

import { freeCashFlowCents, isFugaEterna } from './calc';
import type {
  DebtInput,
  FinanceInput,
  MonthRow,
  ProjectionOptions,
  ProjectionResult,
  RankedDebt,
  YearMonth,
} from './types';

export function addMonths(start: YearMonth, count: number): YearMonth {
  const zeroBased = start.year * 12 + (start.month - 1) + count;
  return { year: Math.floor(zeroBased / 12), month: (zeroBased % 12) + 1 };
}

function ymIndex(ym: YearMonth): number {
  return ym.year * 12 + (ym.month - 1);
}

function promoYearMonth(d: DebtInput): YearMonth | null {
  if (!d.isPromoZero || !d.promoEndDate) return null;
  const [y, m] = d.promoEndDate.split('-').map(Number);
  if (!y || !m) return null;
  return { year: y, month: m };
}

interface SimDebt {
  id: string;
  minPaymentCents: number;
  apr: number;
  promo: YearMonth | null;
  balance: number;
  payoffDate: YearMonth | null;
}

const DEFAULT_MAX_MONTHS = 600;

/**
 * Simula la amortización. `order` son los ids en prioridad de ataque.
 * Guardas: tope de meses y corte si el saldo total no baja 3 meses seguidos.
 */
export function projectPayoff(
  debts: DebtInput[],
  order: string[],
  opts: ProjectionOptions,
): ProjectionResult {
  const maxMonths = opts.maxMonths ?? DEFAULT_MAX_MONTHS;
  const snowball = opts.snowballFreedMinimums ?? true;

  const sim: SimDebt[] = debts
    .filter((d) => d.balanceCents > 0)
    .map((d) => ({
      id: d.id,
      minPaymentCents: d.minPaymentCents,
      apr: d.apr,
      promo: promoYearMonth(d),
      balance: d.balanceCents,
      payoffDate: null,
    }));

  const byId = new Map(sim.map((d) => [d.id, d]));
  const attackSequence = [
    ...order.filter((id) => byId.has(id)),
    ...sim.filter((d) => !order.includes(d.id)).map((d) => d.id),
  ];

  const months: MonthRow[] = [];
  let totalInterest = 0;
  let freedMins = 0;
  let prevTotal = sim.reduce((s, d) => s + d.balance, 0);
  let risingStreak = 0;
  let feasible = true;

  for (let m = 0; m < maxMonths; m++) {
    const remaining = sim.filter((d) => d.balance > 0);
    if (remaining.length === 0) break;
    const cur = addMonths(opts.start, m);

    // 1) Acumular interés (0 mientras dure la promo 0%)
    let interestThisMonth = 0;
    for (const d of remaining) {
      const promoActive = d.promo !== null && ymIndex(cur) <= ymIndex(d.promo);
      if (!promoActive && d.apr > 0) {
        const interest = Math.round((d.balance * d.apr) / 100 / 12);
        d.balance += interest;
        interestThisMonth += interest;
      }
    }

    // 2) Pagar el mínimo de cada deuda activa
    let paidThisMonth = 0;
    for (const d of remaining) {
      const pay = Math.min(d.minPaymentCents, d.balance);
      d.balance -= pay;
      paidThisMonth += pay;
    }

    // 3) Verter extra + mínimos liberados en cascada según el orden de ataque
    let extraPool =
      opts.extraMonthlyCents +
      (snowball ? freedMins : 0) +
      (m === 0 ? (opts.lumpSumCents ?? 0) : 0);
    for (const id of attackSequence) {
      if (extraPool <= 0) break;
      const d = byId.get(id)!;
      if (d.balance <= 0) continue;
      const pay = Math.min(extraPool, d.balance);
      d.balance -= pay;
      extraPool -= pay;
      paidThisMonth += pay;
    }

    // 4) Registrar el mes y las deudas saldadas
    const paidOffIds: string[] = [];
    for (const d of remaining) {
      if (d.balance <= 0 && d.payoffDate === null) {
        d.payoffDate = cur;
        freedMins += d.minPaymentCents;
        paidOffIds.push(d.id);
      }
    }

    const newTotal = sim.reduce((s, d) => s + d.balance, 0);
    totalInterest += interestThisMonth;
    months.push({
      index: m,
      date: cur,
      totalBalanceCents: newTotal,
      interestPaidCents: interestThisMonth,
      principalPaidCents: paidThisMonth - interestThisMonth,
      paidOffDebtIds: paidOffIds,
    });

    if (newTotal >= prevTotal) {
      risingStreak++;
      if (risingStreak >= 3) {
        feasible = false;
        break;
      }
    } else {
      risingStreak = 0;
    }
    prevTotal = newTotal;
  }

  const stillActive = sim.filter((d) => d.balance > 0);
  if (stillActive.length > 0) feasible = false;

  const stuck = stillActive.filter((d) =>
    isFugaEterna({
      id: d.id,
      name: '',
      balanceCents: d.balance,
      minPaymentCents: d.minPaymentCents,
      apr: d.apr,
      isPromoZero: false,
    }),
  );

  return {
    feasible,
    months,
    debtFreeDate: feasible && months.length > 0 ? months[months.length - 1].date : null,
    totalInterestCents: totalInterest,
    perDebtPayoff: sim.map((d) => ({ debtId: d.id, payoffDate: d.payoffDate })),
    stuckDebtIds: (stuck.length > 0 ? stuck : stillActive).map((d) => d.id),
  };
}

export interface FullProjection {
  plan: ProjectionResult;
  /** Solo mínimos, sin extra y sin redirigir mínimos liberados */
  baseline: ProjectionResult;
  /** null si alguna de las dos corridas no es viable */
  interestSavedVsMinimumCents: number | null;
  monthsSavedVsMinimum: number | null;
  extraMonthlyCents: number;
}

/** Corrida del plan (con todo el flujo libre) vs. baseline de solo mínimos. */
export function buildFullProjection(
  f: FinanceInput,
  debts: DebtInput[],
  order: RankedDebt[],
  start: YearMonth,
): FullProjection {
  const extra = Math.max(0, freeCashFlowCents(f, debts));
  const orderIds = order.map((d) => d.id);
  const plan = projectPayoff(debts, orderIds, { extraMonthlyCents: extra, start });
  const baseline = projectPayoff(debts, orderIds, {
    extraMonthlyCents: 0,
    start,
    snowballFreedMinimums: false,
  });
  const bothFeasible = plan.feasible && baseline.feasible;
  return {
    plan,
    baseline,
    interestSavedVsMinimumCents: bothFeasible
      ? baseline.totalInterestCents - plan.totalInterestCents
      : null,
    monthsSavedVsMinimum: bothFeasible
      ? baseline.months.length - plan.months.length
      : null,
    extraMonthlyCents: extra,
  };
}
