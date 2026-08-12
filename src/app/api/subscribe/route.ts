import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

type LeadSource = 'plantilla' | 'lista-espera';

interface SubscribePayload {
  name: string;
  email: string;
  source: LeadSource;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.deudafuerapazdentro.com';

/**
 * A dónde llega el aviso de cada lead nuevo.
 *
 * Esto es un puente, no la solución: hasta que se conecte un ESP y una tabla
 * propia (Fase 2), la bandeja de Rolando es el único lugar donde un correo
 * capturado sobrevive. Antes de esto los leads solo se escribían en el log del
 * servidor, o sea que se perdían.
 */
const NOTIFY_TO = process.env.LEAD_NOTIFY_EMAIL || process.env.EMAIL_FROM;

const WRAP = (inner: string) =>
  `<div style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937">${inner}</div>`;

/**
 * OJO: este correo sigue entregando `/downloads/guia-estrategias.pdf`, que es un
 * placeholder de 946 bytes. No se toca aquí porque cambiar qué se regala es una
 * decisión de producto, no parte de apagar el cobro. Está anotado como pendiente
 * en la ruta de lanzamiento.
 */
function plantillaEmail(name: string) {
  return {
    subject: 'Tu Plantilla IPD 360° está lista',
    html: WRAP(`
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
    `),
  };
}

function listaEsperaEmail(name: string) {
  return {
    subject: 'Estás en la lista de Deuda Fuera, Paz Dentro',
    html: WRAP(`
      <h1 style="color:#1e3a8a">Quedaste apuntado, ${name}</h1>
      <p>El libro está terminado y ahora mismo lo estoy preparando en formato digital. Te escribo en cuanto esté listo, y quienes están en esta lista lo reciben primero.</p>
      <p>Mientras tanto, no te quedes esperando: la herramienta del libro ya está funcionando y es gratis.</p>
      <p>
        <a href="${SITE_URL}/diagnostico"
           style="display:inline-block;background:#16a34a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">
          Calcular mi IPD gratis
        </a>
      </p>
      <p>Es el mismo método del libro: calcula tu Índice de Presión de Deuda, te dice en cuál de las cuatro fases estás y con qué criterio pagar en cada una.</p>
      <p>— Rolando Rodríguez</p>
    `),
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SubscribePayload>;
    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const source: LeadSource = body.source === 'lista-espera' ? 'lista-espera' : 'plantilla';

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }

    const { subject, html } = source === 'lista-espera' ? listaEsperaEmail(name) : plantillaEmail(name);
    await sendEmail({ to: email, subject, html });

    // El aviso a Rolando va después y en su propio try: si falla, el suscriptor
    // ya recibió lo suyo y no tiene por qué ver un error.
    if (NOTIFY_TO) {
      try {
        await sendEmail({
          to: NOTIFY_TO,
          replyTo: email,
          subject: `Lead nuevo (${source}): ${name}`,
          html: WRAP(
            `<p><strong>${name}</strong> — ${email}</p><p>Origen: ${source}</p>` +
              `<p style="color:#6b7280;font-size:13px">Aviso automático mientras no haya ESP conectado. Responder a este correo le escribe directo al lead.</p>`,
          ),
        });
      } catch (err) {
        console.error('[subscribe] no se pudo avisar del lead', err);
      }
    } else {
      console.warn('[subscribe] sin LEAD_NOTIFY_EMAIL ni EMAIL_FROM: el lead no queda en ningún lado', { source });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unexpected error' }, { status: 500 });
  }
}
