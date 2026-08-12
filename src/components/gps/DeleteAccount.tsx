'use client';

// Borrado real de la cuenta y de todos los datos financieros. La privacidad no
// es una promesa en una nota al pie: es un botón que funciona.

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteAccountAndData } from '@/app/diagnostico/actions';
import type { Locale } from '@/lib/i18n';

const CONFIRM_WORD: Record<Locale, string> = { es: 'BORRAR', en: 'DELETE' };

const T: Record<Locale, Record<string, string>> = {
  es: {
    open: 'Borrar mi cuenta y mis datos',
    title: 'Esto borra todo, y no se puede deshacer',
    body: 'Se eliminan tu cuenta, tu ingreso, tus gastos, tus deudas y el registro de tus palancas. No guardamos una copia.',
    prompt: 'Escribe BORRAR para confirmar',
    confirm: 'Borrar definitivamente',
    cancel: 'Cancelar',
    working: 'Borrando…',
  },
  en: {
    open: 'Delete my account and data',
    title: 'This deletes everything, and it cannot be undone',
    body: 'Your account, income, expenses, debts, and lever history are all removed. We do not keep a copy.',
    prompt: 'Type DELETE to confirm',
    confirm: 'Delete permanently',
    cancel: 'Cancel',
    working: 'Deleting…',
  },
};

export default function DeleteAccount({ locale }: { locale: Locale }) {
  const t = T[locale];
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-red-700 underline"
      >
        <Trash2 className="w-4 h-4" aria-hidden /> {t.open}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
      <p className="font-semibold text-red-900">{t.title}</p>
      <p className="text-sm text-red-800">{t.body}</p>
      <label className="block text-sm text-red-900">
        {t.prompt}
        <input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="mt-1 w-full rounded-lg border border-red-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
          autoComplete="off"
        />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={word.trim() !== CONFIRM_WORD[locale] || pending}
          onClick={() =>
            startTransition(async () => {
              const result = await deleteAccountAndData();
              if (result && !result.ok) setError(result.error ?? 'Error');
            })
          }
          className="py-2 px-4 rounded-lg font-semibold bg-red-600 text-white disabled:opacity-50"
        >
          {pending ? t.working : t.confirm}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setWord('');
            setError(null);
          }}
          className="py-2 px-4 rounded-lg font-semibold text-neutral-600"
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );
}
