import React, { useState } from 'react';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: LucideIcon;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, leftIcon: LeftIcon, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const isPassword = type === 'password';
    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-zinc-900 dark:text-zinc-200 tracking-tight">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {LeftIcon && (
            <div className="absolute left-3 pointer-events-none text-zinc-500 dark:text-zinc-400">
              <LeftIcon className="w-4 h-4" strokeWidth={1.75} />
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={computedType}
            className={cn(
              'w-full h-10 px-3 py-2 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 shadow-sm',
              'bg-zinc-50/80 hover:bg-white focus:bg-white text-zinc-950 placeholder-zinc-400 border-zinc-300 hover:border-zinc-400',
              'dark:bg-zinc-950/80 dark:hover:bg-zinc-950 dark:focus:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:border-zinc-700/80 dark:hover:border-zinc-600 dark:focus:border-orange-500',
              error
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30 dark:border-rose-500'
                : '',
              LeftIcon ? 'pl-9' : '',
              isPassword ? 'pr-10' : '',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 p-1 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors focus:outline-none"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" strokeWidth={1.75} />
              ) : (
                <Eye className="w-4 h-4" strokeWidth={1.75} />
              )}
            </button>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';
