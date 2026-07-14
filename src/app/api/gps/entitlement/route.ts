import { NextResponse } from 'next/server';
import { getEntitlement } from '@/lib/gps/entitlement';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** Consultado por /diagnostico/gracias mientras llega el webhook de Stripe. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ entitlement: 'free' }, { status: 401 });
  }
  const entitlement = await getEntitlement(supabase);
  return NextResponse.json({ entitlement });
}
