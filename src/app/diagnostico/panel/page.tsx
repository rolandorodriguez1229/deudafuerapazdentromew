import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  PiggyBank,
  Sparkles,
  Target,
  Wind,
} from 'lucide-react';
import AttackOrderList from '@/components/gps/AttackOrderList';
import DebtDiagnosisTable from '@/components/gps/DebtDiagnosisTable';
import GpsNav from '@/components/gps/GpsNav';
import IpdGauge from '@/components/gps/IpdGauge';
import LockedRow from '@/components/gps/LockedRow';
import ProjectionChart from '@/components/gps/ProjectionChart';
import { requireUser } from '@/lib/gps/auth';
import { buildFullProjection } from '@/lib/gps/amortize';
import { diagnose } from '@/lib/gps/calc';
import { getCopy } from '@/lib/gps/copy';
import { loadGpsData } from '@/lib/gps/data';
import { getEntitlement } from '@/lib/gps/entitlement';
import { recordMonthlySnapshot, touchLastSeen } from '@/lib/gps/events';
import { formatCents, formatCentsWhole, formatMonthYear, formatRatio } from '@/lib/gps/format';
import { oxygenPanelIsPrimary } from '@/lib/gps/levers';
import { buildAttackOrder, targetDebt } from '@/lib/gps/order';
import { getLocale } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Tu panel',
  alternates: { canonical: '/diagnostico/panel' },
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function PanelPage() {
  const { supabase, user, householdId } = await requireUser('/diagnostico/panel');
  const [locale, data] = await Promise.all([getLocale(), loadGpsData(supabase, householdId)]);
  if (!data.finances) redirect('/diagnostico/inicio');

  const c = getCopy(locale);
  const entitlement = await getEntitlement(supabase);
  const summary = diagnose(data.finances, data.debts);
  const phase = c.phase[summary.phase];
  const today = todayIso();

  const noDebts = summary.phase === 'SIN_DEUDAS';
  const noIncome = summary.phase === 'SIN_INGRESO';
  const oxygenFirst = oxygenPanelIsPrimary(summary.phase);
  const singleDebt = data.debts.length === 1;

  // Métricas: idempotente, escribe una vez al mes.
  await Promise.all([
    touchLastSeen(supabase, user.id),
    recordMonthlySnapshot(supabase, householdId, {
      ipd: summary.ipd,
      phase: summary.phase,
      totalDebtCents: summary.totalDebtCents,
      debts: data.debts.map((d) => ({
        id: d.id,
        balanceCents: d.balanceCents,
        minPaymentCents: d.minPaymentCents,
        apr: d.apr,
      })),
    }),
  ]);

  // El orden de ataque y la proyección son Full: para una cuenta Free ni
  // siquiera se calculan, así que nunca viajan al navegador.
  // En Déficit sí hay orden: cada dólar que se consiga va a la deuda de mayor
  // ROI de Flujo, aunque la prioridad de la pantalla siga siendo el superávit.
  const hasOrder = summary.orderStrategy !== null;
  const order =
    entitlement === 'full' && hasOrder ? buildAttackOrder(data.debts, summary.phase) : [];
  const target = targetDebt(order);

  const oxygenCard = (
    <Link
      href="/diagnostico/oxigeno"
      className={`block rounded-xl border p-5 transition-colors ${
        oxygenFirst
          ? 'border-primary-300 bg-primary-50 hover:bg-primary-100'
          : 'border-neutral-200 bg-white hover:border-primary-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Wind className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
          <div>
            <div className="font-bold text-primary-900">{c.oxygenPanel.title}</div>
            <p className="text-sm text-primary-800/80 mt-0.5">{c.oxygenPanel.header}</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-primary-700 shrink-0" aria-hidden />
      </div>
    </Link>
  );

  const debtsSection = (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="heading-md text-primary-900">{c.debts.title}</h2>
        <Link href="/diagnostico/deudas" className="text-sm text-primary-700 underline">
          {c.common.edit}
        </Link>
      </div>
      <DebtDiagnosisTable
        locale={locale}
        debts={data.debts}
        today={today}
        phase={summary.phase}
        highlightId={target?.id ?? null}
      />
    </section>
  );

  if (noDebts) {
    return (
      <div className="section-container py-8 max-w-3xl mx-auto">
        <GpsNav active="/diagnostico/panel" locale={locale} />
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 sm:p-8 text-center space-y-4">
          <Sparkles className="w-10 h-10 text-green-600 mx-auto" aria-hidden />
          <h1 className="heading-md text-primary-900">{phase.headline}</h1>
          <p className="text-neutral-600 max-w-md mx-auto">{phase.message}</p>
          <div className="bg-green-50 rounded-xl p-4 inline-flex items-center gap-3">
            <PiggyBank className="w-6 h-6 text-green-700" aria-hidden />
            <div className="text-left">
              <div className="text-sm text-neutral-500">{c.panel.fondoEsbelto}</div>
              <div className="font-bold text-green-800">
                {formatCentsWhole(summary.fondoEsbelto.minCents)} –{' '}
                {formatCentsWhole(summary.fondoEsbelto.maxCents)}
              </div>
            </div>
          </div>
          <p className="text-sm text-neutral-400">
            <Link href="/diagnostico/deudas" className="text-primary-700 underline">
              {c.debts.add}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container py-8 max-w-3xl mx-auto">
      <GpsNav active="/diagnostico/panel" locale={locale} />

      <div className="space-y-6">
        {/* Velocímetro + fase */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <IpdGauge ipd={summary.ipd} locale={locale} />
            <div>
              <div className="text-sm text-neutral-500 mb-1">{c.panel.yourPhase}</div>
              <h1 className="text-2xl font-bold text-primary-900 mb-2">{phase.name}</h1>
              <p className="font-medium text-neutral-800">{phase.headline}</p>
              <p className="text-neutral-600 text-sm mt-1">{phase.message}</p>
              {summary.orderStrategy && (
                <p className="text-xs text-neutral-400 mt-3">
                  {c.orderStrategy[summary.orderStrategy]}
                </p>
              )}
            </div>
          </div>
        </div>

        {noIncome && (
          <Link href="/diagnostico/deudas" className="btn-primary w-full sm:w-auto">
            {c.panel.noIncomeCta} <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
          </Link>
        )}

        {/* En Déficit y en Oxígeno el Panel de Oxígeno va primero: no hay orden
            de pago que sobreviva a un mes que no cierra. */}
        {oxygenFirst && oxygenCard}

        {/* Número de Paz, Meta de Oxígeno y las métricas del mes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="text-sm text-neutral-500 flex items-center gap-1">
              <Wind className="w-4 h-4" aria-hidden /> {c.panel.numeroDePaz}
            </div>
            <div className="text-2xl font-bold text-primary-900">
              {formatCents(summary.numeroDePazCents)}
            </div>
            <p className="text-xs text-neutral-500 mt-1">{c.panel.numeroDePazHelp}</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="text-sm text-neutral-500">{c.panel.metaDeOxigeno}</div>
            {summary.metaDeOxigeno ? (
              <>
                <div className="text-2xl font-bold text-orange-700">
                  +{formatCents(summary.metaDeOxigeno.totalCents)} {c.common.perMonth}
                </div>
                <ul className="text-xs text-neutral-500 mt-1 space-y-0.5">
                  {summary.metaDeOxigeno.stage1Cents > 0 && (
                    <li>
                      {c.panel.metaStage1}: +{formatCents(summary.metaDeOxigeno.stage1Cents)}
                    </li>
                  )}
                  <li>
                    {c.panel.metaStage2}: +{formatCents(summary.metaDeOxigeno.stage2Cents)}
                  </li>
                </ul>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-700">{c.panel.metaCovered}</div>
                <p className="text-xs text-neutral-500 mt-1">
                  {c.panel.metaCoveredHelp(
                    formatCentsWhole(summary.fondoEsbelto.minCents),
                    formatCentsWhole(summary.fondoEsbelto.maxCents),
                  )}
                </p>
              </>
            )}
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="text-sm text-neutral-500">{c.panel.freeCashFlow}</div>
            <div
              className={`text-2xl font-bold ${
                summary.freeCashFlowCents >= 0 ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {formatCents(summary.freeCashFlowCents)}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {c.panel.totalDebt}: {formatCentsWhole(summary.totalDebtCents)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="text-sm text-neutral-500">{c.panel.dti}</div>
            <div className="text-2xl font-bold text-neutral-900">
              {summary.dti === null ? '—' : formatRatio(summary.dti)}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {summary.dti === null ? c.panel.dtiMissing : c.panel.dtiHelp}
            </p>
          </div>
        </div>

        {/* Deuda objetivo — regla de concentración */}
        {hasOrder && (
          <section className="space-y-3">
            {entitlement === 'full' && target ? (
              <>
                <div className="rounded-xl border-2 border-primary-400 bg-white p-5">
                  <div className="flex items-center gap-2 text-sm text-primary-700 font-medium">
                    <Target className="w-4 h-4" aria-hidden /> {c.panel.targetDebt}
                  </div>
                  <div className="text-2xl font-bold text-primary-900 mt-1">{target.name}</div>
                  <div className="text-neutral-600">
                    {formatCents(target.balanceCents)} · APR {target.apr}%
                  </div>
                  <p className="text-sm text-neutral-700 mt-2">{c.alerts.concentracionRegla}</p>
                  <p className="text-xs text-neutral-500 mt-1">{c.alerts.concentracion}</p>
                  <p className="text-xs text-neutral-400 mt-2">{c.attackReason[target.reason]}</p>
                </div>
                {singleDebt ? (
                  <p className="text-sm text-neutral-500">{c.panel.singleDebtNote}</p>
                ) : (
                  <AttackOrderList order={order} locale={locale} />
                )}
              </>
            ) : (
              <LockedRow locale={locale} />
            )}
          </section>
        )}

        {entitlement === 'full' && hasOrder && (
          <FullProjectionBlock
            locale={locale}
            debts={data.debts}
            finances={data.finances}
            order={order}
          />
        )}

        {!oxygenFirst && oxygenCard}

        {debtsSection}
      </div>
    </div>
  );
}

async function FullProjectionBlock({
  locale,
  debts,
  finances,
  order,
}: {
  locale: Awaited<ReturnType<typeof getLocale>>;
  debts: Awaited<ReturnType<typeof loadGpsData>>['debts'];
  finances: NonNullable<Awaited<ReturnType<typeof loadGpsData>>['finances']>;
  order: ReturnType<typeof buildAttackOrder>;
}) {
  const c = getCopy(locale);
  const now = new Date();
  const start = { year: now.getFullYear(), month: now.getMonth() + 1 };
  const projection = buildFullProjection(finances, debts, order, start);
  const stuckNames = debts
    .filter((d) => projection.plan.stuckDebtIds.includes(d.id))
    .map((d) => d.name);

  if (!projection.plan.feasible || !projection.plan.debtFreeDate) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="font-semibold text-red-800">{c.alerts.stuckProjection}</p>
            {stuckNames.length > 0 && (
              <p className="text-sm text-red-700 mt-1">{stuckNames.join(', ')}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-neutral-500 flex items-center gap-1">
            <CalendarCheck className="w-4 h-4" aria-hidden />{' '}
            {locale === 'es' ? 'Fecha libre de deudas' : 'Debt-free date'}
          </div>
          <div className="text-xl font-bold text-green-700">
            {formatMonthYear(projection.plan.debtFreeDate, c)}
          </div>
        </div>
        <div>
          <div className="text-sm text-neutral-500">
            {locale === 'es' ? 'Intereses que te ahorras' : 'Interest you save'}
          </div>
          <div className="text-xl font-bold text-green-700">
            {projection.interestSavedVsMinimumCents !== null
              ? formatCentsWhole(projection.interestSavedVsMinimumCents)
              : '—'}
          </div>
        </div>
        <div>
          <div className="text-sm text-neutral-500">
            {locale === 'es' ? 'Ataque mensual' : 'Monthly attack'}
          </div>
          <div className="text-xl font-bold text-neutral-900">
            {formatCents(projection.extraMonthlyCents)}
          </div>
        </div>
      </div>
      <ProjectionChart
        locale={locale}
        months={projection.plan.months}
        startBalanceCents={projection.plan.months[0]?.totalBalanceCents ?? 0}
      />
      <Link href="/diagnostico/escenarios" className="btn-secondary w-full sm:w-auto">
        {c.nav.escenarios} <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
      </Link>
    </div>
  );
}
