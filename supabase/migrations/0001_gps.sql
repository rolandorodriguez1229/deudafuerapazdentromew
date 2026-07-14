-- GPS Anti-Deuda — esquema inicial
-- Dinero en centavos enteros (bigint). APR en porcentaje (numeric 6,3).
-- Datos financieros a nivel hogar (household) para que el modo pareja
-- (Fase 3) sea solo "un segundo miembro se une al hogar".

create extension if not exists "pgcrypto";

-- ── Hogares y perfiles ────────────────────────────────────────────────
create table public.households (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid not null references public.households(id),
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Al registrarse un usuario se crea su hogar y su perfil automáticamente.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare hid uuid;
begin
  insert into households default values returning id into hid;
  insert into profiles (id, household_id, full_name)
  values (new.id, hid, new.raw_user_meta_data ->> 'full_name');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Finanzas del hogar ────────────────────────────────────────────────
create table public.finances (
  household_id uuid primary key references public.households(id) on delete cascade,
  net_income_cents bigint not null check (net_income_cents >= 0),
  essential_expenses_cents bigint not null check (essential_expenses_cents >= 0),
  -- desglose opcional en centavos: {vivienda, comida, transporte, servicios, salud, otros}
  expenses_breakdown jsonb,
  updated_at timestamptz not null default now()
);

create type public.debt_kind as enum
  ('tarjeta', 'prestamo_personal', 'auto', 'estudiantil', 'medica', 'otra');
create type public.debt_status as enum ('activa', 'pagada');

create table public.debts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  kind public.debt_kind not null default 'otra',
  balance_cents bigint not null check (balance_cents >= 0),
  min_payment_cents bigint not null check (min_payment_cents >= 0),
  apr numeric(6,3) not null check (apr >= 0),
  credit_limit_cents bigint check (credit_limit_cents > 0),
  statement_day smallint check (statement_day between 1 and 31),
  due_day smallint check (due_day between 1 and 31),
  is_promo_zero boolean not null default false,
  promo_end_date date,
  status public.debt_status not null default 'activa',
  paid_off_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index debts_household_active_idx
  on public.debts (household_id) where status = 'activa';

-- ── Suscripciones (escribe solo el webhook con service-role) ─────────
create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text unique,
  status text not null default 'incomplete',
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

create index subscriptions_customer_idx
  on public.subscriptions (stripe_customer_id);

-- ── Fase 2: check-ins mensuales y log de alertas ─────────────────────
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  month date not null, -- primer día del mes
  ipd numeric(8,4) not null,
  zone text not null,
  total_debt_cents bigint not null,
  debts_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique (household_id, month)
);

create table public.sent_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  debt_id uuid not null references public.debts(id) on delete cascade,
  alert_type text not null, -- due_7|due_3|due_1|promo_60|promo_30|promo_7
  period_key text not null, -- ej. '2026-08' — para no duplicar envíos
  sent_at timestamptz not null default now(),
  unique (debt_id, alert_type, period_key)
);

-- ── Fase 3: invitaciones de pareja ───────────────────────────────────
create table public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  email text not null,
  token uuid not null default gen_random_uuid(),
  status text not null default 'pendiente', -- pendiente|aceptada|revocada
  created_at timestamptz not null default now()
);

-- ── Grants ────────────────────────────────────────────────────────────
-- RLS es la barrera de seguridad; estos grants dan el acceso base.
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete
  on public.households, public.profiles, public.finances, public.debts,
     public.checkins, public.household_invites
  to authenticated;

-- subscriptions y sent_alerts: los usuarios solo leen; escribe el service-role
grant select on public.subscriptions, public.sent_alerts to authenticated;

grant all on all tables in schema public to service_role;

-- ── RLS ───────────────────────────────────────────────────────────────
create function public.current_household_id() returns uuid
language sql stable security definer set search_path = public as $$
  select household_id from profiles where id = auth.uid()
$$;

alter table public.households enable row level security;
alter table public.profiles enable row level security;
alter table public.finances enable row level security;
alter table public.debts enable row level security;
alter table public.subscriptions enable row level security;
alter table public.checkins enable row level security;
alter table public.sent_alerts enable row level security;
alter table public.household_invites enable row level security;

create policy households_select on public.households for select
  using (id = public.current_household_id());

create policy profiles_select on public.profiles for select
  using (id = auth.uid() or household_id = public.current_household_id());
create policy profiles_update on public.profiles for update
  using (id = auth.uid());

create policy finances_all on public.finances for all
  using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

create policy debts_all on public.debts for all
  using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

create policy checkins_all on public.checkins for all
  using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

-- Se puede LEER cualquier suscripción del propio hogar (para el entitlement
-- en modo pareja). Nadie escribe: solo el service-role del webhook.
create policy subscriptions_select on public.subscriptions for select
  using (user_id in (
    select id from public.profiles
    where household_id = public.current_household_id()
  ));

create policy sent_alerts_select on public.sent_alerts for select
  using (user_id = auth.uid());

create policy household_invites_all on public.household_invites for all
  using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());
