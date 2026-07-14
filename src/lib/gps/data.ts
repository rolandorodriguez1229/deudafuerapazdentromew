// Carga de datos del GPS desde Supabase → tipos del motor de cálculo.
// Solo para uso en servidor (Server Components / Server Actions).

import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { DebtInput, FinanceInput } from './types';

export interface DebtRecord extends DebtInput {
  kind: string;
  status: 'activa' | 'pagada';
}

export interface GpsData {
  finances: FinanceInput | null;
  expensesBreakdownCents: Record<string, number> | null;
  /** Solo deudas activas — lo que consume el motor */
  debts: DebtRecord[];
  paidDebts: DebtRecord[];
}

interface DebtRow {
  id: string;
  name: string;
  kind: string;
  balance_cents: number;
  min_payment_cents: number;
  apr: number;
  credit_limit_cents: number | null;
  statement_day: number | null;
  due_day: number | null;
  is_promo_zero: boolean;
  promo_end_date: string | null;
  status: 'activa' | 'pagada';
}

function toDebt(row: DebtRow): DebtRecord {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    status: row.status,
    balanceCents: Number(row.balance_cents),
    minPaymentCents: Number(row.min_payment_cents),
    apr: Number(row.apr),
    creditLimitCents: row.credit_limit_cents ? Number(row.credit_limit_cents) : null,
    statementDay: row.statement_day,
    dueDay: row.due_day,
    isPromoZero: row.is_promo_zero,
    promoEndDate: row.promo_end_date,
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
  const [financesRes, debtsRes] = await Promise.all([
    supabase
      .from('finances')
      .select('net_income_cents, essential_expenses_cents, expenses_breakdown')
      .eq('household_id', householdId)
      .maybeSingle(),
    supabase
      .from('debts')
      .select(
        'id, name, kind, balance_cents, min_payment_cents, apr, credit_limit_cents, statement_day, due_day, is_promo_zero, promo_end_date, status',
      )
      .eq('household_id', householdId)
      .order('created_at', { ascending: true }),
  ]);

  const finances = financesRes.data
    ? {
        netIncomeCents: Number(financesRes.data.net_income_cents),
        essentialExpensesCents: Number(financesRes.data.essential_expenses_cents),
      }
    : null;

  const all = ((debtsRes.data ?? []) as DebtRow[]).map(toDebt);
  return {
    finances,
    expensesBreakdownCents:
      (financesRes.data?.expenses_breakdown as Record<string, number> | null) ?? null,
    debts: all.filter((d) => d.status === 'activa'),
    paidDebts: all.filter((d) => d.status === 'pagada'),
  };
}
