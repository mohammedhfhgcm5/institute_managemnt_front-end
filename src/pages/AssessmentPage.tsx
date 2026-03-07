import { useEffect, useMemo, useState } from "react";
import { AssessmentList } from "@/components/assessments/AssessmentList";
import { useBulkCreateAssessments } from "@/hooks/api/useAssessments";
import { useSectionsByGrade } from "@/hooks/api/useSections";
import { useStudentsBySection } from "@/hooks/api/useStudents";
import { useGradeSubjects } from "@/hooks/api/useGradeSubjects";
import { useGrades } from "@/hooks/api/useGrades";
import { usePermissions } from "@/hooks/usePermissions";
import { useLocale } from "@/hooks/useLocale";
import { SearchSelect } from "@/components/ui/searchselect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AssessmentType,
} from "@/types/common.types";
import { Grade } from "@/types/grade.types";
import { Section } from "@/types/section.types";
import { Student } from "@/types/student.types";
import { GradeSubject } from "@/types/grade-subject.types";
import { toast } from "sonner";

type SearchOption = { id: number; name: string };
type StudentScoreMap = Record<number, { studentId: number; score?: number; feedback?: string }>;

const assessmentTypeOptions: AssessmentType[] = [
  "quiz",
  "exam",
  "homework",
  "midterm",
  "final",
];

const getToday = () => new Date().toISOString().split("T")[0];

const toNumber = (value: string): number | undefined => {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default function AssessmentPage() {
  const { text } = useLocale();
  const permissions = usePermissions();
  const canBulkCreate = permissions.canManageGrades;

  const [selectedGradeId, setSelectedGradeId] = useState<number>(0);
  const [selectedSectionId, setSelectedSectionId] = useState<number>(0);
  const [selectedGradeSubjectId, setSelectedGradeSubjectId] = useState<number>(0);

  const [gradeSubjectQuery, setGradeSubjectQuery] = useState("");
  const [gradeSubjectResults, setGradeSubjectResults] = useState<SearchOption[]>([]);
  const [selectedGradeSubjectOption, setSelectedGradeSubjectOption] =
    useState<SearchOption | null>(null);

  const [assessmentType, setAssessmentType] = useState<AssessmentType>("quiz");
  const [title, setTitle] = useState("");
  const [maxScore, setMaxScore] = useState<number>(100);
  const [assessmentDate, setAssessmentDate] = useState<string>(getToday);
  const [defaultFeedback, setDefaultFeedback] = useState("");
  const [studentScores, setStudentScores] = useState<StudentScoreMap>({});

  const { data: gradesData, isLoading: isGradesLoading } = useGrades({
    page: 1,
    limit: 100,
  });
  const { data: sectionsData, isLoading: isSectionsLoading } =
    useSectionsByGrade(selectedGradeId);
  const { data: studentsData, isLoading: isStudentsLoading } =
    useStudentsBySection(selectedSectionId);
  const { data: gradeSubjectsData, isLoading: isGradeSubjectsLoading } =
    useGradeSubjects();

  const bulkCreateAssessments = useBulkCreateAssessments();

  const grades = useMemo(
    () => ((gradesData?.data as Grade[] | undefined) ?? []),
    [gradesData]
  );
  const sections = useMemo(
    () => ((sectionsData as Section[] | undefined) ?? []),
    [sectionsData]
  );
  const students = useMemo(
    () => ((studentsData as Student[] | undefined) ?? []),
    [studentsData]
  );
  const gradeSubjects = useMemo(
    () => ((gradeSubjectsData as GradeSubject[] | undefined) ?? []),
    [gradeSubjectsData]
  );

  const filteredGradeSubjects = useMemo(() => {
    if (!selectedGradeId) return [];
    return gradeSubjects.filter(
      (gradeSubject) => gradeSubject.gradeId === selectedGradeId
    );
  }, [gradeSubjects, selectedGradeId]);

  const gradeSubjectOptions = useMemo<SearchOption[]>(
    () =>
      filteredGradeSubjects.map((item) => ({
        id: item.id,
        name: `${item.grade?.name || `Grade #${item.gradeId}`} - ${item.subject?.name || `Subject #${item.subjectId}`}`,
      })),
    [filteredGradeSubjects]
  );

  useEffect(() => {
    if (!selectedSectionId) {
      setGradeSubjectResults([]);
      return;
    }

    const query = gradeSubjectQuery.trim().toLowerCase();
    if (!query) {
      setGradeSubjectResults([]);
      return;
    }

    setGradeSubjectResults(
      gradeSubjectOptions.filter((option) =>
        option.name.toLowerCase().includes(query)
      )
    );
  }, [gradeSubjectOptions, gradeSubjectQuery, selectedSectionId]);

  useEffect(() => {
    if (!selectedSectionId) {
      setStudentScores({});
      return;
    }

    setStudentScores((previousMap) => {
      const nextMap: StudentScoreMap = {};

      students.forEach((student) => {
        const previous = previousMap[student.id];
        nextMap[student.id] = {
          studentId: student.id,
          score: previous?.score,
          feedback: previous?.feedback,
        };
      });

      return nextMap;
    });
  }, [selectedSectionId, students]);

  const updateStudentScore = (
    studentId: number,
    patch: Partial<{ score?: number; feedback?: string }>
  ) => {
    setStudentScores((previousMap) => {
      const existing = previousMap[studentId] ?? { studentId };
      return {
        ...previousMap,
        [studentId]: {
          ...existing,
          ...patch,
        },
      };
    });
  };

  const applyScoreToAll = (score: number) => {
    setStudentScores((previousMap) => {
      const nextMap: StudentScoreMap = {};
      students.forEach((student) => {
        const existing = previousMap[student.id];
        nextMap[student.id] = {
          studentId: student.id,
          score,
          feedback: existing?.feedback,
        };
      });
      return nextMap;
    });
  };

  const handleSubmitBulkAssessments = () => {
    if (!canBulkCreate) return;

    if (!selectedGradeId) {
      toast.error(text("يرجى اختيار الصف أولاً", "Please choose grade first"));
      return;
    }

    if (!selectedSectionId) {
      toast.error(text("يرجى اختيار الشعبة أولاً", "Please choose a section first"));
      return;
    }

    if (!selectedGradeSubjectId) {
      toast.error(text("يرجى اختيار مادة الصف", "Please choose grade subject"));
      return;
    }

    if (!title.trim()) {
      toast.error(text("يرجى إدخال عنوان التقييم", "Please enter assessment title"));
      return;
    }

    if (!maxScore || maxScore <= 0) {
      toast.error(text("يجب أن تكون الدرجة العظمى أكبر من صفر", "Max score must be greater than zero"));
      return;
    }

    if (students.length === 0) {
      toast.error(text("لا يوجد طلاب في الشعبة المحددة", "No students found for selected section"));
      return;
    }

    const missingScores = students.filter((student) => {
      const score = studentScores[student.id]?.score;
      return score === undefined || Number.isNaN(score);
    });

    if (missingScores.length > 0) {
      toast.error(
        text(
          `يرجى إدخال الدرجة لجميع الطلاب (المتبقي ${missingScores.length})`,
          `Please enter score for all students (${missingScores.length} missing)`
        )
      );
      return;
    }

    const studentsPayload = students.map((student) => {
      const row = studentScores[student.id];
      const feedback = row?.feedback?.trim() || defaultFeedback.trim() || undefined;
      return {
        studentId: student.id,
        score: row?.score,
        feedback,
      };
    });

    bulkCreateAssessments.mutate(
      {
        gradeSubjectId: selectedGradeSubjectId,
        type: assessmentType,
        title: title.trim(),
        maxScore,
        assessmentDate,
        students: studentsPayload,
      },
      {
        onSuccess: () => {
          setStudentScores((previousMap) => {
            const nextMap: StudentScoreMap = {};
            students.forEach((student) => {
              nextMap[student.id] = {
                studentId: student.id,
                score: previousMap[student.id]?.score,
                feedback: "",
              };
            });
            return nextMap;
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{text("إدارة التقييمات", "Assessment Management")}</h1>

      {canBulkCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {text("إدخال درجات التقييم دفعة واحدة", "Bulk Assessment Scores")}
            </CardTitle>
            <CardDescription>
              {text(
                "اختر الشعبة ثم مادة الصف ثم أدخل درجات الطلاب وأرسل مرة واحدة.",
                "Select section, choose grade subject, then enter each student score and submit once."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>{text("الصف", "Grade")} *</Label>
                <Select
                  value={selectedGradeId ? String(selectedGradeId) : undefined}
                  onValueChange={(value) => {
                    setSelectedGradeId(Number(value));
                    setSelectedSectionId(0);
                    setSelectedGradeSubjectId(0);
                    setSelectedGradeSubjectOption(null);
                    setGradeSubjectQuery("");
                    setGradeSubjectResults([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isGradesLoading
                          ? text("جاري تحميل الصفوف...", "Loading grades...")
                          : text("اختر الصف", "Select grade")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade.id} value={String(grade.id)}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {selectedGradeId ? (
                  <>
                    <Label>{text("الشعبة", "Section")} *</Label>
                    <Select
                      value={selectedSectionId ? String(selectedSectionId) : undefined}
                      onValueChange={(value) => {
                        setSelectedSectionId(Number(value));
                        setSelectedGradeSubjectId(0);
                        setSelectedGradeSubjectOption(null);
                        setGradeSubjectQuery("");
                        setGradeSubjectResults([]);
                      }}
                      disabled={isSectionsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isSectionsLoading
                              ? text("جاري تحميل الشعب...", "Loading sections...")
                              : text("اختر الشعبة", "Select section")
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem key={section.id} value={String(section.id)}>
                            {section.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isSectionsLoading && (
                      <p className="text-xs text-muted-foreground">
                        {text("جاري تحميل الشعب...", "Loading sections...")}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <Label>{text("الشعبة", "Section")} *</Label>
                    <Input disabled value={text("اختر الصف أولاً", "Choose grade first")} />
                  </>
                )}
              </div>

              <div className="space-y-2">
                {selectedSectionId ? (
                  <>
                    <SearchSelect
                      label={text("مادة الصف", "Grade Subject")}
                      query={gradeSubjectQuery}
                      setQuery={setGradeSubjectQuery}
                      results={gradeSubjectResults}
                      setResults={setGradeSubjectResults}
                      selected={selectedGradeSubjectOption}
                      setSelected={setSelectedGradeSubjectOption}
                      setValue={(id) => {
                        setSelectedGradeSubjectId(id);
                        setGradeSubjectQuery("");
                      }}
                      display={(item) => item.name}
                    />
                    {isGradeSubjectsLoading && (
                      <p className="text-xs text-muted-foreground">
                        {text("جاري تحميل مواد الصف...", "Loading grade subjects...")}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <Label>{text("مادة الصف", "Grade Subject")} *</Label>
                    <Input disabled value={text("اختر الشعبة أولاً", "Choose section first")} />
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label>{text("النوع", "Type")} *</Label>
                <Select
                  value={assessmentType}
                  onValueChange={(value) => setAssessmentType(value as AssessmentType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assessmentTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{text("العنوان", "Title")} *</Label>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={text("اختبار الفصل الأول", "First Term Exam")}
                />
              </div>

              <div className="space-y-2">
                <Label>{text("الدرجة العظمى", "Max Score")} *</Label>
                <Input
                  type="number"
                  min={1}
                  step="0.01"
                  value={maxScore}
                  onChange={(event) => {
                    const parsed = toNumber(event.target.value);
                    setMaxScore(parsed ?? 0);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>{text("التاريخ", "Date")} *</Label>
                <Input
                  type="date"
                  value={assessmentDate}
                  onChange={(event) => setAssessmentDate(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{text("ملاحظات افتراضية (اختياري)", "Default Feedback (optional)")}</Label>
              <Textarea
                rows={2}
                value={defaultFeedback}
                onChange={(event) => setDefaultFeedback(event.target.value)}
                placeholder={text("تُطبّق إذا كانت ملاحظة الطالب فارغة", "Applied if student feedback is empty")}
              />
            </div>

            {selectedSectionId > 0 && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => applyScoreToAll(maxScore)}>
                    {text("تعبئة الكل = الدرجة العظمى", "Fill All = Max Score")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyScoreToAll(0)}>
                    {text("تعبئة الكل = 0", "Fill All = 0")}
                  </Button>
                </div>

                <div className="rounded-md border">
                  <div className="max-h-[420px] overflow-auto">
                    <table className="w-full min-w-[760px] text-sm">
                      <thead className="bg-muted/40">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">{text("الطالب", "Student")}</th>
                          <th className="px-3 py-2 text-left font-medium">{text("الدرجة", "Score")}</th>
                          <th className="px-3 py-2 text-left font-medium">{text("الملاحظات", "Feedback")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isStudentsLoading ? (
                          <tr>
                            <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                              {text("جاري تحميل الطلاب...", "Loading students...")}
                            </td>
                          </tr>
                        ) : students.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                              {text("لا يوجد طلاب في الشعبة المحددة", "No students found for selected section")}
                            </td>
                          </tr>
                        ) : (
                          students.map((student) => {
                            const row = studentScores[student.id] ?? {
                              studentId: student.id,
                            };

                            return (
                              <tr key={student.id} className="border-t">
                                <td className="px-3 py-2">
                                  {student.firstName} {student.lastName}
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={maxScore || undefined}
                                    step="0.01"
                                    className="w-[160px]"
                                    value={row.score ?? ""}
                                    onChange={(event) => {
                                      const parsed = toNumber(event.target.value);
                                      updateStudentScore(student.id, { score: parsed });
                                    }}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    value={row.feedback ?? ""}
                                    onChange={(event) =>
                                      updateStudentScore(student.id, {
                                        feedback: event.target.value,
                                      })
                                    }
                                    placeholder={text("اختياري", "Optional")}
                                  />
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitBulkAssessments}
                    disabled={
                      bulkCreateAssessments.isPending ||
                      !selectedGradeSubjectId ||
                      students.length === 0
                    }
                  >
                    {text("إرسال الدرجات دفعة واحدة", "Submit Bulk Scores")}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <AssessmentList />
    </div>
  );
}
