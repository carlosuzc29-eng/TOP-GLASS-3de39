import { SHADE_STEPS } from '@/lib/pricing';
import { cn } from '@/lib/utils';

const SHADE_BG_DARK: Record<number, string> = {
  70: 'rgba(255, 255, 255, 0.85)',
  56: 'rgba(255, 255, 255, 0.68)',
  40: 'rgba(255, 255, 255, 0.52)',
  33: 'rgba(255, 255, 255, 0.36)',
  22: 'rgba(255, 255, 255, 0.22)',
  15: 'rgba(255, 255, 255, 0.12)',
  5: '#ffc000',
};

const SHADE_BG_LIGHT: Record<number, string> = {
  70: 'rgba(0, 0, 0, 0.12)',
  56: 'rgba(0, 0, 0, 0.24)',
  40: 'rgba(0, 0, 0, 0.38)',
  33: 'rgba(0, 0, 0, 0.54)',
  22: 'rgba(0, 0, 0, 0.72)',
  15: 'rgba(0, 0, 0, 0.88)',
  5: '#000000',
};

export function Logo({
  className,
  compact = false,
  variant = 'dark',
}: {
  className?: string;
  compact?: boolean;
  variant?: 'dark' | 'light';
}) {
  const isDark = variant === 'dark';
  const swatchMap = isDark ? SHADE_BG_DARK : SHADE_BG_LIGHT;

  // TODO(content): Replace temporary industrial wordmark with final brand vector logo when delivered
  return (
    <span className={cn('inline-flex flex-col gap-1', className)}>
      <span className="flex items-baseline gap-2.5">
        <span
          className={cn(
            'font-display text-2xl leading-none font-normal tracking-[0.06em] uppercase',
            isDark ? 'text-white' : 'text-[var(--color-carbony-black)]',
          )}
        >
          TOP GLASS
        </span>
        {!compact && (
          <span
            className={cn(
              'font-display text-[11px] leading-none font-normal tracking-[0.14em] uppercase',
              isDark ? 'text-[var(--color-ash-border)]' : 'text-[var(--color-steel-mid)]',
            )}
          >
            WINDOW TINT
          </span>
        )}
      </span>
      <span
        className={cn(
          'flex h-[2px] w-full max-w-[152px] overflow-hidden',
          isDark ? 'bg-[var(--color-graphite-border)]' : 'bg-[var(--color-ash-border)]',
        )}
      >
        {SHADE_STEPS.map((vlt) => (
          <span
            key={vlt}
            className="h-full flex-1"
            style={{ backgroundColor: swatchMap[vlt] }}
            aria-hidden="true"
          />
        ))}
      </span>
    </span>
  );
}
