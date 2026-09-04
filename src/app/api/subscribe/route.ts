import { NextResponse } from 'next/server';
import { confirmEmail } from '@/lib/emails';
import { sendEmail } from '@/lib/email';
import { hasLeadsStore, upsertLead, type LeadSource } from '@/lib/leads';

export const runtime = 'nodejs';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.deudafuerapazdentro.com';

/**
 * Alta en la lista, con doble opt-in.
 *
 * El lead entra como `pending` y solo cuenta cuando hace clic en el enlace de
 * confirmación (ver `/confirmar`). Aquí NO se entrega nada todavía: mandar el
 * regalo antes de confirmar convierte el doble opt-in en teatro.
 *
 * La respuesta es deliberadamente igual para alta nueva, reenvío y correo ya
 * confirmado: si dijera "ese correo ya está en la lista", el formulario se
 * volvería un buscador de suscriptores.
 */

/** El origen que manda el formulario → el valor que guarda la base. */
const ORIGENES: Record<string, LeadSource> = {
  plantilla: 'plantilla',
  'guia-estrategias': 'guia_estrategias',
  'lista-espera': 'lista_espera',
  gps: 'gps',
};

/** El texto que el usuario acepta, guardado tal cual como prueba de consentimiento. */
const CONSENTIMIENTO =
  'Acepto recibir correos de Deuda Fuera, Paz Dentro. Puedo darme de baja cuando quiera.';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<{ name: string; email: string; source: string }>;
    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const source = ORIGENES[(body.source || '').toString()] ?? 'plantilla';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: 'Escribe un correo válido, por ejemplo maria@correo.com.' },
        { status: 400 },
      );
    }
    if (!name) {
      return NextResponse.json({ ok: false, error: 'Falta tu nombre.' }, { status: 400 });
    }

    if (!hasLeadsStore()) {
      // Sin base no hay lista, y sin lista el alta se perdería en silencio —
      // que es justo el problema que esto vino a resolver. Mejor fallar fuerte.
      console.error('[subscribe] sin Supabase configurado: no se puede guardar el lead');
      return NextResponse.json(
        { ok: false, error: 'No pudimos guardar tu correo. Intenta más tarde.' },
        { status: 503 },
      );
    }

    const { confirmToken, status } = await upsertLead({
      email,
      name,
      source,
      consentText: CONSENTIMIENTO,
    });

    if (confirmToken) {
      const url = `${SITE_URL}/confirmar?t=${confirmToken}`;
      const { subject, html } = confirmEmail(name, url);
      const envio = await sendEmail({ to: email, subject, html });

      if (!envio.ok) {
        // El lead ya quedó guardado, pero sin este correo nadie puede confirmar
        // — y sin confirmar no recibe nada. Devolver ok:true aquí pinta un
        // "revisa tu correo" sobre un correo que nunca salió, y el embudo se
        // rompe sin que nadie lo note. Mejor fallar fuerte, como arriba.
        console.error('[subscribe] el correo de confirmación no salió', {
          motivo: envio.skipped ? 'falta RESEND_API_KEY' : `resend respondió ${envio.status}`,
          // Solo el dominio: el correo completo no tiene por qué vivir en un log.
          dominio: email.slice(email.indexOf('@')),
          origen: source,
        });
        return NextResponse.json(
          {
            ok: false,
            error:
              'Guardamos tu registro, pero no pudimos enviarte el correo de confirmación. ' +
              'Inténtalo otra vez en un minuto; si sigue igual, escríbenos a contacto@deudafuerapazdentro.com.',
          },
          { status: 502 },
        );
      }
    }

    // `limite` y `ya_confirmado` también devuelven ok: el usuario ve la misma
    // pantalla y no aprende nada sobre quién está en la lista.
    return NextResponse.json({ ok: true, pendingConfirmation: status !== 'ya_confirmado' });
  } catch (err) {
    console.error('[subscribe] falló el alta', err);
    return NextResponse.json(
      { ok: false, error: 'Algo salió mal de nuestro lado. Intenta de nuevo en un momento.' },
      { status: 500 },
    );
  }
}
