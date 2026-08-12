# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Next.js dev server on http://localhost:3000
npm run build    # Production build
npm start        # Run production build
npm run lint     # ESLint (flat config, next/core-web-vitals + next/typescript)
npm test         # vitest — unit tests for the GPS calc engine (src/lib/gps/__tests__)
npx supabase start  # local Supabase (Docker) for the /diagnostico tool; emails at :54324
```

## Stack

- **Next.js 15** App Router with **React 19** and **TypeScript strict mode**
- **Tailwind CSS v4** via `@tailwindcss/postcss` (no `tailwind.config.*` — theme lives in `src/app/globals.css` under `@theme`)
- **Stripe** (server-only, `runtime = 'nodejs'`) for checkout
- **react-hook-form** + **zod** + **@hookform/resolvers** for form validation
- **lucide-react** for icons
- Path alias: `@/*` → `src/*`
- Language: Spanish (`<html lang="es">`) — copy, routes (`/comprar`, `/gracias`, `/plantilla-gratuita`, `/guia-estrategias`, `/garantia`) and component copy are all in Spanish. Preserve this. The **GPS tool** (`/diagnostico/*`) is the exception: it is bilingual es/en via a cookie — see the i18n bullet below.

## Architecture

This is a marketing/sales site for the book *Deuda Fuera, Paz Dentro*, plus the **GPS Anti-Deuda** freemium web tool at `/diagnostico` (see below).

### GPS Anti-Deuda (`/diagnostico`)

Freemium debt calculator that accompanies the book. The printed URL `/diagnostico` must never break — the root page is public and DB-independent; everything stateful lives in `/diagnostico/*` (entrar, inicio, panel, **oxigeno**, deudas, plan, gracias, cuenta, escenarios).

- **Auth**: Supabase magic link for all users (`@supabase/ssr`, cookies). `src/middleware.ts` (matcher: `/diagnostico/*`, `/auth/*`) refreshes sessions; `/auth/confirm` handles both `token_hash` and PKCE `code`. Page guard: `requireUser()` in `src/lib/gps/auth.ts`.
- **Data**: Supabase Postgres, schema in `supabase/migrations/` (`0001_gps.sql`, then `0002_gps_v2.sql`). All money is **integer cents**; APR is percent (`numeric(6,3)`). Financial data is **household-scoped** (couple mode in Phase 3 = second member joins household). RLS + explicit grants; `subscriptions` is only written by the service-role (Stripe webhook).
- **Calc engine**: `src/lib/gps/` — pure TS, no I/O, no `Date.now()` (today is always a parameter), unit-tested (`npm test`, incl. `__tests__/libro.test.ts` = the four Chapter 9 examples). Formulas come from the book and MUST NOT drift:
  - IPD = (esenciales + mínimos) / ingreso neto, **always a decimal** (0.89, never 89%); `null` when income is 0.
  - **Four phases**: DÉFICIT >1.0 / OXÍGENO ≥0.70 (or free cash flow ≤5% of income) / BOLA DE NIEVE ≥0.45 / AVALANCHA <0.45.
  - **Order, one criterion per phase**: Déficit and Oxígeno use the **ROI de Flujo** (`pago mínimo × 12 ÷ saldo`, highest first); Bola de Nieve uses **smallest balance**; Avalancha uses **highest APR**.
  - The ROI de Flujo is NOT the APR in disguise. That equivalence only holds if every issuer used the same minimum-payment formula, and they do not (1% + interest, 2%, 3%, flat floors). Verified across 6,000 mixed-rule portfolios: the two orders coincide ~10% of the time.
  - **Overrides are phase-scoped** — in Déficit and Oxígeno *nothing* outranks the ROI:
    - *Fuga eterna* (min ≤ monthly interest) reorders only from Bola de Nieve on. The rule is to call first for a lower APR or a hardship program; if the issuer helps, the debt stops meeting `min ≤ interest` and the override switches itself off — no extra flag needed.
    - *Atada al empleo* (401(k) or any job-tied loan) reorders only in Avalancha.
    - APR ≥30% and utilization >80% were **removed** as overrides. Utilization is still shown as a metric.
  - Card minimums decline month to month in the amortizer using the book's formula (1% of balance + interest, $25 floor); installment loans keep a fixed payment.
  - Número de Paz = (esenciales+mínimos)×1.05. DTI uses **gross** income and is labeled as the bank's rule, not ours.
- **Copy + i18n**: `src/lib/gps/copy/es.ts` is the source of truth; `en.ts` must satisfy `typeof es`, so adding a Spanish string without its English twin fails the build. Locale lives in the `gps_lang` cookie (`src/lib/i18n/`), never in the URL — the printed `/diagnostico` must never change. Never "TAE" → APR; never "money market" → HYSA; no blame language; no exclamation marks in alerts; both disclaimers (educational + the regulatory one) on every screen.
- **Freemium gating is server-side only**: Free users' server components never compute/serialize Full data (attack order, projection). Entitlement via `src/lib/gps/entitlement.ts` (Full if any household member has an active/trialing/past_due Stripe subscription). Free includes the whole Panel de Oxígeno and the per-debt diagnosis table.
- **Metrics**: `gps_events` + `checkins` (`src/lib/gps/events.ts`), anonymous and household-scoped — never store anything identifying.
- **Stripe**: eBook one-time checkout unchanged; GPS subscription ($6.99/mo, $79/yr) via `/api/gps/checkout` (`mode: 'subscription'`), webhook `src/app/api/stripe/webhook/route.ts` branches on `session.mode` and syncs `customer.subscription.*` into `subscriptions`. Not selling until the mailing list passes 5,000 subscribers.
- Setup/production checklist: `docs/GPS-SETUP.md`. La Prueba del Mes 12, Phase 2 (7-3-1 email alerts, monthly check-in, Test de la Deuda Nueva) and Phase 3 (couple mode, PDF) are designed and have DB tables ready but are not built.

### Homepage composition (`src/app/page.tsx`)

The homepage is a linear assembly of ~20 section components from `src/components/` rendered in a specific order (Hero → TrustBar → Problem → Solution → Story → Benefits → Products → Guarantee → FAQ → FinalCTA, plus `StickyCTA` and `ExitIntentModal`). Each section is self-contained; reordering or adding a section means editing this file. Components are not parameterized via props — copy and styling live inside each component file.

### Routes

- `src/app/page.tsx` — homepage
- `src/app/comprar/` — sales page
- `src/app/plantilla-gratuita/` — lead magnet landing (no header, posts to `/api/subscribe`)
- `src/app/gracias/`, `src/app/garantia/`, `src/app/guia-estrategias/`, `src/app/test/` — static pages
- `src/app/blog/` — blog index (`page.tsx`) plus one directory per article (`diagnostico-360-sin-dolor`, `estrategia-avalancha`, `estrategia-bola-de-nieve`, `estrategia-oxigeno-rapido`, `flujo-vs-intereses`, `ipd-oxigeno-financiero`), each a hand-written `page.tsx`
- `src/app/checkout/route.ts` — **GET** handler that creates a Stripe Checkout Session and **303-redirects** to it; used by `<a href="/checkout">` buttons
- `src/app/api/checkout/route.ts` — **POST** handler that returns `{ ok, url }` JSON; used by client-side `fetch`
- `src/app/api/subscribe/route.ts` — lead capture; currently only validates + `console.log`s, no provider wired up
- `src/app/api/stripe/webhook/route.ts` — verifies `stripe-signature` with `STRIPE_WEBHOOK_SECRET`, handles `checkout.session.completed` (fulfillment is a TODO)

Both checkout handlers duplicate the same line item (eBook, USD $7.99, `unit_amount: 799`). If pricing or product data changes, update both.

### Styling system

Tailwind v4 theme tokens are declared in `src/app/globals.css` via `@theme` — custom `primary` (blue) and `accent` (indigo) color scales plus `--font-poppins` / `--font-playfair` (loaded via `next/font/google` in `layout.tsx`). Reusable component classes are defined there too: `.section-container`, `.btn-primary` (green), `.btn-secondary`, `.btn-urgent` (orange), `.heading-xl/lg/md`. Prefer these over re-declaring equivalent utility strings.

Note: the README's color/button description is stale — actual `.btn-primary` is green, not blue/gold.

### Environment variables

- `STRIPE_SECRET_KEY` — required for `/checkout` and `/api/checkout` (handlers return an error/redirect when missing rather than throwing at import time)
- `STRIPE_WEBHOOK_SECRET` — required for `/api/stripe/webhook`
- `NEXT_PUBLIC_SITE_URL` — used to build `success_url`/`cancel_url`; falls back to `http://localhost:3000`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — GPS auth + data (pages no-op/redirect gracefully when missing)
- `SUPABASE_SERVICE_ROLE_KEY` — webhook writes to `subscriptions` (server-only, bypasses RLS)
- `STRIPE_PRICE_GPS_MONTHLY`, `STRIPE_PRICE_GPS_YEARLY` — recurring Price IDs for the GPS Full plan
- `.env.local` in dev points at local Supabase (`npx supabase start`)

### `src/book/`

Contains the source manuscript (`.docx` and extracted `.txt`). Reference material only — not imported by the app.
