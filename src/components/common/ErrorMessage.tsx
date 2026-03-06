import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  message,
  onRetry,
}: ErrorMessageProps) {
  const { text } = useLocale();

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-lg font-medium text-muted-foreground">
        {message || text('حدث خطأ غير متوقع', 'An unexpected error occurred')}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {text('إعادة المحاولة', 'Retry')}
        </Button>
      )}
    </div>
  );
}
