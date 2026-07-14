import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente con service-role: SALTA RLS. Usar SOLO en el webhook de Stripe
 * y en crons del servidor. Nunca importar desde código de cliente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
