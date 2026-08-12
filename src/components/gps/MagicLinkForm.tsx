'use client';

import { useActionState } from 'react';
import { Loader2, MailCheck } from 'lucide-react';
import { sendMagicLink, type MagicLinkState } from '@/app/diagnostico/actions';
import { getCopy } from '@/lib/gps/copy';
import type { Locale } from '@/lib/i18n';
import { trackEvent } from '@/lib/track';

const initialState: MagicLinkState = { status: 'idle' };

export default function MagicLinkForm({
  locale,
  next,
  urlError,
}: {
  locale: Locale;
  next: string;
  urlError?: string;
}) {
  const c = getCopy(locale);
  const [state, formAction, pending] = useActionState(
    async (prev: MagicLinkState, formData: FormData) => {
      const result = await sendMagicLink(prev, formData);
      if (result.status === 'sent') trackEvent('gps_magic_link_enviado');
      return result;
    },
    initialState,
  );

  if (state.status === 'sent') {
    return (
      <div className="text-center py-8">
        <MailCheck className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h2 className="heading-md text-primary-900 mb-2">{c.auth.sentTitle}</h2>
        <p className="text-neutral-600">{c.auth.sentBody}</p>
        <p className="text-sm text-neutral-400 mt-4">{c.auth.sentSpam}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {urlError === 'enlace_expirado' && (
        <p className="text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-3">
          {c.auth.expired}
        </p>
      )}
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
          {c.auth.emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="tucorreo@ejemplo.com"
          className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      {state.status === 'error' && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> {c.auth.sending}
          </>
        ) : (
          c.auth.submit
        )}
      </button>
      <p className="text-xs text-neutral-400 text-center">
        Sin contraseñas. Sin spam. Tus datos financieros son privados: nunca los vendemos ni
        compartimos.
      </p>
    </form>
  );
}
