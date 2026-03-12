import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema } from "@/utils/validators";
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
import { SearchSelect } from "@/components/ui/searchselect";
import { useCreatePayment, useUpdatePayment } from "@/hooks/api/usePayments";
import { useStudent, useStudents } from "@/hooks/api/useStudents";
import { useSection } from "@/hooks/api/useSections";
import { useTuitionFees } from "@/hooks/api/useTuitionFees";
import { useLocale } from "@/hooks/useLocale";
import { Payment } from "@/types/payment.types";
import { Loader2 } from "lucide-react";
import { z } from "zod";

type PaymentFormData = z.infer<typeof paymentSchema>;

type PaymentWithStudent = Payment & {
  student?: { id?: number; firstName?: string; lastName?: string };
};

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: PaymentWithStudent | null;
}

export function PaymentForm({ open, onOpenChange, payment }: PaymentFormProps) {
  const { text } = useLocale();
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const isEditing = !!payment;

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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const editingStudentId = payment?.studentId ?? 0;
  const selectedStudentId = watch("studentId") || 0;
  const academicYearValue = watch("academicYear") || "";
  const { data: editingStudent } = useStudent(editingStudentId);
  const { data: selectedStudentData } = useStudent(selectedStudentId);
  const { data: selectedSection } = useSection(selectedStudentData?.sectionId ?? 0);
  const { data: tuitionFees } = useTuitionFees();

  const fallbackGradeId =
    (selectedStudentData as { section?: { gradeId?: number } })?.section?.gradeId ??
    0;
  const gradeId = selectedSection?.gradeId ?? fallbackGradeId;

  const academicYearOptions = useMemo(() => {
    if (!gradeId) return [];

    return Array.from(
      new Set(
        (tuitionFees || [])
          .filter((fee) => fee.gradeId === gradeId)
          .map((fee) => fee.academicYear)
      )
    )
      .filter((year) => year)
      .sort()
      .reverse();
  }, [tuitionFees, gradeId]);

  useEffect(() => {
    if (studentsData?.data && studentQuery.trim().length > 0) {
      setStudentResults(studentsData.data);
    } else {
      setStudentResults([]);
    }
  }, [studentsData, studentQuery]);

  useEffect(() => {
    if (payment) {
      reset({
        studentId: payment.studentId,
        academicYear: payment.academicYear,
        amount: payment.amount,
        discount: payment.discount,
        status: payment.status,
        dueDate: payment.dueDate,
        paymentDate: payment.paymentDate || "",
        notes: payment.notes || "",
      });

      if (payment.student?.firstName || payment.student?.lastName) {
        const name = `${payment.student?.firstName || ""} ${payment.student?.lastName || ""}`.trim();
        setSelectedStudent({ id: payment.studentId, name });
        setStudentQuery(name);
      } else {
        setSelectedStudent({ id: payment.studentId, name: `Student #${payment.studentId}` });
        setStudentQuery("");
      }
    } else {
      reset({
        studentId: 0,
        academicYear: "",
        amount: 0,
        discount: 0,
        status: "pending",
        dueDate: "",
        paymentDate: "",
        notes: "",
      });
      setSelectedStudent(null);
      setStudentQuery("");
      setStudentResults([]);
    }
  }, [payment, reset]);

  useEffect(() => {
    if (!payment || !editingStudent) return;
    const name = `${editingStudent.firstName} ${editingStudent.lastName}`.trim();
    if (!name) return;
    setSelectedStudent({ id: editingStudent.id, name });
    if (!studentQuery.trim()) {
      setStudentQuery(name);
    }
  }, [payment, editingStudent, studentQuery]);

  useEffect(() => {
    if (isEditing) return;
    if (!selectedStudentId) return;

    if (academicYearOptions.length === 0) {
      if (academicYearValue) {
        setValue("academicYear", "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      return;
    }

    if (
      !academicYearValue ||
      !academicYearOptions.includes(academicYearValue)
    ) {
      const preferred =
        selectedStudentData?.academicYear &&
        academicYearOptions.includes(selectedStudentData.academicYear)
          ? selectedStudentData.academicYear
          : academicYearOptions[0];

      if (preferred) {
        setValue("academicYear", preferred, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }, [
    isEditing,
    selectedStudentId,
    selectedStudentData?.academicYear,
    academicYearOptions,
    academicYearValue,
    setValue,
  ]);

  const onSubmit = (data: PaymentFormData) => {
    if (isEditing && payment) {
      updatePayment.mutate(
        { id: payment.id, data },
        { onSuccess: () => onOpenChange(false) }
      );
      return;
    }

    createPayment.mutate(data, { onSuccess: () => onOpenChange(false) });
  };

  const isPending = createPayment.isPending || updatePayment.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? text("تعديل الدفعة", "Edit Payment") : text("إضافة دفعة", "Add Payment")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <SearchSelect
                label={text("الطالب", "Student")}
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
                display={(student) => `${student.firstName} ${student.lastName}`.trim()}
              />
              {errors.studentId && (
                <p className="text-sm text-destructive">{errors.studentId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{text("السنة الدراسية", "Academic Year")} *</Label>
              <Select
                value={academicYearValue || undefined}
                onValueChange={(val) => setValue("academicYear", val)}
                disabled={!selectedStudentId || academicYearOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedStudentId
                        ? text("اختر السنة الدراسية", "Select academic year")
                        : text("اختر الطالب أولاً", "Select student first")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {academicYearOptions.length === 0 ? (
                    <SelectItem value="none" disabled>
                      {text("لا توجد سنوات للقسط", "No tuition years available")}
                    </SelectItem>
                  ) : (
                    academicYearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.academicYear && (
                <p className="text-sm text-destructive">{errors.academicYear.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{text("المبلغ", "Amount")} *</Label>
              <Input type="number" {...register("amount", { valueAsNumber: true })} />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{text("الخصم", "Discount")}</Label>
              <Input type="number" {...register("discount", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{text("الحالة", "Status")}</Label>
            <Select
              value={watch("status")}
              onValueChange={(val) => setValue("status", val as PaymentFormData["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{text("معلق", "Pending")}</SelectItem>
                <SelectItem value="paid">{text("مدفوع", "Paid")}</SelectItem>
                <SelectItem value="partial">{text("جزئي", "Partial")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{text("تاريخ الاستحقاق", "Due Date")} *</Label>
              <Input type="date" {...register("dueDate")} />
              {errors.dueDate && (
                <p className="text-sm text-destructive">{errors.dueDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{text("تاريخ الدفع", "Payment Date")}</Label>
              <Input type="date" {...register("paymentDate")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{text("الملاحظات", "Notes")}</Label>
            <Textarea {...register("notes")} rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {text("إلغاء", "Cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEditing ? text("تحديث", "Update") : text("إنشاء", "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
