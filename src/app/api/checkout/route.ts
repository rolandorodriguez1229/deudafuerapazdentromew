import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { EBOOK_SALES_PAUSED, WAITLIST_PATH } from '@/config/sales';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export async function POST() {
  try {
    // Guarda dura, igual que en /checkout. Se responde con la ruta de la lista
    // de espera para que el cliente sepa a dónde mandar al usuario.
    if (EBOOK_SALES_PAUSED) {
      return NextResponse.json(
        { ok: false, paused: true, url: WAITLIST_PATH },
        { status: 503 },
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ ok: false, error: 'Stripe not configured' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 799,
            product_data: {
              name: 'Deuda Fuera, Paz Dentro (eBook digital)',
              description: 'Descuento especial de lanzamiento',
            },
          },
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/gracias?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/comprar?canceled=1`,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'checkout_failed' }, { status: 500 });
  }
}


