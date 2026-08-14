import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { sendEmail } from '@/lib/email';
import { leadNotifyEmail, welcomeEmail } from '@/lib/emails';
import { hasEntregas, otorgarGrant } from '@/lib/entregas';
import { confirmLead } from '@/lib/leads';

export const metadata: Metadata = {
  title: 'Confirma tu correo',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const NOTIFY_TO = process.env.LEAD_NOTIFY_EMAIL || process.env.EMAIL_FROM;

/**
 * Paso 2 del doble opt-in. Consume el token, marca el lead como confirmado y
 * recién entonces manda lo prometido.
 *
 * Es idempotente: quien haga doble clic o reenvíe el enlace ve lo mismo. Lo que
 * no se repite es el correo de bienvenida — eso lo decide `confirmLead`, que
 * distingue entre confirmar por primera vez y volver a entrar.
 */
export default async function ConfirmarPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const lead = t ? await confirmLead(t) : null;

  let tokenDescarga: string | null = null;
  if (lead && hasEntregas()) {
    // Confirmar da derecho a la guía. El permiso se crea aquí, no al pedir el
    // alta: antes del clic no hay consentimiento verificado y no se entrega nada.
    try {
      const grant = await otorgarGrant({ email: lead.email, tipo: 'lead' });
      tokenDescarga = grant.token;
    } catch (err) {
      console.error('[confirmar] no se pudo crear el permiso de descarga', err);
    }
  }

  if (lead) {
    const { subject, html } = welcomeEmail(lead.name, lead.unsubscribeToken, tokenDescarga);
    // Si el correo falla, el lead YA quedó confirmado: es lo que importa. No se
    // le muestra un error por algo que puede reintentarse desde el enlace.
    try {
      await sendEmail({ to: lead.email, subject, html });
      if (NOTIFY_TO) {
        const aviso = leadNotifyEmail(lead.name, lead.email, lead.source);
        await sendEmail({ to: NOTIFY_TO, replyTo: lead.email, ...aviso });
      }
    } catch (err) {
      console.error('[confirmar] confirmado pero falló el envío', err);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-xl p-8 sm:p-10 text-center">
        {lead ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-8 w-8 text-green-600" aria-hidden />
            </div>
            <h1 className="heading-md text-neutral-900 mb-3">Correo confirmado</h1>
            <p className="text-neutral-600 mb-6">
              Ya estás dentro. Te mandé todo por correo, pero no hace falta que lo esperes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/diagnostico" className="btn-primary inline-flex items-center justify-center">
                Calcular mi IPD gratis
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
              </Link>
              {tokenDescarga && (
                <Link href={`/descargas?t=${tokenDescarga}`} className="btn-secondary">
                  Descargar mi guía
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="h-8 w-8 text-amber-600" aria-hidden />
            </div>
            <h1 className="heading-md text-neutral-900 mb-3">Este enlace ya no sirve</h1>
            <p className="text-neutral-600 mb-6">
              Los enlaces de confirmación vencen a las 48 horas. Pide uno nuevo y te llega en
              seguida — o entra directo al GPS, que es gratis y no necesita correo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/plantilla-gratuita" className="btn-primary">
                Pedir un enlace nuevo
              </Link>
              <Link href="/diagnostico" className="btn-secondary">
                Entrar al GPS
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
