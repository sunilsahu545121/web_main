import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

type Variant = 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground',
  success: 'bg-success/15 text-success border border-success/30',
  warning: 'bg-warning/15 text-warning border border-warning/30',
  destructive: 'bg-destructive/15 text-destructive border border-destructive/30',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-input text-foreground',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', styles[variant], className)}
      {...props}
    />
  );
}
