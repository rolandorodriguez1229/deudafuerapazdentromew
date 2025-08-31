import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });
  const sig = (request.headers.get('stripe-signature') || '').toString();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      // TODO: fulfill order: save to DB / send email, etc.
      console.log('[stripe] checkout completed', { id: session.id, email: session.customer_details?.email });
    }
  } catch (err) {
    return new NextResponse('Webhook handler failed', { status: 500 });
  }

  return NextResponse.json({ received: true });
}


