/**
 * Plantillas de correo de la lista.
 *
 * Dos tipos, y la diferencia importa legalmente:
 *
 *  - Confirmación (doble opt-in): es transaccional. El usuario la pidió al
 *    enviar el formulario, así que puede salir sin consentimiento previo.
 *  - Bienvenida y todo lo que venga después: es marketing. CAN-SPAM exige
 *    dirección postal física y baja en un clic; CASL exige que esa baja siga
 *    funcionando 60 días después del envío.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.deudafuerapazdentro.com';

/**
 * Dirección postal física, obligatoria por CAN-SPAM en correo de marketing.
 * No hay valor por defecto a propósito: inventar una dirección sería peor que
 * no ponerla. Si falta, `marketingFooter` avisa en el log del servidor.
 */
const POSTAL_ADDRESS = process.env.EMAIL_POSTAL_ADDRESS;

export function unsubscribeUrl(token: string): string {
  return `${SITE_URL}/baja?t=${token}`;
}

function shell(titulo: string, inner: string): string {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titulo}</title></head>
<body style="margin:0;background:#f6f7f9">
<div style="font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937;background:#ffffff;line-height:1.6">
${inner}
</div></body></html>`;
}

const BOTON = 'display:inline-block;background:#15803d;color:#ffffff;padding:13px 22px;border-radius:8px;text-decoration:none;font-weight:600';

/** Pie legal del correo de marketing: baja + identificación + dirección. */
function marketingFooter(token: string): string {
  if (!POSTAL_ADDRESS) {
    console.warn(
      '[email] falta EMAIL_POSTAL_ADDRESS — CAN-SPAM exige dirección postal en correo de marketing',
    );
  }
  return `
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 16px">
    <p style="font-size:12px;color:#6b7280;margin:0 0 6px">
      Recibes esto porque pediste la guía en deudafuerapazdentro.com y confirmaste tu correo.
      <a href="${unsubscribeUrl(token)}" style="color:#6b7280">Darme de baja</a> — es un clic, sin preguntas.
    </p>
    <p style="font-size:12px;color:#9ca3af;margin:0">
      Rolando Rodríguez${POSTAL_ADDRESS ? ` · ${POSTAL_ADDRESS}` : ''}
    </p>`;
}

/** Paso 1 del doble opt-in. Transaccional: no lleva pie de marketing. */
export function confirmEmail(name: string | null, confirmUrl: string) {
  const saludo = name ? `Hola, ${name}` : 'Hola';
  return {
    subject: 'Confirma tu correo (un clic y listo)',
    html: shell(
      'Confirma tu correo',
      `<h1 style="color:#1e3a8a;font-size:22px;margin:0 0 12px">${saludo}</h1>
       <p style="margin:0 0 16px">Falta un paso. Haz clic para confirmar que este correo es tuyo y te mando el acceso al GPS Anti-Deuda:</p>
       <p style="margin:0 0 20px"><a href="${confirmUrl}" style="${BOTON}">Confirmar mi correo</a></p>
       <p style="font-size:14px;color:#4b5563;margin:0 0 8px">El enlace vence en 48 horas. Si no funciona, copia y pega esta dirección:</p>
       <p style="font-size:12px;color:#6b7280;word-break:break-all;margin:0 0 20px">${confirmUrl}</p>
       <p style="font-size:14px;color:#4b5563;margin:0">Si tú no pediste esto, ignora el correo: sin ese clic no te escribo más.</p>`,
    ),
  };
}

/** Paso 2: ya confirmó. Esto sí es marketing. */
export function welcomeEmail(name: string | null, unsubToken: string) {
  const saludo = name ? `Listo, ${name}` : 'Listo';
  return {
    subject: 'Tu GPS Anti-Deuda está listo',
    html: shell(
      'Tu GPS Anti-Deuda',
      `<h1 style="color:#1e3a8a;font-size:22px;margin:0 0 12px">${saludo}</h1>
       <p style="margin:0 0 16px">Aquí tienes tu <strong>GPS Anti-Deuda</strong>. No hay nada que descargar: entra, pon tus números y en 15 minutos tienes tu diagnóstico.</p>
       <p style="margin:0 0 20px"><a href="${SITE_URL}/diagnostico" style="${BOTON}">Calcular mi IPD gratis</a></p>
       <h2 style="font-size:16px;color:#111827;margin:0 0 8px">Qué vas a ver</h2>
       <p style="margin:0 0 16px">En cuál de las cuatro fases estás —Déficit, Oxígeno, Bola de Nieve o Avalancha— y con qué criterio pagar en la tuya. Y un diagnóstico deuda por deuda: cuál te está asfixiando y cuál conviene renegociar antes que pagar.</p>
       <p style="margin:0">En los próximos días te escribo con las estrategias que mejor funcionan en cada fase.</p>
       <p style="margin:16px 0 0">— Rolando</p>
       ${marketingFooter(unsubToken)}`,
    ),
  };
}

/** Aviso interno a Rolando. Puente hasta que haya ESP conectado. */
export function leadNotifyEmail(name: string | null, email: string, source: string) {
  return {
    subject: `Lead confirmado (${source}): ${name || email}`,
    html: shell(
      'Lead confirmado',
      `<p style="margin:0 0 6px"><strong>${name || '(sin nombre)'}</strong> — ${email}</p>
       <p style="margin:0 0 6px">Origen: ${source}</p>
       <p style="font-size:13px;color:#6b7280;margin:12px 0 0">Confirmó el doble opt-in, así que ya cuenta para el umbral de los 5,000. Responder a este correo le escribe directo.</p>`,
    ),
  };
}
