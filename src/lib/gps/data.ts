// Carga de datos del GPS desde Supabase → tipos del motor de cálculo.
// Solo para uso en servidor (Server Components / Server Actions).

import type { SupabaseClient, User } from '@supabase/supabase-js';
import { LEVER_EFFECT } from './levers';
import type { DebtInput, FinanceInput, LeverId, LeverResult } from './types';

export interface DebtRecord extends DebtInput {
  status: 'activa' | 'pagada';
}

export type LeverStatus = 'pendiente' | 'en_proceso' | 'lograda' | 'no_aplica';

export interface LeverRecord extends LeverResult {
  status: LeverStatus;
  updatedAt: string | null;
}

export interface GpsData {
  finances: FinanceInput | null;
  expensesBreakdownCents: Record<string, number> | null;
  /** Solo deudas activas — lo que consume el motor */
  debts: DebtRecord[];
  paidDebts: DebtRecord[];
  levers: LeverRecord[];
}

interface DebtRow {
  id: string;
  name: string;
  debt_type: DebtInput['type'];
  balance_cents: number;
  min_payment_cents: number;
  apr: number;
  credit_limit_cents: number | null;
  statement_day: number | null;
  due_day: number | null;
  is_promo_zero: boolean;
  promo_end_date: string | null;
  employment_tied: boolean;
  status: 'activa' | 'pagada';
}

interface LeverRow {
  lever: LeverId;
  status: LeverStatus;
  monthly_gain_cents: number;
  note: string | null;
  updated_at: string | null;
}

const DEBT_COLUMNS =
  'id, name, debt_type, balance_cents, min_payment_cents, apr, credit_limit_cents, statement_day, due_day, is_promo_zero, promo_end_date, employment_tied, status';

function toDebt(row: DebtRow): DebtRecord {
  return {
    id: row.id,
    name: row.name,
    type: row.debt_type,
    status: row.status,
    balanceCents: Number(row.balance_cents),
    minPaymentCents: Number(row.min_payment_cents),
    apr: Number(row.apr),
    creditLimitCents: row.credit_limit_cents ? Number(row.credit_limit_cents) : null,
    statementDay: row.statement_day,
    dueDay: row.due_day,
    isPromoZero: row.is_promo_zero,
    promoEndDate: row.promo_end_date,
    employmentTied: row.employment_tied,
  };
}

function toLever(row: LeverRow): LeverRecord {
  return {
    lever: row.lever,
    status: row.status,
    monthlyGainCents: Number(row.monthly_gain_cents),
    effect: LEVER_EFFECT[row.lever],
    note: row.note,
    updatedAt: row.updated_at,
  };
}

export async function getHouseholdId(
  supabase: SupabaseClient,
  user: User,
): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single();
  return data?.household_id ?? null;
}

export async function loadGpsData(
  supabase: SupabaseClient,
  householdId: string,
): Promise<GpsData> {
  const [financesRes, debtsRes, leversRes] = await Promise.all([
    supabase
      .from('finances')
      .select('net_income_cents, gross_income_cents, essential_expenses_cents, expenses_breakdown')
      .eq('household_id', householdId)
      .maybeSingle(),
    supabase
      .from('debts')
      .select(DEBT_COLUMNS)
      .eq('household_id', householdId)
      .order('created_at', { ascending: true }),
    supabase
      .from('lever_results')
      .select('lever, status, monthly_gain_cents, note, updated_at')
      .eq('household_id', householdId),
  ]);

  const finances = financesRes.data
    ? {
        netIncomeCents: Number(financesRes.data.net_income_cents),
        essentialExpensesCents: Number(financesRes.data.essential_expenses_cents),
        grossIncomeCents:
          financesRes.data.gross_income_cents === null
            ? null
            : Number(financesRes.data.gross_income_cents),
      }
    : null;

  const all = ((debtsRes.data ?? []) as unknown as DebtRow[]).map(toDebt);
  return {
    finances,
    expensesBreakdownCents:
      (financesRes.data?.expenses_breakdown as Record<string, number> | null) ?? null,
    debts: all.filter((d) => d.status === 'activa'),
    paidDebts: all.filter((d) => d.status === 'pagada'),
    levers: ((leversRes.data ?? []) as unknown as LeverRow[]).map(toLever),
  };
}
