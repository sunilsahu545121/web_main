import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? (label ? generatedId : undefined);
    const input = (
      <input
        id={inputId}
        type={type}
        ref={ref}
        className={clsx(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );

    if (!label) return input;

    return (
      <label className="block space-y-1.5 text-sm font-medium text-foreground" htmlFor={inputId}>
        <span>{label}</span>
        {input}
      </label>
    );
  }
);
Input.displayName = 'Input';
