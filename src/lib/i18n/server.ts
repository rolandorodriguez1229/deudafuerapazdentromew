// Lectura del idioma en el servidor. Se mantiene aparte de `index.ts` para que
// los componentes de cliente puedan importar los tipos sin arrastrar next/headers.

import { cookies } from 'next/headers';
import { LOCALE_COOKIE, normalizeLocale, type Locale } from './index';
import { getCopy, type Copy } from '@/lib/gps/copy';

export async function getLocale(): Promise<Locale> {
  try {
    const store = await cookies();
    return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
  } catch {
    // Renderizado estático: el idioma por defecto es el correcto.
    return normalizeLocale(undefined);
  }
}

export async function getServerCopy(): Promise<{ locale: Locale; c: Copy }> {
  const locale = await getLocale();
  return { locale, c: getCopy(locale) };
}
