import { describe, expect, it } from 'vitest';
import { runScenario } from '../scenarios';
import type { DebtInput, FinanceInput } from '../types';

const START = { year: 2026, month: 8 };
const f: FinanceInput = { netIncomeCents: 400_000, essentialExpensesCents: 250_000 };

const debts: DebtInput[] = [
  {
    id: 'tarjeta',
    name: 'Tarjeta',
    type: 'tarjeta',
    balanceCents: 300_000,
    minPaymentCents: 9_000,
    apr: 22,
  },
  {
    id: 'auto',
    name: 'Auto',
    type: 'prestamo_plazo',
    balanceCents: 800_000,
    minPaymentCents: 25_000,
    apr: 9,
  },
];

describe('runScenario', () => {
  it('+$200/mes extra: termina antes y ahorra intereses', () => {
    const s = runScenario(f, debts, 'BOLA_DE_NIEVE', START, {
      kind: 'extra_mensual',
      amountCents: 20_000,
    });
    expect(s.monthsSaved).toBeGreaterThan(0);
    expect(s.interestSavedCents).toBeGreaterThan(0);
  });

  it('pago único de $1,000 acelera el plan', () => {
    const s = runScenario(f, debts, 'BOLA_DE_NIEVE', START, {
      kind: 'pago_unico',
      amountCents: 100_000,
    });
    expect(s.monthsSaved).toBeGreaterThan(0);
    expect(s.result.months[0].totalBalanceCents).toBeLessThan(
      s.base.months[0].totalBalanceCents,
    );
  });

  it('bajar el APR de la tarjeta ahorra intereses sin cambiar la fecha necesariamente', () => {
    const s = runScenario(f, debts, 'BOLA_DE_NIEVE', START, {
      kind: 'reduccion_apr',
      debtId: 'tarjeta',
      newApr: 10,
    });
    expect(s.interestSavedCents).toBeGreaterThan(0);
  });

  it('el escenario nunca modifica las deudas originales', () => {
    const before = JSON.parse(JSON.stringify(debts));
    runScenario(f, debts, 'BOLA_DE_NIEVE', START, {
      kind: 'reduccion_apr',
      debtId: 'tarjeta',
      newApr: 10,
    });
    expect(debts).toEqual(before);
  });
});
