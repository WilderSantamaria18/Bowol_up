import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'interactive';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', children, ...props }, ref) => {
    const variants = {
      glass:
        'bg-white dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-white/[0.08] backdrop-blur-xl shadow-lg shadow-zinc-200/40 dark:shadow-none text-zinc-900 dark:text-zinc-100',
      solid:
        'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100',
      interactive:
        'bg-white dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-white/[0.08] hover:border-orange-500/40 backdrop-blur-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md text-zinc-900 dark:text-zinc-100',
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-xl p-5', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
