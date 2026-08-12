import type { Locale } from '@/lib/i18n';
import { en } from './en';
import { es, type Copy } from './es';

export type { Copy };

const DICTIONARIES: Record<Locale, Copy> = { es, en };

export function getCopy(locale: Locale): Copy {
  return DICTIONARIES[locale] ?? es;
}
