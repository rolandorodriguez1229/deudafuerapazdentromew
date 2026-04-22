'use client';

import { useEffect } from 'react';
import { trackPurchase } from '@/lib/track';

export default function PurchaseTracker() {
  useEffect(() => {
    const key = 'purchase_tracked';
    if (sessionStorage.getItem(key) === '1') return;
    sessionStorage.setItem(key, '1');
    trackPurchase({ value: 7.99, currency: 'USD' });
  }, []);
  return null;
}
