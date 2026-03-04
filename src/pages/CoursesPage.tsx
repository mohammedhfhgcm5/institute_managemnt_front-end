import { useMemo, useState, useEffect } from 'react';
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
import { SearchSelect } from '@/components/ui/searchselect';
import { Course } from '@/types/course.types';
import { GradeSubject } from '@/types/grade-subject.types';
import { formatDate } from '@/utils/formatters';
import { useDebounce } from '@/hooks/useDebounce';
import { Plus, Edit, Trash2, Link2, Loader2 } from 'lucide-react';
import { CourseForm } from '@/components/courses/CourseForm';
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
  const [deletingGradeSubjectId, setDeletingGradeSubjectId] = useState<number | null>(null);

  // SearchSelect states for Grade
  const [gradeQuery, setGradeQuery] = useState('');
  const [gradeResults, setGradeResults] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<{ id: number; name: string } | null>(null);

  // SearchSelect states for Subject
  const [subjectQuery, setSubjectQuery] = useState('');
  const [subjectResults, setSubjectResults] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<{ id: number; name: string } | null>(null);

  // SearchSelect states for Teacher
  const [teacherQuery, setTeacherQuery] = useState('');
  const [teacherResults, setTeacherResults] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<{ id: number; name: string } | null>(null);

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
  
  // Fetch data with search queries
  const { data: subjectsForRelations } = useCourses({ 
    page: 1, 
    limit: 100, 
    search: subjectQuery 
  });
  
  const { data: gradesForRelations } = useGrades({ 
    page: 1, 
    limit: 100, 
    search: gradeQuery 
  });
  
  const { data: teachersForRelations } = useTeachers({ 
    page: 1, 
    limit: 100, 
    search: teacherQuery 
  });

  const deleteCourse = useDeleteCourse();
  const createGradeSubject = useCreateGradeSubject();
  const deleteGradeSubject = useDeleteGradeSubject();

  // Extract data arrays with fallback to empty array
  const subjects = subjectsForRelations?.data || [];
  const grades = gradesForRelations?.data || [];
  const teachers = teachersForRelations?.data || [];

  // Update results when data changes
  useEffect(() => {
    if (grades && gradeQuery.length > 0) {
      setGradeResults(grades);
    } else {
      setGradeResults([]);
    }
  }, [grades, gradeQuery]);

  useEffect(() => {
    if (subjects && subjectQuery.length > 0) {
      setSubjectResults(subjects);
    } else {
      setSubjectResults([]);
    }
  }, [subjects, subjectQuery]);

  useEffect(() => {
    if (teachers && teacherQuery.length > 0) {
      setTeacherResults(teachers);
    } else {
      setTeacherResults([]);
    }
  }, [teachers, teacherQuery]);

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
    const gradeId = selectedGrade?.id;
    const subjectId = selectedSubject?.id;
    const teacherId = selectedTeacher?.id;

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
          setSelectedGrade(null);
          setGradeQuery('');
          setSelectedSubject(null);
          setSubjectQuery('');
          setSelectedTeacher(null);
          setTeacherQuery('');
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

        <div className="grid gap-3 md:grid-cols-3 md:items-end">
          <SearchSelect
            label="Grade (الصف)"
            query={gradeQuery}
            setQuery={setGradeQuery}
            results={gradeResults}
            setResults={setGradeResults}
            selected={selectedGrade}
            setSelected={setSelectedGrade}
            setValue={(id) => setSelectedGrade({ id, name: grades.find(g => g.id === id)?.name || '' })}
            display={(grade) => grade.name}
            required={true}
          />

          <SearchSelect
            label="Subject (مواد)"
            query={subjectQuery}
            setQuery={setSubjectQuery}
            results={subjectResults}
            setResults={setSubjectResults}
            selected={selectedSubject}
            setSelected={setSelectedSubject}
            setValue={(id) => setSelectedSubject({ id, name: subjects.find(s => s.id === id)?.name || '' })}
            display={(subject) => subject.name}
            required={true}
          />

          <SearchSelect
            label="Teacher (Optional)"
            query={teacherQuery}
            setQuery={setTeacherQuery}
            results={teacherResults}
            setResults={setTeacherResults}
            selected={selectedTeacher}
            setSelected={setSelectedTeacher}
            setValue={(id) => setSelectedTeacher({ id, name: `${teachers.find(t => t.id === id)?.firstName || ''} ${teachers.find(t => t.id === id)?.lastName || ''}`.trim() })}
            display={(teacher) => `${teacher.firstName} ${teacher.lastName}`.trim()}
            required={false}
          />
        </div>

        <Button
          type="button"
          onClick={handleCreateGradeSubject}
          disabled={!selectedGrade || !selectedSubject || createGradeSubject.isPending}
          className="w-full md:w-auto"
        >
          {createGradeSubject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Link
        </Button>

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