import type { SupabaseClient } from '@supabase/supabase-js';

export type Entitlement = 'free' | 'full';

const FULL_STATUSES = new Set(['active', 'trialing', 'past_due']);

/**
 * Full si ALGÚN miembro del hogar tiene suscripción vigente
 * (la política RLS ya limita el select a las suscripciones del hogar).
 * `past_due` mantiene acceso mientras Stripe reintenta el cobro.
 */
export async function getEntitlement(supabase: SupabaseClient): Promise<Entitlement> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, current_period_end');
  if (error || !data) return 'free';

  const now = Date.now();
  const hasActive = data.some((s) => {
    if (!FULL_STATUSES.has(s.status)) return false;
    if (!s.current_period_end) return true;
    // 3 días de gracia sobre el fin de periodo para el retraso del webhook
    return new Date(s.current_period_end).getTime() + 3 * 24 * 3600 * 1000 > now;
  });
  return hasActive ? 'full' : 'free';
}
