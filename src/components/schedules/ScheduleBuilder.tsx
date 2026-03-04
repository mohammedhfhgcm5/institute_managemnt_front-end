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

// FIXED: Now includes all 7 days of the week
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as DayOfWeek[];

// Use 24‑hour format for consistency with calculateEndTime
const TIME_SLOTS = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '16:00',
] as const;

const SUBJECT_COLORS: Record<string, ColorScheme> = {
  'Mathematics': { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700' },
  'Science': { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-700' },
  'English': { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
  'Computer Science': { bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-700' },
  'History': { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700' },
  'Art': { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-700' },
  'Geography': { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-700' },
  'Physics': { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700' },
  'Chemistry': { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700' },
  'Physical Education': { bg: 'bg-cyan-100', border: 'border-cyan-400', text: 'text-cyan-700' },
  'Default': { bg: 'bg-slate-100', border: 'border-slate-400', text: 'text-slate-700' },
};

const getSubjectColor = (subjectName: string): ColorScheme => {
  const subject = Object.keys(SUBJECT_COLORS).find(key => 
    subjectName.toLowerCase().includes(key.toLowerCase())
  );
  return subject ? SUBJECT_COLORS[subject] : SUBJECT_COLORS['Default'];
};

const SUBJECT_CATEGORIES: SubjectCategory[] = [];

// Helper function to convert ISO datetime string to HH:MM format
const extractTimeFromISO = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`;
  } catch {
    // Fallback: try to extract time from string format
    if (typeof isoString === 'string') {
      // Handle formats like "09:30" or "1970-01-01 09:30:00"
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

  // Convert gradeSubjects to modules
  const availableModules: Module[] = useMemo(() => {
    return gradeSubjects.map((gs: any) => {
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
        color: getSubjectColor(subjectName),
      };
    });
  }, [gradeSubjects]);

  // FIXED: Build schedule map from existing schedules for the selected section
  useEffect(() => {
    if (!schedules.length || !sectionId) {
      setSchedule({});
      return;
    }
    
    const scheduleMap: ScheduleMap = {};
    
    schedules.forEach((sched: any) => {
      // Extract time from ISO datetime string (e.g., "1970-01-01T09:30:00.000Z" -> "09:30")
      const timePart = extractTimeFromISO(sched.startTime);
      
      // Create multiple possible keys to ensure schedule is displayed
      // This handles cases where the time might be stored in different formats
      const possibleKeys = [
        `${sched.dayOfWeek}-${timePart}`, // Standard key
        `${sched.dayOfWeek}-${sched.startTime}`, // Raw startTime
      ];
      
      // Find matching module from gradeSubjects
      const module = availableModules.find(m => m.gradeSubjectId === sched.gradeSubjectId);
      
      const scheduleEntry = {
        ...sched,
        module,
      };
      
      // Store using the primary key (with extracted time)
      const primaryKey = `${sched.dayOfWeek}-${timePart}`;
      scheduleMap[primaryKey] = scheduleEntry;
      
      // Debug log to see what's being mapped
      console.log('Schedule mapping:', {
        id: sched.id,
        primaryKey,
        dayOfWeek: sched.dayOfWeek,
        startTime: sched.startTime,
        timePart,
        module: module?.name,
        gradeSubjectId: sched.gradeSubjectId
      });
    });
    
    console.log('Final schedule map:', scheduleMap);
    console.log('Total schedules mapped:', Object.keys(scheduleMap).length);
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

  // Calculate end time as startTime + 1 hour (24-hour format)
  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let endHours = hours + 1;
    // Handle day wrap (if needed, but school hours unlikely to cross midnight)
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
      
      // Optimistically update the UI immediately
      const tempSchedule: Schedule & { module?: Module } = {
        id: Date.now(), // Temporary ID
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
      
      // Update state immediately for instant UI feedback
      setSchedule(prev => ({
        ...prev,
        [key]: tempSchedule,
      }));
      
      // Then save to backend
      createSchedule.mutate({
        sectionId: sectionId,
        gradeSubjectId: draggedModule.gradeSubjectId,
        dayOfWeek: day,
        startTime: timeSlot,       // 24‑hour format
        endTime: endTime,           // 24‑hour format
        room: draggedModule.room || undefined,
        status: 'scheduled',
      }, {
        onSuccess: (data) => {
          // Refresh from server to get the real ID and any server-side updates
          refetch();
          setDraggedModule(null);
        },
        onError: (error) => {
          // Revert optimistic update on error
          setSchedule(prev => {
            const newSchedule = { ...prev };
            delete newSchedule[key];
            return newSchedule;
          });
          setDraggedModule(null);
          // Optionally show error toast here
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
    const details = [
      item.module?.teacher ? `Teacher: ${item.module.teacher}` : '',
      item.room ? `Room: ${item.room}` : '',
    ].filter(Boolean);

    return details.length > 0 ? `${moduleName}\n${details.join(' | ')}` : moduleName;
  };

  const handleExportPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const generatedAt = new Date().toLocaleString();
      const headerRow = ['Time', ...DAYS];
      const bodyRows = TIME_SLOTS.map((timeSlot) => {
        const row: string[] = [timeSlot];
        DAYS.forEach((day) => {
          const key = `${day}-${timeSlot}`;
          const scheduleItem = schedule[key];
          row.push(scheduleItem ? formatScheduleCellForExport(scheduleItem) : '-');
        });
        return row;
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`Schedule - ${sectionName}`, 10, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated: ${generatedAt}`, 10, 18);

      autoTable(doc, {
        startY: 22,
        head: [headerRow],
        body: bodyRows,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          valign: 'middle',
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: {
            cellWidth: 20,
            halign: 'center',
            fontStyle: 'bold',
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
      toast.success('Schedule PDF downloaded successfully.');
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
              {/* Debug Section - Remove this after fixing */}
              {schedules.length > 0 && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-bold text-yellow-800 mb-2">Debug: All Schedules ({schedules.length} total)</h3>
                  <div className="text-xs text-yellow-700 space-y-1 max-h-40 overflow-y-auto">
                    {schedules.map((sched: any, idx: number) => {
                      const timePart = extractTimeFromISO(sched.startTime);
                      const key = `${sched.dayOfWeek}-${timePart}`;
                      const module = availableModules.find(m => m.gradeSubjectId === sched.gradeSubjectId);
                      const isInTimeSlots = TIME_SLOTS.includes(timePart as any);
                      return (
                        <div key={idx} className={isInTimeSlots ? 'text-green-700' : 'text-red-700 font-bold'}>
                          {idx + 1}. {sched.dayOfWeek} at {timePart} ({sched.startTime}) - {module?.name || 'No module'} - Key: {key}
                          {!isInTimeSlots && ' ⚠️ TIME NOT IN TIME_SLOTS!'}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-yellow-600 mt-2">
                    <strong>Green = showing in table</strong> | <strong className="text-red-700">Red = missing from table</strong>
                  </p>
                </div>
              )}
              
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
                        
                        // FIXED: Removed all SHORT BREAK logic that was causing schedules to not display
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
            {/* Sidebar Header */}
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

            {/* Category Filters */}
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

            {/* Available Modules */}
            <div className="p-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Available Modules ({filteredModules.length})
              </h4>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8 text-slate-500">Loading...</div>
                ) : filteredModules.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">No modules found</div>
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

            {/* Quick Tip */}
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
            // Find and remove from local state optimistically
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
                  // Restore on error
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
