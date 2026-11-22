'use client';

import { Lock } from 'lucide-react';
import { SHADE_STEPS } from '@/lib/pricing';
import { cn } from '@/lib/utils';

const STEP_FILL_LIGHT: Record<number, string> = {
  70: 'rgba(32, 32, 32, 0.10)',
  56: 'rgba(32, 32, 32, 0.22)',
  40: 'rgba(32, 32, 32, 0.38)',
  33: 'rgba(32, 32, 32, 0.56)',
  22: 'rgba(32, 32, 32, 0.74)',
  15: 'rgba(24, 24, 24, 0.88)',
  5: '#000000',
};

const STEP_FILL_DARK: Record<number, string> = {
  70: '#8b9196',
  56: '#6c7176',
  40: '#4f5357',
  33: '#3d4043',
  22: '#2a2c2e',
  15: '#17181a',
  5: '#000000',
};

export function ShadeScaleDivider({
  className,
  variant = 'light',
}: {
  className?: string;
  variant?: 'light' | 'dark';
}) {
  return (
    <div
      className={cn(
        'h-[1px] w-full',
        variant === 'dark' ? 'bg-[var(--color-graphite-border)]' : 'bg-[var(--color-ash-border)]',
        className,
      )}
      aria-hidden="true"
    />
  );
}

interface ShadeScaleBarProps {
  value: number | null;
  onChange: (vlt: number) => void;
  availableShades?: number[];
  blockedShades?: number[];
  blockedReason?: string;
  label?: string;
  variant?: 'light' | 'dark';
  className?: string;
}

export function ShadeScaleBar({
  value,
  onChange,
  availableShades = [...SHADE_STEPS],
  blockedShades = [],
  blockedReason,
  label,
  variant = 'light',
  className,
}: ShadeScaleBarProps) {
  const hasBlocked = blockedShades.some((s) => availableShades.includes(s));
  const isDarkSurface = variant === 'dark';
  const fillMap = isDarkSurface ? STEP_FILL_DARK : STEP_FILL_LIGHT;

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.023em]">
          <span className={isDarkSurface ? 'text-white' : 'text-[var(--color-carbony-black)]'}>
            {label}
          </span>
          {value != null && (
            <span
              className={cn(
                'tabular-nums',
                isDarkSurface
                  ? 'text-[var(--color-giallo-vivo)]'
                  : 'text-[var(--color-carbony-black)]',
              )}
            >
              {value}% VLT
            </span>
          )}
        </div>
      )}

      <div
        role="radiogroup"
        aria-label={label ?? 'Tint shade selector'}
        className="grid grid-cols-7 gap-1"
      >
        {SHADE_STEPS.map((vlt) => {
          const isAvailable = availableShades.includes(vlt);
          const isBlocked = blockedShades.includes(vlt);
          const disabled = !isAvailable || isBlocked;
          const isSelected = value === vlt;
          const isDarkCell = isDarkSurface || vlt <= 33;

          return (
            <button
              key={vlt}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              title={isBlocked ? blockedReason : `${vlt}% VLT`}
              onClick={() => {
                if (!disabled) onChange(vlt);
              }}
              className={cn(
                'group relative flex flex-col items-center justify-center rounded-none border px-1 py-3 text-xs tracking-[0.023em] uppercase transition-colors',
                isSelected
                  ? 'border-[var(--color-giallo-vivo)] ring-1 ring-[var(--color-giallo-vivo)]'
                  : isDarkSurface
                    ? 'border-[var(--color-graphite-border)] hover:border-white'
                    : 'border-[var(--color-ash-border)] hover:border-[var(--color-pure-black)]',
                disabled && 'cursor-not-allowed opacity-35',
              )}
              style={{
                backgroundColor: isAvailable ? fillMap[vlt] : 'transparent',
                color: isAvailable
                  ? isDarkCell
                    ? '#ffffff'
                    : '#202020'
                  : '#7d7d7d',
              }}
            >
              <span className="tabular-nums">{vlt}%</span>
              {isSelected && (
                <span
                  className="absolute inset-x-0 bottom-0 h-[3px] bg-[var(--color-giallo-vivo)]"
                  aria-hidden="true"
                />
              )}
              {isBlocked && (
                <Lock
                  className={cn(
                    'mt-1 h-3 w-3',
                    isDarkCell ? 'text-white/75' : 'text-[var(--color-carbony-black)]/75',
                  )}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {hasBlocked && blockedReason && (
        <p
          className={cn(
            'flex items-center gap-1.5 text-xs uppercase tracking-[0.023em]',
            isDarkSurface ? 'text-[var(--color-ash-border)]' : 'text-[var(--color-steel-mid)]',
          )}
        >
          <Lock
            className={cn(
              'h-3.5 w-3.5 shrink-0',
              isDarkSurface ? 'text-[var(--color-giallo-vivo)]' : 'text-[var(--color-carbony-black)]',
            )}
            aria-hidden="true"
          />
          <span>{blockedReason}</span>
        </p>
      )}
    </div>
  );
}
