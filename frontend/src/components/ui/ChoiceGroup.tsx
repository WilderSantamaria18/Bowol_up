import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TONES, type Tone } from './tones';

export interface ChoiceOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: LucideIcon;
  tone?: Tone;
  disabled?: boolean;
}

export interface ChoiceGroupProps<T extends string = string> {
  options: ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4;
  'aria-label': string;
  className?: string;
}

/**
 * Grupo de tarjetas de selección única (resultado, método, pasarela, paquete…).
 * Semántica de radio (`role="radiogroup"`) y estado seleccionado con el tono de cada opción.
 */
export function ChoiceGroup<T extends string = string>({
  options,
  value,
  onChange,
  columns = 3,
  className,
  ...rest
}: ChoiceGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={rest['aria-label']}
      className={cn('grid gap-2.5', columns === 2 && 'grid-cols-2', columns === 3 && 'grid-cols-3', columns === 4 && 'grid-cols-2 sm:grid-cols-4', className)}
    >
      {options.map(({ value: optionValue, label, description, icon: Icon, tone = 'orange', disabled }) => {
        const selected = optionValue === value;
        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(optionValue)}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 disabled:opacity-50',
              selected
                ? cn(TONES[tone].active, 'ring-1 ring-current/20')
                : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-zinc-400 dark:hover:text-zinc-200',
            )}
          >
            {Icon && <Icon className={cn('mb-1 h-5 w-5', TONES[tone].text)} strokeWidth={1.5} />}
            <span className="text-xs font-semibold">{label}</span>
            {description && <span className="text-[10px] text-zinc-500">{description}</span>}
          </button>
        );
      })}
    </div>
  );
}
