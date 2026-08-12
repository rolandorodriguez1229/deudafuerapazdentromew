// Orden de Ataque: prioriza las deudas según la FASE del GPS Anti-Deuda.
//
// El criterio de cada fase (ver `orderStrategyFor`):
//   Déficit y Oxígeno → ROI de Flujo, de mayor a menor
//   Bola de Nieve     → saldo menor
//   Avalancha         → APR más alta
//
// Sobre los overrides: en Déficit y en Oxígeno NINGUNO manda sobre el ROI.
// Cuando el mes no cierra, lo único que cuenta es liberar el mayor pago
// mensual con el menor capital posible; una deuda que crece despacio es un
// problema de mañana y una fuga eterna, a ese nivel de ingreso, no se puede
// out-pagar — se resuelve con una llamada, no con un abono. Por eso ahí
// aparecen como aviso y no reordenan nada.
//
// Los dos overrides que sí reordenan lo hacen más adelante:
//   · Fuga eterna → en Bola de Nieve. La regla del libro es llamar primero
//     para pedir una APR menor o un plan de dificultad; si el banco ayuda, la
//     deuda deja de cumplir `mínimo ≤ interés` por sí sola y este override se
//     apaga sin que nadie tenga que declararlo. Si no ayuda, va primero.
//   · Atada al empleo → en Avalancha, antes del orden por APR.
//
// Se quitaron a propósito los overrides de APR ≥ 30% y de utilización > 80%:
// el primero porque una tarjeta cara que no es fuga eterna igual va bajando y
// la Avalancha la caza cuando toca; el segundo porque es un problema de score,
// y aquí el buen crédito es consecuencia de salir de deudas, no el objetivo.

import { isFugaEterna, orderStrategyFor, roiDeFlujo, utilization } from './calc';
import type { DebtInput, OrderStrategy, Phase, RankedDebt } from './types';

function toRanked(
  d: DebtInput,
  tier: RankedDebt['tier'],
  reason: RankedDebt['reason'],
): RankedDebt {
  return {
    ...d,
    tier,
    reason,
    flags: { fugaEterna: isFugaEterna(d), utilization: utilization(d) },
  };
}

/** Comparador de la fase. Los desempates dejan el orden determinista. */
function comparator(strategy: OrderStrategy): (a: DebtInput, b: DebtInput) => number {
  if (strategy === 'roi_flujo') {
    return (a, b) =>
      roiDeFlujo(b) - roiDeFlujo(a) || a.balanceCents - b.balanceCents || a.id.localeCompare(b.id);
  }
  if (strategy === 'saldo_menor') {
    return (a, b) =>
      a.balanceCents - b.balanceCents || b.apr - a.apr || a.id.localeCompare(b.id);
  }
  return (a, b) => b.apr - a.apr || a.balanceCents - b.balanceCents || a.id.localeCompare(b.id);
}

export function buildAttackOrder(debts: DebtInput[], phase: Phase): RankedDebt[] {
  const strategy = orderStrategyFor(phase);
  if (strategy === null) return [];

  const cmp = comparator(strategy);
  const active = debts.filter((d) => d.balanceCents > 0);

  // Déficit y Oxígeno: el ROI manda solo, sin excepciones.
  if (strategy === 'roi_flujo') {
    return [...active].sort(cmp).map((d) => toRanked(d, 3, 'fase'));
  }

  const fugaPrimero = phase === 'BOLA_DE_NIEVE' || phase === 'AVALANCHA';
  const empleoPrimero = phase === 'AVALANCHA';

  const tier1 = (fugaPrimero ? active.filter(isFugaEterna) : []).sort(cmp);
  const resto = active.filter((d) => !tier1.includes(d));
  const tier2 = (empleoPrimero ? resto.filter((d) => d.employmentTied) : []).sort(cmp);
  const tier3 = resto.filter((d) => !tier2.includes(d)).sort(cmp);

  return [
    ...tier1.map((d) => toRanked(d, 1, 'fuga_eterna')),
    ...tier2.map((d) => toRanked(d, 2, 'atada_al_empleo')),
    ...tier3.map((d) => toRanked(d, 3, 'fase')),
  ];
}

/**
 * Regla de concentración: mínimo a todas, todo el extra a UNA sola deuda.
 * La interfaz muestra esta deuda grande y destacada, y las demás en gris.
 */
export function targetDebt(order: RankedDebt[]): RankedDebt | null {
  return order[0] ?? null;
}
