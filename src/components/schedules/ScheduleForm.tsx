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
import {
  useCreateSchedule,
  useUpdateSchedule,
} from "@/hooks/api/useSchedules";
import { useSections } from "@/hooks/api/useSections";
import { useGradeSubjects } from "@/hooks/api/useGradeSubjects";
import { Schedule } from "@/types/schedule.types";
import { GradeSubject } from "@/types/grade-subject.types";
import { Loader2 } from "lucide-react";

const dayOfWeekOptions = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const statusOptions = ["scheduled", "cancelled", "completed"] as const;

const scheduleFormSchema = z
  .object({
    sectionId: z.number().int().min(1, "Section is required"),
    gradeSubjectId: z.number().int().min(1, "Grade subject is required"),
    dayOfWeek: z.enum(dayOfWeekOptions),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    room: z.string().optional().or(z.literal("")),
    status: z.enum(statusOptions),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

type SectionOption = {
  id: number;
  name: string;
};

type GradeSubjectWithRelations = GradeSubject & {
  grade?: { name?: string };
  subject?: { name?: string };
};

interface ScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: Schedule | null;
}

const defaultValues: ScheduleFormData = {
  sectionId: 0,
  gradeSubjectId: 0,
  dayOfWeek: "Sunday",
  startTime: "08:00",
  endTime: "09:00",
  room: "",
  status: "scheduled",
};

const toTimeInputValue = (timeValue?: string) => {
  if (!timeValue) return "";

  const directMatch = timeValue.match(/\d{2}:\d{2}/);
  if (directMatch) return directMatch[0];

  const parsed = new Date(timeValue);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toTimeString().slice(0, 5);
  }

  return timeValue;
};

export function ScheduleForm({
  open,
  onOpenChange,
  schedule,
}: ScheduleFormProps) {
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const isEditing = !!schedule;

  const { data: sectionsData, isLoading: isSectionsLoading } = useSections({
    page: 1,
    limit: 100,
  });
  const { data: gradeSubjectsData, isLoading: isGradeSubjectsLoading } =
    useGradeSubjects();

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    if (schedule) {
      reset({
        sectionId: schedule.sectionId,
        gradeSubjectId: schedule.gradeSubjectId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: toTimeInputValue(schedule.startTime),
        endTime: toTimeInputValue(schedule.endTime),
        room: schedule.room || "",
        status: schedule.status,
      });
      return;
    }

    reset(defaultValues);
  }, [open, reset, schedule]);

  const onSubmit = (data: ScheduleFormData) => {
    const payload = {
      sectionId: data.sectionId,
      gradeSubjectId: data.gradeSubjectId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room || undefined,
      status: data.status,
    };

    const onSuccess = () => {
      reset(defaultValues);
      onOpenChange(false);
    };

    if (isEditing && schedule) {
      updateSchedule.mutate({ id: schedule.id, data: payload }, { onSuccess });
      return;
    }

    createSchedule.mutate(payload, { onSuccess });
  };

  const sections = (sectionsData?.data || []) as SectionOption[];
  const gradeSubjects = (gradeSubjectsData || []) as GradeSubjectWithRelations[];
  const isPending = createSchedule.isPending || updateSchedule.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Schedule" : "Add Schedule"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Section *</Label>
              <Select
                value={
                  watch("sectionId") ? String(watch("sectionId")) : undefined
                }
                onValueChange={(val) =>
                  setValue("sectionId", Number(val), { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isSectionsLoading ? "Loading sections..." : "Select section"
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
              {errors.sectionId && (
                <p className="text-sm text-destructive">{errors.sectionId.message}</p>
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
                    const gradeName = item.grade?.name || `Grade #${item.gradeId}`;
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
              <Label>Day *</Label>
              <Select
                value={watch("dayOfWeek")}
                onValueChange={(val) =>
                  setValue("dayOfWeek", val as ScheduleFormData["dayOfWeek"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dayOfWeekOptions.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dayOfWeek && (
                <p className="text-sm text-destructive">{errors.dayOfWeek.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={watch("status")}
                onValueChange={(val) =>
                  setValue("status", val as ScheduleFormData["status"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Input
                type="time"
                value={watch("startTime")}
                onChange={(event) =>
                  setValue("startTime", event.target.value, {
                    shouldValidate: true,
                  })
                }
              />
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>End Time *</Label>
              <Input
                type="time"
                value={watch("endTime")}
                onChange={(event) =>
                  setValue("endTime", event.target.value, {
                    shouldValidate: true,
                  })
                }
              />
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Room</Label>
            <Input
              value={watch("room") || ""}
              onChange={(event) =>
                setValue("room", event.target.value, { shouldValidate: true })
              }
              placeholder="Room 101"
            />
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
