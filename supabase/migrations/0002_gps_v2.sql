-- GPS Anti-Deuda v2 — el ROI de Flujo deja de ordenar y pasa a diagnóstico.
--
-- Cambios del modelo de datos:
--   1. debts.debt_type — obligatorio, cambia la lógica (tarjeta recalcula su
--      mínimo cada mes; préstamo a plazo tiene pago fijo y fecha conocida).
--   2. finances.gross_income_cents — solo para el DTI, que es la regla del
--      banco. El IPD sigue usando el ingreso NETO.
--   3. lever_results — el Panel de Oxígeno (las seis palancas).
--   4. gps_events — métricas anonimizadas del método, desde el día uno.
--   5. profiles.last_seen_at — para medir abandono a 30/90/365 días.
--
-- Diseñado para soportar Full (Prueba del Mes 12, alertas 7-3-1, modo pareja)
-- sin otra migración: las tablas de Fase 2 y 3 ya existen en 0001.

-- ── 1. Tipo de deuda ──────────────────────────────────────────────────
create type public.debt_type as enum ('tarjeta', 'prestamo_plazo', 'otro');

alter table public.debts add column debt_type public.debt_type;

update public.debts set debt_type = (
  case
    when kind = 'tarjeta' then 'tarjeta'
    when kind in ('prestamo_personal', 'auto', 'estudiantil') then 'prestamo_plazo'
    else 'otro'
  end
)::public.debt_type;

-- Sin DEFAULT a propósito: el campo es obligatorio y un insert que lo omita
-- debe fallar en vez de adivinar.
alter table public.debts alter column debt_type set not null;

-- `kind` queda como subtipo descriptivo heredado. Ya no se pregunta en el
-- formulario; se deriva de debt_type al guardar.
comment on column public.debts.kind is
  'Heredado de la v1. La lógica vive en debt_type.';

-- Deuda atada al empleo (préstamo del 401k y similares). Es el cuarto override
-- del Selector: si el usuario pierde el trabajo, la deuda se vuelve pagadera de
-- inmediato y lo que no cubra cuenta como retiro anticipado, con impuestos más
-- 10% de multa. Ver el Escenario 3 del libro (Javier).
alter table public.debts
  add column employment_tied boolean not null default false;

-- ── 2. Ingreso bruto (solo para el DTI del banco) ─────────────────────
alter table public.finances
  add column gross_income_cents bigint check (gross_income_cents >= 0);

comment on column public.finances.gross_income_cents is
  'Opcional. DTI = pagos de deuda / ingreso BRUTO. El IPD usa el neto.';

comment on column public.finances.expenses_breakdown is
  'Desglose opcional en centavos: {vivienda, transporte, comida, servicios, '
  'seguros, cuidado_hijos, remesas, otros}';

-- ── 3. Panel de Oxígeno: las seis palancas ────────────────────────────
create type public.oxygen_lever as enum (
  'bajar_apr',
  'programa_dificultad',
  'refinanciar_auto',
  'ingreso_extra',
  'recortar_esenciales',
  'liquidar_deuda'
);

create type public.lever_status as enum (
  'pendiente',
  'en_proceso',
  'lograda',
  'no_aplica'
);

-- Una fila por (hogar, palanca): es el estado del checklist. El "aire ganado"
-- se registra aquí y alimenta tanto el IPD proyectado como las métricas.
create table public.lever_results (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  lever public.oxygen_lever not null,
  status public.lever_status not null default 'pendiente',
  monthly_gain_cents bigint not null default 0 check (monthly_gain_cents >= 0),
  -- Ej. "pedí 19.99%, me dieron 21.99%"
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, lever)
);

create index lever_results_household_idx on public.lever_results (household_id);

-- ── 4. Métricas del método (anonimizadas, agregadas) ──────────────────
-- No se venden ni se comparten: sirven para saber si el método funciona.
-- Nunca guardar aquí email, nombre ni nada que identifique a la persona.
create table public.gps_events (
  id bigint generated always as identity primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  -- ipd_calculado | fase_cambiada | palanca_registrada | deuda_liquidada | ...
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index gps_events_household_idx on public.gps_events (household_id, created_at desc);
create index gps_events_type_idx on public.gps_events (type, created_at desc);

-- ── 5. Abandono ───────────────────────────────────────────────────────
alter table public.profiles
  add column last_seen_at timestamptz not null default now();

-- ── Grants ────────────────────────────────────────────────────────────
grant select, insert, update, delete on public.lever_results to authenticated;
-- Los eventos solo se insertan y se leen: nadie edita ni borra su historial.
grant select, insert on public.gps_events to authenticated;
grant usage, select on sequence public.gps_events_id_seq to authenticated;
grant all on all tables in schema public to service_role;

-- ── RLS ───────────────────────────────────────────────────────────────
alter table public.lever_results enable row level security;
alter table public.gps_events enable row level security;

create policy lever_results_all on public.lever_results for all
  using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

create policy gps_events_select on public.gps_events for select
  using (household_id = public.current_household_id());

create policy gps_events_insert on public.gps_events for insert
  with check (household_id = public.current_household_id());
