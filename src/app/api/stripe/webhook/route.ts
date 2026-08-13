import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendEmail } from '@/lib/email';
import { compraEmail } from '@/lib/emails';
import { otorgarGrant } from '@/lib/entregas';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


/** Sincroniza una suscripción de Stripe → tabla `subscriptions` (upsert idempotente). */
async function syncSubscription(sub: Stripe.Subscription) {
  const userId = sub.metadata?.supabase_user_id;
  if (!userId) {
    console.error('[stripe] subscription sin supabase_user_id en metadata', sub.id);
    return;
  }
  const admin = createAdminClient();
  const { error } = await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
      stripe_subscription_id: sub.id,
      status: sub.status,
      price_id: sub.items.data[0]?.price?.id ?? null,
      current_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: sub.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  if (error) throw new Error(`Supabase upsert subscriptions: ${error.message}`);
}

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });
  const sig = (request.headers.get('stripe-signature') || '').toString();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === 'subscription') {
        // GPS Anti-Deuda — plan Full
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id,
          );
          await syncSubscription(sub);
        }
        console.log('[stripe] gps subscription checkout completed', {
          id: session.id,
          user: session.client_reference_id,
        });
      } else {
        // eBook. La entrega ya no son enlaces a /public: se crea un permiso y
        // el comprador descarga desde /descargas, que firma URLs de vida corta
        // contra el bucket privado.
        const email = session.customer_details?.email;
        const name = session.customer_details?.name || null;

        if (email) {
          const grant = await otorgarGrant({
            email,
            tipo: 'compra',
            stripeSessionId: session.id,
          });
          const { subject, html } = compraEmail(name, grant.token);
          await sendEmail({ to: email, subject, html });
          console.log('[stripe] compra entregada', { id: session.id, grant: grant.id });
        } else {
          // Sin correo no hay a quién entregarle. Es raro pero no imposible.
          console.error('[stripe] compra sin correo del cliente', session.id);
        }
      }
    }

    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      await syncSubscription(event.data.object as Stripe.Subscription);
    }
  } catch (err) {
    console.error('[stripe] webhook handler failed', err);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }

  return NextResponse.json({ received: true });
}
