// Validación compartida cliente/servidor. Los formularios trabajan en DÓLARES;
// la conversión a centavos ocurre una sola vez, en el server action.

import { z } from 'zod';

const dollars = z.coerce
  .number({ message: 'Escribe un número válido' })
  .min(0, 'No puede ser negativo')
  .max(10_000_000, 'Cifra demasiado grande');

// El literal '' va PRIMERO: z.coerce.number() convertiría '' en 0
const optionalDollars = z
  .union([z.literal(''), z.undefined(), z.null(), dollars])
  .transform((v) => (v === '' || v == null ? undefined : v));

const optionalDay = z
  .union([z.literal(''), z.undefined(), z.null(), z.coerce.number().int().min(1, 'Entre 1 y 31').max(31, 'Entre 1 y 31')])
  .transform((v) => (v === '' || v == null ? undefined : v));

export const incomeSchema = z.object({
  netIncome: dollars.refine((v) => v > 0, 'Tu ingreso neto mensual es necesario para calcular tu IPD'),
});
export type IncomeForm = z.input<typeof incomeSchema>;

export const EXPENSE_FIELDS = [
  'vivienda',
  'comida',
  'transporte',
  'servicios',
  'salud',
  'otros',
] as const;
export type ExpenseField = (typeof EXPENSE_FIELDS)[number];

export const expensesSchema = z
  .object({
    vivienda: optionalDollars,
    comida: optionalDollars,
    transporte: optionalDollars,
    servicios: optionalDollars,
    salud: optionalDollars,
    otros: optionalDollars,
    /** Alternativa: un solo total si no quiere desglosar */
    total: optionalDollars,
  })
  .refine(
    (v) =>
      (v.total ?? 0) > 0 ||
      EXPENSE_FIELDS.some((k) => (v[k] ?? 0) > 0),
    { message: 'Ingresa al menos un gasto esencial (o el total)', path: ['total'] },
  );
export type ExpensesForm = Partial<z.input<typeof expensesSchema>>;

export const DEBT_KINDS = [
  'tarjeta',
  'prestamo_personal',
  'auto',
  'estudiantil',
  'medica',
  'otra',
] as const;

export const DEBT_KIND_LABEL: Record<(typeof DEBT_KINDS)[number], string> = {
  tarjeta: 'Tarjeta de crédito',
  prestamo_personal: 'Préstamo personal',
  auto: 'Auto',
  estudiantil: 'Estudiantil',
  medica: 'Médica',
  otra: 'Otra',
};

export const debtSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, 'Ponle un nombre (ej. "Visa azul")').max(80),
    kind: z.enum(DEBT_KINDS),
    balance: dollars.refine((v) => v > 0, 'El saldo debe ser mayor a 0'),
    minPayment: dollars,
    apr: z.coerce
      .number({ message: 'Escribe el APR (%)' })
      .min(0, 'No puede ser negativo')
      .max(300, 'Verifica el APR'),
    creditLimit: optionalDollars,
    dueDay: optionalDay,
    statementDay: optionalDay,
    isPromoZero: z.coerce.boolean().default(false),
    promoEndDate: z
      .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal(''), z.undefined(), z.null()])
      .transform((v) => (v === '' || v == null ? undefined : v)),
  })
  .refine((d) => !d.isPromoZero || Boolean(d.promoEndDate), {
    message: '¿Cuándo termina la promoción 0%? La necesitamos para avisarte a tiempo',
    path: ['promoEndDate'],
  });
export type DebtForm = z.input<typeof debtSchema>;
export type DebtParsed = z.output<typeof debtSchema>;
