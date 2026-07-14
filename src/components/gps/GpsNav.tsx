import Link from 'next/link';

const TABS = [
  { href: '/diagnostico/panel', label: 'Panel' },
  { href: '/diagnostico/deudas', label: 'Deudas' },
  { href: '/diagnostico/escenarios', label: 'Escenarios' },
  { href: '/diagnostico/cuenta', label: 'Cuenta' },
] as const;

export default function GpsNav({ active }: { active: (typeof TABS)[number]['href'] }) {
  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 mb-6 -mx-1 px-1">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={
            tab.href === active
              ? 'px-4 py-2 rounded-full bg-primary-600 text-white text-sm font-medium whitespace-nowrap'
              : 'px-4 py-2 rounded-full bg-white border border-neutral-200 text-neutral-600 text-sm font-medium whitespace-nowrap hover:border-primary-300'
          }
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
