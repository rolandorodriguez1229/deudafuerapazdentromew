// Escenarios "qué pasa si" (plan Full): extra mensual, pago único,
// reducción de APR por negociación.

import { buildFullProjection, projectPayoff } from './amortize';
import { freeCashFlowCents } from './calc';
import { buildAttackOrder } from './order';
import type {
  DebtInput,
  FinanceInput,
  ProjectionResult,
  YearMonth,
  Zone,
} from './types';

export type ScenarioMod =
  | { kind: 'extra_mensual'; amountCents: number }
  | { kind: 'pago_unico'; amountCents: number }
  | { kind: 'reduccion_apr'; debtId: string; newApr: number };

export interface ScenarioComparison {
  base: ProjectionResult;
  result: ProjectionResult;
  /** null si alguna corrida no es viable */
  monthsSaved: number | null;
  interestSavedCents: number | null;
}

export function compareProjections(
  base: ProjectionResult,
  result: ProjectionResult,
): { monthsSaved: number | null; interestSavedCents: number | null } {
  if (!base.feasible || !result.feasible) {
    return { monthsSaved: null, interestSavedCents: null };
  }
  return {
    monthsSaved: base.months.length - result.months.length,
    interestSavedCents: base.totalInterestCents - result.totalInterestCents,
  };
}

/**
 * Corre un escenario contra el plan actual. La zona no cambia (los mínimos
 * y el ingreso no se tocan), pero el orden se recalcula porque una reducción
 * de APR puede sacar una deuda del override.
 */
export function runScenario(
  f: FinanceInput,
  debts: DebtInput[],
  zone: Zone,
  start: YearMonth,
  mod: ScenarioMod,
): ScenarioComparison {
  const baseExtra = Math.max(0, freeCashFlowCents(f, debts));
  const base = buildFullProjection(f, debts, buildAttackOrder(debts, zone), start).plan;

  let modDebts = debts;
  let extraMonthlyCents = baseExtra;
  let lumpSumCents = 0;

  if (mod.kind === 'extra_mensual') {
    extraMonthlyCents = baseExtra + mod.amountCents;
  } else if (mod.kind === 'pago_unico') {
    lumpSumCents = mod.amountCents;
  } else {
    modDebts = debts.map((d) =>
      d.id === mod.debtId ? { ...d, apr: mod.newApr } : d,
    );
  }

  const order = buildAttackOrder(modDebts, zone).map((d) => d.id);
  const result = projectPayoff(modDebts, order, {
    extraMonthlyCents,
    lumpSumCents,
    start,
  });

  return { base, result, ...compareProjections(base, result) };
}
