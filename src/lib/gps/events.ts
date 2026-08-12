// Métricas del método, desde el día uno. No para vender datos: para saber si
// esto funciona. Anonimizadas y agregadas — aquí NUNCA va email, nombre, ni
// nada que identifique a una persona. Solo el hogar y números.
//
// Lo que queremos poder responder con esta tabla:
//   · IPD inicial y a los 30/60/90 días.
//   · Fase inicial y cambios de fase.
//   · Meses hasta la primera deuda liquidada.
//   · Flujo mensual liberado acumulado.
//   · Qué palanca de Oxígeno se intentó y cuánto aire dio en promedio.
//   · Abandono a 30/90/365 días (se deriva de profiles.last_seen_at).

import type { SupabaseClient } from '@supabase/supabase-js';

export type GpsEventType =
  | 'ipd_calculado'
  | 'fase_cambiada'
  | 'deuda_agregada'
  | 'deuda_liquidada'
  | 'palanca_registrada'
  | 'candado_visto';

/**
 * Registro best-effort: una métrica nunca puede tumbar una pantalla ni un
 * guardado. Si falla, se anota en el log del servidor y la vida sigue.
 */
export async function trackEvent(
  supabase: SupabaseClient,
  householdId: string,
  type: GpsEventType,
  payload: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { error } = await supabase
      .from('gps_events')
      .insert({ household_id: householdId, type, payload });
    if (error) console.error('[gps] trackEvent', type, error.message);
  } catch (err) {
    console.error('[gps] trackEvent', type, err);
  }
}

/**
 * Snapshot mensual del hogar. Es la columna vertebral de las métricas: de aquí
 * salen el IPD a los 30/60/90 días y los cambios de fase. La tabla tiene
 * unique(household_id, month), así que correrlo en cada render es idempotente:
 * escribe una vez al mes y el resto de las veces no hace nada.
 *
 * `checkins.zone` es el nombre heredado de la columna; guarda la fase.
 */
export async function recordMonthlySnapshot(
  supabase: SupabaseClient,
  householdId: string,
  snapshot: {
    ipd: number | null;
    phase: string;
    totalDebtCents: number;
    debts: { id: string; balanceCents: number; minPaymentCents: number; apr: number }[];
  },
): Promise<void> {
  if (snapshot.ipd === null || !Number.isFinite(snapshot.ipd)) return;

  try {
    const now = new Date();
    const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;

    const { data: last } = await supabase
      .from('checkins')
      .select('month, zone')
      .eq('household_id', householdId)
      .order('month', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (last?.month === month) return;

    const { error } = await supabase.from('checkins').insert({
      household_id: householdId,
      month,
      ipd: Number(snapshot.ipd.toFixed(4)),
      zone: snapshot.phase,
      total_debt_cents: snapshot.totalDebtCents,
      debts_snapshot: snapshot.debts,
    });
    // 23505 = unique_violation: otra pestaña ganó la carrera. No es un error.
    if (error && error.code !== '23505') {
      console.error('[gps] recordMonthlySnapshot', error.message);
      return;
    }

    await trackEvent(supabase, householdId, 'ipd_calculado', {
      ipd: snapshot.ipd,
      phase: snapshot.phase,
      total_debt_cents: snapshot.totalDebtCents,
      debt_count: snapshot.debts.length,
    });

    if (last && last.zone !== snapshot.phase) {
      await trackEvent(supabase, householdId, 'fase_cambiada', {
        from: last.zone,
        to: snapshot.phase,
        ipd: snapshot.ipd,
      });
    }
  } catch (err) {
    console.error('[gps] recordMonthlySnapshot', err);
  }
}

/** Marca actividad para poder medir abandono. Igual de best-effort. */
export async function touchLastSeen(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  try {
    await supabase
      .from('profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', userId);
  } catch (err) {
    console.error('[gps] touchLastSeen', err);
  }
}
