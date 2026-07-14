// Todo el copy del GPS Anti-Deuda vive aquí.
// Reglas del libro: nunca "TAE" (siempre APR), nunca "money market" (siempre HYSA).

import type { UtilizationBand, Zone } from './types';

export const DISCLAIMER =
  'Herramienta educativa e informativa; no constituye asesoría financiera, legal ni fiscal.';

export const FIRST_VICTORY = 'Acabas de lograr tu primera victoria: ya no caminas a ciegas.';

export const NO_BLAME = 'Aquí no hay culpa, hay estrategia.';

export const BANK_TRAP = 'El banco aprueba deudas que tu vida no puede pagar.';

export const FUGA_ETERNA_WARNING =
  'Este mínimo no reduce capital — esta deuda sube de prioridad automáticamente.';

export const STUCK_PROJECTION_WARNING =
  'Con los pagos actuales, esta deuda nunca baja: el mínimo no cubre ni los intereses.';

export const ZONE_INFO: Record<
  Zone,
  { name: string; strategyName: string | null; short: string; color: 'verde' | 'amarillo' | 'rojo' }
> = {
  SIN_DEUDAS: {
    name: 'Sin deudas',
    strategyName: null,
    short:
      '¡Felicidades! Vives sin deudas. Tu siguiente paso es el fondo esbelto: de 0.5 a 2 meses de gastos esenciales en una HYSA.',
    color: 'verde',
  },
  DEFICIT: {
    name: 'Déficit',
    strategyName: null,
    short:
      'Tu prioridad ahora no es pagar deudas: es generar superávit. Gigs, recortes y ventas primero. ' + NO_BLAME,
    color: 'rojo',
  },
  OXIGENO_RAPIDO: {
    name: 'Zona roja',
    strategyName: 'Oxígeno Rápido (Liberación de Cash)',
    short:
      'Tu mes está apretado: primero libera flujo. Ataca las deudas que más pago mensual te devuelven por dólar de saldo.',
    color: 'rojo',
  },
  BOLA_DE_NIEVE: {
    name: 'Zona amarilla',
    strategyName: 'Bola de Nieve',
    short:
      'Necesitas momentum: ataca primero la deuda más pequeña. Cada deuda tachada alimenta a la siguiente.',
    color: 'amarillo',
  },
  AVALANCHA: {
    name: 'Zona verde',
    strategyName: 'Avalancha',
    short:
      'Ya respiras: ahora optimiza. Ataca primero la deuda con el APR más alto y ahorra el máximo en intereses.',
    color: 'verde',
  },
};

export const ATTACK_REASON_LABEL: Record<string, string> = {
  override_apr: 'APR ≥ 30% — se ataca primero, sin importar la zona',
  override_utilizacion: 'Utilización arriba del 80% — se ataca primero, sin importar la zona',
  fuga_eterna: 'Fuga eterna: el mínimo no reduce capital',
  zona: 'Orden de tu estrategia',
};

export const UTILIZATION_LABEL: Record<UtilizationBand, string> = {
  ideal: 'Ideal (<9%)',
  aceptable: 'Aceptable (<30%)',
  alta: 'Alta',
  critica: 'Crítica (>80%)',
};

export const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;
