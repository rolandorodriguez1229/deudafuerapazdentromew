type GtagArgs = [string, string, Record<string, unknown>?];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArgs) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  try {
    window.gtag?.('event', name, params);
    window.fbq?.('trackCustom', name, params);
  } catch {}
}

export function trackLead(email?: string) {
  if (typeof window === 'undefined') return;
  try {
    window.gtag?.('event', 'generate_lead', { method: 'plantilla_gratuita' });
    window.fbq?.('track', 'Lead', email ? { em: email } : undefined);
  } catch {}
}

export function trackPurchase(params: {
  value: number;
  currency?: string;
  transactionId?: string;
}) {
  if (typeof window === 'undefined') return;
  const currency = params.currency || 'USD';
  try {
    window.gtag?.('event', 'purchase', {
      transaction_id: params.transactionId,
      value: params.value,
      currency,
    });
    window.fbq?.('track', 'Purchase', { value: params.value, currency });
  } catch {}
}

export function trackInitiateCheckout(value = 7.99) {
  if (typeof window === 'undefined') return;
  try {
    window.gtag?.('event', 'begin_checkout', { value, currency: 'USD' });
    window.fbq?.('track', 'InitiateCheckout', { value, currency: 'USD' });
  } catch {}
}
