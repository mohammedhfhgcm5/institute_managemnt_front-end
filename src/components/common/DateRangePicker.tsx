import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/useLocale';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  const { text } = useLocale();

  return (
    <div className="flex items-center gap-4">
      <div className="space-y-1">
        <Label className="text-xs">{text('من', 'From')}</Label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-40"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{text('إلى', 'To')}</Label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-40"
        />
      </div>
    </div>
  );
}
