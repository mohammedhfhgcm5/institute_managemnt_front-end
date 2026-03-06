import { StudentList } from '@/components/students/StudentList';
import { useLocale } from '@/hooks/useLocale';

export default function StudentsPage() {
  const { text } = useLocale();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{text('إدارة الطلاب', 'Student Management')}</h1>
      <StudentList />
    </div>
  );
}
