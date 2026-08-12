'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, normalizeLocale } from '@/lib/i18n';
import { dollarsToCents } from '@/lib/gps/format';
import { LEVER_EFFECT } from '@/lib/gps/levers';
import {
  EXPENSE_FIELDS,
  KIND_FOR_TYPE,
  debtSchema,
  expensesSchema,
  incomeSchema,
  leverResultSchema,
  type DebtForm,
  type ExpensesForm,
  type IncomeForm,
  type LeverResultForm,
} from '@/lib/gps/schemas';
import { getHouseholdId } from '@/lib/gps/data';
import { trackEvent } from '@/lib/gps/events';
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
  revalidatePath('/diagnostico/oxigeno');
  revalidatePath('/diagnostico/deudas');
  revalidatePath('/diagnostico/inicio');
  revalidatePath('/diagnostico/escenarios');
}

// ── Idioma ────────────────────────────────────────────────────────────

export async function setLocaleFromForm(formData: FormData): Promise<void> {
  const locale = normalizeLocale(String(formData.get('locale') ?? ''));
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
  });
  revalidatePath('/diagnostico', 'layout');
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

/**
 * Borra la cuenta y TODOS los datos financieros. Los datos del usuario son
 * sensibles: esta opción tiene que existir, ser visible y funcionar de verdad.
 * El borrado del usuario en auth arrastra el perfil, y el perfil arrastra
 * (on delete cascade) finanzas, deudas, palancas, eventos y check-ins.
 */
export async function deleteAccountAndData(): Promise<ActionResult> {
  const { supabase, user, householdId } = await requireHousehold();

  const { createAdminClient } = await import('@/lib/supabase/admin');
  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error('[gps] deleteAccount: falta el service role', err);
    return { ok: false, error: GENERIC_ERROR };
  }

  const { error: userError } = await admin.auth.admin.deleteUser(user.id);
  if (userError) {
    console.error('[gps] deleteAccount', userError.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  // El hogar no cuelga de auth.users, así que se borra explícitamente; sus
  // tablas hijas van en cascada.
  const { error: householdError } = await admin
    .from('households')
    .delete()
    .eq('id', householdId);
  if (householdError) console.error('[gps] deleteAccount household', householdError.message);

  await supabase.auth.signOut();
  redirect('/diagnostico?borrada=1');
}

// ── Finanzas ──────────────────────────────────────────────────────────

export async function saveIncome(values: IncomeForm): Promise<ActionResult> {
  const parsed = incomeSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { supabase, householdId } = await requireHousehold();
  const { data: existing } = await supabase
    .from('finances')
    .select('essential_expenses_cents')
    .eq('household_id', householdId)
    .maybeSingle();

  const { error } = await supabase.from('finances').upsert(
    {
      household_id: householdId,
      net_income_cents: dollarsToCents(parsed.data.netIncome),
      gross_income_cents:
        parsed.data.grossIncome !== undefined ? dollarsToCents(parsed.data.grossIncome) : null,
      // upsert reemplaza la fila completa: se preserva lo ya guardado
      essential_expenses_cents: existing ? Number(existing.essential_expenses_cents) : 0,
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
    .select('net_income_cents, gross_income_cents')
    .eq('household_id', householdId)
    .maybeSingle();

  const { error } = await supabase.from('finances').upsert(
    {
      household_id: householdId,
      net_income_cents: existing ? Number(existing.net_income_cents) : 0,
      gross_income_cents: existing?.gross_income_cents ?? null,
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
    debt_type: d.type,
    // `kind` es la columna heredada: se deriva, ya no se pregunta
    kind: KIND_FOR_TYPE[d.type],
    balance_cents: dollarsToCents(d.balance),
    min_payment_cents: dollarsToCents(d.minPayment),
    apr: d.apr,
    credit_limit_cents:
      d.creditLimit !== undefined && d.creditLimit > 0 ? dollarsToCents(d.creditLimit) : null,
    due_day: d.dueDay ?? null,
    statement_day: d.statementDay ?? null,
    is_promo_zero: d.isPromoZero,
    promo_end_date: d.promoEndDate ?? null,
    employment_tied: d.employmentTied,
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
  if (!d.id) {
    await trackEvent(supabase, householdId, 'deuda_agregada', {
      debt_type: d.type,
      apr: d.apr,
      balance_cents: row.balance_cents,
    });
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

// ── Panel de Oxígeno ──────────────────────────────────────────────────

export async function saveLeverResult(values: LeverResultForm): Promise<ActionResult> {
  const parsed = leverResultSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { supabase, householdId } = await requireHousehold();
  const v = parsed.data;
  const gainCents = v.monthlyGain !== undefined ? dollarsToCents(v.monthlyGain) : 0;

  const { error } = await supabase.from('lever_results').upsert(
    {
      household_id: householdId,
      lever: v.lever,
      status: v.status,
      monthly_gain_cents: gainCents,
      note: v.note ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'household_id,lever' },
  );
  if (error) {
    console.error('[gps] saveLeverResult', error.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  // El dato más valioso de la herramienta: cuánto aire da cada palanca.
  await trackEvent(supabase, householdId, 'palanca_registrada', {
    lever: v.lever,
    status: v.status,
    effect: LEVER_EFFECT[v.lever],
    monthly_gain_cents: gainCents,
  });

  revalidateGps();
  return { ok: true };
}
