import { describe, expect, it } from 'vitest';
import {
  airGainedCents,
  classifyPhase,
  computeDti,
  computeIpd,
  diagnose,
  diagnoseDebts,
  estimateCardMinPaymentCents,
  fondoEsbeltoCents,
  freeCashFlowCents,
  ipdWithLevers,
  isFugaEterna,
  metaDeOxigeno,
  monthlyInterestCents,
  numeroDePazCents,
  orderStrategyFor,
  paybackMonths,
  promoAlert,
  renegotiateTag,
  roiDeFlujo,
  utilization,
  utilizationBand,
} from '../calc';
import type { DebtInput, FinanceInput } from '../types';

function debt(over: Partial<DebtInput>): DebtInput {
  return {
    id: 'd1',
    name: 'Tarjeta',
    type: 'tarjeta',
    balanceCents: 100000,
    minPaymentCents: 5000,
    apr: 20,
    ...over,
  };
}

// income $4,000 — essentials+mins ajustados para dar el IPD exacto
function scenario(ipd: number): { f: FinanceInput; debts: DebtInput[] } {
  const income = 400_000;
  const target = Math.round(income * ipd);
  const mins = 20_000;
  return {
    f: { netIncomeCents: income, essentialExpensesCents: target - mins },
    debts: [debt({ minPaymentCents: mins })],
  };
}

describe('IPD (fórmula del libro)', () => {
  it('IPD = (esenciales + mínimos) / ingreso — los gastos no esenciales no entran', () => {
    const f = { netIncomeCents: 400_000, essentialExpensesCents: 200_000 };
    const debts = [debt({ minPaymentCents: 50_000 })];
    expect(computeIpd(f, debts)).toBeCloseTo(0.625, 10);
  });

  it('ingreso cero → null: nunca dividimos entre cero', () => {
    expect(computeIpd({ netIncomeCents: 0, essentialExpensesCents: 1 }, [])).toBeNull();
  });
});

describe('Fases del Selector', () => {
  it.each([
    [0.44, 'AVALANCHA'],
    [0.45, 'BOLA_DE_NIEVE'],
    [0.69, 'BOLA_DE_NIEVE'],
    [0.7, 'OXIGENO'],
    [1.0, 'OXIGENO'],
    [1.01, 'DEFICIT'],
  ])('IPD %f → %s', (ipd, phase) => {
    const { f, debts } = scenario(ipd);
    expect(classifyPhase(f, debts)).toBe(phase);
  });

  it('sin deudas → SIN_DEUDAS aunque el IPD sea alto', () => {
    const f = { netIncomeCents: 100_000, essentialExpensesCents: 99_000 };
    expect(classifyPhase(f, [])).toBe('SIN_DEUDAS');
  });

  it('con deudas pero sin ingreso → SIN_INGRESO (mensaje especial)', () => {
    const f = { netIncomeCents: 0, essentialExpensesCents: 100_000 };
    expect(classifyPhase(f, [debt({})])).toBe('SIN_INGRESO');
  });

  it('flujo libre ≤ 5% del ingreso también dispara Oxígeno', () => {
    const { f, debts } = scenario(0.96);
    expect(freeCashFlowCents(f, debts)).toBeLessThanOrEqual(0.05 * f.netIncomeCents);
    expect(classifyPhase(f, debts)).toBe('OXIGENO');
  });

  it('una deuda con saldo 0 no cuenta como deuda', () => {
    const f = { netIncomeCents: 400_000, essentialExpensesCents: 100_000 };
    expect(classifyPhase(f, [debt({ balanceCents: 0 })])).toBe('SIN_DEUDAS');
  });
});

describe('Criterio de orden por fase', () => {
  it('Déficit y Oxígeno comparten criterio: el ROI de Flujo', () => {
    expect(orderStrategyFor('DEFICIT')).toBe('roi_flujo');
    expect(orderStrategyFor('OXIGENO')).toBe('roi_flujo');
  });

  it('Bola de Nieve ordena por saldo menor y Avalancha por APR', () => {
    expect(orderStrategyFor('BOLA_DE_NIEVE')).toBe('saldo_menor');
    expect(orderStrategyFor('AVALANCHA')).toBe('apr_mas_alta');
  });

  it('sin deudas o sin ingreso no hay orden', () => {
    expect(orderStrategyFor('SIN_DEUDAS')).toBeNull();
    expect(orderStrategyFor('SIN_INGRESO')).toBeNull();
  });
});

describe('Número de Paz y Meta de Oxígeno', () => {
  const debts = [debt({ minPaymentCents: 50_000 })];

  it('Número de Paz = (esenciales + mínimos) × 1.05', () => {
    const f = { netIncomeCents: 400_000, essentialExpensesCents: 200_000 };
    expect(numeroDePazCents(f, debts)).toBe(262_500);
  });

  it('Meta de Oxígeno en dos etapas: cubrir el mes, luego el colchón del 5%', () => {
    const f = { netIncomeCents: 240_000, essentialExpensesCents: 200_000 };
    const meta = metaDeOxigeno(f, debts);
    expect(meta).not.toBeNull();
    expect(meta!.totalCents).toBe(22_500);
    expect(meta!.stage1Cents).toBe(10_000); // 250,000 del mes − 240,000 de ingreso
    expect(meta!.stage2Cents).toBe(12_500); // el colchón del 5%
  });

  it('null cuando el ingreso ya cubre el Número de Paz', () => {
    const f = { netIncomeCents: 400_000, essentialExpensesCents: 200_000 };
    expect(metaDeOxigeno(f, debts)).toBeNull();
  });

  it('si el ingreso cubre el mes pero no el colchón, etapa 1 es 0', () => {
    const f = { netIncomeCents: 255_000, essentialExpensesCents: 200_000 };
    const meta = metaDeOxigeno(f, debts);
    expect(meta!.stage1Cents).toBe(0);
    expect(meta!.stage2Cents).toBe(7_500);
  });
});

describe('Fuga eterna', () => {
  it('mínimo ≤ interés mensual → fuga eterna', () => {
    // $12,000 al 30% APR → interés mensual $300
    const d = debt({ balanceCents: 1_200_000, apr: 30, minPaymentCents: 30_000 });
    expect(monthlyInterestCents(d)).toBe(30_000);
    expect(isFugaEterna(d)).toBe(true);
    expect(isFugaEterna({ ...d, minPaymentCents: 30_001 })).toBe(false);
  });

  it('promoción 0% no es fuga eterna', () => {
    const d = debt({ balanceCents: 1_200_000, apr: 30, minPaymentCents: 100, isPromoZero: true });
    expect(isFugaEterna(d)).toBe(false);
  });
});

describe('Utilización y override', () => {
  it('bandas del semáforo', () => {
    expect(utilizationBand(0.08)).toBe('ideal');
    expect(utilizationBand(0.09)).toBe('aceptable');
    expect(utilizationBand(0.29)).toBe('aceptable');
    expect(utilizationBand(0.3)).toBe('alta');
    expect(utilizationBand(0.8)).toBe('alta');
    expect(utilizationBand(0.801)).toBe('critica');
  });

  it('utilización = saldo / límite; null sin límite', () => {
    expect(utilization(debt({ balanceCents: 40_000, creditLimitCents: 100_000 }))).toBe(0.4);
    expect(utilization(debt({}))).toBeNull();
  });

  it('saldo por arriba del límite: utilización > 1, y solo es informativo', () => {
    const d = debt({ balanceCents: 110_000, creditLimitCents: 100_000, apr: 10 });
    expect(utilization(d)).toBeCloseTo(1.1, 10);
    expect(utilizationBand(1.1)).toBe('critica');
  });

  it('estar atada al empleo se marca en el diagnóstico', () => {
    const k401 = debt({ type: 'prestamo_plazo', apr: 9, employmentTied: true });
    expect(diagnoseDebts([k401], '2026-08-12')[0].employmentTied).toBe(true);
    expect(
      diagnoseDebts([debt({ balanceCents: 0, employmentTied: true })], '2026-08-12')[0]
        .employmentTied,
    ).toBe(false);
  });
});

describe('ROI de Flujo, Payback, DTI, Fondo esbelto', () => {
  it('ROI de Flujo = pago×12 / saldo; Payback = saldo / pago', () => {
    const d = debt({ balanceCents: 120_000, minPaymentCents: 10_000 });
    expect(roiDeFlujo(d)).toBe(1);
    expect(paybackMonths(d)).toBe(12);
  });

  it('pago mínimo mayor al saldo: payback menor a 1 mes, sin explotar', () => {
    const d = debt({ balanceCents: 5_000, minPaymentCents: 20_000 });
    expect(paybackMonths(d)).toBeCloseTo(0.25, 10);
    expect(renegotiateTag(d, 5_000)).toBe('se_libera_sola');
  });

  it('DTI usa el ingreso BRUTO, no el neto', () => {
    const f = {
      netIncomeCents: 400_000,
      essentialExpensesCents: 0,
      grossIncomeCents: 500_000,
    };
    expect(computeDti(f, [debt({ minPaymentCents: 100_000 })])).toBe(0.2);
  });

  it('sin ingreso bruto capturado, el DTI no se calcula', () => {
    const f = { netIncomeCents: 400_000, essentialExpensesCents: 0 };
    expect(computeDti(f, [debt({ minPaymentCents: 100_000 })])).toBeNull();
  });

  it('Fondo esbelto = 0.5–2 meses de esenciales', () => {
    const f = { netIncomeCents: 0, essentialExpensesCents: 200_000 };
    expect(fondoEsbeltoCents(f)).toEqual({ minCents: 100_000, maxCents: 400_000 });
  });
});

describe('Autocálculo del pago mínimo de tarjeta', () => {
  it('1% del saldo + interés del mes', () => {
    // $5,000 al 24% → $50 + $100 = $150
    expect(estimateCardMinPaymentCents(500_000, 24)).toBe(15_000);
  });

  it('nunca baja del piso de $25', () => {
    expect(estimateCardMinPaymentCents(10_000, 0)).toBe(2_500);
  });

  it('saldo 0 → 0', () => {
    expect(estimateCardMinPaymentCents(0, 24)).toBe(0);
  });
});

describe('Columna ¿Renegociar?', () => {
  const total = 1_000_000;

  it('payback ≤ 6 meses → se libera sola', () => {
    expect(renegotiateTag(debt({ balanceCents: 60_000, minPaymentCents: 10_000 }), total)).toBe(
      'se_libera_sola',
    );
  });

  it('ROI ≥ 100% (y payback > 6) → te está apretando', () => {
    // payback 10 meses → ROI 120%
    expect(renegotiateTag(debt({ balanceCents: 100_000, minPaymentCents: 10_000 }), total)).toBe(
      'te_esta_apretando',
    );
  });

  it('ROI < 50% y saldo > 25% del total → renegocia esta', () => {
    // ROI 24%, saldo 300k sobre un total de 1M
    expect(renegotiateTag(debt({ balanceCents: 300_000, minPaymentCents: 6_000 }), total)).toBe(
      'renegocia_esta',
    );
  });

  it('ROI < 50% pero saldo chico → sin recomendación', () => {
    expect(renegotiateTag(debt({ balanceCents: 100_000, minPaymentCents: 2_000 }), total)).toBeNull();
  });
});

describe('Aviso de fin de promoción 0%', () => {
  const d = debt({ isPromoZero: true, promoEndDate: '2026-09-15' });

  it.each([
    ['2026-08-06', 40, 60],
    ['2026-09-10', 5, 7],
    ['2026-08-20', 26, 30],
  ])('desde %s faltan %i días → umbral %i', (today, daysLeft, level) => {
    expect(promoAlert(d, today as string)).toEqual({ daysLeft, level });
  });

  it('a más de 60 días todavía no avisa', () => {
    expect(promoAlert(d, '2026-06-01')).toBeNull();
  });

  it('vencida ya no avisa', () => {
    expect(promoAlert(d, '2026-09-20')).toBeNull();
  });

  it('sin promo no hay aviso', () => {
    expect(promoAlert(debt({}), '2026-08-06')).toBeNull();
  });
});

describe('Panel de Oxígeno: aire ganado', () => {
  const f = { netIncomeCents: 400_000, essentialExpensesCents: 200_000 };
  const debts = [debt({ minPaymentCents: 50_000 })];

  it('una palanca de ingreso sube el denominador', () => {
    const ipd = ipdWithLevers(f, debts, [
      { lever: 'ingreso_extra', monthlyGainCents: 50_000, effect: 'ingreso' },
    ]);
    expect(ipd).toBeCloseTo(250_000 / 450_000, 10);
  });

  it('una palanca de gasto baja el numerador', () => {
    const ipd = ipdWithLevers(f, debts, [
      { lever: 'bajar_apr', monthlyGainCents: 50_000, effect: 'gasto' },
    ]);
    expect(ipd).toBeCloseTo(0.5, 10);
  });

  it('el aire ganado suma todas las palancas', () => {
    expect(
      airGainedCents([
        { lever: 'bajar_apr', monthlyGainCents: 3_000, effect: 'gasto' },
        { lever: 'ingreso_extra', monthlyGainCents: 20_000, effect: 'ingreso' },
      ]),
    ).toBe(23_000);
  });

  it('sin palancas el IPD no se mueve', () => {
    expect(ipdWithLevers(f, debts, [])).toBeCloseTo(computeIpd(f, debts)!, 10);
  });
});

describe('diagnose', () => {
  it('arma el resumen completo', () => {
    const f = { netIncomeCents: 400_000, essentialExpensesCents: 200_000 };
    const debts = [debt({ minPaymentCents: 50_000 })];
    const s = diagnose(f, debts);
    expect(s.ipd).toBeCloseTo(0.625);
    expect(s.phase).toBe('BOLA_DE_NIEVE');
    expect(s.orderStrategy).toBe('saldo_menor');
    expect(s.totalDebtCents).toBe(100_000);
    expect(s.totalMinPaymentsCents).toBe(50_000);
    expect(s.freeCashFlowCents).toBe(150_000);
  });

  it('diagnoseDebts marca fuga eterna y utilización por deuda', () => {
    const rows = diagnoseDebts(
      [
        // $2,000 al 32% → interés $53.33 al mes; el mínimo de $60 sí reduce capital
        debt({ id: 'a', apr: 32, balanceCents: 200_000, minPaymentCents: 6_000 }),
        // mismo saldo y APR, pero con un mínimo de $50: el capital nunca baja
        debt({ id: 'b', apr: 32, balanceCents: 200_000, minPaymentCents: 5_000 }),
        debt({ id: 'c', apr: 10, balanceCents: 90_000, creditLimitCents: 100_000 }),
      ],
      '2026-08-06',
    );
    expect(rows[0].fugaEterna).toBe(false);
    expect(rows[1].fugaEterna).toBe(true);
    expect(rows[2].utilizationBand).toBe('critica');
  });
});
