import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function GET() {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  if (!secretKey) {
    return NextResponse.redirect(new URL('/comprar?error=stripe', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: 799,
          product_data: {
            name: 'Deuda Fuera, Paz Dentro (eBook digital)',
            description: 'Oferta de lanzamiento con bonos',
          },
        },
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/gracias?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/comprar?canceled=1`,
  });

  return NextResponse.redirect(session.url as string, { status: 303 });
}


