/**
 * La lista de correo, del lado del servidor.
 *
 * Todo pasa por el service-role: la tabla `leads` no tiene políticas RLS ni
 * grants para anon/authenticated, así que el navegador no la toca ni por
 * accidente. Ver `supabase/migrations/0003_leads.sql`.
 *
 * Doble opt-in: un alta entra como `pending` y solo cuenta cuando el usuario
 * hace clic en el enlace de confirmación. El contador de los 5,000 —la regla
 * que dispara el lanzamiento del GPS Full— cuenta únicamente confirmados.
 */
import { createAdminClient } from '@/lib/supabase/admin';

export type LeadSource = 'plantilla' | 'guia_estrategias' | 'lista_espera' | 'gps';

/** 48 h, el máximo que aguanta un enlace de confirmación antes de oler a viejo. */
const CONFIRM_TTL_MS = 48 * 60 * 60 * 1000;
/** Tope de reenvíos por hora, para que el formulario no sirva de ariete. */
const MAX_ATTEMPTS_PER_HOUR = 3;

export function hasLeadsStore(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export interface UpsertResult {
  /** null cuando no hay que mandar correo (ya estaba confirmado, o pidió demasiadas veces) */
  confirmToken: string | null;
  status: 'nuevo' | 'reenvio' | 'ya_confirmado' | 'limite';
}

/**
 * Alta o re-alta. Devuelve el token a poner en el enlace de confirmación.
 *
 * El token se regenera en cada intento: si un enlace viejo se filtró en un
 * reenvío de correo, deja de servir en cuanto el usuario pide otro.
 */
export async function upsertLead(input: {
  email: string;
  name?: string;
  source: LeadSource;
  consentText: string;
}): Promise<UpsertResult> {
  const admin = createAdminClient();
  const email = input.email.trim();
  const now = new Date();

  const { data: existing } = await admin
    .from('leads')
    .select('id, status, confirm_attempts, last_confirm_attempt_at')
    .ilike('email', email)
    .maybeSingle();

  // Ya confirmado: no se le vuelve a pedir nada, pero tampoco es un error para
  // el usuario — se le enseña la misma pantalla de éxito.
  if (existing?.status === 'confirmed') {
    return { confirmToken: null, status: 'ya_confirmado' };
  }

  // Se dio de baja y vuelve por otro formulario: se respeta la baja anterior y
  // se le pide confirmar otra vez. Nunca se le reactiva en silencio.
  const dentroDeLaHora =
    existing?.last_confirm_attempt_at &&
    now.getTime() - new Date(existing.last_confirm_attempt_at).getTime() < 60 * 60 * 1000;
  if (existing && dentroDeLaHora && existing.confirm_attempts >= MAX_ATTEMPTS_PER_HOUR) {
    return { confirmToken: null, status: 'limite' };
  }

  const confirmToken = crypto.randomUUID();
  const fila = {
    email,
    name: input.name?.trim() || null,
    source: input.source,
    status: 'pending' as const,
    confirm_token: confirmToken,
    confirm_sent_at: now.toISOString(),
    confirm_expires_at: new Date(now.getTime() + CONFIRM_TTL_MS).toISOString(),
    confirm_attempts: dentroDeLaHora ? (existing?.confirm_attempts ?? 0) + 1 : 1,
    last_confirm_attempt_at: now.toISOString(),
    consent_text: input.consentText,
    consent_at: now.toISOString(),
  };

  if (existing) {
    const { error } = await admin.from('leads').update(fila).eq('id', existing.id);
    if (error) throw new Error(`leads.update: ${error.message}`);
    return { confirmToken, status: 'reenvio' };
  }

  const { error } = await admin.from('leads').insert(fila);
  if (error) throw new Error(`leads.insert: ${error.message}`);
  return { confirmToken, status: 'nuevo' };
}

export interface ConfirmedLead {
  email: string;
  name: string | null;
  source: LeadSource;
  unsubscribeToken: string;
}

/**
 * Consume el token de confirmación. Devuelve null si no existe o si caducó,
 * para que la página muestre "pide el enlace otra vez" en vez de un error.
 *
 * Es idempotente: confirmar dos veces con el mismo token devuelve el lead las
 * dos veces. El usuario que hace doble clic no debe ver un fallo.
 */
export async function confirmLead(token: string): Promise<ConfirmedLead | null> {
  const admin = createAdminClient();
  const { data: lead } = await admin
    .from('leads')
    .select('id, email, name, source, status, confirm_expires_at, unsubscribe_token')
    .eq('confirm_token', token)
    .maybeSingle();

  if (!lead) return null;

  const salida: ConfirmedLead = {
    email: lead.email,
    name: lead.name,
    source: lead.source,
    unsubscribeToken: lead.unsubscribe_token,
  };

  if (lead.status === 'confirmed') return salida;

  if (lead.confirm_expires_at && new Date(lead.confirm_expires_at) < new Date()) {
    return null;
  }

  const { error } = await admin
    .from('leads')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', lead.id);
  if (error) throw new Error(`leads.confirm: ${error.message}`);

  return salida;
}

/**
 * Baja. El token NO se regenera nunca: los correos ya enviados llevan ese
 * enlace y CASL exige que siga funcionando 60 días después del envío.
 */
export async function unsubscribeLead(token: string): Promise<{ email: string } | null> {
  const admin = createAdminClient();
  const { data: lead } = await admin
    .from('leads')
    .select('id, email, status')
    .eq('unsubscribe_token', token)
    .maybeSingle();

  if (!lead) return null;
  if (lead.status === 'unsubscribed') return { email: lead.email };

  const { error } = await admin
    .from('leads')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .eq('id', lead.id);
  if (error) throw new Error(`leads.unsubscribe: ${error.message}`);

  return { email: lead.email };
}

/** La cifra que gobierna el lanzamiento del GPS Full. Solo confirmados. */
export async function confirmedLeadsCount(): Promise<number> {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'confirmed');
  if (error) throw new Error(`leads.count: ${error.message}`);
  return count ?? 0;
}
