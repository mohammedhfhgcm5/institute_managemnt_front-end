import { useMemo, useState } from 'react';
import { useCourses, useDeleteCourse } from '@/hooks/api/useCourses';
import { useGrades } from '@/hooks/api/useGrades';
import { useTeachers } from '@/hooks/api/useTeachers';
import {
  useCreateGradeSubject,
  useDeleteGradeSubject,
  useGradeSubjects,
} from '@/hooks/api/useGradeSubjects';
import { DataTable, Column } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Course } from '@/types/course.types';
import { GradeSubject } from '@/types/grade-subject.types';
import { formatDate } from '@/utils/formatters';
import { useDebounce } from '@/hooks/useDebounce';
import { Plus, Edit, Trash2, Link2, Loader2 } from 'lucide-react';
import { CourseForm } from '@/components/courses/CourseForm';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

type GradeSubjectWithRelations = GradeSubject & {
  grade?: { id?: number; name?: string };
  subject?: { id?: number; name?: string };
  teacher?: { id?: number; firstName?: string; lastName?: string; name?: string };
};

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [deletingGradeSubjectId, setDeletingGradeSubjectId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useCourses({
    page,
    limit: 10,
    search: debouncedSearch,
  });

  const {
    data: gradeSubjects,
    isLoading: isGradeSubjectsLoading,
    isError: isGradeSubjectsError,
    refetch: refetchGradeSubjects,
  } = useGradeSubjects();
  
  // Fetch data for dropdowns with proper spacing
  const { data: subjectsForRelations, isLoading: isSubjectsLoading } = useCourses({ 
    page: 1, 
    limit: 99, 
    search: '' 
  });
  const { data: gradesForRelations, isLoading: isGradesLoading } = useGrades({ 
    page: 1, 
    limit: 99, 
    search: '' 
  });
  const { data: teachersForRelations, isLoading: isTeachersLoading } = useTeachers({ 
    page: 1, 
    limit: 99, 
    search: '' 
  });

  const deleteCourse = useDeleteCourse();
  const createGradeSubject = useCreateGradeSubject();
  const deleteGradeSubject = useDeleteGradeSubject();

  // Extract data arrays with fallback to empty array
  const subjects = subjectsForRelations?.data || [];
  const grades = gradesForRelations?.data || [];
  const teachers = teachersForRelations?.data || [];

  // Debug: Log the data to console (remove in production)
  console.log('Subjects:', subjects);
  console.log('Grades:', grades);
  console.log('Teachers:', teachers);

  const subjectNameById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject.name])),
    [subjects]
  );
  const gradeNameById = useMemo(
    () => new Map(grades.map((grade) => [grade.id, grade.name])),
    [grades]
  );
  const teacherNameById = useMemo(
    () =>
      new Map(
        teachers.map((teacher) => [teacher.id, `${teacher.firstName} ${teacher.lastName}`.trim()])
      ),
    [teachers]
  );

  const getSubjectName = (item: GradeSubject) => {
    const enriched = item as GradeSubjectWithRelations;
    return enriched.subject?.name || subjectNameById.get(item.subjectId) || `#${item.subjectId}`;
  };

  const getGradeName = (item: GradeSubject) => {
    const enriched = item as GradeSubjectWithRelations;
    return enriched.grade?.name || gradeNameById.get(item.gradeId) || `#${item.gradeId}`;
  };

  const getTeacherName = (item: GradeSubject) => {
    const enriched = item as GradeSubjectWithRelations;
    if (enriched.teacher?.name) return enriched.teacher.name;
    if (enriched.teacher?.firstName || enriched.teacher?.lastName) {
      return `${enriched.teacher.firstName || ''} ${enriched.teacher.lastName || ''}`.trim();
    }
    if (item.teacherId) return teacherNameById.get(item.teacherId) || `#${item.teacherId}`;
    return '-';
  };

  const handleCreateGradeSubject = () => {
    const gradeId = Number(selectedGradeId);
    const subjectId = Number(selectedSubjectId);
    const teacherId = selectedTeacherId ? Number(selectedTeacherId) : undefined;

    if (!gradeId || !subjectId) {
      toast.error('Please select both grade and subject.');
      return;
    }

    const exists = (gradeSubjects || []).some(
      (item) => item.gradeId === gradeId && item.subjectId === subjectId
    );
    if (exists) {
      toast.error('This subject is already linked to the selected grade.');
      return;
    }

    createGradeSubject.mutate(
      { gradeId, subjectId, teacherId },
      {
        onSuccess: () => {
          setSelectedGradeId('');
          setSelectedSubjectId('');
          setSelectedTeacherId('');
        },
      }
    );
  };

  const courseColumns: Column<Course>[] = [
    { key: 'id', header: '#' },
    { key: 'name', header: 'Subject Name' },
    {
      key: 'description',
      header: 'Description',
      render: (c) => c.description || '-',
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (c) => formatDate(c.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (c) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingCourse(c);
              setFormOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletingId(c.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const gradeSubjectColumns: Column<GradeSubject>[] = [
    { key: 'id', header: '#' },
    {
      key: 'gradeId',
      header: 'Grade',
      render: (item) => getGradeName(item),
    },
    {
      key: 'subjectId',
      header: 'Subject',
      render: (item) => getSubjectName(item),
    },
    {
      key: 'teacherId',
      header: 'Teacher',
      render: (item) => getTeacherName(item),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (item) => formatDate(item.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <Button variant="ghost" size="icon" onClick={() => setDeletingGradeSubjectId(item.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Subjects (مواد)</h1>
        <DataTable
          columns={courseColumns}
          data={data?.data || []}
          total={data?.meta?.total || 0}
          page={data?.meta?.page || page}
          limit={data?.meta?.limit || 10}
          totalPages={data?.meta?.totalPages || 1}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          onPageChange={setPage}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search subject..."
          actions={
            <Button
              onClick={() => {
                setEditingCourse(null);
                setFormOpen(true);
              }}
            >
              <Plus className="ml-2 h-4 w-4" />
              Add Subject
            </Button>
          }
        />
      </div>

      <div className="space-y-4 rounded-md border p-4">
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Grade-Subject Relation (grade_subject)</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Each row links one subject (مواد) to one grade (الصف), with optional teacher.
        </p>

        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label>Grade (الصف)</Label>
            <Select 
              value={selectedGradeId || undefined} 
              onValueChange={setSelectedGradeId}
              disabled={isGradesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isGradesLoading ? "Loading..." : "Select grade"} />
              </SelectTrigger>
              <SelectContent>
                {grades.length === 0 && !isGradesLoading ? (
                  <div className="p-2 text-sm text-muted-foreground">No grades available</div>
                ) : (
                  grades.map((grade) => (
                    <SelectItem key={grade.id} value={String(grade.id)}>
                      {grade.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subject (مواد)</Label>
            <Select 
              value={selectedSubjectId || undefined} 
              onValueChange={setSelectedSubjectId}
              disabled={isSubjectsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isSubjectsLoading ? "Loading..." : "Select subject"} />
              </SelectTrigger>
              <SelectContent>
                {subjects.length === 0 && !isSubjectsLoading ? (
                  <div className="p-2 text-sm text-muted-foreground">No subjects available</div>
                ) : (
                  subjects.map((subject) => (
                    <SelectItem key={subject.id} value={String(subject.id)}>
                      {subject.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Teacher (Optional)</Label>
            <Select 
              value={selectedTeacherId || undefined} 
              onValueChange={setSelectedTeacherId}
              disabled={isTeachersLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isTeachersLoading ? "Loading..." : "Select teacher (optional)"} />
              </SelectTrigger>
              <SelectContent>
                {teachers.length === 0 && !isTeachersLoading ? (
                  <div className="p-2 text-sm text-muted-foreground">No teachers available</div>
                ) : (
                  teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                      {`${teacher.firstName} ${teacher.lastName}`.trim()}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            onClick={handleCreateGradeSubject}
            disabled={!selectedGradeId || !selectedSubjectId || createGradeSubject.isPending}
          >
            {createGradeSubject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Link
          </Button>
        </div>

        <DataTable
          columns={gradeSubjectColumns}
          data={gradeSubjects || []}
          isLoading={isGradeSubjectsLoading}
          isError={isGradeSubjectsError}
          onRetry={() => refetchGradeSubjects()}
        />
      </div>

      <CourseForm open={formOpen} onOpenChange={setFormOpen} course={editingCourse} />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Subject"
        description="Are you sure you want to delete this subject?"
        onConfirm={() => {
          if (deletingId) {
            deleteCourse.mutate(deletingId, { onSuccess: () => setDeletingId(null) });
          }
        }}
        isLoading={deleteCourse.isPending}
        confirmText="Delete"
      />

      <ConfirmDialog
        open={!!deletingGradeSubjectId}
        onOpenChange={(open) => !open && setDeletingGradeSubjectId(null)}
        title="Delete Grade-Subject Link"
        description="Are you sure you want to delete this subject-grade relation?"
        onConfirm={() => {
          if (deletingGradeSubjectId) {
            deleteGradeSubject.mutate(deletingGradeSubjectId, {
              onSuccess: () => setDeletingGradeSubjectId(null),
            });
          }
        }}
        isLoading={deleteGradeSubject.isPending}
        confirmText="Delete"
      />
    </div>
  );
}