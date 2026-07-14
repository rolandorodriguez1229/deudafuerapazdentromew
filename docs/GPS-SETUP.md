# GPS Anti-Deuda — Configuración de producción

Checklist para dejar `/diagnostico` funcionando en producción (Vercel).
El código ya está listo; esto es lo que tú (Rolando) tienes que crear en cada servicio.

## 1. Supabase (cuentas + base de datos)

1. Crea un proyecto en [supabase.com](https://supabase.com) (plan Free alcanza para empezar).
2. **SQL**: en el editor SQL, pega y ejecuta el contenido completo de
   `supabase/migrations/0001_gps.sql`.
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

1. **Products → Add product**: "GPS Anti-Deuda — Plan Full", con DOS precios recurrentes:
   - $6.99 USD / mes
   - $59 USD / año
   Copia los dos `price_...` IDs.
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

## 4. Prueba en producción (10 min)

1. Entra a `/diagnostico` → "Calcula tu IPD gratis" → recibe el magic link → completa el wizard.
2. Verifica el panel Free (fila "Tu deuda objetivo: 🔒").
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

## Fases pendientes (ya diseñadas, no construidas)

- **Fase 2**: alertas 7-3-1 por email (cron diario + tabla `sent_alerts` ya creada),
  check-in mensual con celebración y migración de estrategia (tabla `checkins` lista),
  Test de la Deuda Nueva, alertas de fin de promo 0% (60/30/7 días).
- **Fase 3**: modo pareja (tabla `household_invites` lista — el modelo de datos ya es
  por hogar) y export a PDF.
