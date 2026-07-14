import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getHouseholdId } from '@/lib/gps/data';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/** Crea la sesión de checkout de la suscripción GPS Full ($6.99/mes o $59/año). */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
  }

  let interval: 'month' | 'year' = 'month';
  try {
    const body = await request.json();
    if (body?.interval === 'year') interval = 'year';
  } catch {
    // body vacío → mensual
  }

  const priceId =
    interval === 'year'
      ? process.env.STRIPE_PRICE_GPS_YEARLY
      : process.env.STRIPE_PRICE_GPS_MONTHLY;
  if (!process.env.STRIPE_SECRET_KEY || !priceId) {
    return NextResponse.json(
      { ok: false, error: 'Checkout no configurado' },
      { status: 500 },
    );
  }

  const householdId = await getHouseholdId(supabase, user);

  // Reutilizar el customer si ya existe (evita duplicados en Stripe)
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id, status')
    .eq('user_id', user.id)
    .maybeSingle();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      ...(existing?.stripe_customer_id
        ? { customer: existing.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          household_id: householdId ?? '',
        },
      },
      locale: 'es',
      allow_promotion_codes: true,
      success_url: `${SITE_URL}/diagnostico/gracias?session_id={CHECKOUT_SESSION_ID}&plan=${interval}`,
      cancel_url: `${SITE_URL}/diagnostico/plan?canceled=1`,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error('[gps] checkout session failed', err);
    return NextResponse.json({ ok: false, error: 'Error creando el checkout' }, { status: 500 });
  }
}
