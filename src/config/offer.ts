/**
 * Ventana de la oferta de lanzamiento.
 *
 * ⚠️ ANTES DE REACTIVAR LA VENTA: pon una fecha real en LAUNCH_END_AT y su
 * etiqueta en LAUNCH_END_LABEL. La fecha de abajo ya pasó.
 *
 * Mientras esté vencida no se rompe nada: `lanzamientoVigente()` devuelve
 * false y el sitio simplemente no enseña ni el contador ni la frase de
 * urgencia. Es deliberado — una cuenta atrás congelada en 00:00:00 o un
 * "válida hasta el 31 de mayo" en septiembre cuestan más credibilidad que
 * no tener urgencia ninguna.
 */
export const LAUNCH_END_AT = new Date('2026-05-31T23:59:59-06:00');

export const LAUNCH_END_LABEL = '31 de mayo';

export const LAUNCH_UNITS_LIMIT = 100;

export const LAUNCH_DEADLINE_COPY = `Oferta de lanzamiento válida hasta el ${LAUNCH_END_LABEL} o primeras ${LAUNCH_UNITS_LIMIT} compras`;

/** ¿Sigue abierta la ventana? Se evalúa en cada render, no al importar. */
export function lanzamientoVigente(ahora: Date = new Date()): boolean {
  return LAUNCH_END_AT.getTime() > ahora.getTime();
}
