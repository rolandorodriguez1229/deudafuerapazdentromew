import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import Disclaimer from '@/components/gps/Disclaimer';
import LangSwitch from '@/components/gps/LangSwitch';
import { getLocale } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: {
    default: 'GPS Anti-Deuda',
    template: '%s | GPS Anti-Deuda',
  },
};

export default async function DiagnosticoLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white border-b border-neutral-200">
        <div className="section-container flex items-center justify-between gap-3 h-14">
          <Link
            href="/diagnostico"
            className="flex items-center gap-2 font-semibold text-primary-900"
          >
            <Compass className="w-5 h-5 text-primary-600" aria-hidden />
            <span>GPS Anti-Deuda</span>
          </Link>
          <div className="flex items-center gap-4">
            <LangSwitch locale={locale} />
            <Link
              href="/"
              className="hidden sm:inline text-sm text-neutral-500 hover:text-primary-700"
            >
              Deuda Fuera, Paz Dentro
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Disclaimer locale={locale} />
    </div>
  );
}
