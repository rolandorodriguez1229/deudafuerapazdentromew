import { redirect } from 'next/navigation';
import { getHouseholdId } from './data';
import { createClient, hasSupabaseEnv } from '@/lib/supabase/server';

/** Guard de páginas con cuenta: redirige a /entrar si no hay sesión. */
export async function requireUser(next: string) {
  if (!hasSupabaseEnv()) redirect('/diagnostico');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/diagnostico/entrar?next=${encodeURIComponent(next)}`);

  const householdId = await getHouseholdId(supabase, user);
  if (!householdId) redirect(`/diagnostico/entrar?next=${encodeURIComponent(next)}`);

  return { supabase, user, householdId };
}
