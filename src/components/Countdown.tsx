'use client';

import { useEffect, useRef, useState } from 'react';

type CountdownSize = 'sm' | 'md';

interface CountdownProps {
  durationSeconds?: number;
  size?: CountdownSize;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function Countdown({ durationSeconds = 15 * 60, size = 'md' }: CountdownProps) {
  const [remaining, setRemaining] = useState<number>(durationSeconds);
  const endAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!endAtRef.current) {
      endAtRef.current = Date.now() + durationSeconds * 1000;
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
  }, [durationSeconds]);

  const base = 'inline-flex items-center rounded-full font-semibold';
  const variant =
    size === 'sm'
      ? 'text-xs px-3 py-1 bg-yellow-100 text-yellow-800'
      : 'text-sm px-4 py-1.5 bg-yellow-100 text-yellow-800';

  return (
    <span className={`${base} ${variant}`}>
      Oferta activa: {formatTime(remaining)}
    </span>
  );
}


