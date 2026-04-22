type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, from, replyTo }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — skipping send', { to, subject });
    return { ok: false, skipped: true };
  }

  const fromAddress = from || process.env.EMAIL_FROM || 'Deuda Fuera, Paz Dentro <no-reply@deudafuerapazdentro.com>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [to],
      subject,
      html,
      reply_to: replyTo,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[email] Resend error', res.status, text);
    return { ok: false, status: res.status };
  }
  return { ok: true };
}
