import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-[hsl(var(--field-border))] bg-[hsl(var(--field-bg))] px-3 py-2 text-sm text-[hsl(var(--field-text))] shadow-[0_1px_2px_0_hsl(var(--field-shadow))] ring-offset-background transition-[border-color,box-shadow,background-color,color] duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[hsl(var(--field-placeholder))] hover:bg-[hsl(var(--field-bg-hover))] hover:border-[hsl(var(--field-border-strong)/0.4)] focus-visible:outline-none focus-visible:border-[hsl(var(--field-border-strong))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--field-ring)/0.45)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
