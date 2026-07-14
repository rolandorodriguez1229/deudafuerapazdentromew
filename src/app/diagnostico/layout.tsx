import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import Disclaimer from '@/components/gps/Disclaimer';

export const metadata: Metadata = {
  title: {
    default: 'GPS Anti-Deuda',
    template: '%s | GPS Anti-Deuda',
  },
};

export default function DiagnosticoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white border-b border-neutral-200">
        <div className="section-container flex items-center justify-between h-14">
          <Link href="/diagnostico" className="flex items-center gap-2 font-semibold text-primary-900">
            <Compass className="w-5 h-5 text-primary-600" />
            <span>GPS Anti-Deuda</span>
          </Link>
          <Link href="/" className="text-sm text-neutral-500 hover:text-primary-700">
            Deuda Fuera, Paz Dentro
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Disclaimer />
    </div>
  );
}
