import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: SearchInputProps) {
  const { isArabic, text } = useLocale();
  const resolvedPlaceholder = placeholder || text('بحث...', 'Search...');

  return (
    <div className={`relative ${className}`}>
      <Search
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ${
          isArabic ? 'right-3' : 'left-3'
        }`}
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={resolvedPlaceholder}
        className="px-10"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-1/2 h-7 w-7 -translate-y-1/2 ${
            isArabic ? 'left-1' : 'right-1'
          }`}
          onClick={() => onChange('')}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
