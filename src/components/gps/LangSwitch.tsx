import { Languages } from 'lucide-react';
import { setLocaleFromForm } from '@/app/diagnostico/actions';
import { LOCALES, LOCALE_LABEL, type Locale } from '@/lib/i18n';

/**
 * Interruptor de idioma. Español por defecto, inglés desde el día uno: la 3ª
 * generación consume en inglés y no queremos perderla.
 *
 * Son dos <form> con server action, no un componente de cliente: funciona sin
 * JavaScript y no manda un solo kilobyte al navegador.
 */
export default function LangSwitch({ locale }: { locale: Locale }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <Languages className="w-3.5 h-3.5 text-neutral-400" aria-hidden />
      {LOCALES.map((l) => (
        <form key={l} action={setLocaleFromForm}>
          <input type="hidden" name="locale" value={l} />
          <button
            type="submit"
            lang={l}
            aria-current={l === locale ? 'true' : undefined}
            className={
              l === locale
                ? 'px-2 py-1 rounded-full bg-neutral-900 text-white font-medium'
                : 'px-2 py-1 rounded-full text-neutral-500 hover:text-neutral-900'
            }
          >
            {LOCALE_LABEL[l]}
          </button>
        </form>
      ))}
    </div>
  );
}
