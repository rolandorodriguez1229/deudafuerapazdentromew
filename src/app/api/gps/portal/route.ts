import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/** Portal de facturación de Stripe (cambiar tarjeta, cancelar, facturas). */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!sub?.stripe_customer_id || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ ok: false, error: 'Sin suscripción' }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${SITE_URL}/diagnostico/cuenta`,
    });
    return NextResponse.json({ ok: true, url: portal.url });
  } catch (err) {
    console.error('[gps] portal session failed', err);
    return NextResponse.json({ ok: false, error: 'Error abriendo el portal' }, { status: 500 });
  }
}
