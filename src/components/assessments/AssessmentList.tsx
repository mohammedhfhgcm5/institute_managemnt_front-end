import { useState } from "react";
import {
  useAssessments,
  useDeleteAssessment,
} from "@/hooks/api/useAssessments";
import { usePermissions } from "@/hooks/usePermissions";
import { DataTable, Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Assessment } from "@/types/assessment.types";
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  formatPercentage,
} from "@/utils/formatters";
import { useDebounce } from "@/hooks/useDebounce";
import { Plus, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssessmentForm } from "./AssessmentForm";

type AssessmentWithRelations = Assessment & {
  student?: { id?: number; firstName?: string; lastName?: string };
  gradeSubject?: {
    id?: number;
    grade?: { name?: string };
    subject?: { name?: string };
  };
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number")
    return Number.isFinite(value) ? value : undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export function AssessmentList() {
  const permissions = usePermissions();
  const canCreateOrEdit = permissions.canManageGrades;
  const canDelete = permissions.isAdmin;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] =
    useState<AssessmentWithRelations | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useAssessments({
    page,
    limit: 10,
    search: debouncedSearch,
  });
  const deleteAssessment = useDeleteAssessment();

  const assessments = (data?.data || []) as AssessmentWithRelations[];

  const columns: Column<AssessmentWithRelations>[] = [
    { key: "id", header: "#" },
    {
      key: "student",
      header: "Student",
      render: (item) =>
        item.student
          ? `${item.student.firstName || ""} ${item.student.lastName || ""}`.trim()
          : `#${item.studentId}`,
    },
    {
      key: "subject",
      header: "Subject",
      render: (item) => {
        const grade = item.gradeSubject?.grade?.name;
        const subject = item.gradeSubject?.subject?.name;
        if (grade || subject) return `${grade || ""} ${subject || ""}`.trim();
        return `#${item.gradeSubjectId}`;
      },
    },
    {
      key: "title",
      header: "Title",
    },
    {
      key: "type",
      header: "Type",
      render: (item) => (
        <Badge className={cn("text-xs", getStatusColor(item.type))}>
          {getStatusLabel(item.type)}
        </Badge>
      ),
    },
    {
      key: "score",
      header: "Score",
      render: (item) => {
        const score = toNumber(item.score);
        const maxScore = toNumber(item.maxScore);
        if (maxScore === undefined) return "-";
        return `${score ?? 0} / ${maxScore}`;
      },
    },
    {
      key: "percentage",
      header: "Percentage",
      render: (item) => formatPercentage(toNumber(item.percentage)),
    },
    {
      key: "assessmentDate",
      header: "Date",
      render: (item) => formatDate(item.assessmentDate),
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
                setEditingAssessment(item);
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
        data={assessments}
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
        searchPlaceholder="Search assessments..."
        actions={
          canCreateOrEdit ? (
            <Button
              onClick={() => {
                setEditingAssessment(null);
                setFormOpen(true);
              }}
            >
              <Plus className="ml-2 h-4 w-4" />
              Add Assessment
            </Button>
          ) : null
        }
      />

      {canCreateOrEdit && (
        <AssessmentForm
          open={formOpen}
          onOpenChange={setFormOpen}
          assessment={editingAssessment}
        />
      )}

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Assessment"
        description="Are you sure you want to delete this assessment?"
        onConfirm={() => {
          if (deletingId) {
            deleteAssessment.mutate(deletingId, {
              onSuccess: () => setDeletingId(null),
            });
          }
        }}
        isLoading={deleteAssessment.isPending}
        confirmText="Delete"
      />
    </>
  );
}
