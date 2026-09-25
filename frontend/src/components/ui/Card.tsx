import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'interactive';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', children, ...props }, ref) => {
    const variants = {
      glass: 'glass-card',
      solid: 'bg-zinc-900 border border-zinc-800',
      interactive: 'glass-card glass-card-hover cursor-pointer',
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
