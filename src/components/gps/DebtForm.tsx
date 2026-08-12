'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronDown, Loader2, Wand2 } from 'lucide-react';
import { upsertDebt } from '@/app/diagnostico/actions';
import { estimateCardMinPaymentCents } from '@/lib/gps/calc';
import { getCopy } from '@/lib/gps/copy';
import { centsToDollars } from '@/lib/gps/format';
import { DEBT_TYPES } from '@/lib/gps/schemas';
import type { DebtType } from '@/lib/gps/types';
import type { Locale } from '@/lib/i18n';

export interface DebtFormValues {
  id?: string;
  name: string;
  type: DebtType;
  balance: string;
  minPayment: string;
  apr: string;
  creditLimit: string;
  dueDay: string;
  statementDay: string;
  isPromoZero: boolean;
  promoEndDate: string;
  employmentTied: boolean;
}

const EMPTY: DebtFormValues = {
  name: '',
  type: 'tarjeta',
  balance: '',
  minPayment: '',
  apr: '',
  creditLimit: '',
  dueDay: '',
  statementDay: '',
  isPromoZero: false,
  promoEndDate: '',
  employmentTied: false,
};

export default function DebtForm({
  locale,
  initial,
  onSaved,
  onCancel,
  submitLabel,
}: {
  locale: Locale;
  initial?: Partial<DebtFormValues>;
  onSaved: (values: DebtFormValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const c = getCopy(locale);
  const { register, handleSubmit, watch, setValue, reset } = useForm<DebtFormValues>({
    defaultValues: { ...EMPTY, ...initial },
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [estimated, setEstimated] = useState(false);
  const [showOptional, setShowOptional] = useState(
    Boolean(
      initial?.creditLimit || initial?.dueDay || initial?.isPromoZero || initial?.employmentTied,
    ),
  );

  const isPromoZero = watch('isPromoZero');
  const type = watch('type');
  const balance = watch('balance');
  const apr = watch('apr');
  const canEstimate = type === 'tarjeta' && Number(balance) > 0 && apr !== '';

  function estimateMin() {
    const cents = estimateCardMinPaymentCents(
      Math.round(Number(balance) * 100),
      Number(apr) || 0,
    );
    setValue('minPayment', String(centsToDollars(cents)), { shouldDirty: true });
    setEstimated(true);
  }

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    setServerError(null);
    const result = await upsertDebt({
      id: values.id || undefined,
      name: values.name,
      type: values.type,
      balance: values.balance,
      minPayment: values.minPayment,
      apr: values.apr,
      creditLimit: values.creditLimit,
      dueDay: values.dueDay,
      statementDay: values.statementDay,
      isPromoZero: values.isPromoZero,
      promoEndDate: values.promoEndDate,
      employmentTied: values.employmentTied,
    });
    setSaving(false);
    if (!result.ok) {
      setServerError(result.error ?? 'Algo salió mal');
      return;
    }
    reset({ ...EMPTY });
    setShowOptional(false);
    setEstimated(false);
    onSaved(values);
  });

  const inputClass =
    'w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500';
  const labelClass = 'block text-sm font-medium text-neutral-700 mb-1';

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{c.debts.name}</label>
          <input
            {...register('name')}
            required
            maxLength={80}
            placeholder={c.debts.namePlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{c.debts.type}</label>
          <select {...register('type')} required className={inputClass}>
            {DEBT_TYPES.map((t) => (
              <option key={t} value={t}>
                {c.debts.typeOptions[t]}
              </option>
            ))}
          </select>
          <p className="text-xs text-neutral-400 mt-1">{c.debts.typeHelp}</p>
        </div>
        <div>
          <label className={labelClass}>{c.debts.balance} (USD)</label>
          <input
            {...register('balance')}
            required
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            placeholder="3,500"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{c.debts.apr}</label>
          <input
            {...register('apr')}
            required
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            max="300"
            placeholder="24.99"
            className={inputClass}
          />
          <p className="text-xs text-neutral-400 mt-1">
            {locale === 'es'
              ? 'Está en tu estado de cuenta como “APR” o “tasa anual”.'
              : 'It is on your statement as “APR” or “annual rate”.'}
          </p>
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-baseline justify-between gap-2">
            <label className={labelClass}>{c.debts.minPayment} (USD)</label>
            {canEstimate && (
              <button
                type="button"
                onClick={estimateMin}
                className="flex items-center gap-1 text-xs font-medium text-primary-700 hover:underline"
              >
                <Wand2 className="w-3.5 h-3.5" /> {c.debts.estimateMin}
              </button>
            )}
          </div>
          <input
            {...register('minPayment', { onChange: () => setEstimated(false) })}
            required
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="85"
            className={inputClass}
          />
          {estimated ? (
            <p className="text-xs text-amber-700 mt-1 font-medium">
              {c.common.estimate}: {c.debts.estimatedNote}
            </p>
          ) : (
            type !== 'tarjeta' && (
              <p className="text-xs text-neutral-400 mt-1">{c.debts.estimateOnlyCards}</p>
            )
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowOptional((s) => !s)}
        className="flex items-center gap-1 text-sm text-primary-700 font-medium"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${showOptional ? 'rotate-180' : ''}`} />
        {locale === 'es'
          ? 'Datos opcionales (límite, fechas, promoción 0%)'
          : 'Optional details (limit, dates, 0% promo)'}
      </button>

      {showOptional && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 rounded-lg p-4">
          <div>
            <label className={labelClass}>{c.debts.creditLimit}</label>
            <input
              {...register('creditLimit')}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{c.debts.statementDay}</label>
              <input
                {...register('statementDay')}
                type="number"
                min="1"
                max="31"
                placeholder="15"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{c.debts.dueDay}</label>
              <input
                {...register('dueDay')}
                type="number"
                min="1"
                max="31"
                placeholder="5"
                className={inputClass}
              />
            </div>
          </div>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" {...register('isPromoZero')} className="w-4 h-4" />
              {c.debts.promoZero}
            </label>
            {isPromoZero && (
              <div>
                <label className={labelClass}>{c.debts.promoEnd}</label>
                <input
                  {...register('promoEndDate')}
                  type="date"
                  required={isPromoZero}
                  className={inputClass}
                />
              </div>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                {...register('employmentTied')}
                className="w-4 h-4 mt-0.5 shrink-0"
              />
              <span>
                {c.debts.employmentTied}
                <span className="block text-xs text-neutral-400 mt-0.5">
                  {c.debts.employmentTiedHelp}
                </span>
              </span>
            </label>
          </div>
        </div>
      )}

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> {c.common.saving}
            </>
          ) : (
            (submitLabel ?? c.common.save)
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="py-3 px-6 rounded-lg font-semibold text-neutral-500 hover:text-neutral-700"
          >
            {c.common.cancel}
          </button>
        )}
      </div>
    </form>
  );
}
