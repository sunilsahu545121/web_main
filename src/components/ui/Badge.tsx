import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

type Variant = 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline' | 'info';
type Tone = 'success' | 'warning' | 'danger' | 'destructive' | 'info' | 'secondary' | 'default';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  tone?: Tone;
}

const styles: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground',
  success: 'bg-success/15 text-success border border-success/30',
  warning: 'bg-warning/15 text-warning border border-warning/30',
  destructive: 'bg-destructive/15 text-destructive border border-destructive/30',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-input text-foreground',
  info: 'bg-blue-500/15 text-blue-700 border border-blue-500/30',
};

const toneToVariant: Record<Tone, Variant> = {
  default: 'default',
  success: 'success',
  warning: 'warning',
  danger: 'destructive',
  destructive: 'destructive',
  info: 'info',
  secondary: 'secondary',
};

export function Badge({ className, variant = 'default', tone, ...props }: BadgeProps) {
  const resolvedVariant = tone ? toneToVariant[tone] : variant;

  return (
    <span
      className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', styles[resolvedVariant], className)}
      {...props}
    />
  );
}
