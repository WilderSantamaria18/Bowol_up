import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';
    
    // Jerarquía iOS: primario tintado con brillo interior; secundarios translúcidos sobre el cristal.
    const variants = {
      primary:
        'bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold shadow-[0_1px_2px_rgba(154,52,18,0.4),0_6px_16px_-6px_rgba(234,88,12,0.55),inset_0_1px_0_rgba(255,255,255,0.28)]',
      secondary:
        'bg-zinc-900/[0.07] hover:bg-zinc-900/[0.11] dark:bg-white/[0.1] dark:hover:bg-white/[0.15] text-zinc-900 dark:text-zinc-100 font-semibold',
      outline:
        'bg-transparent hover:bg-zinc-900/[0.05] dark:hover:bg-white/[0.07] text-zinc-800 dark:text-zinc-200 border border-zinc-900/[0.14] dark:border-white/[0.16]',
      ghost:
        'bg-transparent hover:bg-zinc-900/[0.06] dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white',
      glass:
        'ios-card text-zinc-800 dark:text-zinc-200 hover:border-orange-500/40',
    };

    const sizes = {
      sm: 'h-8 px-3.5 text-xs rounded-[11px] gap-1.5',
      md: 'h-10 px-4 text-sm rounded-[13px] gap-2',
      lg: 'h-12 px-6 text-base rounded-[15px] gap-2.5',
      icon: 'h-9 w-9 p-0 rounded-[11px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" strokeWidth={1.5} />
        ) : LeftIcon ? (
          <LeftIcon className="w-4 h-4 text-current" strokeWidth={1.5} />
        ) : null}
        {children}
        {!isLoading && RightIcon ? (
          <RightIcon className="w-4 h-4 text-current" strokeWidth={1.5} />
        ) : null}
      </button>
    );
  }
);
Button.displayName = 'Button';
