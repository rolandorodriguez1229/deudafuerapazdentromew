# GPS Anti-Deuda — Configuración de producción

Checklist para dejar `/diagnostico` funcionando en producción (Vercel).
El código ya está listo; esto es lo que tú (Rolando) tienes que crear en cada servicio.

## 1. Supabase (cuentas + base de datos)

1. Crea un proyecto en [supabase.com](https://supabase.com) (plan Free alcanza para empezar).
2. **SQL**: en el editor SQL, ejecuta las migraciones **en orden**:
   `supabase/migrations/0001_gps.sql` y después `supabase/migrations/0002_gps_v2.sql`.
3. **Auth → URL Configuration**:
   - Site URL: `https://www.deudafuerapazdentro.com`
   - Redirect URLs: agrega `https://www.deudafuerapazdentro.com/**`
     y `http://localhost:3000/**` (para desarrollo).
4. **Auth → Email Templates → Magic Link**: tradúcelo al español y apunta el enlace a
   nuestro handler (evita problemas si el usuario abre el correo en otro navegador):

   ```html
   <h2>Entra a tu GPS Anti-Deuda</h2>
   <p>Haz clic para entrar a tu tablero — sin contraseñas:</p>
   <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/diagnostico/inicio">Entrar a mi GPS Anti-Deuda</a></p>
   <p>Si tú no pediste este correo, ignóralo.</p>
   ```

5. (Recomendado) **Auth → SMTP**: configura SMTP con Resend para que los correos
   salgan de `@deudafuerapazdentro.com` y no caigan en spam.
6. Copia de **Settings → API**: Project URL, `anon` key y `service_role` key.

## 2. Stripe (suscripción Full)

La suscripción no se activa hasta que la lista de correo pase los 5,000 suscriptores;
esto queda listo de antemano.

1. **Products → Add product**: "GPS Anti-Deuda — Plan Full", con DOS precios recurrentes:
   - $6.99 USD / mes
   - $79 USD / año
   Copia los dos `price_...` IDs. **Estos precios tienen que coincidir con los que muestra
   `src/components/gps/PlanSelector.tsx`** — Stripe cobra lo que dice el Price ID, no la
   pantalla, y si se separan el usuario ve un precio y paga otro.
2. **Webhook**: en el endpoint existente (`/api/stripe/webhook`) agrega estos eventos:
   - `checkout.session.completed` (ya estaba)
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
3. **Billing → Customer portal**: actívalo (los usuarios cancelan/cambian tarjeta solos).

## 3. Variables de entorno en Vercel

Agrega a las existentes (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `EMAIL_FROM`):

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (¡secreta!) |
| `STRIPE_PRICE_GPS_MONTHLY` | price_... del plan mensual |
| `STRIPE_PRICE_GPS_YEARLY` | price_... del plan anual |
| `EMAIL_POSTAL_ADDRESS` | **Obligatoria.** Dirección postal física, la exige CAN-SPAM en todo correo de marketing. Sin ella el pie del correo sale incompleto y el servidor lo avisa en el log. |
| `LEAD_NOTIFY_EMAIL` | Opcional. A dónde llega el aviso de cada lead confirmado. Si falta, usa `EMAIL_FROM`. Es un puente hasta que haya un ESP conectado. |

## 3-bis. La lista de correo

La migración `0003_leads.sql` crea la tabla `leads`, que es **la lista**. Hay que
correrla junto con las otras dos.

Cómo funciona, en corto: un alta entra como `pending` y solo pasa a `confirmed`
cuando la persona hace clic en el enlace del correo (doble opt-in). Nada se
entrega antes de ese clic.

Por qué importa para el negocio: **la regla de los 5,000 suscriptores cuenta solo
confirmados.** Un contador inflado con correos falsos dispararía el lanzamiento
del GPS Full sobre datos falsos.

Para consultar la cifra en cualquier momento, desde el SQL editor de Supabase:

```sql
select confirmed_leads_count();
```

La tabla es PII: tiene RLS activa y cero políticas, así que `anon` y
`authenticated` no la leen ni por accidente. Solo el service-role la toca.

Cumplimiento ya cubierto en el código: registro de consentimiento con el texto
literal que aceptó cada persona (GDPR), baja en un clic sin login que sigue
funcionando indefinidamente (CASL pide 60 días), enlaces de confirmación que
vencen a las 48 h y tope de 3 reenvíos por hora.

## 3-ter. Entrega protegida de los archivos

Los entregables (EPUB, PDF y los tres anexos) **ya no viven en `public/`**. Están
en un bucket privado de Supabase Storage llamado `entregas`, que crea la
migración `0004_entregas.sql`.

Cómo funciona: cada persona autorizada tiene un permiso en `download_grants` con
un token. La página `/descargas?t=<token>` valida el permiso contra la base y
recién entonces pide a Supabase una URL firmada que vive **15 minutos**. Esa URL
no se guarda: se genera en cada visita.

Dos niveles: `lead` (quien confirmó su correo) recibe solo la Guía de
Estrategias; `compra` recibe el libro completo y los tres anexos. Un lead que
compra sube de nivel y conserva su mismo enlace.

Para subir los archivos al bucket:

```bash
python3 scripts/build-epub.py && python3 scripts/build-pdf.py && python3 scripts/build-anexos.py
python3 scripts/subir-entregables.py            # usa .env.local
python3 scripts/subir-entregables.py --listar   # ver qué hay
```

En producción, apunta `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`
al proyecto real antes de correr el script de subida.

> El bucket es privado y `storage.objects` no tiene políticas para `anon` ni
> `authenticated`. Verificado: sin firma da 400, con la clave anon da 400,
> listar devuelve `[]`, y cambiarle la ruta a una firma válida también da 400
> — la firma va atada al archivo, así que un lead no puede pedir el libro.

## 4. Prueba en producción (10 min)

1. Entra a `/diagnostico` → "Calcula tu IPD gratis" → recibe el magic link → completa el wizard.
2. Verifica el panel Free: tu fase, el Panel de Oxígeno, la tabla ¿Renegociar? y la fila
   "Tu deuda objetivo: 🔒". Marca una deuda como atada al empleo (préstamo del 401k) y
   confirma que aparece su aviso de riesgo.
3. Con [tarjeta de prueba](https://stripe.com/docs/testing) en modo test (o una compra real
   de $6.99): `/diagnostico/plan` → checkout → `/diagnostico/gracias` debe decir
   "¡Listo! Ya tienes el GPS completo" y el panel debe mostrar el Orden de Ataque.
4. Compra un eBook de prueba en `/comprar` para confirmar que ese flujo sigue intacto.

## Desarrollo local

```bash
npx supabase start          # levanta Postgres+Auth locales (necesita Docker)
npm run dev                 # el .env.local ya apunta al Supabase local
# correos de prueba (magic links): http://127.0.0.1:54324
npm test                    # tests del motor de cálculo (fórmulas del libro)
```

## Métricas del método

`gps_events` (anónima, por hogar) + `checkins` (snapshot mensual) responden hoy:

| Pregunta | De dónde sale |
|---|---|
| IPD inicial y a los 30/60/90 días | `checkins` (una fila por hogar y mes) |
| Fase inicial y cambios de fase | `checkins.zone` + evento `fase_cambiada` |
| Palancas intentadas y aire promedio | `lever_results` + evento `palanca_registrada` |
| Deudas registradas y su perfil | evento `deuda_agregada` |
| Abandono a 30/90/365 días | `profiles.last_seen_at` |

Aquí NUNCA se guarda email, nombre ni nada identificable — solo `household_id` y números.

Quedan atadas a Full: **tasa de concentración** y **meses hasta la primera deuda
liquidada** necesitan el seguimiento mensual (marcar deudas pagadas), que es Fase 2.

## Fases pendientes (ya diseñadas, no construidas)

- **Fase 2**: alertas 7-3-1 por email (cron diario + tabla `sent_alerts` ya creada),
  check-in mensual con celebración y migración de fase (tabla `checkins` lista),
  Test de la Deuda Nueva, alertas de fin de promo 0% (60/30/7 días — el cálculo ya
  existe en `promoAlert()` y se muestra en la tabla de diagnóstico; falta el envío).
- **Fase 3**: modo pareja (tabla `household_invites` lista — el modelo de datos ya es
  por hogar), export a PDF y la versión imprimible para el refrigerador.
- **La Prueba del Mes 12** (Full): el motor de amortización ya recalcula el mínimo de
  tarjeta mes a mes y respeta el pago fijo de los préstamos a plazo, que es lo que la
  simulación necesita. Falta la pantalla y la comparación de las tres estrategias.
