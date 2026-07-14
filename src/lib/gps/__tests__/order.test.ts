import { describe, expect, it } from 'vitest';
import { buildAttackOrder } from '../order';
import type { DebtInput } from '../types';

function debt(id: string, over: Partial<DebtInput>): DebtInput {
  return {
    id,
    name: id,
    balanceCents: 100_000,
    minPaymentCents: 5_000,
    apr: 15,
    ...over,
  };
}

describe('buildAttackOrder', () => {
  it('DÉFICIT y SIN_DEUDAS no tienen orden de ataque', () => {
    const debts = [debt('a', {})];
    expect(buildAttackOrder(debts, 'DEFICIT')).toEqual([]);
    expect(buildAttackOrder([], 'SIN_DEUDAS')).toEqual([]);
  });

  it('Avalancha: APR descendente', () => {
    const debts = [debt('bajo', { apr: 8 }), debt('alto', { apr: 24 }), debt('medio', { apr: 15 })];
    const ids = buildAttackOrder(debts, 'AVALANCHA').map((d) => d.id);
    expect(ids).toEqual(['alto', 'medio', 'bajo']);
  });

  it('Bola de Nieve: saldo ascendente', () => {
    const debts = [
      debt('grande', { balanceCents: 900_000, minPaymentCents: 20_000 }),
      debt('chica', { balanceCents: 50_000 }),
      debt('media', { balanceCents: 300_000, minPaymentCents: 8_000 }),
    ];
    const ids = buildAttackOrder(debts, 'BOLA_DE_NIEVE').map((d) => d.id);
    expect(ids).toEqual(['chica', 'media', 'grande']);
  });

  it('Oxígeno Rápido: ROI de Flujo descendente', () => {
    const debts = [
      // ROI = pago×12/saldo → a: 0.6, b: 2.4
      debt('a', { balanceCents: 100_000, minPaymentCents: 5_000 }),
      debt('b', { balanceCents: 50_000, minPaymentCents: 10_000 }),
    ];
    const ids = buildAttackOrder(debts, 'OXIGENO_RAPIDO').map((d) => d.id);
    expect(ids).toEqual(['b', 'a']);
  });

  it('override APR ≥ 30% va primero sin importar la zona', () => {
    const debts = [
      debt('chica', { balanceCents: 10_000, apr: 5 }),
      debt('cara', { balanceCents: 999_000, apr: 32 }),
    ];
    const ranked = buildAttackOrder(debts, 'BOLA_DE_NIEVE');
    expect(ranked[0].id).toBe('cara');
    expect(ranked[0].tier).toBe(1);
    expect(ranked[0].reason).toBe('override_apr');
  });

  it('override por utilización > 80%', () => {
    const debts = [
      debt('normal', { apr: 20 }),
      debt('quemada', { apr: 10, balanceCents: 90_000, creditLimitCents: 100_000 }),
    ];
    const ranked = buildAttackOrder(debts, 'AVALANCHA');
    expect(ranked[0].id).toBe('quemada');
    expect(ranked[0].reason).toBe('override_utilizacion');
  });

  it('fuga eterna es tier 2: después del override, antes de la zona', () => {
    const debts = [
      debt('normal', { apr: 12, balanceCents: 20_000 }),
      // interés mensual 25,000×24/1200 ... $12,000 al 24% → $240/mes, mínimo $200 → fuga
      debt('fuga', { apr: 24, balanceCents: 1_200_000, minPaymentCents: 20_000 }),
      debt('override', { apr: 31 }),
    ];
    const ranked = buildAttackOrder(debts, 'BOLA_DE_NIEVE');
    expect(ranked.map((d) => d.id)).toEqual(['override', 'fuga', 'normal']);
    expect(ranked[1].tier).toBe(2);
    expect(ranked[1].flags.fugaEterna).toBe(true);
  });

  it('ignora deudas con saldo 0', () => {
    const debts = [debt('pagada', { balanceCents: 0 }), debt('activa', {})];
    expect(buildAttackOrder(debts, 'AVALANCHA').map((d) => d.id)).toEqual(['activa']);
  });
});
