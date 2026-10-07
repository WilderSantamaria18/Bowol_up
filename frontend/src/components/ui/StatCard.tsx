import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TONES, type Tone } from './tones';

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  hint?: string;
  className?: string;
}

/** Indicador tipo widget de iOS: baldosa de icono, etiqueta y cifra grande con números tabulares. */
export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, tone = 'zinc', hint, className }) => (
  <div className={cn('ios-card rounded-[20px] p-4 text-zinc-900 dark:text-zinc-100', className)}>
    <div className="flex items-center gap-2.5">
      {Icon && (
        <span className={cn(TONES[tone].ios, 'h-7 w-7 shrink-0 rounded-[9px]')}>
          <Icon className="h-[15px] w-[15px]" strokeWidth={1.9} />
        </span>
      )}
      <span className="truncate text-[12px] font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
    </div>
    <p className="mt-2.5 text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-zinc-950 dark:text-white">{value}</p>
    {hint && <p className="mt-1.5 text-[11.5px] text-zinc-500">{hint}</p>}
  </div>
);

/** Rejilla responsiva para varias StatCard. */
export const StatGrid: React.FC<{ children: React.ReactNode; columns?: 3 | 4 | 5; className?: string }> = ({
  children,
  columns = 4,
  className,
}) => (
  <div
    className={cn(
      'grid grid-cols-2 gap-3',
      columns === 3 && 'sm:grid-cols-3',
      columns === 4 && 'sm:grid-cols-4',
      columns === 5 && 'sm:grid-cols-5',
      className,
    )}
  >
    {children}
  </div>
);
