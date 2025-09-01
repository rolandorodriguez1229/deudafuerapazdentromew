'use client';

import { useEffect, useRef, useState } from 'react';

type CountdownSize = 'sm' | 'md';

interface CountdownProps {
  durationSeconds?: number;
  endAt?: string | number | Date;
  size?: CountdownSize;
  label?: string;
}

function formatTime(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function Countdown({ durationSeconds = 15 * 60, endAt, size = 'md', label }: CountdownProps) {
  const [remaining, setRemaining] = useState<number>(durationSeconds);
  const endAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!endAtRef.current) {
      if (endAt) {
        const ts = typeof endAt === 'string' || endAt instanceof Date ? new Date(endAt).getTime() : Number(endAt);
        endAtRef.current = ts;
      } else {
        endAtRef.current = Date.now() + durationSeconds * 1000;
      }
    }

    const interval = setInterval(() => {
      const msLeft = (endAtRef.current as number) - Date.now();
      const secLeft = Math.max(0, Math.ceil(msLeft / 1000));
      setRemaining(secLeft);
      if (secLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [durationSeconds, endAt]);

  const base = 'inline-flex items-center rounded-full font-semibold';
  const variant =
    size === 'sm'
      ? 'text-xs px-3 py-1 bg-yellow-100 text-yellow-800'
      : 'text-sm px-4 py-1.5 bg-yellow-100 text-yellow-800';

  return (
    <span className={`${base} ${variant}`}>
      {label ? `${label} ` : ''}{formatTime(remaining)}
    </span>
  );
}


