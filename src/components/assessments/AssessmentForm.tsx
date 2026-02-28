import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useCreateAssessment,
  useUpdateAssessment,
} from "@/hooks/api/useAssessments";
import { useStudents } from "@/hooks/api/useStudents";
import { useGradeSubjects } from "@/hooks/api/useGradeSubjects";
import { Assessment } from "@/types/assessment.types";
import { GradeSubject } from "@/types/grade-subject.types";
import { Loader2 } from "lucide-react";

type AssessmentWithRelations = Assessment & {
  student?: { id?: number; firstName?: string; lastName?: string };
  gradeSubject?: {
    id?: number;
    grade?: { name?: string };
    subject?: { name?: string };
  };
};

type GradeSubjectWithRelations = GradeSubject & {
  grade?: { name?: string };
  subject?: { name?: string };
};

const assessmentFormSchema = z.object({
  studentId: z.number().int().min(1, "Student is required"),
  gradeSubjectId: z.number().int().min(1, "Grade subject is required"),
  type: z.enum(["quiz", "exam", "homework", "midterm", "final"]),
  title: z.string().min(1, "Title is required"),
  maxScore: z.number().positive("Max score must be greater than 0"),
  score: z.number().nonnegative().optional(),
  feedback: z.string().optional().or(z.literal("")),
  assessmentDate: z.string().min(1, "Date is required"),
});

type AssessmentFormData = z.infer<typeof assessmentFormSchema>;

interface AssessmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment?: AssessmentWithRelations | null;
}

const defaultValues: AssessmentFormData = {
  studentId: 0,
  gradeSubjectId: 0,
  type: "quiz",
  title: "",
  maxScore: 100,
  score: undefined,
  feedback: "",
  assessmentDate: new Date().toISOString().split("T")[0],
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number")
    return Number.isFinite(value) ? value : undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toDateInputValue = (dateValue?: string) => {
  if (!dateValue) return new Date().toISOString().split("T")[0];
  return dateValue.includes("T") ? dateValue.split("T")[0] : dateValue;
};

export function AssessmentForm({
  open,
  onOpenChange,
  assessment,
}: AssessmentFormProps) {
  const createAssessment = useCreateAssessment();
  const updateAssessment = useUpdateAssessment();
  const isEditing = !!assessment;

  const { data: studentsData, isLoading: isStudentsLoading } = useStudents({
    page: 1,
    limit: 100,
  });
  const { data: gradeSubjectsData, isLoading: isGradeSubjectsLoading } =
    useGradeSubjects();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    if (assessment) {
      reset({
        studentId: assessment.studentId,
        gradeSubjectId: assessment.gradeSubjectId,
        type: assessment.type,
        title: assessment.title,
        maxScore: toNumber(assessment.maxScore) ?? 100,
        score: toNumber(assessment.score),
        feedback: assessment.feedback || "",
        assessmentDate: toDateInputValue(assessment.assessmentDate),
      });
      return;
    }

    reset(defaultValues);
  }, [assessment, open, reset]);

  const onSubmit = (data: AssessmentFormData) => {
    const payload = {
      studentId: data.studentId,
      gradeSubjectId: data.gradeSubjectId,
      type: data.type,
      title: data.title,
      maxScore: data.maxScore,
      score: data.score,
      feedback: data.feedback || undefined,
      assessmentDate: data.assessmentDate,
    };

    const onSuccess = () => {
      reset(defaultValues);
      onOpenChange(false);
    };

    if (isEditing && assessment) {
      updateAssessment.mutate(
        { id: assessment.id, data: payload },
        { onSuccess },
      );
      return;
    }

    createAssessment.mutate(payload, { onSuccess });
  };

  const students = studentsData?.data || [];
  const gradeSubjects = (gradeSubjectsData || []) as GradeSubjectWithRelations[];
  const isPending = createAssessment.isPending || updateAssessment.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Assessment" : "Add Assessment"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Student *</Label>
              <Select
                value={
                  watch("studentId") ? String(watch("studentId")) : undefined
                }
                onValueChange={(val) =>
                  setValue("studentId", Number(val), { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isStudentsLoading
                        ? "Loading students..."
                        : "Select student"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.studentId && (
                <p className="text-sm text-destructive">
                  {errors.studentId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Grade Subject *</Label>
              <Select
                value={
                  watch("gradeSubjectId")
                    ? String(watch("gradeSubjectId"))
                    : undefined
                }
                onValueChange={(val) =>
                  setValue("gradeSubjectId", Number(val), {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isGradeSubjectsLoading
                        ? "Loading grade subjects..."
                        : "Select grade subject"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {gradeSubjects.map((item) => {
                    const gradeName =
                      item.grade?.name || `Grade #${item.gradeId}`;
                    const subjectName =
                      item.subject?.name || `Subject #${item.subjectId}`;
                    return (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {gradeName} - {subjectName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.gradeSubjectId && (
                <p className="text-sm text-destructive">
                  {errors.gradeSubjectId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={watch("type")}
                onValueChange={(val) =>
                  setValue("type", val as AssessmentFormData["type"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="homework">Homework</SelectItem>
                  <SelectItem value="midterm">Midterm</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" {...register("assessmentDate")} />
              {errors.assessmentDate && (
                <p className="text-sm text-destructive">
                  {errors.assessmentDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title *</Label>
            <Input {...register("title")} placeholder="First Term Exam" />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Max Score *</Label>
              <Input
                type="number"
                min={1}
                step="0.01"
                {...register("maxScore", {
                  setValueAs: (value) => Number(value),
                })}
              />
              {errors.maxScore && (
                <p className="text-sm text-destructive">
                  {errors.maxScore.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Score</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                {...register("score", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value),
                })}
              />
              {errors.score && (
                <p className="text-sm text-destructive">
                  {errors.score.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Feedback</Label>
            <Textarea {...register("feedback")} rows={3} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
