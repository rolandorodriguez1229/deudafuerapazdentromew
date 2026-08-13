-- La lista de correo, en nuestra propia base.
--
-- Por qué existe: hasta ahora /api/subscribe validaba el correo, mandaba el
-- lead magnet y hacía console.log. Cada suscriptor se perdía. Y la regla de
-- lanzamiento del GPS Full ("no vender hasta pasar los 5,000 suscriptores")
-- dependía de una lista que no existía y no se podía contar.
--
-- Por qué aquí y no solo en el ESP: si mañana cambiamos de proveedor, la lista
-- sigue siendo nuestra y migrar es un export, no una mudanza. El ESP es un
-- espejo de esta tabla, no al revés.
--
-- Doble opt-in a propósito: un lead solo cuenta cuando confirma. Es lo que
-- piden GDPR y CASL para correo de marketing, mantiene limpia la lista y — lo
-- que más importa aquí — hace que el umbral de los 5,000 signifique algo. Un
-- contador inflado con correos falsos dispara la decisión sobre datos falsos.
--
-- Esta tabla es PII. Solo la toca el service-role: no hay grants ni políticas
-- para anon ni para authenticated, a diferencia del resto del esquema.

-- ── Estado del lead ───────────────────────────────────────────────────
-- pending      → pidió alta, todavía no confirma. NO se le manda marketing.
-- confirmed    → hizo clic en el enlace de confirmación. Cuenta para los 5,000.
-- unsubscribed → se dio de baja. Se conserva la fila: hay que recordar la baja
--                para no volver a escribirle si se resuscribe por otro form.
-- bounced      → el correo rebotó duro. Nunca más se le escribe.
-- complained   → marcó el correo como spam. Nunca más se le escribe.
create type public.lead_status as enum (
  'pending', 'confirmed', 'unsubscribed', 'bounced', 'complained'
);

-- De dónde entró. Sirve para medir qué imán convierte y para el texto del
-- correo que le toca.
create type public.lead_source as enum (
  'plantilla', 'guia_estrategias', 'lista_espera', 'gps'
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  source public.lead_source not null,
  status public.lead_status not null default 'pending',

  -- ── Doble opt-in ────────────────────────────────────────────────────
  -- El token va en la URL de confirmación. Se regenera en cada reenvío para
  -- que un enlace viejo filtrado deje de servir.
  confirm_token uuid not null default gen_random_uuid(),
  confirm_sent_at timestamptz,
  -- 48 h, el máximo que recomienda la práctica estándar. Pasado eso hay que
  -- volver a pedir el alta.
  confirm_expires_at timestamptz,
  confirmed_at timestamptz,
  -- Para limitar reenvíos (3 por hora) sin necesitar otra tabla.
  confirm_attempts integer not null default 0,
  last_confirm_attempt_at timestamptz,

  -- ── Baja ────────────────────────────────────────────────────────────
  -- Token estable: los correos ya enviados llevan este enlace y CASL exige que
  -- siga funcionando 60 días después del envío. Por eso NO se regenera.
  unsubscribe_token uuid not null default gen_random_uuid(),
  unsubscribed_at timestamptz,

  -- ── Registro de consentimiento ──────────────────────────────────────
  -- GDPR pide poder demostrar quién consintió, cuándo, cómo y a qué. Guardamos
  -- el texto exacto que aceptó, no un booleano: si el copy cambia, el registro
  -- viejo sigue diciendo la verdad de lo que se aceptó ese día.
  consent_text text,
  consent_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Un correo, una fila. Case-insensitive porque Ana@x.com y ana@x.com son la
-- misma persona y contarlas dos veces infla el umbral de lanzamiento.
create unique index leads_email_key on public.leads (lower(email));

-- El contador de los 5,000 se consulta seguido; que no haga scan completo.
create index leads_status_idx on public.leads (status);
create index leads_confirm_token_idx on public.leads (confirm_token);
create index leads_unsubscribe_token_idx on public.leads (unsubscribe_token);

comment on table public.leads is
  'Lista de correo propia. PII: solo service-role. El ESP es un espejo de esta tabla.';
comment on column public.leads.consent_text is
  'El texto literal que el usuario aceptó, para poder demostrar el consentimiento.';

-- ── updated_at ────────────────────────────────────────────────────────
create or replace function public.touch_leads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_touch_updated_at
  before update on public.leads
  for each row execute function public.touch_leads_updated_at();

-- ── Contador de la lista ──────────────────────────────────────────────
-- La cifra que gobierna el lanzamiento del GPS Full. Solo cuenta confirmados:
-- los pendientes no dieron consentimiento verificable todavía.
create or replace function public.confirmed_leads_count()
returns bigint
language sql
stable
as $$
  select count(*) from public.leads where status = 'confirmed';
$$;

-- ── Permisos ──────────────────────────────────────────────────────────
-- RLS encendida y CERO políticas: con eso, anon y authenticated no ven nada
-- aunque alguien se equivoque y les dé un grant. El service-role la salta.
alter table public.leads enable row level security;

revoke all on public.leads from anon, authenticated;
revoke all on function public.confirmed_leads_count() from anon, authenticated;

grant all on public.leads to service_role;
grant execute on function public.confirmed_leads_count() to service_role;
