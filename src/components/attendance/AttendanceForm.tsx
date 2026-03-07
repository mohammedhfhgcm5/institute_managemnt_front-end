import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchSelect } from "@/components/ui/searchselect";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateAttendance,
  useUpdateAttendance,
} from "@/hooks/api/useAttendance";
import { useStudent, useStudents } from "@/hooks/api/useStudents";
import { useLocale } from "@/hooks/useLocale";
import { Attendance } from "@/types/attendance.types";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const attendanceFormSchema = z.object({
  studentId: z.number().int().min(1, "Student is required"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["present", "absent", "late", "excused"]),
  lateMinutes: z.number().min(0, "Late minutes must be zero or higher").optional(),
  notes: z.string().optional(),
});

type AttendanceFormData = z.infer<typeof attendanceFormSchema>;

interface AttendanceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance?: Attendance | null;
}

const getDefaultValues = (): AttendanceFormData => ({
  studentId: 0,
  date: new Date().toISOString().split("T")[0],
  status: "present",
  lateMinutes: undefined,
  notes: "",
});

const toDateInputValue = (dateValue?: string) => {
  if (!dateValue) return new Date().toISOString().split("T")[0];
  return dateValue.includes("T") ? dateValue.split("T")[0] : dateValue;
};

export function AttendanceForm({
  open,
  onOpenChange,
  attendance,
}: AttendanceFormProps) {
  const { text } = useLocale();
  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const isEditing = !!attendance;
  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const { data: studentsData } = useStudents({
    page: 1,
    limit: 100,
    search: studentQuery,
  });
  const editingStudentId = attendance?.studentId ?? 0;
  const { data: editingStudent } = useStudent(editingStudentId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    if (studentsData?.data && studentQuery.trim().length > 0) {
      setStudentResults(studentsData.data);
      return;
    }

    setStudentResults([]);
  }, [studentsData, studentQuery]);

  useEffect(() => {
    if (!open) return;

    if (attendance) {
      const studentName = attendance.student
        ? `${attendance.student.firstName} ${attendance.student.lastName}`.trim()
        : "";
      reset({
        studentId: attendance.studentId,
        date: toDateInputValue(attendance.date),
        status: attendance.status,
        lateMinutes: attendance.lateMinutes,
        notes: attendance.notes || "",
      });
      if (studentName) {
        setSelectedStudent({ id: attendance.studentId, name: studentName });
        setStudentQuery(studentName);
      } else {
        setSelectedStudent({
          id: attendance.studentId,
          name: `Student #${attendance.studentId}`,
        });
        setStudentQuery("");
      }
      setStudentResults([]);
      return;
    }

    reset(getDefaultValues());
    setSelectedStudent(null);
    setStudentQuery("");
    setStudentResults([]);
  }, [attendance, open, reset]);

  useEffect(() => {
    if (!attendance || !editingStudent) return;

    const name = `${editingStudent.firstName} ${editingStudent.lastName}`.trim();
    if (!name) return;

    setSelectedStudent({ id: editingStudent.id, name });
    if (!studentQuery.trim()) {
      setStudentQuery(name);
    }
  }, [attendance, editingStudent, studentQuery]);

  const onSubmit = (data: AttendanceFormData) => {
    const payload = {
      studentId: data.studentId,
      date: data.date,
      status: data.status,
      lateMinutes:
        data.status === "late" && typeof data.lateMinutes === "number"
          ? data.lateMinutes
          : undefined,
      notes: data.notes?.trim() ? data.notes.trim() : undefined,
    };

    const onSuccess = () => {
      reset(getDefaultValues());
      onOpenChange(false);
    };

    if (isEditing && attendance) {
      updateAttendance.mutate({ id: attendance.id, data: payload }, { onSuccess });
      return;
    }

    createAttendance.mutate(payload, { onSuccess });
  };

  const selectedStatus = watch("status");
  const isPending = createAttendance.isPending || updateAttendance.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? text("Edit Attendance", "Edit Attendance")
              : text("Record Attendance", "Record Attendance")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <SearchSelect
              label={text("Student", "Student")}
              query={studentQuery}
              setQuery={setStudentQuery}
              results={studentResults}
              setResults={setStudentResults}
              selected={selectedStudent}
              setSelected={setSelectedStudent}
              setValue={(id) =>
                setValue("studentId", id, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              display={(student) =>
                `${student.firstName || ""} ${student.lastName || ""}`.trim()
              }
            />
            {errors.studentId && (
              <p className="text-sm text-destructive">{errors.studentId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{text("Date", "Date")} *</Label>
            <Input type="date" {...register("date")} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>{text("Status", "Status")} *</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => {
                const nextStatus = value as AttendanceFormData["status"];
                setValue("status", nextStatus, { shouldValidate: true });
                if (nextStatus !== "late") {
                  setValue("lateMinutes", undefined, { shouldValidate: true });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">{text("Present", "Present")}</SelectItem>
                <SelectItem value="absent">{text("Absent", "Absent")}</SelectItem>
                <SelectItem value="late">{text("Late", "Late")}</SelectItem>
                <SelectItem value="excused">{text("Excused", "Excused")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{text("Late Minutes", "Late Minutes")}</Label>
            <Input
              type="number"
              min={0}
              disabled={selectedStatus !== "late"}
              {...register("lateMinutes", {
                setValueAs: (value) => (value === "" ? undefined : Number(value)),
              })}
            />
            {errors.lateMinutes && (
              <p className="text-sm text-destructive">{errors.lateMinutes.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{text("Notes", "Notes")}</Label>
            <Textarea {...register("notes")} rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {text("Cancel", "Cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEditing ? text("Update", "Update") : text("Save", "Save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
