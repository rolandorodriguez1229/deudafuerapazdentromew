'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { dollarsToCents } from '@/lib/gps/format';
import {
  EXPENSE_FIELDS,
  debtSchema,
  expensesSchema,
  incomeSchema,
  type DebtForm,
  type ExpensesForm,
  type IncomeForm,
} from '@/lib/gps/schemas';
import { getHouseholdId } from '@/lib/gps/data';
import { createClient } from '@/lib/supabase/server';

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const GENERIC_ERROR = 'Algo salió mal. Intenta de nuevo en un momento.';

async function requireHousehold() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/diagnostico/entrar');
  const householdId = await getHouseholdId(supabase, user);
  if (!householdId) redirect('/diagnostico/entrar');
  return { supabase, user, householdId };
}

function revalidateGps() {
  revalidatePath('/diagnostico/panel');
  revalidatePath('/diagnostico/deudas');
  revalidatePath('/diagnostico/inicio');
  revalidatePath('/diagnostico/escenarios');
}

// ── Auth ──────────────────────────────────────────────────────────────

export interface MagicLinkState {
  status: 'idle' | 'sent' | 'error';
  error?: string;
}

export async function sendMagicLink(
  _prev: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const next = String(formData.get('next') ?? '/diagnostico/inicio');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 'error', error: 'Escribe un correo válido' };
  }

  const supabase = await createClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/diagnostico/inicio';
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${site}/auth/confirm?next=${encodeURIComponent(safeNext)}`,
    },
  });

  if (error) {
    console.error('[gps] sendMagicLink', error.message);
    return { status: 'error', error: GENERIC_ERROR };
  }
  return { status: 'sent' };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/diagnostico');
}

// ── Finanzas ──────────────────────────────────────────────────────────

export async function saveIncome(values: IncomeForm): Promise<ActionResult> {
  const parsed = incomeSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { supabase, householdId } = await requireHousehold();
  const { error } = await supabase.from('finances').upsert(
    {
      household_id: householdId,
      net_income_cents: dollarsToCents(parsed.data.netIncome),
      // Se preserva el valor previo si ya existía la fila
      ...(await needsExpensesDefault(supabase, householdId)),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'household_id' },
  );
  if (error) {
    console.error('[gps] saveIncome', error.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidateGps();
  return { ok: true };
}

// upsert reemplaza la fila completa: si aún no hay gastos guardados, arranca en 0
async function needsExpensesDefault(
  supabase: Awaited<ReturnType<typeof createClient>>,
  householdId: string,
): Promise<Record<string, number>> {
  const { data } = await supabase
    .from('finances')
    .select('essential_expenses_cents')
    .eq('household_id', householdId)
    .maybeSingle();
  if (data) return { essential_expenses_cents: Number(data.essential_expenses_cents) };
  return { essential_expenses_cents: 0 };
}

export async function saveExpenses(values: ExpensesForm): Promise<ActionResult> {
  const parsed = expensesSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { supabase, householdId } = await requireHousehold();

  const v = parsed.data;
  const breakdownCents: Record<string, number> = {};
  let sum = 0;
  for (const key of EXPENSE_FIELDS) {
    const amount = v[key];
    if (amount !== undefined && amount > 0) {
      breakdownCents[key] = dollarsToCents(amount);
      sum += dollarsToCents(amount);
    }
  }
  const totalCents = v.total !== undefined && v.total > 0 ? dollarsToCents(v.total) : sum;

  const { data: existing } = await supabase
    .from('finances')
    .select('net_income_cents')
    .eq('household_id', householdId)
    .maybeSingle();

  const { error } = await supabase.from('finances').upsert(
    {
      household_id: householdId,
      net_income_cents: existing ? Number(existing.net_income_cents) : 0,
      essential_expenses_cents: totalCents,
      expenses_breakdown: sum > 0 ? breakdownCents : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'household_id' },
  );
  if (error) {
    console.error('[gps] saveExpenses', error.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidateGps();
  return { ok: true };
}

// ── Deudas ────────────────────────────────────────────────────────────

export async function upsertDebt(values: DebtForm): Promise<ActionResult> {
  const parsed = debtSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { supabase, householdId } = await requireHousehold();
  const d = parsed.data;

  const row = {
    household_id: householdId,
    name: d.name,
    kind: d.kind,
    balance_cents: dollarsToCents(d.balance),
    min_payment_cents: dollarsToCents(d.minPayment),
    apr: d.apr,
    credit_limit_cents:
      d.creditLimit !== undefined && d.creditLimit > 0 ? dollarsToCents(d.creditLimit) : null,
    due_day: d.dueDay ?? null,
    statement_day: d.statementDay ?? null,
    is_promo_zero: d.isPromoZero,
    promo_end_date: d.promoEndDate ?? null,
    updated_at: new Date().toISOString(),
  };

  const query = d.id
    ? supabase.from('debts').update(row).eq('id', d.id).eq('household_id', householdId)
    : supabase.from('debts').insert(row);

  const { error } = await query;
  if (error) {
    console.error('[gps] upsertDebt', error.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidateGps();
  return { ok: true };
}

export async function deleteDebt(id: string): Promise<ActionResult> {
  const { supabase, householdId } = await requireHousehold();
  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId);
  if (error) {
    console.error('[gps] deleteDebt', error.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidateGps();
  return { ok: true };
}
