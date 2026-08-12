import { describe, expect, it } from 'vitest';
import { buildAttackOrder, targetDebt } from '../order';
import type { DebtInput } from '../types';

function debt(id: string, over: Partial<DebtInput>): DebtInput {
  return {
    id,
    name: id,
    type: 'tarjeta',
    balanceCents: 100_000,
    minPaymentCents: 5_000,
    apr: 15,
    ...over,
  };
}

describe('Criterio de cada fase', () => {
  it('SIN_DEUDAS y SIN_INGRESO no tienen orden de ataque', () => {
    expect(buildAttackOrder([debt('a', {})], 'SIN_INGRESO')).toEqual([]);
    expect(buildAttackOrder([], 'SIN_DEUDAS')).toEqual([]);
  });

  // El mismo saldo en las tres: lo único que las separa es cuánto pago
  // mensual devuelve cada una. Es el ejemplo que da Rolando.
  const tresIguales = [
    debt('t1', { balanceCents: 200_000, minPaymentCents: 1_000, apr: 30 }),
    debt('t2', { balanceCents: 200_000, minPaymentCents: 10_000, apr: 20 }),
    debt('t3', { balanceCents: 200_000, minPaymentCents: 3_000, apr: 1 }),
  ];

  it('Déficit ordena por ROI de Flujo', () => {
    expect(buildAttackOrder(tresIguales, 'DEFICIT').map((d) => d.id)).toEqual(['t2', 't3', 't1']);
  });

  it('Oxígeno ordena por ROI de Flujo, igual que Déficit', () => {
    expect(buildAttackOrder(tresIguales, 'OXIGENO').map((d) => d.id)).toEqual(['t2', 't3', 't1']);
  });

  it('el ROI de Flujo NO es la APR disfrazada', () => {
    const porRoi = buildAttackOrder(tresIguales, 'OXIGENO').map((d) => d.id);
    const porApr = [...tresIguales].sort((a, b) => b.apr - a.apr).map((d) => d.id);
    expect(porApr).toEqual(['t1', 't2', 't3']);
    expect(porRoi).not.toEqual(porApr);
  });

  it('Bola de Nieve ordena por saldo menor', () => {
    const debts = [
      debt('grande', { balanceCents: 900_000, minPaymentCents: 20_000 }),
      debt('chica', { balanceCents: 50_000 }),
      debt('media', { balanceCents: 300_000, minPaymentCents: 8_000 }),
    ];
    expect(buildAttackOrder(debts, 'BOLA_DE_NIEVE').map((d) => d.id)).toEqual([
      'chica',
      'media',
      'grande',
    ]);
  });

  it('Avalancha ordena por APR más alta', () => {
    const debts = [debt('bajo', { apr: 8 }), debt('alto', { apr: 24 }), debt('medio', { apr: 15 })];
    expect(buildAttackOrder(debts, 'AVALANCHA').map((d) => d.id)).toEqual([
      'alto',
      'medio',
      'bajo',
    ]);
  });

  it('ignora deudas con saldo 0', () => {
    const debts = [debt('pagada', { balanceCents: 0 }), debt('activa', {})];
    expect(buildAttackOrder(debts, 'OXIGENO').map((d) => d.id)).toEqual(['activa']);
  });
});

describe('Overrides: cuándo mandan y cuándo no', () => {
  // $12,000 al 24% → interés $240/mes contra un mínimo de $200: crece aunque pagues.
  // Y su ROI es bajísimo (2%), así que el ROI la manda hasta el final.
  const fuga = debt('fuga', { balanceCents: 1_200_000, minPaymentCents: 20_000, apr: 24 });
  const chica = debt('chica', { balanceCents: 90_000, minPaymentCents: 9_000, apr: 22 });
  const media = debt('media', { balanceCents: 400_000, minPaymentCents: 15_000, apr: 12 });
  const cartera = [fuga, chica, media];

  it('en Déficit la fuga eterna NO se salta la fila: manda el ROI', () => {
    expect(buildAttackOrder(cartera, 'DEFICIT')[0].id).toBe('chica');
    expect(buildAttackOrder(cartera, 'DEFICIT').at(-1)!.id).toBe('fuga');
  });

  it('en Oxígeno tampoco: a ese nivel la fuga eterna se resuelve llamando, no abonando', () => {
    const orden = buildAttackOrder(cartera, 'OXIGENO');
    expect(orden[0].id).toBe('chica');
    expect(orden.every((d) => d.reason === 'fase')).toBe(true);
  });

  it('en Bola de Nieve la fuga eterna sí va primero', () => {
    const orden = buildAttackOrder(cartera, 'BOLA_DE_NIEVE');
    expect(orden[0].id).toBe('fuga');
    expect(orden[0].tier).toBe(1);
    expect(orden[0].reason).toBe('fuga_eterna');
    expect(orden.slice(1).map((d) => d.id)).toEqual(['chica', 'media']);
  });

  // Si el banco baja la APR, el mínimo deja de ser menor que el interés y la
  // deuda deja de ser fuga eterna sola. El override se apaga sin que nadie
  // tenga que declarar nada: basta con actualizar el APR después de la llamada.
  it('si la llamada da resultado, el override se apaga solo', () => {
    const ayudada = cartera.map((d) => (d.id === 'fuga' ? { ...d, apr: 12 } : d));
    const orden = buildAttackOrder(ayudada, 'BOLA_DE_NIEVE');
    expect(orden[0].id).toBe('chica');
    expect(orden.every((d) => d.reason === 'fase')).toBe(true);
  });

  it('un APR de 30% o más ya no es override en ninguna fase', () => {
    const debts = [
      debt('cara', { balanceCents: 800_000, minPaymentCents: 30_000, apr: 32 }),
      debt('chica', { balanceCents: 60_000, minPaymentCents: 5_000, apr: 10 }),
    ];
    expect(buildAttackOrder(debts, 'BOLA_DE_NIEVE')[0].id).toBe('chica');
    expect(buildAttackOrder(debts, 'OXIGENO')[0].id).toBe('chica'); // ROI 100% vs 45%
  });

  it('la utilización arriba del 80% tampoco reordena: es un tema de score', () => {
    const debts = [
      debt('quemada', { balanceCents: 95_000, minPaymentCents: 3_000, creditLimitCents: 100_000 }),
      debt('normal', { balanceCents: 200_000, minPaymentCents: 20_000 }),
    ];
    expect(buildAttackOrder(debts, 'BOLA_DE_NIEVE')[0].id).toBe('quemada'); // por saldo, no por override
    expect(buildAttackOrder(debts, 'AVALANCHA')[0].reason).toBe('fase');
  });
});

describe('Override de la Avalancha: deuda atada al empleo', () => {
  const k401 = debt('401k', {
    type: 'prestamo_plazo',
    balanceCents: 750_000,
    minPaymentCents: 29_000,
    apr: 9,
    employmentTied: true,
  });
  const cara = debt('cara', { balanceCents: 300_000, minPaymentCents: 12_000, apr: 26 });
  const chica = debt('chica', { balanceCents: 120_000, minPaymentCents: 6_000, apr: 18 });
  const cartera = [k401, cara, chica];

  it('espera su turno en Déficit, Oxígeno y Bola de Nieve', () => {
    expect(buildAttackOrder(cartera, 'OXIGENO')[0].id).not.toBe('401k');
    expect(buildAttackOrder(cartera, 'BOLA_DE_NIEVE')[0].id).toBe('chica');
  });

  it('en Avalancha va primero, antes del orden por APR', () => {
    const orden = buildAttackOrder(cartera, 'AVALANCHA');
    expect(orden[0].id).toBe('401k');
    expect(orden[0].tier).toBe(2);
    expect(orden[0].reason).toBe('atada_al_empleo');
    expect(orden.slice(1).map((d) => d.id)).toEqual(['cara', 'chica']);
  });

  it('una fuga eterna le gana al override de empleo: esa crece hoy', () => {
    const fuga = debt('fuga', { balanceCents: 1_200_000, minPaymentCents: 20_000, apr: 24 });
    const orden = buildAttackOrder([...cartera, fuga], 'AVALANCHA');
    expect(orden.map((d) => d.id).slice(0, 2)).toEqual(['fuga', '401k']);
  });
});

describe('Regla de concentración', () => {
  it('apunta a una sola deuda objetivo', () => {
    const debts = [
      debt('a', { balanceCents: 400_000, minPaymentCents: 15_000 }),
      debt('b', { balanceCents: 100_000, minPaymentCents: 9_000 }),
    ];
    expect(targetDebt(buildAttackOrder(debts, 'OXIGENO'))!.id).toBe('b');
    expect(targetDebt([])).toBeNull();
  });
});
