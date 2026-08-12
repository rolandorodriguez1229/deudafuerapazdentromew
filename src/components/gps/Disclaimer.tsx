import { getCopy } from '@/lib/gps/copy';
import type { Locale } from '@/lib/i18n';

/**
 * Los dos disclaimers van juntos y en TODAS las pantallas. El segundo no es
 * opcional: nos mantiene fuera del alcance de las leyes estatales de debt
 * adjusting y del Telemarketing Sales Rule de la FTC.
 */
export default function Disclaimer({ locale }: { locale: Locale }) {
  const c = getCopy(locale);
  return (
    <div className="text-xs text-neutral-400 text-center max-w-xl mx-auto py-6 px-4 space-y-2">
      <p>{c.disclaimer}</p>
      <p>{c.disclaimerRegulatorio}</p>
    </div>
  );
}
