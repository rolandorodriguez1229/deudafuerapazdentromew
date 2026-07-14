// Orden de Ataque: prioriza las deudas según la zona del GPS Anti-Deuda,
// con los overrides del libro siempre activos.

import {
  isFugaEterna,
  isOverride,
  monthlyInterestCents,
  roiDeFlujo,
  utilization,
} from './calc';
import type { DebtInput, RankedDebt, Zone } from './types';

function toRanked(d: DebtInput, tier: 1 | 2 | 3, reason: RankedDebt['reason']): RankedDebt {
  return {
    ...d,
    tier,
    reason,
    flags: { fugaEterna: isFugaEterna(d), utilization: utilization(d) },
  };
}

/**
 * Tier 1: override (APR ≥ 30% o utilización > 80%), por APR descendente.
 * Tier 2: fuga eterna (mínimo ≤ interés mensual), por brecha de interés descendente.
 * Tier 3: según la zona — Oxígeno Rápido: ROI de Flujo desc · Bola de Nieve: saldo asc · Avalancha: APR desc.
 * En DÉFICIT o SIN_DEUDAS no hay orden de ataque.
 */
export function buildAttackOrder(debts: DebtInput[], zone: Zone): RankedDebt[] {
  if (zone === 'DEFICIT' || zone === 'SIN_DEUDAS') return [];

  const active = debts.filter((d) => d.balanceCents > 0);
  const tier1 = active.filter(isOverride);
  const tier2 = active.filter((d) => !isOverride(d) && isFugaEterna(d));
  const tier3 = active.filter((d) => !isOverride(d) && !isFugaEterna(d));

  tier1.sort((a, b) => b.apr - a.apr);
  tier2.sort(
    (a, b) =>
      monthlyInterestCents(b) - b.minPaymentCents - (monthlyInterestCents(a) - a.minPaymentCents),
  );

  if (zone === 'OXIGENO_RAPIDO') {
    tier3.sort((a, b) => roiDeFlujo(b) - roiDeFlujo(a));
  } else if (zone === 'BOLA_DE_NIEVE') {
    tier3.sort((a, b) => a.balanceCents - b.balanceCents);
  } else {
    tier3.sort((a, b) => b.apr - a.apr);
  }

  return [
    ...tier1.map((d) =>
      toRanked(d, 1, d.apr >= 30 ? 'override_apr' : 'override_utilizacion'),
    ),
    ...tier2.map((d) => toRanked(d, 2, 'fuga_eterna')),
    ...tier3.map((d) => toRanked(d, 3, 'zona')),
  ];
}
