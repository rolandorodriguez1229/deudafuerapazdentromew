// Sistema de traducción del GPS Anti-Deuda.
//
// Español por defecto con interruptor a inglés desde el día uno: el 67% de los
// hispanos en EE.UU. nació aquí y la 3ª generación consume en inglés. El idioma
// vive en una cookie (nada de rutas /es y /en, para que la URL impresa en el
// libro —/diagnostico— nunca cambie ni redirija por idioma).

export type Locale = 'es' | 'en';

export const LOCALES: readonly Locale[] = ['es', 'en'];
export const DEFAULT_LOCALE: Locale = 'es';
export const LOCALE_COOKIE = 'gps_lang';
/** Un año: el idioma es una preferencia, no una sesión. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return value === 'es' || value === 'en';
}

export function normalizeLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export const LOCALE_LABEL: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};
