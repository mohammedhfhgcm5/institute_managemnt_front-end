import { useEffect, useMemo, useState } from "react";
import { useSchedules, useDeleteSchedule } from "@/hooks/api/useSchedules";
import { usePermissions } from "@/hooks/usePermissions";
import { DataTable, Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Schedule } from "@/types/schedule.types";
import { getStatusColor, getStatusLabel } from "@/utils/formatters";
import { useDebounce } from "@/hooks/useDebounce";
import { Plus, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScheduleForm } from "./ScheduleForm";

type ScheduleWithRelations = Schedule & {
  section?: {
    id?: number;
    name?: string;
  };
  gradeSubject?: {
    id?: number;
    grade?: {
      name?: string;
    };
    subject?: {
      name?: string;
    };
    teacher?: {
      firstName?: string;
      lastName?: string;
    };
  };
};

const PAGE_SIZE = 10;

const toTimeLabel = (timeValue: string) => {
  const match = timeValue.match(/\d{2}:\d{2}/);
  return match ? match[0] : timeValue;
};

export function ScheduleList() {
  const permissions = usePermissions();
  const canCreateOrEdit = permissions.canManageAttendance;
  const canDelete = permissions.isAdmin;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<ScheduleWithRelations | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useSchedules();
  const deleteSchedule = useDeleteSchedule();

  const schedules = (data || []) as ScheduleWithRelations[];

  const filteredSchedules = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return schedules;

    return schedules.filter((item) => {
      const sectionName = item.section?.name || `#${item.sectionId}`;
      const gradeName = item.gradeSubject?.grade?.name || "";
      const subjectName = item.gradeSubject?.subject?.name || "";
      const teacherName = `${item.gradeSubject?.teacher?.firstName || ""} ${item.gradeSubject?.teacher?.lastName || ""}`.trim();
      const searchableText = [
        sectionName,
        gradeName,
        subjectName,
        teacherName,
        item.dayOfWeek,
        item.startTime,
        item.endTime,
        item.room || "",
        item.status,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(term);
    });
  }, [debouncedSearch, schedules]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const total = filteredSchedules.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedSchedules = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredSchedules.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredSchedules, page]);

  const columns: Column<ScheduleWithRelations>[] = [
    { key: "id", header: "#" },
    {
      key: "section",
      header: "Section",
      render: (item) => item.section?.name || `#${item.sectionId}`,
    },
    {
      key: "subject",
      header: "Subject",
      render: (item) => {
        const gradeName = item.gradeSubject?.grade?.name;
        const subjectName = item.gradeSubject?.subject?.name;
        if (gradeName || subjectName) {
          return `${gradeName || ""} ${subjectName || ""}`.trim();
        }
        return `#${item.gradeSubjectId}`;
      },
    },
    {
      key: "dayOfWeek",
      header: "Day",
    },
    {
      key: "time",
      header: "Time",
      render: (item) => `${toTimeLabel(item.startTime)} - ${toTimeLabel(item.endTime)}`,
    },
    {
      key: "room",
      header: "Room",
      render: (item) => item.room || "-",
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge className={cn("text-xs", getStatusColor(item.status))}>
          {getStatusLabel(item.status)}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-1">
          {canCreateOrEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditingSchedule(item);
                setFormOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeletingId(item.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
          {!canCreateOrEdit && !canDelete && "-"}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={pagedSchedules}
        total={total}
        page={page}
        limit={PAGE_SIZE}
        totalPages={totalPages}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search schedules..."
        actions={
          canCreateOrEdit ? (
            <Button
              onClick={() => {
                setEditingSchedule(null);
                setFormOpen(true);
              }}
            >
              <Plus className="ml-2 h-4 w-4" />
              Add Schedule
            </Button>
          ) : null
        }
      />

      {canCreateOrEdit && (
        <ScheduleForm
          open={formOpen}
          onOpenChange={setFormOpen}
          schedule={editingSchedule}
        />
      )}

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Schedule"
        description="Are you sure you want to delete this schedule?"
        onConfirm={() => {
          if (deletingId) {
            deleteSchedule.mutate(deletingId, {
              onSuccess: () => setDeletingId(null),
            });
          }
        }}
        isLoading={deleteSchedule.isPending}
        confirmText="Delete"
      />
    </>
  );
}
