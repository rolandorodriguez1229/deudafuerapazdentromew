// Las seis palancas del Panel de Oxígeno, en orden de velocidad de resultado.
// El copy vive en `copy/`; aquí solo la estructura y hacia dónde pega cada una.

import type { LeverEffect, LeverId } from './types';

export const LEVER_ORDER: readonly LeverId[] = [
  'bajar_apr',
  'programa_dificultad',
  'refinanciar_auto',
  'ingreso_extra',
  'recortar_esenciales',
  'liquidar_deuda',
];

/**
 * Dónde pega el aire ganado dentro del IPD. Cinco palancas bajan el numerador
 * (menos gasto esencial o menos pago mínimo); solo el ingreso extra sube el
 * denominador. Se deriva de la palanca, nunca lo elige el usuario.
 */
export const LEVER_EFFECT: Record<LeverId, LeverEffect> = {
  bajar_apr: 'gasto',
  programa_dificultad: 'gasto',
  refinanciar_auto: 'gasto',
  ingreso_extra: 'ingreso',
  recortar_esenciales: 'gasto',
  liquidar_deuda: 'gasto',
};

/** El Panel de Oxígeno manda en Déficit y en Oxígeno; en las otras fases acompaña. */
export function oxygenPanelIsPrimary(phase: string): boolean {
  return phase === 'DEFICIT' || phase === 'OXIGENO' || phase === 'SIN_INGRESO';
}

export type LeverStatus = 'pendiente' | 'en_proceso' | 'lograda' | 'no_aplica';

/** Estado del formulario del Panel de Oxígeno. Los montos van en DÓLARES. */
export interface LeverState {
  status: LeverStatus;
  gain: string;
  note: string;
}

export type LeverStateMap = Record<LeverId, LeverState>;

export function emptyLeverState(): LeverStateMap {
  return Object.fromEntries(
    LEVER_ORDER.map((id) => [id, { status: 'pendiente', gain: '', note: '' }]),
  ) as LeverStateMap;
}

// Vive aquí y no en el componente porque el server component lo llama para
// armar el estado inicial: una función exportada desde un módulo 'use client'
// no se puede invocar desde el servidor.
export function leverStateFromRecords(
  records: {
    lever: LeverId;
    status: LeverStatus;
    monthlyGainCents: number;
    note?: string | null;
  }[],
): LeverStateMap {
  const base = emptyLeverState();
  for (const r of records) {
    base[r.lever] = {
      status: r.status,
      gain: r.monthlyGainCents > 0 ? String(Math.round(r.monthlyGainCents) / 100) : '',
      note: r.note ?? '',
    };
  }
  return base;
}
