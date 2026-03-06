import { TeacherList } from '@/components/teachers/TeacherList';
import { useLocale } from '@/hooks/useLocale';

export default function TeachersPage() {
  const { text } = useLocale();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{text('إدارة المعلمين', 'Teacher Management')}</h1>
      <TeacherList />
    </div>
  );
}
