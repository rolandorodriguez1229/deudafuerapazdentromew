/**
 * Entrega de los archivos del libro.
 *
 * Los entregables viven en un bucket PRIVADO de Supabase Storage. Nunca se
 * sirven directo ni se copian a /public: la página de descargas valida el
 * permiso contra la base y pide a Supabase una URL firmada de vida corta, que
 * no se guarda en ningún lado.
 *
 * Antes esto era `/downloads/guia-estrategias.pdf` en /public, o sea que
 * cualquiera con la URL se lo bajaba sin pagar ni suscribirse.
 */
import { createAdminClient } from '@/lib/supabase/admin';

export const BUCKET = 'entregas';

/** Minutos que vive una URL firmada. Corta a propósito: se regenera entrando. */
const TTL_FIRMA_SEGUNDOS = 15 * 60;

export type GrantTipo = 'lead' | 'compra';

export interface Entregable {
  ruta: string;
  nombre: string;
  descripcion: string;
  /** Nombre con el que se guarda en el disco de quien descarga */
  archivo: string;
}

/**
 * El catálogo. `lead` es un subconjunto de `compra`: quien paga recibe todo lo
 * que recibe quien solo se suscribe, más el libro.
 */
export const CATALOGO: Record<GrantTipo, Entregable[]> = {
  lead: [
    {
      ruta: 'anexos/guia-estrategias.pdf',
      nombre: 'Guía de Estrategias',
      descripcion: 'Las cuatro fases del Selector y las reglas de decisión, en un solo documento.',
      archivo: 'Guia-de-Estrategias.pdf',
    },
  ],
  compra: [
    {
      ruta: 'libro/deuda-fuera-paz-dentro.epub',
      nombre: 'Deuda Fuera, Paz Dentro (EPUB)',
      descripcion: 'Para Kindle, Apple Books, Google Play Books y cualquier lector.',
      archivo: 'Deuda-Fuera-Paz-Dentro.epub',
    },
    {
      ruta: 'libro/deuda-fuera-paz-dentro.pdf',
      nombre: 'Deuda Fuera, Paz Dentro (PDF)',
      descripcion: 'Para leer en pantalla o imprimir. 162 páginas.',
      archivo: 'Deuda-Fuera-Paz-Dentro.pdf',
    },
    {
      ruta: 'anexos/guia-estrategias.pdf',
      nombre: 'Guía de Estrategias',
      descripcion: 'Las cuatro fases y las reglas de decisión, para tener a la mano.',
      archivo: 'Guia-de-Estrategias.pdf',
    },
    {
      ruta: 'anexos/scripts-negociacion.pdf',
      nombre: 'Scripts para negociar',
      descripcion: 'Qué decir al llamar, la goodwill letter y cuándo aceptar el trato.',
      archivo: 'Scripts-para-negociar.pdf',
    },
    {
      ruta: 'anexos/calendario-7-3-1.ics',
      nombre: 'Calendario 7-3-1',
      descripcion: 'Los tres recordatorios de pago. Se importa a Google Calendar, Apple o Outlook.',
      archivo: 'Calendario-7-3-1.ics',
    },
  ],
};

export interface Grant {
  id: string;
  token: string;
  email: string;
  tipo: GrantTipo;
  downloads: number;
}

export function hasEntregas(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Crea (o reutiliza) el permiso de descarga.
 *
 * Idempotente por `stripe_session_id`: Stripe reintenta los webhooks, y dos
 * permisos para una misma compra significarían dos correos y dos enlaces vivos.
 * Si alguien que ya era lead compra, se le sube el permiso a `compra` en vez de
 * dejarle dos tokens dando vueltas.
 */
export async function otorgarGrant(input: {
  email: string;
  tipo: GrantTipo;
  stripeSessionId?: string | null;
  leadId?: string | null;
}): Promise<Grant> {
  const admin = createAdminClient();
  const email = input.email.trim();

  if (input.stripeSessionId) {
    const { data: previo } = await admin
      .from('download_grants')
      .select('id, token, email, tipo, downloads')
      .eq('stripe_session_id', input.stripeSessionId)
      .maybeSingle();
    if (previo) return previo as Grant;
  }

  const { data: existente } = await admin
    .from('download_grants')
    .select('id, token, email, tipo, downloads')
    .ilike('email', email)
    .is('revoked_at', null)
    .maybeSingle();

  if (existente) {
    // Un lead que compra sube de nivel; un comprador nunca baja a lead.
    const sube = input.tipo === 'compra' && existente.tipo === 'lead';
    if (sube || input.stripeSessionId) {
      const { data, error } = await admin
        .from('download_grants')
        .update({
          tipo: sube ? 'compra' : existente.tipo,
          stripe_session_id: input.stripeSessionId ?? null,
        })
        .eq('id', existente.id)
        .select('id, token, email, tipo, downloads')
        .single();
      if (error) throw new Error(`grants.update: ${error.message}`);
      return data as Grant;
    }
    return existente as Grant;
  }

  const { data, error } = await admin
    .from('download_grants')
    .insert({
      email,
      tipo: input.tipo,
      stripe_session_id: input.stripeSessionId ?? null,
      lead_id: input.leadId ?? null,
    })
    .select('id, token, email, tipo, downloads')
    .single();
  if (error) throw new Error(`grants.insert: ${error.message}`);
  return data as Grant;
}

/** Devuelve el permiso si el token es válido, no caducó y no fue revocado. */
export async function buscarGrant(token: string): Promise<Grant | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('download_grants')
    .select('id, token, email, tipo, downloads, expires_at, revoked_at')
    .eq('token', token)
    .maybeSingle();

  if (!data) return null;
  if (data.revoked_at) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  return data as Grant;
}

export interface EnlaceFirmado extends Entregable {
  url: string;
}

/**
 * Firma las URLs de lo que el permiso autoriza.
 *
 * Se firma en cada visita y con vida corta: si alguien reenvía el correo, el
 * enlace que comparte es el de /descargas —que se puede revocar— y no una URL
 * de Storage que viviría para siempre.
 */
export async function firmarEntregables(tipo: GrantTipo): Promise<EnlaceFirmado[]> {
  const admin = createAdminClient();
  const items = CATALOGO[tipo];
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrls(items.map((i) => i.ruta), TTL_FIRMA_SEGUNDOS);
  if (error) throw new Error(`storage.sign: ${error.message}`);

  const porRuta = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
  return items
    .map((i) => ({ ...i, url: porRuta.get(i.ruta) ?? '' }))
    .filter((i) => i.url);
}

/** Cuenta la visita. Sirve para detectar un enlace que se está compartiendo. */
export async function registrarDescarga(grantId: string): Promise<void> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('download_grants')
    .select('downloads')
    .eq('id', grantId)
    .maybeSingle();
  await admin
    .from('download_grants')
    .update({
      downloads: (data?.downloads ?? 0) + 1,
      last_download_at: new Date().toISOString(),
    })
    .eq('id', grantId);
}
