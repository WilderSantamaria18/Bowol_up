import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: string;
  /** El control recibe `id` y `aria-describedby` por render-prop para asociarlos a la etiqueta. */
  children: (control: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => React.ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

/** Etiqueta + control + ayuda/error, con asociación accesible. Para cualquier control (textarea, select, custom). */
export const FormField: React.FC<FormFieldProps> = ({ label, children, hint, error, required, className }) => {
  const id = useId();
  const describedBy = error || hint ? `${id}-desc` : undefined;
  return (
    <div className={cn('space-y-1.5 text-left', className)}>
      <label htmlFor={id} className="block text-xs font-bold tracking-tight text-zinc-900 dark:text-zinc-200">
        {label}
        {required && <span className="ml-0.5 text-rose-600 dark:text-rose-400" aria-hidden="true">*</span>}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {error ? (
        <p id={describedBy} className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
      ) : hint ? (
        <p id={describedBy} className="text-xs text-zinc-600 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
};

export const CONTROL_CLASSES =
  'w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 shadow-sm ' +
  'bg-zinc-50/80 hover:bg-white focus:bg-white text-zinc-950 placeholder-zinc-400 border-zinc-300 hover:border-zinc-400 ' +
  'dark:bg-zinc-950/80 dark:hover:bg-zinc-950 dark:focus:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:border-zinc-700/80 dark:hover:border-zinc-600';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, rows = 3, ...props }, ref) => (
    <textarea ref={ref} rows={rows} className={cn(CONTROL_CLASSES, 'resize-y', className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';
