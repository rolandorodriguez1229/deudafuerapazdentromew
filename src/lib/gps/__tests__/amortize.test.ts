import { describe, expect, it } from 'vitest';
import { addMonths, buildFullProjection, projectPayoff } from '../amortize';
import { buildAttackOrder } from '../order';
import type { DebtInput, FinanceInput } from '../types';

const START = { year: 2026, month: 8 };

function debt(id: string, over: Partial<DebtInput>): DebtInput {
  return {
    id,
    name: id,
    type: 'prestamo_plazo',
    balanceCents: 120_000,
    minPaymentCents: 10_000,
    apr: 0,
    ...over,
  };
}

describe('addMonths', () => {
  it('cruza el año', () => {
    expect(addMonths({ year: 2026, month: 11 }, 3)).toEqual({ year: 2027, month: 2 });
    expect(addMonths({ year: 2026, month: 1 }, 0)).toEqual({ year: 2026, month: 1 });
  });
});

describe('projectPayoff', () => {
  it('deuda simple sin interés: $1,200 con mínimo de $100 → 12 meses', () => {
    const d = debt('a', {});
    const r = projectPayoff([d], ['a'], { extraMonthlyCents: 0, start: START });
    expect(r.feasible).toBe(true);
    expect(r.months).toHaveLength(12);
    expect(r.debtFreeDate).toEqual(addMonths(START, 11));
    expect(r.totalInterestCents).toBe(0);
  });

  it('con interés acumula intereses y termina', () => {
    const d = debt('a', { apr: 12 }); // 1% mensual
    const r = projectPayoff([d], ['a'], { extraMonthlyCents: 0, start: START });
    expect(r.feasible).toBe(true);
    expect(r.totalInterestCents).toBeGreaterThan(0);
    expect(r.months.length).toBeGreaterThan(12);
  });

  it('tarjeta: el mínimo baja con el saldo, así que solo con mínimos tarda más', () => {
    const opts = { extraMonthlyCents: 0, start: START, snowballFreedMinimums: false };
    const card = projectPayoff([debt('card', { type: 'tarjeta' })], ['card'], opts);
    const loan = projectPayoff([debt('loan', {})], ['loan'], opts);
    expect(loan.months).toHaveLength(12); // pago fijo: $1,200 / $100
    expect(card.months.length).toBeGreaterThan(12);
    expect(card.feasible).toBe(true); // el piso de $25 la termina de liquidar
  });

  it('el extra se aplica según el orden de ataque', () => {
    const debts = [debt('primera', {}), debt('segunda', {})];
    const r = projectPayoff(debts, ['primera', 'segunda'], {
      extraMonthlyCents: 20_000,
      start: START,
    });
    const primera = r.perDebtPayoff.find((p) => p.debtId === 'primera')!;
    const segunda = r.perDebtPayoff.find((p) => p.debtId === 'segunda')!;
    expect(primera.payoffDate!.year * 12 + primera.payoffDate!.month).toBeLessThan(
      segunda.payoffDate!.year * 12 + segunda.payoffDate!.month,
    );
  });

  it('bola de nieve: el mínimo liberado acelera a la siguiente deuda', () => {
    const debts = [
      debt('chica', { balanceCents: 30_000 }),
      debt('grande', { balanceCents: 600_000, apr: 18, minPaymentCents: 12_000 }),
    ];
    const withSnowball = projectPayoff(debts, ['chica', 'grande'], {
      extraMonthlyCents: 0,
      start: START,
    });
    const without = projectPayoff(debts, ['chica', 'grande'], {
      extraMonthlyCents: 0,
      start: START,
      snowballFreedMinimums: false,
    });
    expect(withSnowball.feasible).toBe(true);
    expect(withSnowball.months.length).toBeLessThan(without.months.length);
  });

  it('fuga eterna sin extra → inviable, con la deuda atorada identificada', () => {
    // $10,000 al 24% → interés $200/mes, mínimo $150
    const d = debt('atorada', { balanceCents: 1_000_000, apr: 24, minPaymentCents: 15_000 });
    const r = projectPayoff([d], ['atorada'], { extraMonthlyCents: 0, start: START });
    expect(r.feasible).toBe(false);
    expect(r.debtFreeDate).toBeNull();
    expect(r.stuckDebtIds).toContain('atorada');
    expect(r.months.length).toBeLessThan(10); // la guarda corta rápido, no simula 600 meses
  });

  it('promoción 0%: no acumula interés hasta que vence la promo', () => {
    const d = debt('promo', {
      apr: 24,
      isPromoZero: true,
      promoEndDate: '2026-10-15', // promo cubre ago-sep-oct
      balanceCents: 500_000,
      minPaymentCents: 5_000,
    });
    const r = projectPayoff([d], ['promo'], { extraMonthlyCents: 0, start: START });
    expect(r.months[0].interestPaidCents).toBe(0); // agosto
    expect(r.months[1].interestPaidCents).toBe(0); // septiembre
    expect(r.months[2].interestPaidCents).toBe(0); // octubre
    expect(r.months[3].interestPaidCents).toBeGreaterThan(0); // noviembre
  });

  it('pago único se aplica el primer mes', () => {
    const d = debt('a', { balanceCents: 120_000, minPaymentCents: 10_000 });
    const r = projectPayoff([d], ['a'], {
      extraMonthlyCents: 0,
      lumpSumCents: 60_000,
      start: START,
    });
    expect(r.months[0].totalBalanceCents).toBe(50_000);
    expect(r.months).toHaveLength(6);
  });
});

describe('buildFullProjection', () => {
  it('plan (con flujo libre) termina antes y ahorra intereses vs solo mínimos', () => {
    const f: FinanceInput = { netIncomeCents: 400_000, essentialExpensesCents: 250_000 };
    const debts = [
      debt('tarjeta', { balanceCents: 300_000, apr: 22, minPaymentCents: 9_000 }),
      debt('auto', { balanceCents: 800_000, apr: 9, minPaymentCents: 25_000 }),
    ];
    const order = buildAttackOrder(debts, 'BOLA_DE_NIEVE');
    const full = buildFullProjection(f, debts, order, START);
    expect(full.extraMonthlyCents).toBe(400_000 - 250_000 - 34_000);
    expect(full.plan.feasible).toBe(true);
    expect(full.baseline.feasible).toBe(true);
    expect(full.plan.months.length).toBeLessThan(full.baseline.months.length);
    expect(full.interestSavedVsMinimumCents).toBeGreaterThan(0);
    expect(full.monthsSavedVsMinimum).toBeGreaterThan(0);
  });

  it('si el baseline es inviable (fuga eterna), el ahorro es null pero el plan puede ser viable', () => {
    const f: FinanceInput = { netIncomeCents: 500_000, essentialExpensesCents: 300_000 };
    const debts = [debt('fuga', { balanceCents: 1_000_000, apr: 24, minPaymentCents: 15_000 })];
    const order = buildAttackOrder(debts, 'AVALANCHA');
    const full = buildFullProjection(f, debts, order, START);
    expect(full.baseline.feasible).toBe(false);
    expect(full.plan.feasible).toBe(true);
    expect(full.interestSavedVsMinimumCents).toBeNull();
  });
});
