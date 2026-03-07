import { useEffect, useMemo, useState } from "react";
import {
  useAttendanceList,
  useBulkCreateAttendance,
  useDeleteAttendance,
} from "@/hooks/api/useAttendance";
import { useSectionsByGrade } from "@/hooks/api/useSections";
import { useStudentsBySection } from "@/hooks/api/useStudents";
import { useGrades } from "@/hooks/api/useGrades";
import { DataTable, Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Attendance,
  ExceptionStudentData,
} from "@/types/attendance.types";
import { AttendanceStatus } from "@/types/common.types";
import { formatDate, getStatusColor, getStatusLabel } from "@/utils/formatters";
import { useDebounce } from "@/hooks/useDebounce";
import { Edit, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/hooks/useLocale";
import { Grade } from "@/types/grade.types";
import { Section } from "@/types/section.types";
import { Student } from "@/types/student.types";
import { toast } from "sonner";
import { AttendanceForm } from "@/components/attendance/AttendanceForm";

const statusOptions: AttendanceStatus[] = [
  "present",
  "absent",
  "late",
  "excused",
];

type StudentAttendanceMap = Record<number, ExceptionStudentData>;

const getToday = () => new Date().toISOString().split("T")[0];

export default function AttendancePage() {
  const { text } = useLocale();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedGradeId, setSelectedGradeId] = useState<number>(0);
  const [selectedSectionId, setSelectedSectionId] = useState<number>(0);
  const [attendanceDate, setAttendanceDate] = useState<string>(getToday);
  const [studentAttendanceMap, setStudentAttendanceMap] =
    useState<StudentAttendanceMap>({});
  const debouncedSearch = useDebounce(search);

  const { data: gradesData, isLoading: isGradesLoading } = useGrades({
    page: 1,
    limit: 100,
  });
  const { data: sectionsData, isLoading: isSectionsLoading } =
    useSectionsByGrade(selectedGradeId);
  const { data: studentsData, isLoading: isStudentsLoading } =
    useStudentsBySection(selectedSectionId);
  const { data, isLoading, isError, refetch } = useAttendanceList({
    page,
    limit: 10,
    search: debouncedSearch,
  });

  const deleteAttendance = useDeleteAttendance();
  const bulkCreateAttendance = useBulkCreateAttendance();

  const grades = useMemo(
    () => ((gradesData?.data as Grade[] | undefined) ?? []),
    [gradesData],
  );
  const sections = useMemo(
    () => (sectionsData as Section[] | undefined) ?? [],
    [sectionsData],
  );
  const students = useMemo(() => {
    const list = (studentsData ?? []) as Student[];
    return [...list].sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    );
  }, [studentsData]);

  const tableData = data?.data ?? [];
  const meta = data?.meta;

  useEffect(() => {
    if (!selectedSectionId) {
      setStudentAttendanceMap({});
      return;
    }

    setStudentAttendanceMap((previousMap) => {
      const nextMap: StudentAttendanceMap = {};
      students.forEach((student) => {
        const previous = previousMap[student.id];
        nextMap[student.id] = {
          studentId: student.id,
          status: previous?.status ?? "present",
          lateMinutes: previous?.lateMinutes,
          notes: previous?.notes,
        };
      });
      return nextMap;
    });
  }, [selectedSectionId, students]);

  const updateStudentAttendance = (
    studentId: number,
    patch: Partial<ExceptionStudentData>,
  ) => {
    setStudentAttendanceMap((previousMap) => {
      const existing = previousMap[studentId] ?? {
        studentId,
        status: "present" as AttendanceStatus,
      };

      return {
        ...previousMap,
        [studentId]: {
          ...existing,
          ...patch,
        },
      };
    });
  };

  const applyStatusToAll = (status: AttendanceStatus) => {
    setStudentAttendanceMap((previousMap) => {
      const nextMap: StudentAttendanceMap = {};
      students.forEach((student) => {
        const existing = previousMap[student.id];
        nextMap[student.id] = {
          studentId: student.id,
          status,
          lateMinutes: status === "late" ? existing?.lateMinutes : undefined,
          notes: existing?.notes,
        };
      });
      return nextMap;
    });
  };

  const handleSubmitBulkAttendance = () => {
    if (!selectedSectionId) {
      toast.error(text("Please choose a section first", "Please choose a section first"));
      return;
    }

    if (!attendanceDate) {
      toast.error(text("Please choose attendance date", "Please choose attendance date"));
      return;
    }

    if (students.length === 0) {
      toast.error(text("No students found for this section", "No students found for this section"));
      return;
    }

    const exceptions = students
      .map((student) => {
        const row = studentAttendanceMap[student.id] ?? {
          studentId: student.id,
          status: "present" as AttendanceStatus,
        };

        return {
          studentId: student.id,
          status: row.status,
          lateMinutes:
            row.status === "late" && typeof row.lateMinutes === "number" && row.lateMinutes >= 0
              ? row.lateMinutes
              : undefined,
          notes: row.notes?.trim() ? row.notes.trim() : undefined,
        };
      })
      .filter((item) => item.status !== "present");

    bulkCreateAttendance.mutate(
      {
        sectionId: selectedSectionId,
        date: attendanceDate,
        exceptions: exceptions.length ? exceptions : undefined,
      },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  const columns: Column<Attendance>[] = [
    { key: "id", header: "#" },
    {
      key: "student",
      header: text("Student", "Student"),
      render: (record) =>
        record.student
          ? `${record.student.firstName} ${record.student.lastName}`
          : `#${record.studentId}`,
    },
    {
      key: "date",
      header: text("Date", "Date"),
      render: (record) => formatDate(record.date),
    },
    {
      key: "status",
      header: text("Status", "Status"),
      render: (record) => (
        <Badge className={cn("text-xs", getStatusColor(record.status))}>
          {getStatusLabel(record.status)}
        </Badge>
      ),
    },
    {
      key: "notes",
      header: text("Notes", "Notes"),
      render: (record) => record.notes || "-",
    },
    {
      key: "actions",
      header: text("Actions", "Actions"),
      render: (record) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingRecord(record);
              setFormOpen(true);
            }}
            title={text("Edit attendance", "Edit attendance")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeletingId(record.id)}
            title={text("Delete attendance", "Delete attendance")}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {text("Attendance Management", "Attendance Management")}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{text("Bulk Attendance", "Bulk Attendance")}</CardTitle>
          <CardDescription>
            {text(
              "Select section, set date, then submit attendance once. Only non-present students are sent as exceptions.",
              "Select section, set date, then submit attendance once. Only non-present students are sent as exceptions.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{text("Grade", "Grade")} *</Label>
              <Select
                value={selectedGradeId ? String(selectedGradeId) : undefined}
                onValueChange={(value) => {
                  setSelectedGradeId(Number(value));
                  setSelectedSectionId(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isGradesLoading
                        ? text("Loading grades...", "Loading grades...")
                        : text("Select grade", "Select grade")
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
            </div>

            <div className="space-y-2">
              <Label>{text("Section", "Section")} *</Label>
              <Select
                value={selectedSectionId ? String(selectedSectionId) : undefined}
                onValueChange={(value) => {
                  setSelectedSectionId(Number(value));
                }}
                disabled={!selectedGradeId || isSectionsLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedGradeId
                        ? text("Select grade first", "Select grade first")
                        : isSectionsLoading
                          ? text("Loading sections...", "Loading sections...")
                          : text("Select section", "Select section")
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
            </div>

            <div className="space-y-2">
              <Label>{text("Date", "Date")} *</Label>
              <Input
                type="date"
                value={attendanceDate}
                onChange={(event) => setAttendanceDate(event.target.value)}
              />
            </div>
          </div>

          {selectedSectionId > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => applyStatusToAll("present")}>
                  {text("Mark All Present", "Mark All Present")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => applyStatusToAll("absent")}>
                  {text("Mark All Absent", "Mark All Absent")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => applyStatusToAll("late")}>
                  {text("Mark All Late", "Mark All Late")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => applyStatusToAll("excused")}>
                  {text("Mark All Excused", "Mark All Excused")}
                </Button>
              </div>

              <div className="rounded-md border">
                <div className="max-h-[420px] overflow-auto">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">{text("Student", "Student")}</th>
                        <th className="px-3 py-2 text-left font-medium">{text("Status", "Status")}</th>
                        <th className="px-3 py-2 text-left font-medium">{text("Late Minutes", "Late Minutes")}</th>
                        <th className="px-3 py-2 text-left font-medium">{text("Notes", "Notes")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isStudentsLoading ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                            {text("Loading students...", "Loading students...")}
                          </td>
                        </tr>
                      ) : students.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                            {text(
                              "No students found for the selected section",
                              "No students found for the selected section",
                            )}
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => {
                          const row = studentAttendanceMap[student.id] ?? {
                            studentId: student.id,
                            status: "present" as AttendanceStatus,
                          };

                          return (
                            <tr key={student.id} className="border-t">
                              <td className="px-3 py-2">
                                {student.firstName} {student.lastName}
                              </td>
                              <td className="px-3 py-2">
                                <Select
                                  value={row.status}
                                  onValueChange={(value) =>
                                    updateStudentAttendance(student.id, {
                                      status: value as AttendanceStatus,
                                      lateMinutes:
                                        value === "late" ? row.lateMinutes : undefined,
                                    })
                                  }
                                >
                                  <SelectTrigger className="w-[160px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {statusOptions.map((status) => (
                                      <SelectItem key={status} value={status}>
                                        {getStatusLabel(status)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  min={0}
                                  value={row.lateMinutes ?? ""}
                                  disabled={row.status !== "late"}
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    updateStudentAttendance(student.id, {
                                      lateMinutes: value ? Number(value) : undefined,
                                    });
                                  }}
                                  className="w-[140px]"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  value={row.notes ?? ""}
                                  onChange={(event) =>
                                    updateStudentAttendance(student.id, {
                                      notes: event.target.value,
                                    })
                                  }
                                  placeholder={text("Optional note", "Optional note")}
                                />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitBulkAttendance}
                  disabled={
                    bulkCreateAttendance.isPending ||
                    !selectedSectionId ||
                    students.length === 0
                  }
                >
                  {text("Submit Bulk Attendance", "Submit Bulk Attendance")}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={tableData}
        total={meta?.total ?? tableData.length}
        page={meta?.page ?? page}
        limit={meta?.limit ?? 10}
        totalPages={meta?.totalPages ?? 1}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={text("Search attendance...", "Search attendance...")}
        actions={
          <Button
            onClick={() => {
              setEditingRecord(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {text("Record Attendance", "Record Attendance")}
          </Button>
        }
      />

      <AttendanceForm
        open={formOpen}
        onOpenChange={(nextOpen) => {
          setFormOpen(nextOpen);
          if (!nextOpen) {
            setEditingRecord(null);
          }
        }}
        attendance={editingRecord}
      />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(nextOpen) => !nextOpen && setDeletingId(null)}
        title={text("Delete Attendance Record", "Delete Attendance Record")}
        description={text(
          "Are you sure you want to delete this attendance record?",
          "Are you sure you want to delete this attendance record?",
        )}
        onConfirm={() => {
          if (deletingId) {
            deleteAttendance.mutate(deletingId, {
              onSuccess: () => setDeletingId(null),
            });
          }
        }}
        isLoading={deleteAttendance.isPending}
        confirmText={text("Delete", "Delete")}
      />
    </div>
  );
}
