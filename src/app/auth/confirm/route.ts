import { type EmailOtpType } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Destino del enlace mágico. La plantilla de email de Supabase debe apuntar a:
// {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const rawNext = searchParams.get('next') ?? '/diagnostico/inicio';
  // Solo rutas internas — evita open redirects.
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/diagnostico/inicio';

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      redirect(next);
    }
  }

  // Plantilla default de Supabase (flujo PKCE): llega ?code= en lugar de token_hash
  const code = searchParams.get('code');
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(next);
    }
  }

  redirect('/diagnostico/entrar?error=enlace_expirado');
}
