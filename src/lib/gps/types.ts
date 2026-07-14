// Tipos del motor GPS Anti-Deuda. Todo el dinero se maneja en centavos enteros.

export interface DebtInput {
  id: string;
  name: string;
  balanceCents: number;
  minPaymentCents: number;
  /** APR en porcentaje, ej. 24.99 */
  apr: number;
  creditLimitCents?: number | null;
  /** Día del mes (1-31) en que vence el pago */
  dueDay?: number | null;
  /** Día del mes (1-31) de corte del estado de cuenta */
  statementDay?: number | null;
  isPromoZero?: boolean;
  /** ISO yyyy-mm-dd — fin de la promoción 0% */
  promoEndDate?: string | null;
}

export interface FinanceInput {
  netIncomeCents: number;
  essentialExpensesCents: number;
}

export type Zone =
  | 'SIN_DEUDAS'
  | 'DEFICIT'
  | 'OXIGENO_RAPIDO'
  | 'BOLA_DE_NIEVE'
  | 'AVALANCHA';

export type UtilizationBand = 'ideal' | 'aceptable' | 'alta' | 'critica';

export type AttackReason =
  | 'override_apr'
  | 'override_utilizacion'
  | 'fuga_eterna'
  | 'zona';

export interface RankedDebt extends DebtInput {
  /** 1 = override, 2 = fuga eterna, 3 = orden de la zona */
  tier: 1 | 2 | 3;
  reason: AttackReason;
  flags: {
    fugaEterna: boolean;
    utilization: number | null;
  };
}

export interface YearMonth {
  year: number;
  /** 1-12 */
  month: number;
}

export interface MonthRow {
  /** 0 = primer mes simulado */
  index: number;
  date: YearMonth;
  totalBalanceCents: number;
  interestPaidCents: number;
  principalPaidCents: number;
  paidOffDebtIds: string[];
}

export interface ProjectionResult {
  /** false si los saldos nunca bajan (fuga eterna global) o se excede el tope */
  feasible: boolean;
  months: MonthRow[];
  debtFreeDate: YearMonth | null;
  totalInterestCents: number;
  perDebtPayoff: { debtId: string; payoffDate: YearMonth | null }[];
  stuckDebtIds: string[];
}

export interface ProjectionOptions {
  extraMonthlyCents: number;
  /** Pago único aplicado el primer mes según el orden de ataque */
  lumpSumCents?: number;
  start: YearMonth;
  /** Tope duro de la simulación (default 600 meses) */
  maxMonths?: number;
  /** Redirigir los mínimos liberados a la siguiente deuda (default true) */
  snowballFreedMinimums?: boolean;
}

export interface GpsSummary {
  ipd: number;
  zone: Zone;
  dti: number;
  freeCashFlowCents: number;
  numeroDePazCents: number;
  metaDeOxigeno: {
    totalCents: number;
    /** Etapa 1: cubrir el mes */
    stage1Cents: number;
    /** Etapa 2: el colchón del 5% */
    stage2Cents: number;
  } | null;
  fondoEsbelto: { minCents: number; maxCents: number };
  totalDebtCents: number;
  totalMinPaymentsCents: number;
}
