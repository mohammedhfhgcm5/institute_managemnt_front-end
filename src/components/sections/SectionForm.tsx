import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useCreateSection, useUpdateSection } from "@/hooks/api/useSections";
import { useGrades } from "@/hooks/api/useGrades";
import { Section } from "@/types/section.types";
import { Loader2 } from "lucide-react";

const sectionFormSchema = z.object({
  gradeId: z.number().int().min(1, "Grade is required"),
  name: z.string().min(1, "Section name is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  maxStudents: z.number().int().positive().optional(),
  status: z.enum(["active", "inactive"]),
});

type SectionFormData = z.infer<typeof sectionFormSchema>;

interface SectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section?: Section | null;
}

const defaultValues: SectionFormData = {
  gradeId: 0,
  name: "",
  academicYear: "",
  maxStudents: undefined,
  status: "active",
};

export function SectionForm({ open, onOpenChange, section }: SectionFormProps) {
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const { data: gradesData, isLoading: isGradesLoading } = useGrades({
    page: 1,
    limit: 100,
  });
  const isEditing = !!section;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SectionFormData>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    if (section) {
      reset({
        gradeId: section.gradeId,
        name: section.name,
        academicYear: section.academicYear,
        maxStudents: section.maxStudents,
        status: section.status,
      });
      return;
    }

    reset(defaultValues);
  }, [open, reset, section]);

  const onSubmit = (data: SectionFormData) => {
    const payload = {
      gradeId: data.gradeId,
      name: data.name,
      academicYear: data.academicYear,
      maxStudents: data.maxStudents,
      status: data.status,
    };

    const onSuccess = () => {
      reset(defaultValues);
      onOpenChange(false);
    };

    if (isEditing && section) {
      updateSection.mutate({ id: section.id, data: payload }, { onSuccess });
      return;
    }

    createSection.mutate(payload, { onSuccess });
  };

  const isPending = createSection.isPending || updateSection.isPending;
  const grades = gradesData?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Section" : "Add Section"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Grade *</Label>
            <Select
              value={watch("gradeId") ? String(watch("gradeId")) : undefined}
              onValueChange={(val) =>
                setValue("gradeId", Number(val), { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isGradesLoading ? "Loading grades..." : "Select grade"
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
            {errors.gradeId && (
              <p className="text-sm text-destructive">
                {errors.gradeId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Section Name *</Label>
            <Input {...register("name")} placeholder="A" />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Academic Year *</Label>
            <Input {...register("academicYear")} placeholder="2025-2026" />
            {errors.academicYear && (
              <p className="text-sm text-destructive">
                {errors.academicYear.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Max Students</Label>
            <Input
              type="number"
              min={1}
              {...register("maxStudents", {
                setValueAs: (value) =>
                  value === "" ? undefined : Number(value),
              })}
            />
            {errors.maxStudents && (
              <p className="text-sm text-destructive">
                {errors.maxStudents.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status *</Label>
            <Select
              value={watch("status")}
              onValueChange={(val) =>
                setValue("status", val as SectionFormData["status"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">
                {errors.status.message}
              </p>
            )}
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
