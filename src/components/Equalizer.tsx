import React from 'react';

interface EqualizerProps {
  playing: boolean;
  bars?: number;
  className?: string;
  barClassName?: string;
}

/** Decorative animated equalizer; bars freeze low when paused. */
export const Equalizer: React.FC<EqualizerProps> = ({
  playing,
  bars = 5,
  className = 'h-4 gap-[3px]',
  barClassName = 'w-[3px] bg-accent',
}) => (
  <span aria-hidden="true" className={`inline-flex items-end ${playing ? '' : 'eq-paused'} ${className}`}>
    {Array.from({ length: bars }).map((_, i) => (
      <span
        key={i}
        className={`eq-bar h-full rounded-full ${barClassName}`}
        style={{ animationDelay: `${(i * 137) % 600 - 600}ms`, animationDuration: `${900 + ((i * 211) % 500)}ms` }}
      />
    ))}
  </span>
);
