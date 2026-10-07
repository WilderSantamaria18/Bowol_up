import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LucideIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TONES, type Tone } from './tones';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-3xl',
} as const;

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  tone?: Tone;
  size?: keyof typeof SIZES;
  /** Contenido fijo al pie (botones de acción). */
  footer?: React.ReactNode;
  /** Bloquea cierre por Escape/fondo/botón mientras se envía un formulario. */
  busy?: boolean;
  /** Cierra al pulsar el fondo (por defecto sí). */
  dismissOnBackdrop?: boolean;
  className?: string;
  'data-testid'?: string;
  children: React.ReactNode;
}

/**
 * Diálogo modal único de la aplicación: fondo, panel, cabecera, cierre por Escape,
 * foco inicial, `role="dialog"` y soporte claro/oscuro. Sustituye a los 29 overlays hechos a mano.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  tone = 'orange',
  size = 'md',
  footer,
  busy = false,
  dismissOnBackdrop = true,
  className,
  children,
  ...rest
}) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    // Foco inicial: primer campo del formulario si existe; si no, el propio panel.
    const firstField = panelRef.current?.querySelector<HTMLElement>('input:not([type=hidden]), textarea, select');
    (firstField ?? panelRef.current)?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, busy, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-md animate-in fade-in duration-200 dark:bg-black/50"
      onMouseDown={(e) => {
        if (dismissOnBackdrop && !busy && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        data-testid={rest['data-testid']}
        className={cn(
          'ios-sheet relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[28px] text-zinc-900 outline-none dark:text-zinc-100',
          SIZES[size],
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-zinc-900/[0.07] px-6 py-5 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className={cn(TONES[tone].ios, 'h-10 w-10 shrink-0 rounded-[13px]')}>
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
            )}
            <div>
              <h2 id={titleId} className="text-[17px] font-semibold tracking-[-0.015em] text-zinc-950 dark:text-white">
                {title}
              </h2>
              {subtitle && <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Cerrar"
            className="rounded-full bg-zinc-900/[0.07] p-1.5 text-zinc-500 transition-colors hover:bg-zinc-900/[0.12] hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 disabled:opacity-40 dark:bg-white/[0.1] dark:text-zinc-400 dark:hover:bg-white/[0.16] dark:hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-3 border-t border-zinc-900/[0.07] px-6 py-4 dark:border-white/[0.08]">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
};
