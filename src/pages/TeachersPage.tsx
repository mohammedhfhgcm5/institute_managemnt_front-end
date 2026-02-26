import { TeacherList } from '@/components/teachers/TeacherList';

export default function TeachersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة المعلمين</h1>
      <TeacherList />
    </div>
  );
}
