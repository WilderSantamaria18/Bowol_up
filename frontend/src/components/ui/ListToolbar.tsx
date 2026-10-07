import React from 'react';
import { Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const FIELD_BASE =
  'text-[13px] rounded-[12px] border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 ' +
  'bg-zinc-900/[0.06] text-zinc-900 placeholder-zinc-500 hover:bg-zinc-900/[0.09] focus:bg-white ' +
  'dark:bg-white/[0.08] dark:text-zinc-100 dark:placeholder-zinc-500 dark:hover:bg-white/[0.11] dark:focus:bg-white/[0.12]';

export interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onValueChange: (value: string) => void;
}

/** Buscador de listados con icono. */
export const SearchField: React.FC<SearchFieldProps> = ({ value, onValueChange, className, placeholder = 'Buscar…', ...props }) => (
  <div className={cn('relative w-full max-w-xs', className)}>
    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" strokeWidth={1.5} />
    <input
      type="search"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      placeholder={placeholder}
      aria-label={props['aria-label'] ?? placeholder}
      className={cn(FIELD_BASE, 'w-full py-2 pl-9 pr-3')}
      {...props}
    />
  </div>
);

export interface FilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  'aria-label': string;
  className?: string;
}

/** Filtro compacto por lista desplegable (estado, canal, tipo…). */
export const FilterSelect: React.FC<FilterSelectProps> = ({ value, onValueChange, options, className, ...rest }) => (
  <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
    <Filter className="h-3.5 w-3.5 shrink-0 text-zinc-500" strokeWidth={1.5} />
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      aria-label={rest['aria-label']}
      className={cn(FIELD_BASE, 'cursor-pointer px-2.5 py-2', className)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

/** Fila de herramientas del listado: pestañas/filtros a la izquierda, búsqueda y filtros a la derecha. */
export const ListToolbar: React.FC<{ left?: React.ReactNode; children?: React.ReactNode; className?: string }> = ({
  left,
  children,
  className,
}) => (
  <div className={cn('flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center', className)}>
    {left}
    <div className="flex flex-1 items-center gap-2.5 sm:justify-end">{children}</div>
  </div>
);
