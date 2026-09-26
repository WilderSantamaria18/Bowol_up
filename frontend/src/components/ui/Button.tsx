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
    
    const variants = {
      primary: 'bg-orange-600 hover:bg-orange-500 text-white shadow-sm hover:shadow-orange-500/25 shadow-orange-600/30 font-semibold',
      secondary: 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-300/80 dark:border-zinc-700/60 shadow-sm',
      outline: 'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white border border-zinc-300 dark:border-zinc-700',
      ghost: 'bg-transparent hover:bg-zinc-200/70 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white',
      glass: 'bg-white/80 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.08] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/[0.08] backdrop-blur-md hover:border-orange-500/40 shadow-sm',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
      md: 'h-9 px-4 text-sm rounded-lg gap-2',
      lg: 'h-11 px-6 text-base rounded-xl gap-2.5',
      icon: 'h-9 w-9 p-0 rounded-lg',
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
