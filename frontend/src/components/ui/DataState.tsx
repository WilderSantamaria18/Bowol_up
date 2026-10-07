import React from 'react';
import { Inbox, LucideIcon, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert } from './Alert';
import { Button } from './Button';

/** Bloque animado de carga; se compone en esqueletos de tarjeta o de lista. */
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div aria-hidden="true" className={cn('animate-pulse rounded-lg bg-zinc-200/80 dark:bg-white/[0.06]', className)} />
);

/** Rejilla de tarjetas esqueleto para listados en columnas. */
export const CardSkeletonGrid: React.FC<{ count?: number; className?: string; cardClassName?: string }> = ({
  count = 6,
  className,
  cardClassName,
}) => (
  <div
    role="status"
    aria-label="Cargando"
    className={cn('grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3', className)}
  >
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className={cn(
          'ios-card space-y-3 rounded-[20px] p-5',
          cardClassName,
        )}
      >
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-8 w-full" />
      </div>
    ))}
  </div>
);

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

/** Estado vacío estándar de un listado (sin datos o sin resultados de filtro). */
export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon: Icon = Inbox, action, className }) => (
  <div
    className={cn(
      'ios-card mx-auto flex max-w-md flex-col items-center gap-2 rounded-[28px] p-12 text-center',
      className,
    )}
  >
    <span className="ios-tile ios-tile-zinc mb-1 h-12 w-12 rounded-[15px] opacity-90">
      <Icon className="h-6 w-6" strokeWidth={1.7} />
    </span>
    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
    {description && <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export interface DataStateProps {
  isLoading: boolean;
  /** Mensaje de error ya legible, o null. */
  error?: string | null;
  onRetry?: () => void;
  isEmpty: boolean;
  /** Esqueleto mostrado mientras carga (por defecto, una rejilla de tarjetas). */
  loading?: React.ReactNode;
  empty: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Máquina de estados única para listados: cargando → error → vacío → contenido.
 * Cada módulo deja de reimplementar su propio ternario anidado.
 */
export const DataState: React.FC<DataStateProps> = ({ isLoading, error, onRetry, isEmpty, loading, empty, children }) => {
  if (isLoading) return <>{loading ?? <CardSkeletonGrid />}</>;
  if (error) {
    return (
      <Alert variant="error" title="No se pudo cargar la información" detail={error}>
        {onRetry && (
          <Button variant="outline" size="sm" leftIcon={RefreshCw} onClick={onRetry} className="mt-2">
            Reintentar
          </Button>
        )}
      </Alert>
    );
  }
  if (isEmpty) return <>{empty}</>;
  return <>{children}</>;
};
