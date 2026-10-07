import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'interactive';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', children, ...props }, ref) => {
    const variants = {
      glass: 'ios-card text-zinc-900 dark:text-zinc-100',
      solid:
        'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100',
      interactive:
        'ios-card cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-500/40 text-zinc-900 dark:text-zinc-100',
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-[20px] p-5', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
