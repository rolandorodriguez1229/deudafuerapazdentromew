'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ChevronDown, Loader2 } from 'lucide-react';
import { upsertDebt } from '@/app/diagnostico/actions';
import { DEBT_KINDS, DEBT_KIND_LABEL } from '@/lib/gps/schemas';

export interface DebtFormValues {
  id?: string;
  name: string;
  kind: string;
  balance: string;
  minPayment: string;
  apr: string;
  creditLimit: string;
  dueDay: string;
  statementDay: string;
  isPromoZero: boolean;
  promoEndDate: string;
}

const EMPTY: DebtFormValues = {
  name: '',
  kind: 'tarjeta',
  balance: '',
  minPayment: '',
  apr: '',
  creditLimit: '',
  dueDay: '',
  statementDay: '',
  isPromoZero: false,
  promoEndDate: '',
};

export default function DebtForm({
  initial,
  onSaved,
  onCancel,
  submitLabel = 'Guardar deuda',
}: {
  initial?: Partial<DebtFormValues>;
  onSaved: (values: DebtFormValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const { register, handleSubmit, watch, reset } = useForm<DebtFormValues>({
    defaultValues: { ...EMPTY, ...initial },
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showOptional, setShowOptional] = useState(
    Boolean(initial?.creditLimit || initial?.dueDay || initial?.isPromoZero),
  );
  const isPromoZero = watch('isPromoZero');

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    setServerError(null);
    const result = await upsertDebt({
      id: values.id || undefined,
      name: values.name,
      kind: values.kind as (typeof DEBT_KINDS)[number],
      balance: values.balance,
      minPayment: values.minPayment,
      apr: values.apr,
      creditLimit: values.creditLimit,
      dueDay: values.dueDay,
      statementDay: values.statementDay,
      isPromoZero: values.isPromoZero,
      promoEndDate: values.promoEndDate,
    });
    setSaving(false);
    if (!result.ok) {
      setServerError(result.error ?? 'Algo salió mal');
      return;
    }
    reset({ ...EMPTY });
    setShowOptional(false);
    onSaved(values);
  });

  const inputClass =
    'w-full rounded-lg border border-neutral-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Nombre de la deuda
          </label>
          <input
            {...register('name')}
            required
            maxLength={80}
            placeholder='Ej. "Visa azul"'
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Tipo</label>
          <select {...register('kind')} className={inputClass}>
            {DEBT_KINDS.map((k) => (
              <option key={k} value={k}>
                {DEBT_KIND_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Saldo actual (USD)
          </label>
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
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Pago mínimo mensual (USD)
          </label>
          <input
            {...register('minPayment')}
            required
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="85"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">APR (%)</label>
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
            Está en tu estado de cuenta como “APR” o “tasa anual”.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowOptional((s) => !s)}
        className="flex items-center gap-1 text-sm text-primary-700 font-medium"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${showOptional ? 'rotate-180' : ''}`} />
        Datos opcionales (límite, fechas, promoción 0%)
      </button>

      {showOptional && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 rounded-lg p-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Límite de crédito (USD)
            </label>
            <input
              {...register('creditLimit')}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="Solo tarjetas"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Día de corte
              </label>
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
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Día de pago
              </label>
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
              Está en promoción 0% de interés
            </label>
            {isPromoZero && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  ¿Cuándo termina la promo?
                </label>
                <input
                  {...register('promoEndDate')}
                  type="date"
                  required={isPromoZero}
                  className={inputClass}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando…
            </>
          ) : (
            submitLabel
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="py-3 px-6 rounded-lg font-semibold text-neutral-500 hover:text-neutral-700"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
