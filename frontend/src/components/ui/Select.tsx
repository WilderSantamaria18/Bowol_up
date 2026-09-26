import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold text-zinc-900 dark:text-zinc-200 tracking-tight">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full h-10 px-3 pr-10 text-sm rounded-lg border appearance-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 shadow-sm cursor-pointer',
              'bg-zinc-50/80 hover:bg-white focus:bg-white text-zinc-950 border-zinc-300 hover:border-zinc-400',
              'dark:bg-zinc-950/80 dark:hover:bg-zinc-950 dark:focus:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-700/80 dark:hover:border-zinc-600',
              error
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30 dark:border-rose-500'
                : '',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-500 dark:text-zinc-400">
            <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
          </div>
        </div>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{error}</p>}
        {!error && helperText && <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
