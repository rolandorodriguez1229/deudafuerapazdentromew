import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import MagicLinkForm from '@/components/gps/MagicLinkForm';
import { getCopy } from '@/lib/gps/copy';
import { getLocale } from '@/lib/i18n/server';
import { createClient, hasSupabaseEnv } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Entrar',
  alternates: { canonical: '/diagnostico/entrar' },
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const [locale, params] = await Promise.all([getLocale(), searchParams]);
  const c = getCopy(locale);

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect(params.next ?? '/diagnostico/panel');
  }

  return (
    <div className="section-container py-12">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
        <h1 className="heading-md text-primary-900 mb-2">{c.auth.title}</h1>
        <p className="text-neutral-600 mb-6">{c.auth.intro}</p>
        <MagicLinkForm
          locale={locale}
          next={params.next ?? '/diagnostico/inicio'}
          urlError={params.error}
        />
      </div>
    </div>
  );
}
