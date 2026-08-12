// Los ejemplos numéricos del Capítulo 9. Estas cifras están impresas en el
// libro: si un test de aquí se pone rojo, o cambió el manuscrito o se rompió
// el motor.
//
// Manuscrito de referencia: Deuda Fuera Paz Dentro v3.6.docx. El ROI de Flujo
// ordena en Déficit y en Oxígeno; el saldo menor en Bola de Nieve; la APR en
// Avalancha. Los Ejemplos 1, 2 y 3 vienen intactos desde la v2.2.

import { describe, expect, it } from 'vitest';
import {
  classifyPhase,
  computeIpd,
  estimateCardMinPaymentCents,
  freeCashFlowCents,
  isFugaEterna,
  monthlyInterestCents,
  paybackMonths,
  renegotiateTag,
  roiDeFlujo,
  totalDebtCents,
  totalMinPaymentsCents,
} from '../calc';
import { buildAttackOrder } from '../order';
import { projectPayoff } from '../amortize';
import type { DebtInput } from '../types';

function debt(over: Partial<DebtInput> & Pick<DebtInput, 'id'>): DebtInput {
  return {
    name: over.id,
    type: 'tarjeta',
    balanceCents: 0,
    minPaymentCents: 0,
    apr: 20,
    ...over,
  };
}

const byApr = (debts: DebtInput[]) =>
  [...debts].sort((a, b) => b.apr - a.apr).map((d) => d.id);

describe('Ejemplo 1 — dos deudas', () => {
  const A = debt({ id: 'A', balanceCents: 300_000, minPaymentCents: 12_000 });
  const B = debt({ id: 'B', type: 'prestamo_plazo', balanceCents: 200_000, minPaymentCents: 16_000 });

  it('ROI de Flujo y payback impresos', () => {
    expect(roiDeFlujo(A)).toBeCloseTo(0.48, 10); // 48%
    expect(paybackMonths(A)).toBeCloseTo(25, 10);
    expect(roiDeFlujo(B)).toBeCloseTo(0.96, 10); // 96%
    expect(paybackMonths(B)).toBeCloseTo(12.5, 10);
  });

  it('la decisión impresa: paga primero B (96% > 48%)', () => {
    expect(buildAttackOrder([A, B], 'OXIGENO').map((d) => d.id)).toEqual(['B', 'A']);
  });
});

describe('Ejemplo 2 — tres deudas', () => {
  const X = debt({ id: 'X', balanceCents: 450_000, minPaymentCents: 18_000, apr: 29 });
  const Y = debt({ id: 'Y', type: 'prestamo_plazo', balanceCents: 350_000, minPaymentCents: 22_000, apr: 12 });
  const Z = debt({ id: 'Z', type: 'prestamo_plazo', balanceCents: 1_200_000, minPaymentCents: 41_000, apr: 7 });

  it('la tabla rápida del libro', () => {
    expect(roiDeFlujo(X)).toBeCloseTo(0.48, 10);
    expect(paybackMonths(X)).toBeCloseTo(25.0, 1);
    expect(roiDeFlujo(Y)).toBeCloseTo(0.754, 3);
    expect(paybackMonths(Y)).toBeCloseTo(15.9, 1);
    expect(roiDeFlujo(Z)).toBeCloseTo(0.41, 10);
    expect(paybackMonths(Z)).toBeCloseTo(29.3, 1);
  });

  it('el orden impreso Y → X → Z sale del ROI de Flujo', () => {
    expect(buildAttackOrder([X, Y, Z], 'OXIGENO').map((d) => d.id)).toEqual(['Y', 'X', 'Z']);
  });

  it('y no es el orden por APR: ahí X iría primero', () => {
    expect(byApr([X, Y, Z])).toEqual(['X', 'Y', 'Z']);
    expect(buildAttackOrder([X, Y, Z], 'AVALANCHA').map((d) => d.id)).toEqual(['X', 'Y', 'Z']);
  });
});

describe('Ejemplo 3 — promo 0% con pago alto', () => {
  const promo = debt({
    id: 'promo',
    balanceCents: 100_000,
    minPaymentCents: 25_000,
    apr: 0,
    isPromoZero: true,
    promoEndDate: '2026-12-01',
  });

  it('ROI 300% y payback de 4 meses', () => {
    expect(roiDeFlujo(promo)).toBeCloseTo(3.0, 10);
    expect(paybackMonths(promo)).toBeCloseTo(4, 10);
  });

  it('la columna ¿Renegociar? la marca como "se libera sola"', () => {
    expect(renegotiateTag(promo, totalDebtCents([promo]))).toBe('se_libera_sola');
  });
});

// El ejemplo con el que Rolando fijó el criterio: mismo saldo en las tres, así
// que lo único que las separa es cuánto pago mensual devuelve cada una.
describe('Tres tarjetas del mismo saldo — el ROI no es la APR disfrazada', () => {
  const t1 = debt({ id: 't1', balanceCents: 200_000, minPaymentCents: 1_000, apr: 30 });
  const t2 = debt({ id: 't2', balanceCents: 200_000, minPaymentCents: 10_000, apr: 20 });
  const t3 = debt({ id: 't3', balanceCents: 200_000, minPaymentCents: 3_000, apr: 1 });
  const cartera = [t1, t2, t3];

  it('los ROI: 6%, 60% y 18%', () => {
    expect(roiDeFlujo(t1)).toBeCloseTo(0.06, 10);
    expect(roiDeFlujo(t2)).toBeCloseTo(0.6, 10);
    expect(roiDeFlujo(t3)).toBeCloseTo(0.18, 10);
  });

  it('en Oxígeno gana la Tarjeta 2, que devuelve $100 al mes; la APR mandaría a la 1', () => {
    expect(buildAttackOrder(cartera, 'OXIGENO')[0].id).toBe('t2');
    expect(byApr(cartera)[0]).toBe('t1');
  });

  it('la Tarjeta 1 es fuga eterna: $10 de mínimo contra $50 de interés', () => {
    expect(isFugaEterna(t1)).toBe(true);
    // En Oxígeno no se salta la fila — a ese nivel se resuelve llamando.
    expect(buildAttackOrder(cartera, 'OXIGENO')[0].id).not.toBe('t1');
    // En Bola de Nieve sí, si la llamada no dio resultado.
    expect(buildAttackOrder(cartera, 'BOLA_DE_NIEVE')[0].id).toBe('t1');
  });
});

describe('La prueba del mes 12 — la cartera impresa', () => {
  const medica = debt({ id: 'medica', type: 'prestamo_plazo', balanceCents: 180_000, minPaymentCents: 3_000, apr: 0 });
  const tienda = debt({ id: 'tienda', balanceCents: 240_000, minPaymentCents: 6_000, apr: 19.99 });
  const muebles = debt({ id: 'muebles', type: 'prestamo_plazo', balanceCents: 390_000, minPaymentCents: 32_500, apr: 14.99 });
  const personal = debt({ id: 'personal', type: 'prestamo_plazo', balanceCents: 580_000, minPaymentCents: 29_000, apr: 21.99 });
  const principal = debt({ id: 'principal', balanceCents: 840_000, minPaymentCents: 25_000, apr: 27.99 });
  const cartera = [medica, tienda, muebles, personal, principal];
  const f = { netIncomeCents: 340_000, essentialExpensesCents: 205_000 };
  const EXTRA = 39_500; // los $395 que les sobran cada mes
  const START = { year: 2026, month: 1 };

  const ordenPor = (fase: Parameters<typeof buildAttackOrder>[1]) =>
    buildAttackOrder(cartera, fase).map((d) => d.id);

  /**
   * Obligación mensual al llegar al mes 12, siguiendo el mismo cascadeo que
   * `projectPayoff`: mínimo a todas y el resto del presupuesto a la primera del
   * orden. Se replica aquí porque el motor no expone el mínimo mes a mes; el
   * test siguiente ata este cálculo al motor comparando las fechas de pago.
   */
  function obligacionMes12(order: string[]) {
    const sim = cartera.map((d) => ({ ...d, balance: d.balanceCents }));
    const byId = new Map(sim.map((d) => [d.id, d]));
    const base = sim.reduce((s2, d) => s2 + d.minPaymentCents, 0);
    const minMes = (d: (typeof sim)[number]) =>
      d.type === 'tarjeta'
        ? Math.min(d.minPaymentCents, estimateCardMinPaymentCents(d.balance, d.apr))
        : d.minPaymentCents;
    const muertas: Record<string, number> = {};
    for (let m = 1; m <= 11; m++) {
      const vivas = sim.filter((d) => d.balance > 0);
      for (const d of vivas) d.balance += Math.round((d.balance * d.apr) / 100 / 12);
      let pagado = 0;
      for (const d of vivas) {
        const pago = Math.min(minMes(d), d.balance);
        d.balance -= pago;
        pagado += pago;
      }
      let pool = EXTRA + Math.max(0, base - pagado);
      for (const id of order) {
        if (pool <= 0) break;
        const d = byId.get(id)!;
        if (d.balance <= 0) continue;
        const pago = Math.min(pool, d.balance);
        d.balance -= pago;
        pool -= pago;
      }
      for (const d of vivas) if (d.balance <= 0 && !(d.id in muertas)) muertas[d.id] = m;
    }
    const minimos = sim.filter((d) => d.balance > 0).reduce((s2, d) => s2 + minMes(d), 0);
    return { minimos, muertas };
  }

  it('los números de partida impresos', () => {
    expect(totalDebtCents(cartera)).toBe(2_230_000); // $22,300
    expect(totalMinPaymentsCents(cartera)).toBe(95_500); // $955
    expect(computeIpd(f, cartera)).toBeCloseTo(0.88, 2);
    expect(freeCashFlowCents(f, cartera)).toBe(EXTRA); // $395
    expect(classifyPhase(f, cartera)).toBe('OXIGENO');
  });

  it('los ROI de Flujo de la lista impresa', () => {
    expect(roiDeFlujo(medica)).toBeCloseTo(0.2, 10);
    expect(roiDeFlujo(tienda)).toBeCloseTo(0.3, 10);
    expect(roiDeFlujo(muebles)).toBeCloseTo(1.0, 10);
    expect(roiDeFlujo(personal)).toBeCloseTo(0.6, 10);
    expect(roiDeFlujo(principal)).toBeCloseTo(0.357, 3);
  });

  it('ninguna fuga eterna: el ejemplo mide criterios, no excepciones', () => {
    for (const d of cartera) expect(isFugaEterna(d)).toBe(false);
  });

  it('los tres criterios dan órdenes distintos — que es lo que el ejemplo necesita', () => {
    expect(ordenPor('OXIGENO')).toEqual(['muebles', 'personal', 'principal', 'tienda', 'medica']);
    expect(ordenPor('BOLA_DE_NIEVE')).toEqual(['medica', 'tienda', 'muebles', 'personal', 'principal']);
    expect(ordenPor('AVALANCHA')).toEqual(['principal', 'personal', 'tienda', 'muebles', 'medica']);
  });

  it('el desenlace impreso: $331 contra $540 contra $797', () => {
    expect(obligacionMes12(ordenPor('OXIGENO')).minimos).toBe(33_086); // $330.86 → $331
    expect(obligacionMes12(ordenPor('BOLA_DE_NIEVE')).minimos).toBe(54_000); // $540
    expect(obligacionMes12(ordenPor('AVALANCHA')).minimos).toBe(79_729); // $797.29 → $797
  });

  it('con $650 en la mano, solo la Avalancha se atrasa', () => {
    const disponible = 65_000;
    expect(disponible - obligacionMes12(ordenPor('OXIGENO')).minimos).toBe(31_914); // +$319
    expect(disponible - obligacionMes12(ordenPor('BOLA_DE_NIEVE')).minimos).toBe(11_000); // +$110
    expect(disponible - obligacionMes12(ordenPor('AVALANCHA')).minimos).toBe(-14_729); // −$147
  });

  it('quién muere y cuándo — y el motor dice lo mismo', () => {
    const casos = [
      ['OXIGENO', { muebles: 6, personal: 11 }],
      ['BOLA_DE_NIEVE', { medica: 5, tienda: 10, muebles: 11 }],
      ['AVALANCHA', {}],
    ] as const;
    for (const [fase, esperado] of casos) {
      const order = ordenPor(fase);
      expect(obligacionMes12(order).muertas).toEqual(esperado);
      // el mismo cascadeo, corrido por el motor de proyección
      const p = projectPayoff(cartera, order, { extraMonthlyCents: EXTRA, start: START, maxMonths: 11 });
      const delMotor = Object.fromEntries(
        p.perDebtPayoff
          .filter((x) => x.payoffDate !== null)
          .map((x) => [x.debtId, x.payoffDate!.month - START.month + 1]),
      );
      expect(delMotor).toEqual(esperado);
    }
  });

  it('la tarjeta principal es la candidata a renegociar de la Decisión 2', () => {
    expect(renegotiateTag(principal, totalDebtCents(cartera))).toBe('renegocia_esta');
    expect(paybackMonths(principal)).toBeCloseTo(33.6, 1);
  });
});

// ── El caso Ramírez (Capítulo 20) ─────────────────────────────────────
// Lo que el motor decide en su historia: la fase en los dos extremos del arco
// y el objetivo del mes 3. El resto del arco es aritmética de narrativa.
describe('Caso Ramírez — fase y objetivo', () => {
  // Saldos al cerrar el mes 3, ya con la APR de Capital One bajada a 19.99%
  const capone = debt({ id: 'capone', balanceCents: 405_700, minPaymentCents: 12_500, apr: 19.99 });
  const discover = debt({ id: 'discover', balanceCents: 349_400, minPaymentCents: 10_800, apr: 24.49 });
  const onemain = debt({ id: 'onemain', type: 'prestamo_plazo', balanceCents: 610_700, minPaymentCents: 28_500, apr: 29 });
  const auto = debt({ id: 'auto', type: 'prestamo_plazo', balanceCents: 1_266_300, minPaymentCents: 41_000, apr: 11.9 });
  const cartera = [capone, discover, onemain, auto];

  it('los ROI impresos del mes 3', () => {
    expect(roiDeFlujo(onemain)).toBeCloseTo(0.56, 3);
    expect(roiDeFlujo(auto)).toBeCloseTo(0.389, 3);
    expect(roiDeFlujo(discover)).toBeCloseTo(0.371, 3);
    expect(roiDeFlujo(capone)).toBeCloseTo(0.37, 3);
  });

  it('mes 3: IPD 0.96, fase Oxígeno, y el objetivo es OneMain', () => {
    const f = { netIncomeCents: 410_000, essentialExpensesCents: 302_000 };
    expect(computeIpd(f, cartera)).toBeCloseTo(0.96, 2);
    expect(classifyPhase(f, cartera)).toBe('OXIGENO');
    expect(buildAttackOrder(cartera, 'OXIGENO')[0].id).toBe('onemain');
  });

  it('mes 24: con $233 de mínimos siguen en Oxígeno — nunca cambian de criterio', () => {
    const restan = [
      debt({ id: 'capone', balanceCents: 183_800, minPaymentCents: 12_500, apr: 19.99 }),
      debt({ id: 'discover', balanceCents: 254_400, minPaymentCents: 10_800, apr: 24.49 }),
    ];
    const f = { netIncomeCents: 445_000, essentialExpensesCents: 302_000 };
    expect(totalMinPaymentsCents(restan)).toBe(23_300); // $233
    expect(computeIpd(f, restan)).toBeCloseTo(0.73, 2);
    expect(classifyPhase(f, restan)).toBe('OXIGENO');
  });
});

// ── El caso de Laura (Capítulo 12) ────────────────────────────────────
// La llamada que baja la APR. Lo que el capítulo enseña: lo que renegocias
// no es lo que atacas.
describe('Caso Laura — renegociar no es atacar', () => {
  const tarjetaA = debt({ id: 'tarjetaA', balanceCents: 740_000, minPaymentCents: 25_300, apr: 28.99 });
  const tarjetaB = debt({ id: 'tarjetaB', balanceCents: 210_000, minPaymentCents: 6_500, apr: 24.99 });
  const personal = debt({ id: 'personal', type: 'prestamo_plazo', balanceCents: 440_000, minPaymentCents: 21_500, apr: 22.99 });
  const auto = debt({ id: 'auto', type: 'prestamo_plazo', balanceCents: 930_000, minPaymentCents: 34_000, apr: 8.49 });
  const cartera = [tarjetaA, tarjetaB, personal, auto];
  const f = { netIncomeCents: 360_000, essentialExpensesCents: 230_000 };

  it('los números de partida impresos', () => {
    expect(totalDebtCents(cartera)).toBe(2_320_000); // $23,200
    expect(totalMinPaymentsCents(cartera)).toBe(87_300); // $873
    expect(computeIpd(f, cartera)).toBeCloseTo(0.88, 2);
    expect(freeCashFlowCents(f, cartera)).toBe(42_700); // $427
    expect(classifyPhase(f, cartera)).toBe('OXIGENO');
  });

  it('los cuatro ROI impresos: 41, 37, 59 y 44', () => {
    expect(roiDeFlujo(tarjetaA)).toBeCloseTo(0.41, 2);
    expect(roiDeFlujo(tarjetaB)).toBeCloseTo(0.371, 3);
    expect(roiDeFlujo(personal)).toBeCloseTo(0.586, 3);
    expect(roiDeFlujo(auto)).toBeCloseTo(0.439, 3);
  });

  it('ataca el préstamo personal — y renegocia la Tarjeta A', () => {
    expect(buildAttackOrder(cartera, 'OXIGENO')[0].id).toBe('personal');
    const total = totalDebtCents(cartera);
    expect(renegotiateTag(tarjetaA, total)).toBe('renegocia_esta');
    expect(renegotiateTag(auto, total)).toBe('renegocia_esta'); // marcado, pero al 8.49% no hay nada que pedir
    expect(renegotiateTag(personal, total)).not.toBe('renegocia_esta');
  });

  it('el reparto del pago antes y después de la llamada', () => {
    expect(monthlyInterestCents(tarjetaA)).toBe(17_877); // $179 de los $253
    const conPlan = { ...tarjetaA, apr: 9.99, minPaymentCents: 18_500 };
    expect(monthlyInterestCents(conPlan)).toBe(6_161); // $62 de los $185
    expect(conPlan.minPaymentCents - monthlyInterestCents(conPlan)).toBe(12_339); // $123 al saldo
    expect(tarjetaA.minPaymentCents - monthlyInterestCents(tarjetaA)).toBe(7_423); // $74 al saldo
  });

  it('libera $68 al mes, el IPD baja a 0.86 y la deuda objetivo NO cambia', () => {
    const despues = [{ ...tarjetaA, apr: 9.99, minPaymentCents: 18_500 }, tarjetaB, personal, auto];
    expect(totalMinPaymentsCents(despues)).toBe(80_500); // $805
    expect(87_300 - 80_500).toBe(6_800); // $68
    expect(computeIpd(f, despues)).toBeCloseTo(0.86, 2);
    expect(freeCashFlowCents(f, despues)).toBe(49_500); // $495
    expect(classifyPhase(f, despues)).toBe('OXIGENO');
    expect(buildAttackOrder(despues, 'OXIGENO')[0].id).toBe('personal');
  });
});

describe('Escenario 3 (Javier) — el override de empleo', () => {
  const auto1 = debt({ id: 'auto1', type: 'prestamo_plazo', balanceCents: 1_600_000, minPaymentCents: 43_000, apr: 8 });
  const auto2 = debt({ id: 'auto2', type: 'prestamo_plazo', balanceCents: 900_000, minPaymentCents: 35_000, apr: 8 });
  const k401 = debt({ id: '401k', type: 'prestamo_plazo', balanceCents: 750_000, minPaymentCents: 29_000, apr: 9, employmentTied: true });
  const tarjetaA = debt({ id: 'tarjetaA', balanceCents: 320_000, minPaymentCents: 13_000, apr: 24 });
  const tarjetaB = debt({ id: 'tarjetaB', balanceCents: 530_000, minPaymentCents: 22_000, apr: 22 });
  const cartera = [auto1, auto2, k401, tarjetaA, tarjetaB];

  it('los mínimos suman los $1,420 impresos', () => {
    expect(totalMinPaymentsCents(cartera)).toBe(142_000);
  });

  // El texto imprime estos dos ROI: la B gana por poco (49.8% contra 48.8%).
  it('en Oxígeno el ROI manda a la tarjeta B', () => {
    expect(roiDeFlujo(tarjetaB)).toBeCloseTo(0.498, 3);
    expect(roiDeFlujo(tarjetaA)).toBeCloseTo(0.4875, 4);
    expect(buildAttackOrder(cartera, 'OXIGENO')[0].id).toBe('tarjetaB');
  });

  it('el 401k espera: no se salta ni Oxígeno ni Bola de Nieve', () => {
    expect(buildAttackOrder(cartera, 'OXIGENO')[0].id).not.toBe('401k');
    expect(buildAttackOrder(cartera, 'BOLA_DE_NIEVE')[0].id).toBe('tarjetaA');
  });

  it('en Avalancha cobra su turno, antes del orden por APR', () => {
    const orden = buildAttackOrder(cartera, 'AVALANCHA');
    expect(orden[0].id).toBe('401k');
    expect(orden[0].reason).toBe('atada_al_empleo');
    expect(orden.slice(1).map((d) => d.id)).toEqual(['tarjetaA', 'tarjetaB', 'auto2', 'auto1']);
  });
});
