import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TONES, type Tone } from './tones';

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  tone?: Tone;
  /** Texto pequeño sobre el título (fase, módulo…). */
  eyebrow?: string;
  /** Botones de acción alineados a la derecha. */
  actions?: React.ReactNode;
  className?: string;
}

/** Cabecera estándar de módulo: título grande estilo iOS, baldosa de icono con degradado y acciones. */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon: Icon, tone = 'orange', eyebrow, actions, className }) => (
  <header className={cn('flex flex-col justify-between gap-4 md:flex-row md:items-end', className)}>
    <div className="flex items-center gap-4">
      {Icon && (
        <span className={cn(TONES[tone].ios, 'h-12 w-12 shrink-0 rounded-[15px]')}>
          <Icon className="h-6 w-6" strokeWidth={1.7} />
        </span>
      )}
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-zinc-500 dark:text-zinc-400">{eyebrow}</p>
        )}
        <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-zinc-950 dark:text-white sm:text-[30px]">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
        )}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
  </header>
);
