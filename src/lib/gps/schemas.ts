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
  /** Solo para el DTI, que es la regla del banco. El IPD usa el neto. */
  grossIncome: optionalDollars,
});
export type IncomeForm = z.input<typeof incomeSchema>;

export const EXPENSE_FIELDS = [
  'vivienda',
  'transporte',
  'comida',
  'servicios',
  'seguros',
  'cuidado_hijos',
  'remesas',
  'otros',
] as const;
export type ExpenseField = (typeof EXPENSE_FIELDS)[number];

export const expensesSchema = z
  .object({
    vivienda: optionalDollars,
    transporte: optionalDollars,
    comida: optionalDollars,
    servicios: optionalDollars,
    seguros: optionalDollars,
    cuidado_hijos: optionalDollars,
    remesas: optionalDollars,
    otros: optionalDollars,
    /** Alternativa: un solo total si no quiere desglosar */
    total: optionalDollars,
  })
  .refine(
    (v) => (v.total ?? 0) > 0 || EXPENSE_FIELDS.some((k) => (v[k] ?? 0) > 0),
    { message: 'Ingresa al menos un gasto esencial (o el total)', path: ['total'] },
  );
export type ExpensesForm = Partial<z.input<typeof expensesSchema>>;

/**
 * Tipo de deuda — obligatorio: cambia la lógica. Las tarjetas recalculan su
 * mínimo cada mes; los préstamos a plazo tienen pago fijo y fecha conocida.
 */
export const DEBT_TYPES = ['tarjeta', 'prestamo_plazo', 'otro'] as const;

/** `kind` es la columna heredada de la v1; se deriva, ya no se pregunta. */
export const KIND_FOR_TYPE: Record<(typeof DEBT_TYPES)[number], string> = {
  tarjeta: 'tarjeta',
  prestamo_plazo: 'prestamo_personal',
  otro: 'otra',
};

export const debtSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1, 'Ponle un nombre (ej. "Visa azul")').max(80),
    type: z.enum(DEBT_TYPES, { message: 'Elige el tipo de deuda' }),
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
    /** Préstamo del 401k y similares: el riesgo funciona como override. */
    employmentTied: z.coerce.boolean().default(false),
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

/** Panel de Oxígeno: resultado de una palanca. */
export const LEVER_IDS = [
  'bajar_apr',
  'programa_dificultad',
  'refinanciar_auto',
  'ingreso_extra',
  'recortar_esenciales',
  'liquidar_deuda',
] as const;

export const LEVER_STATUSES = ['pendiente', 'en_proceso', 'lograda', 'no_aplica'] as const;

export const leverResultSchema = z.object({
  lever: z.enum(LEVER_IDS),
  status: z.enum(LEVER_STATUSES),
  monthlyGain: optionalDollars,
  note: z
    .union([z.string().trim().max(280, 'Máximo 280 caracteres'), z.literal(''), z.undefined()])
    .transform((v) => (v === '' || v == null ? undefined : v)),
});
export type LeverResultForm = z.input<typeof leverResultSchema>;
