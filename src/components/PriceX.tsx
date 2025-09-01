import React from 'react';

type PriceXProps = {
  text: string; // e.g., "$19.99"
  size?: 'sm' | 'md';
  className?: string;
};

export default function PriceX({ text, size = 'md', className = '' }: PriceXProps) {
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';
  return (
    <span className={`relative inline-block align-middle ${textSize} ${className}`} aria-label={`Precio anterior ${text}`}>
      <span className="relative z-10 text-neutral-400 select-none">{text}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/2 w-full h-[2px] bg-red-500/90 rotate-12"
        style={{ transformOrigin: 'center' }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/2 w-full h-[2px] bg-red-500/90 -rotate-12"
        style={{ transformOrigin: 'center' }}
      />
    </span>
  );
}
