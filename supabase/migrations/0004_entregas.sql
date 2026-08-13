-- Entrega protegida de los archivos del libro.
--
-- Hasta ahora los entregables vivían en /public/downloads/, o sea que cualquiera
-- con la URL los bajaba sin pagar ni suscribirse. Y el correo de compra mandaba
-- exactamente esos enlaces.
--
-- El modelo nuevo: los archivos viven en un bucket PRIVADO de Storage y nunca se
-- sirven directo. Cada persona autorizada tiene un permiso (`download_grants`)
-- con un token; la página /descargas valida ese token contra la base y recién
-- entonces pide a Supabase una URL firmada de vida corta. La URL no se guarda en
-- ningún lado: se genera al vuelo cada vez que se abre la página.
--
-- Dos niveles, porque hay dos públicos:
--   lead   → quien confirmó su correo. Solo la guía de estrategias.
--   compra → quien pagó. El libro completo y los tres anexos.

-- ── El bucket ─────────────────────────────────────────────────────────
-- `public = false` es lo que hace todo esto: sin eso, la URL directa del
-- objeto funciona para cualquiera y las firmas sobran.
insert into storage.buckets (id, name, public, file_size_limit)
values ('entregas', 'entregas', false, 52428800)  -- 50 MB por archivo
on conflict (id) do update set public = false;

-- Cero políticas sobre storage.objects para este bucket: así ni anon ni
-- authenticated pueden listar ni descargar. Solo el service-role, que salta
-- RLS, puede firmar URLs — y eso ocurre únicamente en el servidor.

-- ── Quién puede descargar qué ─────────────────────────────────────────
create type public.grant_tipo as enum ('lead', 'compra');

create table public.download_grants (
  id uuid primary key default gen_random_uuid(),
  -- Va en la URL: /descargas?t=<token>
  token uuid not null default gen_random_uuid(),
  email text not null,
  tipo public.grant_tipo not null,

  -- De dónde salió, para poder rastrear una entrega si alguien reclama
  stripe_session_id text,
  lead_id uuid references public.leads (id) on delete set null,

  -- Caducidad. Un comprador que pierde el archivo no debería perder el
  -- producto, así que el permiso dura bastante: lo que caduca rápido es la URL
  -- firmada, que se vuelve a generar entrando a la página.
  expires_at timestamptz not null default (now() + interval '365 days'),
  revoked_at timestamptz,

  -- Para detectar que un enlace se está compartiendo
  downloads integer not null default 0,
  last_download_at timestamptz,

  created_at timestamptz not null default now()
);

create unique index download_grants_token_key on public.download_grants (token);
create index download_grants_email_idx on public.download_grants (lower(email));
-- Una compra genera un permiso y solo uno, aunque Stripe reintente el webhook.
create unique index download_grants_session_key
  on public.download_grants (stripe_session_id)
  where stripe_session_id is not null;

comment on table public.download_grants is
  'Permisos de descarga. El token va en la URL; las URLs firmadas se generan al vuelo.';
comment on column public.download_grants.expires_at is
  'Caduca el permiso, no la URL firmada. Esa dura minutos y se regenera entrando.';

-- ── Permisos ──────────────────────────────────────────────────────────
-- Igual que `leads`: es PII y decide acceso a un producto pagado. RLS activa,
-- cero políticas, y sin grants para anon/authenticated. Solo el service-role.
alter table public.download_grants enable row level security;

revoke all on public.download_grants from anon, authenticated;
grant all on public.download_grants to service_role;
