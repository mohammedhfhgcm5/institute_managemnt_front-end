import { StudentList } from '@/components/students/StudentList';

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة الطلاب</h1>
      <StudentList />
    </div>
  );
}