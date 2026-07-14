import { describe, expect, it } from 'vitest';
import {
  classifyZone,
  computeDti,
  computeIpd,
  diagnose,
  fondoEsbeltoCents,
  freeCashFlowCents,
  isFugaEterna,
  isOverride,
  metaDeOxigeno,
  monthlyInterestCents,
  numeroDePazCents,
  paybackMonths,
  roiDeFlujo,
  utilization,
  utilizationBand,
} from '../calc';
import type { DebtInput, FinanceInput } from '../types';

function debt(over: Partial<DebtInput>): DebtInput {
  return {
    id: 'd1',
    name: 'Tarjeta',
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

  it('ingreso cero → Infinity (déficit)', () => {
    expect(computeIpd({ netIncomeCents: 0, essentialExpensesCents: 1 }, [])).toBe(Infinity);
  });
});

describe('Zonas del Selector', () => {
  it.each([
    [0.44, 'AVALANCHA'],
    [0.45, 'BOLA_DE_NIEVE'],
    [0.69, 'BOLA_DE_NIEVE'],
    [0.7, 'OXIGENO_RAPIDO'],
    [1.0, 'OXIGENO_RAPIDO'],
    [1.01, 'DEFICIT'],
  ])('IPD %f → %s', (ipd, zone) => {
    const { f, debts } = scenario(ipd);
    expect(classifyZone(f, debts)).toBe(zone);
  });

  it('sin deudas → SIN_DEUDAS aunque el IPD sea alto', () => {
    const f = { netIncomeCents: 100_000, essentialExpensesCents: 99_000 };
    expect(classifyZone(f, [])).toBe('SIN_DEUDAS');
  });

  it('flujo libre ≤ 5% del ingreso también dispara Oxígeno Rápido', () => {
    const { f, debts } = scenario(0.96);
    expect(freeCashFlowCents(f, debts)).toBeLessThanOrEqual(0.05 * f.netIncomeCents);
    expect(classifyZone(f, debts)).toBe('OXIGENO_RAPIDO');
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

  it('override: APR ≥ 30% o utilización > 80%', () => {
    expect(isOverride(debt({ apr: 30 }))).toBe(true);
    expect(isOverride(debt({ apr: 29.99 }))).toBe(false);
    expect(
      isOverride(debt({ apr: 10, balanceCents: 81_000, creditLimitCents: 100_000 })),
    ).toBe(true);
    expect(
      isOverride(debt({ apr: 10, balanceCents: 80_000, creditLimitCents: 100_000 })),
    ).toBe(false);
  });
});

describe('ROI de Flujo, Payback, DTI, Fondo esbelto', () => {
  it('ROI de Flujo = pago×12 / saldo; Payback = saldo / pago', () => {
    const d = debt({ balanceCents: 120_000, minPaymentCents: 10_000 });
    expect(roiDeFlujo(d)).toBe(1);
    expect(paybackMonths(d)).toBe(12);
  });

  it('DTI = mínimos / ingreso', () => {
    const f = { netIncomeCents: 400_000, essentialExpensesCents: 0 };
    expect(computeDti(f, [debt({ minPaymentCents: 100_000 })])).toBe(0.25);
  });

  it('Fondo esbelto = 0.5–2 meses de esenciales', () => {
    const f = { netIncomeCents: 0, essentialExpensesCents: 200_000 };
    expect(fondoEsbeltoCents(f)).toEqual({ minCents: 100_000, maxCents: 400_000 });
  });
});

describe('diagnose', () => {
  it('arma el resumen completo', () => {
    const f = { netIncomeCents: 400_000, essentialExpensesCents: 200_000 };
    const debts = [debt({ minPaymentCents: 50_000 })];
    const s = diagnose(f, debts);
    expect(s.ipd).toBeCloseTo(0.625);
    expect(s.zone).toBe('BOLA_DE_NIEVE');
    expect(s.totalDebtCents).toBe(100_000);
    expect(s.totalMinPaymentsCents).toBe(50_000);
    expect(s.freeCashFlowCents).toBe(150_000);
  });
});
