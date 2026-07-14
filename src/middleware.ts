import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// Solo el GPS Anti-Deuda usa sesión — las páginas de marketing no pasan por aquí.
export const config = {
  matcher: ['/diagnostico/:path*', '/auth/:path*'],
};
