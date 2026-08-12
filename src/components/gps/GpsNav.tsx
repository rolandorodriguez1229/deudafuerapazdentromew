import Link from 'next/link';
import { getCopy } from '@/lib/gps/copy';
import type { Locale } from '@/lib/i18n';

export const GPS_TABS = [
  '/diagnostico/panel',
  '/diagnostico/oxigeno',
  '/diagnostico/deudas',
  '/diagnostico/escenarios',
  '/diagnostico/cuenta',
] as const;

export type GpsTab = (typeof GPS_TABS)[number];

export default function GpsNav({ active, locale }: { active: GpsTab; locale: Locale }) {
  const c = getCopy(locale);
  const labels: Record<GpsTab, string> = {
    '/diagnostico/panel': c.nav.panel,
    '/diagnostico/oxigeno': c.nav.oxigeno,
    '/diagnostico/deudas': c.nav.deudas,
    '/diagnostico/escenarios': c.nav.escenarios,
    '/diagnostico/cuenta': c.nav.cuenta,
  };

  return (
    <div className="mb-6">
      <nav className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {GPS_TABS.map((href) => (
          <Link
            key={href}
            href={href}
            aria-current={href === active ? 'page' : undefined}
            className={
              href === active
                ? 'px-4 py-2 rounded-full bg-primary-600 text-white text-sm font-medium whitespace-nowrap'
                : 'px-4 py-2 rounded-full bg-white border border-neutral-200 text-neutral-600 text-sm font-medium whitespace-nowrap hover:border-primary-300'
            }
          >
            {labels[href]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
