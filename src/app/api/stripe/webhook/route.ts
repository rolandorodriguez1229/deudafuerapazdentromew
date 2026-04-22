import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.deudafuerapazdentro.com';

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
      const email = session.customer_details?.email;
      const name = session.customer_details?.name || 'lector';

      if (email) {
        await sendEmail({
          to: email,
          subject: 'Tu acceso a Deuda Fuera, Paz Dentro',
          html: `
            <div style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937">
              <h1 style="color:#1e3a8a">¡Gracias por tu compra, ${name}!</h1>
              <p>Aquí están tus enlaces de descarga:</p>
              <ul>
                <li><a href="${SITE_URL}/downloads/guia-estrategias.pdf">eBook — Deuda Fuera, Paz Dentro</a></li>
                <li><a href="${SITE_URL}/downloads/scripts-negociacion.pdf">Scripts para negociar con acreedores</a></li>
                <li><a href="${SITE_URL}/downloads/calendario-7-3-1.ics">Calendario 7/3/1</a></li>
              </ul>
              <p>Si tienes cualquier duda, responde este correo y te ayudo personalmente.</p>
              <p>— Rolando</p>
            </div>
          `,
        });
      }

      console.log('[stripe] checkout completed', { id: session.id, email });
    }
  } catch (err) {
    console.error('[stripe] webhook handler failed', err);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }

  return NextResponse.json({ received: true });
}
