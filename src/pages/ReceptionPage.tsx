import { ReceptionList } from '@/components/reception/ReceptionList';
import { useLocale } from '@/hooks/useLocale';

export default function ReceptionPage() {
  const { text } = useLocale();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{text('إدارة الاستقبال', 'Reception Management')}</h1>
      <ReceptionList />
    </div>
  );
}
