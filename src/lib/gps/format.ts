import { MONTHS_ES } from './copy';
import type { YearMonth } from './types';

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
export function formatRatio(ratio: number, decimals = 0): string {
  if (!Number.isFinite(ratio)) return '—';
  return `${(ratio * 100).toFixed(decimals)}%`;
}

/** IPD con dos decimales: 0.6234 → "0.62" */
export function formatIpd(ipd: number): string {
  if (!Number.isFinite(ipd)) return '∞';
  return ipd.toFixed(2);
}

/** {year: 2028, month: 10} → "octubre de 2028" */
export function formatMonthYear(ym: YearMonth): string {
  return `${MONTHS_ES[ym.month - 1]} de ${ym.year}`;
}

/** Dólares (input del usuario) → centavos enteros */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}
