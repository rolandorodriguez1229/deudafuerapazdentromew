import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

interface SubscribePayload {
  name: string;
  email: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.deudafuerapazdentro.com';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SubscribePayload>;
    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }

    await sendEmail({
      to: email,
      subject: 'Tu Plantilla IPD 360° está lista',
      html: `
        <div style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937">
          <h1 style="color:#1e3a8a">¡Hola, ${name}!</h1>
          <p>Gracias por descargar la <strong>Plantilla IPD 360°</strong>. Usa el enlace de abajo para descargarla.</p>
          <p>
            <a href="${SITE_URL}/downloads/guia-estrategias.pdf"
               style="display:inline-block;background:#16a34a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">
              Descargar mi plantilla
            </a>
          </p>
          <p>En los próximos días te enviaré las mejores estrategias para salir de deudas.</p>
          <p>— Rolando Rodríguez</p>
        </div>
      `,
    });

    // Placeholder: integrar con ESP (ConvertKit / MailerLite / Beehiiv)
    console.log('[subscribe] Lead', { name, email });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unexpected error' }, { status: 500 });
  }
}
