import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentSchema } from "@/utils/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { SearchSelect } from "@/components/ui/searchselect";
import { useCreateStudent, useUpdateStudent } from "@/hooks/api/useStudents";
import { useParents } from "@/hooks/api/useParents";
import { useSections, useSectionsByGrade } from "@/hooks/api/useSections";
import { useGrades } from "@/hooks/api/useGrades";
import { Student } from "@/types/student.types";
import { Loader2 } from "lucide-react";
import { z } from "zod";

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
}

export function StudentForm({ open, onOpenChange, student }: StudentFormProps) {
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const isEditing = !!student;

  const [selectedGradeId, setSelectedGradeId] = useState<number>(0);

  const { data: gradesData } = useGrades({ page: 1, limit: 100 });
  const { data: allSectionsData } = useSections({ page: 1, limit: 200 });
  const { data: sectionsByGradeData } = useSectionsByGrade(selectedGradeId);

  // Parent SearchSelect state
  const [parentQuery, setParentQuery] = useState("");
  const [parentResults, setParentResults] = useState<any[]>([]);
  const [selectedParent, setSelectedParent] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const { data: parentsData } = useParents({
    limit: 100,
    search: parentQuery,
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      gender: "male",
      status: "active",
      parentId: undefined,
      sectionId: undefined,
      academicYear: "",
      address: "",
    },
  });

  useEffect(() => {
    if (parentsData?.data && parentQuery.length > 0) {
      setParentResults(parentsData.data);
    } else {
      setParentResults([]);
    }
  }, [parentsData, parentQuery]);

  useEffect(() => {
    if (student) {
      reset({
        firstName: student.firstName,
        lastName: student.lastName,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        parentId: student.parentId,
        sectionId: student.sectionId,
        academicYear: student.academicYear || "",
        address: student.address || "",
        status: student.status,
      });

      if (student.parentId && student.parent) {
        const parentName = `${student.parent.firstName} ${student.parent.lastName}`;
        setSelectedParent({ id: student.parentId, name: parentName });
        setParentQuery(parentName);
      } else {
        setSelectedParent(null);
        setParentQuery("");
      }
    } else {
      reset({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "male",
        parentId: undefined,
        sectionId: undefined,
        academicYear: "",
        address: "",
        status: "active",
      });
      setSelectedParent(null);
      setParentQuery("");
      setSelectedGradeId(0);
    }
  }, [student, reset]);

  useEffect(() => {
    if (!student?.sectionId) return;
    const allSections = allSectionsData?.data || [];
    const matchedSection = allSections.find((item) => item.id === student.sectionId);
    if (matchedSection) {
      setSelectedGradeId(matchedSection.gradeId);
    }
  }, [allSectionsData, student?.sectionId]);

  useEffect(() => {
    if (!selectedGradeId) {
      setValue("academicYear", "");
      return;
    }

    const selectedGrade = (gradesData?.data || []).find(
      (grade) => grade.id === selectedGradeId
    );
    if (selectedGrade) {
      setValue("academicYear", selectedGrade.name);
    }
  }, [gradesData, selectedGradeId, setValue]);

  const onSubmit = (data: StudentFormData) => {
    const selectedGrade = (gradesData?.data || []).find(
      (grade) => grade.id === selectedGradeId
    );

    const payload: StudentFormData = {
      ...data,
      academicYear: selectedGrade?.name || data.academicYear || "",
    };

    if (isEditing && student) {
      updateStudent.mutate(
        { id: student.id, data: payload },
        { onSuccess: () => onOpenChange(false) }
      );
      return;
    }

    createStudent.mutate(payload, { onSuccess: () => onOpenChange(false) });
  };

  const isPending = createStudent.isPending || updateStudent.isPending;
  const grades = gradesData?.data || [];
  const sections = sectionsByGradeData || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Student" : "Add Student"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input {...register("firstName")} />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input {...register("lastName")} />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Date of Birth *</Label>
              <Input type="date" {...register("dateOfBirth")} />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select
                value={watch("gender")}
                onValueChange={(val) => setValue("gender", val as "male" | "female")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-destructive">{errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <SearchSelect
                label="Parent"
                query={parentQuery}
                setQuery={setParentQuery}
                results={parentResults}
                setResults={setParentResults}
                selected={selectedParent}
                setSelected={setSelectedParent}
                setValue={(id) => setValue("parentId", id)}
                display={(parent) => `${parent.firstName} ${parent.lastName}`}
                required={false}
              />
              {errors.parentId && (
                <p className="text-sm text-destructive">{errors.parentId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Grade (الصف)</Label>
              <Select
                value={selectedGradeId ? String(selectedGradeId) : undefined}
                onValueChange={(val) => {
                  const nextGradeId = Number(val);
                  setSelectedGradeId(nextGradeId);
                  setValue("sectionId", undefined, { shouldValidate: true });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
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
              <Label>Section</Label>
              <Select
                value={watch("sectionId") ? String(watch("sectionId")) : undefined}
                onValueChange={(val) => setValue("sectionId", Number(val))}
                disabled={!selectedGradeId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={selectedGradeId ? "Select section" : "Select grade first"}
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
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={watch("status") || "active"}
                onValueChange={(val) => setValue("status", val as StudentFormData["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Address</Label>
              <Input {...register("address")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
