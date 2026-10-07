import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TONES, type Tone } from './tones';

export interface SegmentedTabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

export interface SegmentedTabsProps<T extends string = string> {
  items: SegmentedTabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Color del icono del segmento activo. */
  tone?: Tone;
  /** `tabs` (pestañas de vista) o `filter` (filtros excluyentes: botones con aria-pressed). */
  mode?: 'tabs' | 'filter';
  'aria-label'?: string;
  className?: string;
}

/** Control segmentado estilo iOS: pista translúcida y "pastilla" blanca elevada para el segmento activo. */
export function SegmentedTabs<T extends string = string>({
  items,
  value,
  onChange,
  tone = 'orange',
  mode = 'tabs',
  className,
  ...rest
}: SegmentedTabsProps<T>) {
  return (
    <div
      role={mode === 'tabs' ? 'tablist' : 'group'}
      aria-label={rest['aria-label']}
      className={cn(
        'inline-flex max-w-full items-center gap-0.5 self-start overflow-x-auto rounded-[13px] p-[3px]',
        'bg-zinc-900/[0.07] dark:bg-white/[0.09] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {items.map(({ id, label, icon: Icon, count }) => {
        const selected = id === value;
        return (
          <button
            key={id}
            type="button"
            role={mode === 'tabs' ? 'tab' : undefined}
            aria-selected={mode === 'tabs' ? selected : undefined}
            aria-pressed={mode === 'filter' ? selected : undefined}
            onClick={() => onChange(id)}
            className={cn(
              'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[10px] px-3.5 py-1.5 text-[12.5px] font-semibold outline-none transition-all duration-200',
              'focus-visible:ring-2 focus-visible:ring-orange-500/60',
              selected
                ? 'bg-white text-zinc-950 shadow-[0_1px_3px_rgba(0,0,0,0.14),0_0_0_0.5px_rgba(0,0,0,0.05)] dark:bg-zinc-600/80 dark:text-white dark:shadow-[0_1px_3px_rgba(0,0,0,0.5),inset_0_0.5px_0_rgba(255,255,255,0.12)]'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
            )}
          >
            {Icon && <Icon className={cn('h-3.5 w-3.5', selected && TONES[tone].text)} strokeWidth={1.8} />}
            <span>{label}</span>
            {count !== undefined && (
              <span className="rounded-full bg-zinc-900/[0.08] px-1.5 text-[10px] font-medium tabular-nums text-zinc-700 dark:bg-white/[0.12] dark:text-zinc-300">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
