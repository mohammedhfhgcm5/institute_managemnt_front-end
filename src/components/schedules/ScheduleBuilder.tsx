import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Download,
  Save,
  GripVertical,
  MapPin,
  User,
  Layers,
  LucideIcon,
} from "lucide-react";
import {
  useSchedulesBySection,
  useDeleteSchedule,
  useCreateSchedule,
} from "@/hooks/api/useSchedules";
import { useGradeSubjects } from "@/hooks/api/useGradeSubjects";
import { usePermissions } from "@/hooks/usePermissions";
import { useLocale } from "@/hooks/useLocale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Schedule } from "@/types/schedule.types";
import { DayOfWeek } from "@/types/common.types";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { loadAmiriFont } from "@/fonts/amiriFont";

interface ColorScheme {
  bg: string;
  border: string;
  text: string;
}

interface Module {
  id: number;
  gradeSubjectId: number;
  name: string;
  subject: string;
  teacher: string;
  room: string;
  grade: string;
  color: ColorScheme;
}

interface SubjectCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  subjects?: string[];
}

interface ScheduleMap {
  [key: string]: Schedule & {
    module?: Module;
  };
}

interface ScheduleBuilderProps {
  sectionId: number;
  sectionName?: string;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as DayOfWeek[];

const TIME_SLOTS = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
] as const;

const COLOR_PALETTE: ColorScheme[] = [
  {
    bg: "bg-blue-100 dark:bg-blue-500/20",
    border: "border-blue-300 dark:border-blue-500/50",
    text: "text-blue-800 dark:text-blue-200",
  },
  {
    bg: "bg-emerald-100 dark:bg-emerald-500/20",
    border: "border-emerald-300 dark:border-emerald-500/50",
    text: "text-emerald-800 dark:text-emerald-200",
  },
  {
    bg: "bg-purple-100 dark:bg-purple-500/20",
    border: "border-purple-300 dark:border-purple-500/50",
    text: "text-purple-800 dark:text-purple-200",
  },
  {
    bg: "bg-orange-100 dark:bg-orange-500/20",
    border: "border-orange-300 dark:border-orange-500/50",
    text: "text-orange-800 dark:text-orange-200",
  },
  {
    bg: "bg-indigo-100 dark:bg-indigo-500/20",
    border: "border-indigo-300 dark:border-indigo-500/50",
    text: "text-indigo-800 dark:text-indigo-200",
  },
  {
    bg: "bg-cyan-100 dark:bg-cyan-500/20",
    border: "border-cyan-300 dark:border-cyan-500/50",
    text: "text-cyan-800 dark:text-cyan-200",
  },
  {
    bg: "bg-teal-100 dark:bg-teal-500/20",
    border: "border-teal-300 dark:border-teal-500/50",
    text: "text-teal-800 dark:text-teal-200",
  },
  {
    bg: "bg-green-100 dark:bg-green-500/20",
    border: "border-green-300 dark:border-green-500/50",
    text: "text-green-800 dark:text-green-200",
  },
  {
    bg: "bg-amber-100 dark:bg-amber-500/20",
    border: "border-amber-300 dark:border-amber-500/50",
    text: "text-amber-800 dark:text-amber-200",
  },
  {
    bg: "bg-rose-100 dark:bg-rose-500/20",
    border: "border-rose-300 dark:border-rose-500/50",
    text: "text-rose-800 dark:text-rose-200",
  },
  {
    bg: "bg-pink-100 dark:bg-pink-500/20",
    border: "border-pink-300 dark:border-pink-500/50",
    text: "text-pink-800 dark:text-pink-200",
  },
  {
    bg: "bg-fuchsia-100 dark:bg-fuchsia-500/20",
    border: "border-fuchsia-300 dark:border-fuchsia-500/50",
    text: "text-fuchsia-800 dark:text-fuchsia-200",
  },
  {
    bg: "bg-violet-100 dark:bg-violet-500/20",
    border: "border-violet-300 dark:border-violet-500/50",
    text: "text-violet-800 dark:text-violet-200",
  },
  {
    bg: "bg-sky-100 dark:bg-sky-500/20",
    border: "border-sky-300 dark:border-sky-500/50",
    text: "text-sky-800 dark:text-sky-200",
  },
  {
    bg: "bg-lime-100 dark:bg-lime-500/20",
    border: "border-lime-300 dark:border-lime-500/50",
    text: "text-lime-800 dark:text-lime-200",
  },
  {
    bg: "bg-red-100 dark:bg-red-500/20",
    border: "border-red-300 dark:border-red-500/50",
    text: "text-red-800 dark:text-red-200",
  },
  {
    bg: "bg-yellow-100 dark:bg-yellow-500/20",
    border: "border-yellow-300 dark:border-yellow-500/50",
    text: "text-yellow-800 dark:text-yellow-200",
  },
  {
    bg: "bg-slate-100 dark:bg-slate-500/20",
    border: "border-slate-300 dark:border-slate-500/50",
    text: "text-slate-800 dark:text-slate-200",
  },
];

const getColorById = (id: number): ColorScheme => {
  const index = id % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
};

const SUBJECT_CATEGORIES: SubjectCategory[] = [];

const containsArabic = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text);
};

const extractTimeFromISO = (isoString: string): string => {
  if (typeof isoString === "string") {
    // Always extract HH:MM with regex — never use new Date() which applies
    // a local timezone offset and shifts the time (e.g. UTC 06:00 → local 10:00 in UTC+4).
    const timeMatch = isoString.match(/(\d{2}):(\d{2})/);
    if (timeMatch) {
      return `${timeMatch[1]}:${timeMatch[2]}`;
    }
  }
  return isoString;
};

export function ScheduleBuilder({
  sectionId,
  sectionName = "Class Schedule",
}: ScheduleBuilderProps) {
  const { text } = useLocale();
  const permissions = usePermissions();
  const canCreateOrEdit = permissions.canManageAttendance;
  const canDelete = permissions.isAdmin;

  const [schedule, setSchedule] = useState<ScheduleMap>({});
  const [draggedModule, setDraggedModule] = useState<Module | null>(null);
  // Tracks which cell key ("Day-HH:MM") the user is currently dragging over
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  // Tracks the source cell key when dragging a module that's already in the table
  const [dragSourceKey, setDragSourceKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    data: schedulesData,
    isLoading,
    refetch,
  } = useSchedulesBySection(sectionId);
  const { data: gradeSubjectsData } = useGradeSubjects();
  const deleteSchedule = useDeleteSchedule();
  const createSchedule = useCreateSchedule();

  // Returns the real server ID for a cell key, or null if it's an optimistic entry
  const getServerScheduleId = (key: string): number | null => {
    const entry = schedule[key];
    if (!entry) return null;
    // Optimistic entries use Date.now() as id which is > 1e12
    if (entry.id > 1_000_000_000_000) return null;
    return entry.id;
  };

  const schedules = (schedulesData || []) as any[];
  const gradeSubjects = gradeSubjectsData || [];

  const sectionGradeSubjects = useMemo(
    () =>
      (gradeSubjects as any[]).filter(
        (gs) => typeof gs?.sectionId === "number" && gs.sectionId === sectionId,
      ),
    [gradeSubjects, sectionId],
  );

  const availableModules: Module[] = useMemo(() => {
    return sectionGradeSubjects.map((gs: any) => {
      const subjectName = gs.subject?.name || text("غير معروف", "Unknown");
      const gradeName = gs.grade?.name || "";
      const teacherFirstName = gs.teacher?.firstName || "";
      const teacherLastName = gs.teacher?.lastName || "";

      return {
        id: gs.id,
        gradeSubjectId: gs.id,
        name: `${gradeName} ${subjectName}`.trim(),
        subject: subjectName,
        teacher: `${teacherFirstName} ${teacherLastName}`.trim(),
        room: "",
        grade: gradeName,
        color: getColorById(gs.id),
      };
    });
  }, [sectionGradeSubjects]);

  useEffect(() => {
    if (!schedules.length || !sectionId) {
      setSchedule({});
      return;
    }

    const scheduleMap: ScheduleMap = {};

    schedules.forEach((sched: any) => {
      const timePart = extractTimeFromISO(sched.startTime);
      const module = availableModules.find(
        (m) => m.gradeSubjectId === sched.gradeSubjectId,
      );

      const scheduleEntry = {
        ...sched,
        module,
      };

      const primaryKey = `${sched.dayOfWeek}-${timePart}`;
      scheduleMap[primaryKey] = scheduleEntry;
    });

    setSchedule(scheduleMap);
  }, [schedules, availableModules, sectionId]);

  // ─── Drag handlers ────────────────────────────────────────────────────────

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    module: Module,
    sourceKey?: string,
  ) => {
    setDraggedModule(module);
    setDragSourceKey(sourceKey ?? null);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("moduleId", String(module.id));
  };

  /**
   * Called on the <td> element.
   * We pass day + timeSlot so we can set the exact cell key without any
   * coordinate math — no off-by-one, no shared counter.
   */
  const handleDragOver = (
    e: React.DragEvent<HTMLTableCellElement>,
    day: DayOfWeek,
    timeSlot: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const key = `${day}-${timeSlot}`;
    // Avoid unnecessary re-renders by only updating when the key changes
    setDragOverKey((prev) => (prev === key ? prev : key));
  };

  /**
   * Clear the highlight only when the pointer truly leaves the <td>.
   * relatedTarget tells us where the pointer is going; if it's still
   * inside the same <td> (e.g. entering a child element) we keep the highlight.
   */
  const handleDragLeave = (e: React.DragEvent<HTMLTableCellElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverKey(null);
    }
  };

  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    let endHours = hours + 1;
    if (endHours >= 24) endHours = 0;
    return `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const handleDrop = (
    e: React.DragEvent<HTMLTableCellElement>,
    day: DayOfWeek,
    timeSlot: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverKey(null);

    if (!draggedModule || !sectionId) return;

    const newKey = `${day}-${timeSlot}`;

    // Dropped onto the same cell — nothing to do
    if (dragSourceKey && dragSourceKey === newKey) {
      setDraggedModule(null);
      setDragSourceKey(null);
      return;
    }

    const endTime = calculateEndTime(timeSlot);
    const sourceKey = dragSourceKey;
    // Capture the real server ID of the old entry BEFORE we clear state
    const oldServerId = sourceKey ? getServerScheduleId(sourceKey) : null;

    const tempEntry: Schedule & { module?: Module } = {
      id: Date.now(),
      sectionId,
      gradeSubjectId: draggedModule.gradeSubjectId,
      dayOfWeek: day,
      startTime: timeSlot,
      endTime,
      room: draggedModule.room || "",
      status: "scheduled",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      module: draggedModule,
    };

    // Optimistic UI: place in new slot, remove from old slot immediately
    setSchedule((prev) => {
      const next = { ...prev, [newKey]: tempEntry };
      if (sourceKey) delete next[sourceKey];
      return next;
    });

    setDraggedModule(null);
    setDragSourceKey(null);

    const doCreate = () => {
      createSchedule.mutate(
        {
          sectionId,
          gradeSubjectId: draggedModule.gradeSubjectId,
          dayOfWeek: day,
          startTime: timeSlot,
          endTime,
          room: draggedModule.room || undefined,
          status: "scheduled",
        },
        {
          onSuccess: () => {
            // Refetch to get the real server ID for the new entry
            refetch();
          },
          onError: (error) => {
            console.error("Failed to create schedule:", error);
            toast.error(
              text("فشل في حفظ الجدول", "Failed to save schedule entry"),
            );
            // Roll back: remove new entry, restore old one if we have it
            setSchedule((prev) => {
              const rolled = { ...prev };
              delete rolled[newKey];
              if (sourceKey) rolled[sourceKey] = tempEntry; // best-effort restore
              return rolled;
            });
          },
        },
      );
    };

    if (oldServerId) {
      // Moving within table: delete old server record first, then create new
      deleteSchedule.mutate(oldServerId, {
        onSuccess: () => {
          doCreate();
        },
        onError: (error) => {
          console.error("Failed to delete old schedule entry:", error);
          toast.error(
            text("فشل في تحديث الجدول", "Failed to move schedule entry"),
          );
          // Roll back optimistic changes
          setSchedule((prev) => {
            const rolled = { ...prev };
            delete rolled[newKey];
            if (sourceKey) rolled[sourceKey] = tempEntry;
            return rolled;
          });
        },
      });
    } else {
      // Dragging from the sidebar (no existing server record to delete)
      doCreate();
    }
  };

  // Clear state if the drag ends without a valid drop (e.g. dropped outside)
  const handleDragEnd = () => {
    setDraggedModule(null);
    setDragOverKey(null);
    setDragSourceKey(null);
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleRemoveModule = (scheduleId: number) => {
    setDeletingId(scheduleId);
  };

  // ─── Filter ───────────────────────────────────────────────────────────────

  const filteredModules = useMemo(() => {
    return availableModules.filter((module) => {
      const matchesSearch =
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.teacher.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [searchTerm, selectedCategory, availableModules]);

  // ─── PDF Export ───────────────────────────────────────────────────────────

  const formatScheduleCellForExport = (
    item: Schedule & { module?: Module },
  ): string => {
    const moduleName = item.module?.name || `Module #${item.gradeSubjectId}`;
    const teacher = item.module?.teacher
      ? `المعلم: ${item.module.teacher}`
      : "";
    const room = item.room ? `الغرفة: ${item.room}` : "";
    const details = [teacher, room].filter(Boolean);
    return details.length > 0
      ? `${moduleName}\n${details.join(" | ")}`
      : moduleName;
  };

  const handleExportPdf = async () => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const hasArabic =
        containsArabic(sectionName) ||
        Object.values(schedule).some(
          (item) =>
            containsArabic(item.module?.name || "") ||
            containsArabic(item.module?.teacher || ""),
        );

      if (hasArabic) {
        try {
          await loadAmiriFont(doc);
        } catch (error) {
          console.error("Failed to load Arabic font:", error);
          toast.error("Failed to load Arabic font, using default font");
        }
      }

      const generatedAt = new Date().toLocaleString("ar", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const dayNames = hasArabic
        ? [
            "الأحد",
            "السبت",
            "الجمعة",
            "الخميس",
            "الأربعاء",
            "الثلاثاء",
            "الإثنين",
          ]
        : DAYS;

      const headerRow = [hasArabic ? "الوقت" : "Time", ...dayNames];
      const bodyRows = TIME_SLOTS.map((timeSlot) => {
        const row: string[] = [timeSlot];
        const daysToUse = hasArabic ? [...DAYS].reverse() : DAYS;
        daysToUse.forEach((day) => {
          const key = `${day}-${timeSlot}`;
          const scheduleItem = schedule[key];
          row.push(
            scheduleItem ? formatScheduleCellForExport(scheduleItem) : "-",
          );
        });
        return row;
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(16);
      const title = hasArabic
        ? `جدول الحصص - ${sectionName}`
        : `Schedule - ${sectionName}`;

      if (hasArabic) {
        doc.setFont("Amiri", "normal");
        const titleWidth = doc.getTextWidth(title);
        doc.text(title, pageWidth - titleWidth - 10, 12);
      } else {
        doc.setFont("helvetica", "bold");
        doc.text(title, 10, 12);
      }

      doc.setFontSize(10);
      const subtitle = hasArabic
        ? `تم الإنشاء: ${generatedAt}`
        : `Generated: ${generatedAt}`;

      if (hasArabic) {
        doc.setFont("Amiri", "normal");
        const subtitleWidth = doc.getTextWidth(subtitle);
        doc.text(subtitle, pageWidth - subtitleWidth - 10, 18);
      } else {
        doc.setFont("helvetica", "normal");
        doc.text(subtitle, 10, 18);
      }

      autoTable(doc, {
        startY: 22,
        head: [headerRow],
        body: bodyRows,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 3,
          overflow: "linebreak",
          valign: "middle",
          halign: hasArabic ? "right" : "left",
          font: hasArabic ? "Amiri" : "helvetica",
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          halign: "center",
          fontSize: 11,
          font: hasArabic ? "Amiri" : "helvetica",
          fontStyle: hasArabic ? "normal" : "bold",
        },
        columnStyles: {
          0: {
            cellWidth: 20,
            halign: "center",
            fontStyle: "bold",
            font: "helvetica",
          },
        },
        margin: { left: 8, right: 8 },
      });

      const safeSectionName = sectionName
        .trim()
        .replace(/[<>:"/\\|?*]+/g, "")
        .replace(/\s+/g, "-");
      const exportFileName = `${safeSectionName || `section-${sectionId}`}-schedule-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;

      doc.save(exportFileName);
      toast.success(
        hasArabic
          ? "تم تنزيل ملف PDF بنجاح"
          : "Schedule PDF downloaded successfully.",
      );
    } catch (error) {
      console.error("Failed to export schedule PDF:", error);
      toast.error("Failed to export schedule PDF.");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:gap-6">
        {/* Main Schedule Area */}
        <div className="min-w-0 xl:col-span-9">
          <div className="rounded-xl border border-border bg-card shadow-sm">
            {/* Schedule Header */}
            <div className="border-b border-border p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/15 p-3">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {sectionName}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {text(
                        "السنة الدراسية 2024-2025 • الفصل الربيعي",
                        "Academic Year 2024-2025 • Spring Semester",
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={handleExportPdf}
                  >
                    <Download className="w-4 h-4" />
                    {text("تصدير PDF", "Export PDF")}
                  </Button>
                  <Button
                    onClick={() => refetch()}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {text("تحديث", "Refresh")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Schedule Grid */}
            <div className="p-6 overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr>
                    <th className="w-32 border border-border bg-muted/40 p-3 text-start text-sm font-semibold text-muted-foreground">
                      {text("الوقت", "TIME")}
                    </th>
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        className="border border-border bg-muted/40 p-3 text-center text-sm font-semibold text-foreground"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((timeSlot) => (
                    <tr key={timeSlot}>
                      <td className="border border-border bg-muted/40 p-3 align-top text-sm font-medium text-muted-foreground">
                        {timeSlot}
                      </td>
                      {DAYS.map((day) => {
                        const key = `${day}-${timeSlot}`;
                        const scheduleItem = schedule[key];
                        const module = scheduleItem?.module;
                        const isOver = dragOverKey === key;

                        return (
                          <td
                            key={day}
                            className={`relative h-24 border border-border p-2 transition-colors ${
                              isOver
                                ? "bg-primary/10  outline-2 outline-dashed outline-primary outline-offset-[-2px]"
                                : ""
                            }`}
                            onDragOver={(e) => handleDragOver(e, day, timeSlot)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, day, timeSlot)}
                          >
                            {module && scheduleItem ? (
                              <div
                                className={`${module.color.bg} ${module.color.border} border-l-4 rounded-lg p-3 h-full cursor-move hover:shadow-md transition-shadow relative group`}
                                draggable={canCreateOrEdit}
                                onDragStart={(e) =>
                                  canCreateOrEdit &&
                                  handleDragStart(e, module, key)
                                }
                                onDragEnd={handleDragEnd}
                              >
                                {canDelete && (
                                  <button
                                    onClick={() =>
                                      handleRemoveModule(scheduleItem.id)
                                    }
                                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card/90 text-xs text-muted-foreground opacity-0 shadow-sm transition-opacity hover:text-destructive group-hover:opacity-100"
                                  >
                                    ×
                                  </button>
                                )}
                                <div
                                  className={`font-semibold text-sm ${module.color.text} mb-1`}
                                >
                                  {module.name}
                                </div>
                                <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  {scheduleItem.room ||
                                    text("بدون غرفة", "No room")}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {module.teacher}
                                </div>
                              </div>
                            ) : (
                              canCreateOrEdit && (
                                <div className="flex h-full items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-muted/40 hover:text-muted-foreground">
                                  <span className="text-xs">
                                    {text("أسقط هنا", "Drop here")}
                                  </span>
                                </div>
                              )
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Module Library Sidebar */}
        <div className="min-w-0 xl:col-span-3">
          <div className="rounded-xl border border-border bg-card shadow-sm xl:sticky xl:top-6">
            <div className="border-b border-border p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground">
                    {text("مكتبة الحصص", "Module Library")}
                  </h3>
                </div>
                <span className="rounded-full bg-primary/15 px-2 py-1 text-xs font-medium text-primary">
                  {text("اسحب إلى الجدول", "DRAG TO GRID")}
                </span>
              </div>

              <Input
                type="text"
                placeholder={text("ابحث عن الحصص...", "Search modules...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {SUBJECT_CATEGORIES.length > 0 && (
              <div className="border-b border-border p-4 space-y-1">
                {SUBJECT_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="p-4">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {text("الحصص المتاحة", "Available Modules")} (
                {filteredModules.length})
              </h4>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="py-8 text-center text-muted-foreground">
                    {text("جاري التحميل...", "Loading...")}
                  </div>
                ) : filteredModules.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    {text(
                      "لا توجد حصص متاحة لهذه الشعبة",
                      "No modules found for this section",
                    )}
                  </div>
                ) : (
                  filteredModules.map((module) => (
                    <div
                      key={module.id}
                      draggable={canCreateOrEdit}
                      onDragStart={(e) =>
                        canCreateOrEdit && handleDragStart(e, module)
                      }
                      onDragEnd={handleDragEnd}
                      className={`${module.color.bg} ${module.color.border} border-l-4 rounded-lg p-3 ${
                        canCreateOrEdit
                          ? "cursor-move hover:shadow-md"
                          : "cursor-not-allowed opacity-60"
                      } transition-all`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className={`font-semibold text-sm ${module.color.text}`}
                        >
                          {module.name}
                        </div>
                        {canCreateOrEdit && (
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {module.teacher || text("بدون معلم", "No teacher")}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-border bg-primary/10 p-4">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <span className="text-xs text-primary">i</span>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-foreground">
                    {text("نصيحة سريعة", "Quick Tip")}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {text(
                      "اسحب الحصص من المكتبة وأفلتها داخل الجدول لتوزيع الحصص الدراسية.",
                      "Drag modules from the library and drop them onto the schedule grid to assign classes.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title={text("حذف الحصة", "Delete Schedule")}
        description={text(
          "هل أنت متأكد من حذف هذه الحصة؟",
          "Are you sure you want to delete this schedule?",
        )}
        onConfirm={() => {
          if (deletingId) {
            const keyToDelete = Object.keys(schedule).find(
              (key) => schedule[key].id === deletingId,
            );

            if (keyToDelete) {
              const backup = schedule[keyToDelete];
              setSchedule((prev) => {
                const newSchedule = { ...prev };
                delete newSchedule[keyToDelete];
                return newSchedule;
              });

              deleteSchedule.mutate(deletingId, {
                onSuccess: () => {
                  refetch();
                  setDeletingId(null);
                },
                onError: () => {
                  setSchedule((prev) => ({ ...prev, [keyToDelete]: backup }));
                  setDeletingId(null);
                },
              });
            }
          }
        }}
        isLoading={deleteSchedule.isPending}
        confirmText={text("حذف", "Delete")}
      />
    </>
  );
}
