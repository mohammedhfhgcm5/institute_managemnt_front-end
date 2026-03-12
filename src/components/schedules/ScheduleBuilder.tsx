import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Calendar, Download, Save, GripVertical, Clock, MapPin, User, LayoutGrid, Layers, LucideIcon } from 'lucide-react';
import { useSchedules, useSchedulesBySection, useDeleteSchedule, useCreateSchedule, useUpdateSchedule } from "@/hooks/api/useSchedules";
import { useGradeSubjects } from "@/hooks/api/useGradeSubjects";
import { usePermissions } from "@/hooks/usePermissions";
import { useLocale } from "@/hooks/useLocale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Schedule } from "@/types/schedule.types";
import { DayOfWeek } from '@/types/common.types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { loadAmiriFont } from '@/fonts/amiriFont';

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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as DayOfWeek[];

const TIME_SLOTS = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
] as const;

// Color palette for module assignment based on ID
const COLOR_PALETTE: ColorScheme[] = [
  { bg: 'bg-blue-100 dark:bg-blue-500/20', border: 'border-blue-300 dark:border-blue-500/50', text: 'text-blue-800 dark:text-blue-200' },
  { bg: 'bg-emerald-100 dark:bg-emerald-500/20', border: 'border-emerald-300 dark:border-emerald-500/50', text: 'text-emerald-800 dark:text-emerald-200' },
  { bg: 'bg-purple-100 dark:bg-purple-500/20', border: 'border-purple-300 dark:border-purple-500/50', text: 'text-purple-800 dark:text-purple-200' },
  { bg: 'bg-orange-100 dark:bg-orange-500/20', border: 'border-orange-300 dark:border-orange-500/50', text: 'text-orange-800 dark:text-orange-200' },
  { bg: 'bg-indigo-100 dark:bg-indigo-500/20', border: 'border-indigo-300 dark:border-indigo-500/50', text: 'text-indigo-800 dark:text-indigo-200' },
  { bg: 'bg-cyan-100 dark:bg-cyan-500/20', border: 'border-cyan-300 dark:border-cyan-500/50', text: 'text-cyan-800 dark:text-cyan-200' },
  { bg: 'bg-teal-100 dark:bg-teal-500/20', border: 'border-teal-300 dark:border-teal-500/50', text: 'text-teal-800 dark:text-teal-200' },
  { bg: 'bg-green-100 dark:bg-green-500/20', border: 'border-green-300 dark:border-green-500/50', text: 'text-green-800 dark:text-green-200' },
  { bg: 'bg-amber-100 dark:bg-amber-500/20', border: 'border-amber-300 dark:border-amber-500/50', text: 'text-amber-800 dark:text-amber-200' },
  { bg: 'bg-rose-100 dark:bg-rose-500/20', border: 'border-rose-300 dark:border-rose-500/50', text: 'text-rose-800 dark:text-rose-200' },
  { bg: 'bg-pink-100 dark:bg-pink-500/20', border: 'border-pink-300 dark:border-pink-500/50', text: 'text-pink-800 dark:text-pink-200' },
  { bg: 'bg-fuchsia-100 dark:bg-fuchsia-500/20', border: 'border-fuchsia-300 dark:border-fuchsia-500/50', text: 'text-fuchsia-800 dark:text-fuchsia-200' },
  { bg: 'bg-violet-100 dark:bg-violet-500/20', border: 'border-violet-300 dark:border-violet-500/50', text: 'text-violet-800 dark:text-violet-200' },
  { bg: 'bg-sky-100 dark:bg-sky-500/20', border: 'border-sky-300 dark:border-sky-500/50', text: 'text-sky-800 dark:text-sky-200' },
  { bg: 'bg-lime-100 dark:bg-lime-500/20', border: 'border-lime-300 dark:border-lime-500/50', text: 'text-lime-800 dark:text-lime-200' },
  { bg: 'bg-red-100 dark:bg-red-500/20', border: 'border-red-300 dark:border-red-500/50', text: 'text-red-800 dark:text-red-200' },
  { bg: 'bg-yellow-100 dark:bg-yellow-500/20', border: 'border-yellow-300 dark:border-yellow-500/50', text: 'text-yellow-800 dark:text-yellow-200' },
  { bg: 'bg-slate-100 dark:bg-slate-500/20', border: 'border-slate-300 dark:border-slate-500/50', text: 'text-slate-800 dark:text-slate-200' },
];

// Get color based on module ID
const getColorById = (id: number): ColorScheme => {
  const index = id % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
};

const SUBJECT_CATEGORIES: SubjectCategory[] = [];

// Helper function to detect Arabic characters
const containsArabic = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text);
};

// Helper function to convert ISO datetime string to HH:MM format
const extractTimeFromISO = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    if (typeof isoString === 'string') {
      const timeMatch = isoString.match(/(\d{2}):(\d{2})/);
      if (timeMatch) {
        return `${timeMatch[1]}:${timeMatch[2]}`;
      }
    }
    return isoString;
  }
};

export function ScheduleBuilder({ sectionId, sectionName = 'Class Schedule' }: ScheduleBuilderProps) {
  const { text } = useLocale();
  const permissions = usePermissions();
  const canCreateOrEdit = permissions.canManageAttendance;
  const canDelete = permissions.isAdmin;

  const [schedule, setSchedule] = useState<ScheduleMap>({});
  const [draggedModule, setDraggedModule] = useState<Module | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const dragCounter = useRef<number>(0);

  const { data: schedulesData, isLoading, refetch } = useSchedulesBySection(sectionId);
  const { data: gradeSubjectsData } = useGradeSubjects();
  const deleteSchedule = useDeleteSchedule();
  const createSchedule = useCreateSchedule();

  const schedules = (schedulesData || []) as any[];
  const gradeSubjects = gradeSubjectsData || [];

  const sectionGradeSubjects = useMemo(
    () =>
      (gradeSubjects as any[]).filter(
        (gs) => typeof gs?.sectionId === 'number' && gs.sectionId === sectionId
      ),
    [gradeSubjects, sectionId]
  );

  const availableModules: Module[] = useMemo(() => {
    return sectionGradeSubjects.map((gs: any) => {
      const subjectName = gs.subject?.name || text('ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ', 'Unknown');
      const gradeName = gs.grade?.name || '';
      const teacherFirstName = gs.teacher?.firstName || '';
      const teacherLastName = gs.teacher?.lastName || '';
      
      return {
        id: gs.id,
        gradeSubjectId: gs.id,
        name: `${gradeName} ${subjectName}`.trim(),
        subject: subjectName,
        teacher: `${teacherFirstName} ${teacherLastName}`.trim(),
        room: '',
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
      const module = availableModules.find(m => m.gradeSubjectId === sched.gradeSubjectId);
      
      const scheduleEntry = {
        ...sched,
        module,
      };
      
      const primaryKey = `${sched.dayOfWeek}-${timePart}`;
      scheduleMap[primaryKey] = scheduleEntry;
    });
    
    setSchedule(scheduleMap);
  }, [schedules, availableModules, sectionId]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, module: Module) => {
    setDraggedModule(module);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
    dragCounter.current++;
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLTableCellElement>) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      e.currentTarget.classList.remove('drag-over');
    }
  };

  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let endHours = hours + 1;
    if (endHours >= 24) endHours = 0;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleDrop = (e: React.DragEvent<HTMLTableCellElement>, day: DayOfWeek, timeSlot: string) => {
    e.preventDefault();
    dragCounter.current = 0;
    e.currentTarget.classList.remove('drag-over');
    
    if (draggedModule && sectionId) {
      const endTime = calculateEndTime(timeSlot);
      const key = `${day}-${timeSlot}`;
      
      const tempSchedule: Schedule & { module?: Module } = {
        id: Date.now(),
        sectionId: sectionId,
        gradeSubjectId: draggedModule.gradeSubjectId,
        dayOfWeek: day,
        startTime: timeSlot,
        endTime: endTime,
        room: draggedModule.room || '',
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        module: draggedModule,
      };
      
      setSchedule(prev => ({
        ...prev,
        [key]: tempSchedule,
      }));
      
      createSchedule.mutate({
        sectionId: sectionId,
        gradeSubjectId: draggedModule.gradeSubjectId,
        dayOfWeek: day,
        startTime: timeSlot,
        endTime: endTime,
        room: draggedModule.room || undefined,
        status: 'scheduled',
      }, {
        onSuccess: (data) => {
          refetch();
          setDraggedModule(null);
        },
        onError: (error) => {
          setSchedule(prev => {
            const newSchedule = { ...prev };
            delete newSchedule[key];
            return newSchedule;
          });
          setDraggedModule(null);
          console.error('Failed to create schedule:', error);
        }
      });
    }
  };

  const handleRemoveModule = (scheduleId: number) => {
    setDeletingId(scheduleId);
  };

  const filteredModules = useMemo(() => {
    return availableModules.filter(module => {
      const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           module.teacher.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [searchTerm, selectedCategory, availableModules]);

  const formatScheduleCellForExport = (item: Schedule & { module?: Module }): string => {
    const moduleName = item.module?.name || `Module #${item.gradeSubjectId}`;
    const teacher = item.module?.teacher ? `Ø§Ù„Ù…Ø¹Ù„Ù…: ${item.module.teacher}` : '';
    const room = item.room ? `Ø§Ù„ØºØ±ÙØ©: ${item.room}` : '';
    const details = [teacher, room].filter(Boolean);

    return details.length > 0 ? `${moduleName}\n${details.join(' | ')}` : moduleName;
  };

  const handleExportPdf = async () => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Check if content contains Arabic
      const hasArabic = containsArabic(sectionName) || 
                       Object.values(schedule).some(item => 
                         containsArabic(item.module?.name || '') || 
                         containsArabic(item.module?.teacher || '')
                       );

      // Load Arabic font if needed
      if (hasArabic) {
        try {
          await loadAmiriFont(doc);
        } catch (error) {
          console.error('Failed to load Arabic font:', error);
          toast.error('Failed to load Arabic font, using default font');
        }
      }

      const generatedAt = new Date().toLocaleString('ar', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Arabic day names (in correct RTL order)
      const dayNames = hasArabic 
        ? ['Ø§Ù„Ø£Ø­Ø¯', 'Ø§Ù„Ø³Ø¨Øª', 'Ø§Ù„Ø¬Ù…Ø¹Ø©', 'Ø§Ù„Ø®Ù…ÙŠØ³', 'Ø§Ù„Ø£Ø±Ø¨Ø¹Ø§Ø¡', 'Ø§Ù„Ø«Ù„Ø§Ø«Ø§Ø¡', 'Ø§Ù„Ø¥Ø«Ù†ÙŠÙ†']
        : DAYS;

      const headerRow = [hasArabic ? 'Ø§Ù„ÙˆÙ‚Øª' : 'Time', ...dayNames];
      const bodyRows = TIME_SLOTS.map((timeSlot) => {
        const row: string[] = [timeSlot];
        const daysToUse = hasArabic ? [...DAYS].reverse() : DAYS;
        daysToUse.forEach((day) => {
          const key = `${day}-${timeSlot}`;
          const scheduleItem = schedule[key];
          row.push(scheduleItem ? formatScheduleCellForExport(scheduleItem) : '-');
        });
        return row;
      });

      // Title
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(16);
      const title = hasArabic ? `Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ø­ØµØµ - ${sectionName}` : `Schedule - ${sectionName}`;
      
      if (hasArabic) {
        doc.setFont("Amiri", "normal");
        const titleWidth = doc.getTextWidth(title);
        doc.text(title, pageWidth - titleWidth - 10, 12);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.text(title, 10, 12);
      }

      // Subtitle
      doc.setFontSize(10);
      const subtitle = hasArabic ? `ØªÙ… Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡: ${generatedAt}` : `Generated: ${generatedAt}`;
      
      if (hasArabic) {
        doc.setFont("Amiri", "normal");
        const subtitleWidth = doc.getTextWidth(subtitle);
        doc.text(subtitle, pageWidth - subtitleWidth - 10, 18);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.text(subtitle, 10, 18);
      }

      // Create table
      autoTable(doc, {
        startY: 22,
        head: [headerRow],
        body: bodyRows,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          overflow: 'linebreak',
          valign: 'middle',
          halign: hasArabic ? 'right' : 'left',
          font: hasArabic ? 'Amiri' : 'helvetica',
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          halign: 'center',
          fontSize: 11,
          font: hasArabic ? 'Amiri' : 'helvetica',
          fontStyle: hasArabic ? 'normal' : 'bold',
        },
        columnStyles: {
          0: {
            cellWidth: 20,
            halign: 'center',
            fontStyle: 'bold',
            font: 'helvetica', // Keep time column in helvetica
          },
        },
        margin: { left: 8, right: 8 },
      });

      const safeSectionName = sectionName
        .trim()
        .replace(/[<>:"/\\|?*]+/g, '')
        .replace(/\s+/g, '-');
      const exportFileName = `${safeSectionName || `section-${sectionId}`}-schedule-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;

      doc.save(exportFileName);
      toast.success(hasArabic ? 'ØªÙ… ØªÙ†Ø²ÙŠÙ„ Ù…Ù„Ù PDF Ø¨Ù†Ø¬Ø§Ø­' : 'Schedule PDF downloaded successfully.');
    } catch (error) {
      console.error('Failed to export schedule PDF:', error);
      toast.error('Failed to export schedule PDF.');
    }
  };

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
                    <h2 className="text-2xl font-bold text-foreground">{sectionName}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {text('السنة الدراسية 2024-2025 • الفصل الربيعي', 'Academic Year 2024-2025 • Spring Semester')}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <Button variant="outline" className="flex items-center gap-2" onClick={handleExportPdf}>
                    <Download className="w-4 h-4" />
                    {text('ØªØµØ¯ÙŠØ± PDF', 'Export PDF')}
                  </Button>
                  <Button onClick={() => refetch()} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {text('ØªØ­Ø¯ÙŠØ«', 'Refresh')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Schedule Grid */}
            <div className="p-6 overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr>
                    <th className="w-32 border border-border bg-muted/40 p-3 text-left text-sm font-semibold text-muted-foreground">
                      {text('Ø§Ù„ÙˆÙ‚Øª', 'TIME')}
                    </th>
                    {DAYS.map(day => (
                      <th key={day} className="border border-border bg-muted/40 p-3 text-center text-sm font-semibold text-foreground">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map(timeSlot => (
                    <tr key={timeSlot}>
                      <td className="border border-border bg-muted/40 p-3 align-top text-sm font-medium text-muted-foreground">
                        {timeSlot}
                      </td>
                      {DAYS.map(day => {
                        const key = `${day}-${timeSlot}`;
                        const scheduleItem = schedule[key];
                        const module = scheduleItem?.module;
                        
                        return (
                          <td
                            key={day}
                            className="relative h-24 border border-border p-2 drop-zone"
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, day, timeSlot)}
                          >
                            {module && scheduleItem ? (
                              <div
                                className={`${module.color.bg} ${module.color.border} border-l-4 rounded-lg p-3 h-full cursor-move hover:shadow-md transition-shadow relative group`}
                                draggable={canCreateOrEdit}
                                onDragStart={(e) => canCreateOrEdit && handleDragStart(e, module)}
                              >
                                {canDelete && (
                                  <button
                                    onClick={() => handleRemoveModule(scheduleItem.id)}
                                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card/90 text-xs text-muted-foreground opacity-0 shadow-sm transition-opacity hover:text-destructive group-hover:opacity-100"
                                  >
                                    Ã—
                                  </button>
                                )}
                                <div className={`font-semibold text-sm ${module.color.text} mb-1`}>
                                  {module.name}
                                </div>
                                <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  {scheduleItem.room || text('Ø¨Ø¯ÙˆÙ† ØºØ±ÙØ©', 'No room')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {module.teacher}
                                </div>
                              </div>
                            ) : (
                              canCreateOrEdit && (
                                <div className="flex h-full items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-muted/40 hover:text-muted-foreground">
                                  <span className="text-xs">{text('Ø£Ø³Ù‚Ø· Ù‡Ù†Ø§', 'Drop here')}</span>
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
                  <h3 className="font-bold text-foreground">{text('Ù…ÙƒØªØ¨Ø© Ø§Ù„Ø­ØµØµ', 'Module Library')}</h3>
                </div>
                <span className="rounded-full bg-primary/15 px-2 py-1 text-xs font-medium text-primary">
                  {text('Ø§Ø³Ø­Ø¨ Ø¥Ù„Ù‰ Ø§Ù„Ø¬Ø¯ÙˆÙ„', 'DRAG TO GRID')}
                </span>
              </div>
              
              <Input
                type="text"
                placeholder={text('Ø§Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ø­ØµØµ...', 'Search modules...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {SUBJECT_CATEGORIES.length > 0 && (
              <div className="border-b border-border p-4 space-y-1">
                {SUBJECT_CATEGORIES.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted/40'
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
                {text('Ø§Ù„Ø­ØµØµ Ø§Ù„Ù…ØªØ§Ø­Ø©', 'Available Modules')} ({filteredModules.length})
              </h4>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="py-8 text-center text-muted-foreground">{text('Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù…ÙŠÙ„...', 'Loading...')}</div>
                ) : filteredModules.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    {text('Ù„Ø§ ØªÙˆØ¬Ø¯ Ø­ØµØµ Ù…ØªØ§Ø­Ø© Ù„Ù‡Ø°Ù‡ Ø§Ù„Ø´Ø¹Ø¨Ø©', 'No modules found for this section')}
                  </div>
                ) : (
                  filteredModules.map(module => (
                    <div
                      key={module.id}
                      draggable={canCreateOrEdit}
                      onDragStart={(e) => canCreateOrEdit && handleDragStart(e, module)}
                      className={`${module.color.bg} ${module.color.border} border-l-4 rounded-lg p-3 ${
                        canCreateOrEdit ? 'cursor-move hover:shadow-md' : 'cursor-not-allowed opacity-60'
                      } transition-all`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`font-semibold text-sm ${module.color.text}`}>
                          {module.name}
                        </div>
                        {canCreateOrEdit && <GripVertical className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {module.teacher || text('Ø¨Ø¯ÙˆÙ† Ù…Ø¹Ù„Ù…', 'No teacher')}
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
                  <h4 className="mb-1 text-sm font-semibold text-foreground">{text('Ù†ØµÙŠØ­Ø© Ø³Ø±ÙŠØ¹Ø©', 'Quick Tip')}</h4>
                  <p className="text-xs text-muted-foreground">
                    {text(
                      'Ø§Ø³Ø­Ø¨ Ø§Ù„Ø­ØµØµ Ù…Ù† Ø§Ù„Ù…ÙƒØªØ¨Ø© ÙˆØ£ÙÙ„ØªÙ‡Ø§ Ø¯Ø§Ø®Ù„ Ø§Ù„Ø¬Ø¯ÙˆÙ„ Ù„ØªÙˆØ²ÙŠØ¹ Ø§Ù„Ø­ØµØµ Ø§Ù„Ø¯Ø±Ø§Ø³ÙŠØ©.',
                      'Drag modules from the library and drop them onto the schedule grid to assign classes.'
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
        title={text("Ø­Ø°Ù Ø§Ù„Ø­ØµØ©", "Delete Schedule")}
        description={text("Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ù‡Ø°Ù‡ Ø§Ù„Ø­ØµØ©ØŸ", "Are you sure you want to delete this schedule?")}
        onConfirm={() => {
          if (deletingId) {
            const keyToDelete = Object.keys(schedule).find(
              key => schedule[key].id === deletingId
            );
            
            if (keyToDelete) {
              const backup = schedule[keyToDelete];
              setSchedule(prev => {
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
                  setSchedule(prev => ({
                    ...prev,
                    [keyToDelete]: backup,
                  }));
                  setDeletingId(null);
                }
              });
            }
          }
        }}
        isLoading={deleteSchedule.isPending}
        confirmText={text("Ø­Ø°Ù", "Delete")}
      />

      <style>{`
        .drop-zone.drag-over {
          background-color: hsl(var(--primary) / 0.12);
          outline: 2px dashed hsl(var(--primary));
          outline-offset: -2px;
        }
      `}</style>
    </>
  );
}

