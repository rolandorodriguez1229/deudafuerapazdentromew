// Tipos del motor GPS Anti-Deuda. Todo el dinero se maneja en centavos enteros.

/**
 * Tipo de deuda — obligatorio porque cambia la lógica:
 * las tarjetas recalculan su mínimo cada mes; los préstamos a plazo
 * tienen pago fijo y fecha de liquidación conocida.
 */
export type DebtType = 'tarjeta' | 'prestamo_plazo' | 'otro';

export interface DebtInput {
  id: string;
  name: string;
  type: DebtType;
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
  /**
   * La deuda está atada al empleo: un préstamo del 401k, un anticipo de nómina
   * o cualquier préstamo del trabajo que se vuelva pagadero de inmediato si
   * pierdes el empleo (y que, en el caso del 401k, cuenta como retiro
   * anticipado con impuestos más 10% de multa).
   *
   * No se salta las fases de aire e impulso: cobra su turno en la Avalancha.
   */
  employmentTied?: boolean;
}

export interface FinanceInput {
  netIncomeCents: number;
  essentialExpensesCents: number;
  /**
   * Ingreso BRUTO mensual. Opcional: solo se usa para el DTI, que es la regla
   * del banco y no una métrica nuestra. Sin este dato el DTI no se muestra.
   */
  grossIncomeCents?: number | null;
}

/**
 * Las cuatro fases del Selector. SIN_DEUDAS y SIN_INGRESO son estados de la
 * herramienta (no fases) para los edge cases.
 */
export type Phase =
  | 'SIN_DEUDAS'
  | 'SIN_INGRESO'
  | 'DEFICIT'
  | 'OXIGENO'
  | 'BOLA_DE_NIEVE'
  | 'AVALANCHA';

/**
 * Criterio de orden de pago, uno por fase.
 *
 * `roi_flujo` = (pago mensual × 12) ÷ saldo, de mayor a menor. Es el criterio
 * de Déficit y Oxígeno: cuando estás ahogado, lo que importa es cuánto pago
 * mensual te devuelve cada dólar que inviertes. NO equivale a ordenar por APR
 * — eso solo pasaría si todos los emisores calcularan el mínimo con la misma
 * fórmula, y no lo hacen (unos usan 1% + interés, otros 2% o 3% del saldo,
 * otros un plano de $25).
 */
export type OrderStrategy = 'roi_flujo' | 'saldo_menor' | 'apr_mas_alta';

export type UtilizationBand = 'ideal' | 'aceptable' | 'alta' | 'critica';

export type AttackReason = 'fuga_eterna' | 'atada_al_empleo' | 'fase';

export interface RankedDebt extends DebtInput {
  /** 1 y 2 = overrides de la fase · 3 = el criterio de la fase */
  tier: 1 | 2 | 3;
  reason: AttackReason;
  flags: {
    fugaEterna: boolean;
    utilization: number | null;
  };
}

/**
 * Etiqueta de la columna "¿Renegociar?": qué hacer con cada deuda además de
 * pagarla. En Déficit y Oxígeno el orden de pago ya sale del ROI de Flujo,
 * así que aquí lo que se decide es qué renegociar, refinanciar o consolidar.
 */
export type RenegotiateTag =
  | 'se_libera_sola'
  | 'te_esta_apretando'
  | 'renegocia_esta';

export interface PromoAlert {
  /** Días que faltan para que termine la promoción 0% */
  daysLeft: number;
  /** Umbral disparado: 60, 30 o 7 días */
  level: 60 | 30 | 7;
}

/** Diagnóstico por deuda — visible en Free. */
export interface DebtDiagnosis {
  debtId: string;
  /** (pago mensual × 12) ÷ saldo, en decimal (0.48 = 48%) */
  roiDeFlujo: number;
  /** saldo ÷ pago mensual, en meses */
  paybackMonths: number;
  monthlyInterestCents: number;
  utilization: number | null;
  utilizationBand: UtilizationBand | null;
  /** El mínimo no cubre ni el interés: la deuda crece aunque pagues. */
  fugaEterna: boolean;
  /** Atada al empleo: sube de prioridad al llegar a la Avalancha. */
  employmentTied: boolean;
  /** Recomendación de una línea. `null` = sin recomendación. */
  renegotiate: RenegotiateTag | null;
  /** Alerta independiente de la etiqueta: nunca se pierde por precedencia. */
  promoAlert: PromoAlert | null;
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

/** Palancas del Panel de Oxígeno, en orden de velocidad de resultado. */
export type LeverId =
  | 'bajar_apr'
  | 'programa_dificultad'
  | 'refinanciar_auto'
  | 'ingreso_extra'
  | 'recortar_esenciales'
  | 'liquidar_deuda';

/**
 * Dónde pega el aire ganado en el IPD: subiendo el ingreso (denominador)
 * o bajando gastos esenciales / pagos mínimos (numerador).
 */
export type LeverEffect = 'ingreso' | 'gasto';

export interface LeverResult {
  lever: LeverId;
  monthlyGainCents: number;
  effect: LeverEffect;
  note?: string | null;
}

export interface GpsSummary {
  /** null si no hay ingreso: nunca dividimos entre cero */
  ipd: number | null;
  phase: Phase;
  orderStrategy: OrderStrategy | null;
  /** Regla del banco (pagos ÷ ingreso BRUTO). null si no capturó el bruto. */
  dti: number | null;
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
