import { useState } from "react";
import { useSections, useDeleteSection } from "@/hooks/api/useSections";
import { usePermissions } from "@/hooks/usePermissions";
import { DataTable, Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Section } from "@/types/section.types";
import { formatDate, getStatusColor, getStatusLabel } from "@/utils/formatters";
import { useDebounce } from "@/hooks/useDebounce";
import { Plus, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionForm } from "./SectionForm";

type SectionWithRelations = Section & {
  grade?: {
    id?: number;
    name?: string;
  };
  _count?: {
    students?: number;
  };
};

export function SectionList() {
  const permissions = usePermissions();
  const canManageSections = permissions.isAdmin;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSection, setEditingSection] =
    useState<SectionWithRelations | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useSections({
    page,
    limit: 10,
    search: debouncedSearch,
  });

  const deleteSection = useDeleteSection();
  const sections = (data?.data || []) as SectionWithRelations[];

  const columns: Column<SectionWithRelations>[] = [
    { key: "id", header: "#" },
    {
      key: "name",
      header: "Section",
    },
    {
      key: "gradeId",
      header: "Grade",
      render: (section) => section.grade?.name || `#${section.gradeId}`,
    },
    {
      key: "academicYear",
      header: "Academic Year",
    },
    {
      key: "maxStudents",
      header: "Capacity",
      render: (section) => section.maxStudents || "-",
    },
    {
      key: "studentsCount",
      header: "Students",
      render: (section) => section._count?.students ?? "-",
    },
    {
      key: "status",
      header: "Status",
      render: (section) => (
        <Badge className={cn("text-xs", getStatusColor(section.status))}>
          {getStatusLabel(section.status)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (section) => formatDate(section.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      render: (section) =>
        canManageSections ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditingSection(section);
                setFormOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeletingId(section.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={sections}
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
        searchPlaceholder="Search sections..."
        actions={
          canManageSections ? (
            <Button
              onClick={() => {
                setEditingSection(null);
                setFormOpen(true);
              }}
            >
              <Plus className="ml-2 h-4 w-4" />
              Add Section
            </Button>
          ) : null
        }
      />

      {canManageSections && (
        <SectionForm
          open={formOpen}
          onOpenChange={setFormOpen}
          section={editingSection}
        />
      )}

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Section"
        description="Are you sure you want to delete this section?"
        onConfirm={() => {
          if (deletingId) {
            deleteSection.mutate(deletingId, {
              onSuccess: () => setDeletingId(null),
            });
          }
        }}
        isLoading={deleteSection.isPending}
        confirmText="Delete"
      />
    </>
  );
}
