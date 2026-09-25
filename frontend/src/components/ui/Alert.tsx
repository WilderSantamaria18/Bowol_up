import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  detail?: string;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = 'error',
  title,
  detail,
  children,
  ...props
}) => {
  const icons = {
    error: XCircle,
    success: CheckCircle2,
    warning: AlertCircle,
    info: Info,
  };

  const variants = {
    error: 'bg-rose-500/10 border-rose-500/30 text-rose-200',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
  };

  const Icon = icons[variant];

  return (
    <div
      role="alert"
      className={cn('flex items-start gap-3 p-3.5 rounded-xl border text-sm', variants[variant], className)}
      {...props}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0 text-current opacity-90" strokeWidth={1.5} />
      <div className="space-y-0.5">
        {title && <h5 className="font-semibold text-xs tracking-tight">{title}</h5>}
        {detail && <p className="text-xs opacity-90 leading-relaxed">{detail}</p>}
        {children}
      </div>
    </div>
  );
};
