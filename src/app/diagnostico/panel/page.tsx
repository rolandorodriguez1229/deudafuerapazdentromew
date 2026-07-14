import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  PiggyBank,
  Sparkles,
  Wind,
} from 'lucide-react';
import AttackOrderList from '@/components/gps/AttackOrderList';
import DebtList from '@/components/gps/DebtList';
import GpsNav from '@/components/gps/GpsNav';
import IpdGauge from '@/components/gps/IpdGauge';
import LockedRow from '@/components/gps/LockedRow';
import ProjectionChart from '@/components/gps/ProjectionChart';
import { requireUser } from '@/lib/gps/auth';
import { buildFullProjection } from '@/lib/gps/amortize';
import { diagnose } from '@/lib/gps/calc';
import { STUCK_PROJECTION_WARNING, ZONE_INFO } from '@/lib/gps/copy';
import { loadGpsData } from '@/lib/gps/data';
import { getEntitlement } from '@/lib/gps/entitlement';
import { formatCents, formatCentsWhole, formatMonthYear } from '@/lib/gps/format';
import { buildAttackOrder } from '@/lib/gps/order';

export const metadata: Metadata = {
  title: 'Tu panel',
  alternates: { canonical: '/diagnostico/panel' },
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

export default async function PanelPage() {
  const { supabase, householdId } = await requireUser('/diagnostico/panel');
  const data = await loadGpsData(supabase, householdId);
  if (!data.finances) redirect('/diagnostico/inicio');

  const entitlement = await getEntitlement(supabase);
  const summary = diagnose(data.finances, data.debts);
  const zone = ZONE_INFO[summary.zone];
  const isDeficit = summary.zone === 'DEFICIT';
  const noDebts = summary.zone === 'SIN_DEUDAS';

  // Los cálculos Full solo se ejecutan (y serializan) para cuentas Full.
  let fullBlock: React.ReactNode = null;
  if (entitlement === 'full' && !isDeficit && !noDebts) {
    const now = new Date();
    const start = { year: now.getFullYear(), month: now.getMonth() + 1 };
    const order = buildAttackOrder(data.debts, summary.zone);
    const projection = buildFullProjection(data.finances, data.debts, order, start);
    const payoffByDebt = new Map(
      projection.plan.perDebtPayoff.map((p) => [p.debtId, p.payoffDate]),
    );
    const stuckNames = data.debts
      .filter((d) => projection.plan.stuckDebtIds.includes(d.id))
      .map((d) => d.name);

    fullBlock = (
      <section className="space-y-6">
        <div>
          <h2 className="heading-md text-primary-900 mb-1">Tu Orden de Ataque</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Paga el mínimo de todo; cada dólar extra va a la deuda #1.
          </p>
          <AttackOrderList order={order} payoffByDebt={payoffByDebt} />
        </div>

        {projection.plan.feasible && projection.plan.debtFreeDate ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-neutral-500 flex items-center gap-1">
                  <CalendarCheck className="w-4 h-4" /> Fecha libre de deudas
                </div>
                <div className="text-xl font-bold text-green-700">
                  {formatMonthYear(projection.plan.debtFreeDate)}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-500">Intereses que te ahorras</div>
                <div className="text-xl font-bold text-green-700">
                  {projection.interestSavedVsMinimumCents !== null
                    ? formatCentsWhole(projection.interestSavedVsMinimumCents)
                    : 'Incalculable — con solo mínimos nunca terminarías'}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-500">Ataque mensual (tu flujo libre)</div>
                <div className="text-xl font-bold text-neutral-900">
                  {formatCents(projection.extraMonthlyCents)}
                </div>
              </div>
            </div>
            <ProjectionChart
              months={projection.plan.months}
              startBalanceCents={summary.totalDebtCents}
            />
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">{STUCK_PROJECTION_WARNING}</p>
                {stuckNames.length > 0 && (
                  <p className="text-sm text-red-700 mt-1">
                    Deudas atoradas: {stuckNames.join(', ')}. Prioriza negociar el APR o sube tu
                    ataque mensual — revisa los escenarios.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <Link href="/diagnostico/escenarios" className="btn-secondary w-full sm:w-auto">
          Probar escenarios: ¿y si pago más? <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </section>
    );
  }

  return (
    <div className="section-container py-8 max-w-3xl mx-auto">
      <GpsNav active="/diagnostico/panel" />

      {noDebts ? (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 text-center space-y-4">
          <Sparkles className="w-10 h-10 text-green-600 mx-auto" />
          <h1 className="heading-md text-primary-900">¡Felicidades! Vives sin deudas.</h1>
          <p className="text-neutral-600 max-w-md mx-auto">{zone.short}</p>
          <div className="bg-green-50 rounded-xl p-4 inline-flex items-center gap-3">
            <PiggyBank className="w-6 h-6 text-green-700" />
            <div className="text-left">
              <div className="text-sm text-neutral-500">Tu fondo esbelto (en HYSA)</div>
              <div className="font-bold text-green-800">
                {formatCentsWhole(summary.fondoEsbelto.minCents)} –{' '}
                {formatCentsWhole(summary.fondoEsbelto.maxCents)}
              </div>
            </div>
          </div>
          <p className="text-sm text-neutral-400">
            ¿Tienes una deuda nueva que registrar?{' '}
            <Link href="/diagnostico/deudas" className="text-primary-700 underline">
              Agrégala aquí
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Velocímetro + zona */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <IpdGauge ipd={summary.ipd} />
              <div>
                <div className="text-sm text-neutral-500 mb-1">Tu estrategia GPS</div>
                <h1 className="text-2xl font-bold text-primary-900 mb-2">
                  {zone.strategyName ?? zone.name}
                </h1>
                <p className="text-neutral-600 text-sm">{zone.short}</p>
              </div>
            </div>
          </div>

          {/* Número de Paz y Meta de Oxígeno */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <div className="text-sm text-neutral-500 flex items-center gap-1">
                <Wind className="w-4 h-4" /> Tu Número de Paz
              </div>
              <div className="text-2xl font-bold text-primary-900">
                {formatCents(summary.numeroDePazCents)}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                El ingreso que tu mes necesita, más un colchón del 5%.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <div className="text-sm text-neutral-500">Tu Meta de Oxígeno</div>
              {summary.metaDeOxigeno ? (
                <>
                  <div className="text-2xl font-bold text-orange-700">
                    +{formatCents(summary.metaDeOxigeno.totalCents)} al mes
                  </div>
                  <ul className="text-xs text-neutral-500 mt-1 space-y-0.5">
                    {summary.metaDeOxigeno.stage1Cents > 0 && (
                      <li>
                        Etapa 1 — cubrir tu mes: +{formatCents(summary.metaDeOxigeno.stage1Cents)}
                      </li>
                    )}
                    <li>
                      Etapa 2 — el colchón del 5%: +{formatCents(summary.metaDeOxigeno.stage2Cents)}
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-700">Cubierta ✓</div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Tu ingreso ya supera tu Número de Paz. Llena tu fondo esbelto (
                    {formatCentsWhole(summary.fondoEsbelto.minCents)} –{' '}
                    {formatCentsWhole(summary.fondoEsbelto.maxCents)} en HYSA); lleno, todo va al
                    ataque.
                  </p>
                </>
              )}
            </div>
          </div>

          {isDeficit ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold text-red-800">
                Tu prioridad ahora no es pagar deudas: es generar superávit.
              </h2>
              <p className="text-sm text-red-700">
                Tu mes cuesta más de lo que entra. Antes de cualquier estrategia de pago,
                enfócate en tu Meta de Oxígeno: trabajos extra (gigs), recortes temporales y
                venta de cosas que no usas. Aquí no hay culpa, hay estrategia — el orden de
                ataque se desbloquea cuando tu IPD baje de 1.0.
              </p>
            </div>
          ) : (
            fullBlock
          )}

          {/* Lista de deudas (Free la ve sin ordenar) + candado */}
          {entitlement === 'free' && !isDeficit && (
            <section className="space-y-4">
              <div className="flex items-baseline justify-between">
                <h2 className="heading-md text-primary-900">Tus deudas</h2>
                <Link href="/diagnostico/deudas" className="text-sm text-primary-700 underline">
                  Editar
                </Link>
              </div>
              <DebtList debts={data.debts} />
              <LockedRow />
            </section>
          )}

          {(entitlement === 'full' || isDeficit) && (
            <section className="space-y-4">
              <div className="flex items-baseline justify-between">
                <h2 className="heading-md text-primary-900">Tus deudas</h2>
                <Link href="/diagnostico/deudas" className="text-sm text-primary-700 underline">
                  Editar
                </Link>
              </div>
              <DebtList debts={data.debts} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
