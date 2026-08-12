import type { Copy } from './copy';
import type { YearMonth } from './types';

// Las cifras son en USD para los dos idiomas: el público vive en EE.UU.
const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const usdWhole = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatCents(cents: number): string {
  return usd.format(cents / 100);
}

/** Sin centavos, para cifras grandes del tablero */
export function formatCentsWhole(cents: number): string {
  return usdWhole.format(Math.round(cents / 100));
}

/** 0.62 → "62%" */
export function formatRatio(ratio: number | null, decimals = 0): string {
  if (ratio === null || !Number.isFinite(ratio)) return '—';
  return `${(ratio * 100).toFixed(decimals)}%`;
}

/** El IPD siempre se muestra en decimal: 0.6234 → "0.62". Nunca como porcentaje. */
export function formatIpd(ipd: number | null): string {
  if (ipd === null || !Number.isFinite(ipd)) return '—';
  return ipd.toFixed(2);
}

/** 15.9 → "16 meses" (redondeado hacia arriba: los meses no se parten) */
export function formatMonths(months: number, c: Copy): string {
  if (!Number.isFinite(months)) return '—';
  return `${Math.ceil(months)} ${c.common.months}`;
}

/** {year: 2028, month: 10} → "octubre de 2028" / "October 2028" */
export function formatMonthYear(ym: YearMonth, c: Copy): string {
  return c.monthYear(c.months[ym.month - 1], ym.year);
}

/** Dólares (input del usuario) → centavos enteros */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}
