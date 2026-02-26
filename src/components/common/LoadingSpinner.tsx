import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  if (fullScreen) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2
          className={cn('animate-spin text-primary', sizeClasses[size], className)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <Loader2
        className={cn('animate-spin text-primary', sizeClasses[size], className)}
      />
    </div>
  );
}
