import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Calendar, Download, Save, GripVertical, Clock, MapPin, User, LayoutGrid, Layers, LucideIcon } from 'lucide-react';
import { useSchedules, useSchedulesBySection, useDeleteSchedule, useCreateSchedule, useUpdateSchedule } from "@/hooks/api/useSchedules";
import { useGradeSubjects } from "@/hooks/api/useGradeSubjects";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
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
  { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
  { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-700' },
  { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700' },
  { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700' },
  { bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-700' },
  { bg: 'bg-cyan-100', border: 'border-cyan-400', text: 'text-cyan-700' },
  { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-700' },
  { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700' },
  { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-700' },
  { bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-700' },
  { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-700' },
  { bg: 'bg-fuchsia-100', border: 'border-fuchsia-400', text: 'text-fuchsia-700' },
  { bg: 'bg-violet-100', border: 'border-violet-400', text: 'text-violet-700' },
  { bg: 'bg-sky-100', border: 'border-sky-400', text: 'text-sky-700' },
  { bg: 'bg-lime-100', border: 'border-lime-400', text: 'text-lime-700' },
  { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700' },
  { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700' },
  { bg: 'bg-slate-100', border: 'border-slate-400', text: 'text-slate-700' },
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
      const subjectName = gs.subject?.name || 'Unknown';
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
    const teacher = item.module?.teacher ? `المعلم: ${item.module.teacher}` : '';
    const room = item.room ? `الغرفة: ${item.room}` : '';
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
        ? ['الأحد', 'السبت', 'الجمعة', 'الخميس', 'الأربعاء', 'الثلاثاء', 'الإثنين']
        : DAYS;

      const headerRow = [hasArabic ? 'الوقت' : 'Time', ...dayNames];
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
      const title = hasArabic ? `جدول الحصص - ${sectionName}` : `Schedule - ${sectionName}`;
      
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
      const subtitle = hasArabic ? `تم الإنشاء: ${generatedAt}` : `Generated: ${generatedAt}`;
      
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
      toast.success(hasArabic ? 'تم تنزيل ملف PDF بنجاح' : 'Schedule PDF downloaded successfully.');
    } catch (error) {
      console.error('Failed to export schedule PDF:', error);
      toast.error('Failed to export schedule PDF.');
    }
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        {/* Main Schedule Area */}
        <div className="col-span-9">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            {/* Schedule Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{sectionName}</h2>
                    <p className="text-sm text-slate-500 mt-1">Academic Year 2024-2025 • Spring Semester</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="flex items-center gap-2" onClick={handleExportPdf}>
                    <Download className="w-4 h-4" />
                    Export PDF
                  </Button>
                  <Button onClick={() => refetch()} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Schedule Grid */}
            <div className="p-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 w-32">
                      TIME
                    </th>
                    {DAYS.map(day => (
                      <th key={day} className="text-center p-3 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map(timeSlot => (
                    <tr key={timeSlot}>
                      <td className="p-3 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 align-top">
                        {timeSlot}
                      </td>
                      {DAYS.map(day => {
                        const key = `${day}-${timeSlot}`;
                        const scheduleItem = schedule[key];
                        const module = scheduleItem?.module;
                        
                        return (
                          <td
                            key={day}
                            className="border border-slate-200 p-2 h-24 relative drop-zone"
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
                                    className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-slate-600 hover:text-red-600 text-xs"
                                  >
                                    ×
                                  </button>
                                )}
                                <div className={`font-semibold text-sm ${module.color.text} mb-1`}>
                                  {module.name}
                                </div>
                                <div className="text-xs text-slate-600 flex items-center gap-1 mb-1">
                                  <MapPin className="w-3 h-3" />
                                  {scheduleItem.room || 'No room'}
                                </div>
                                <div className="text-xs text-slate-600">
                                  {module.teacher}
                                </div>
                              </div>
                            ) : (
                              canCreateOrEdit && (
                                <div className="h-full flex items-center justify-center text-slate-300 hover:text-slate-400 hover:bg-slate-50 rounded transition-colors">
                                  <span className="text-xs">Drop here</span>
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
        <div className="col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-6">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800">Module Library</h3>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  DRAG TO GRID
                </span>
              </div>
              
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {SUBJECT_CATEGORIES.length > 0 && (
              <div className="p-4 border-b border-slate-200 space-y-1">
                {SUBJECT_CATEGORIES.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50'
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
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Available Modules ({filteredModules.length})
              </h4>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8 text-slate-500">Loading...</div>
                ) : filteredModules.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No modules found for this section
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
                        {canCreateOrEdit && <GripVertical className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {module.teacher || 'No teacher'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-blue-50">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-700 text-xs">i</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-blue-900 mb-1">Quick Tip</h4>
                  <p className="text-xs text-blue-700">
                    Drag modules from the library and drop them onto the schedule grid to assign classes.
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
        title="Delete Schedule"
        description="Are you sure you want to delete this schedule?"
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
        confirmText="Delete"
      />

      <style>{`
        .drop-zone.drag-over {
          background-color: #dbeafe;
          border: 2px dashed #3b82f6;
        }
      `}</style>
    </>
  );
}
