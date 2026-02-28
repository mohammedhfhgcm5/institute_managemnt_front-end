import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  ClipboardCheck,
  FileSpreadsheet,
  CreditCard,
  Receipt,
  Bell,
  BarChart3,
  Settings,
  UserCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
}

const navItems: NavItem[] = [
  { title: "لوحة التحكم", href: "/", icon: LayoutDashboard },
  {
    title: "الطلاب",
    href: "/students",
    icon: GraduationCap,
    permission: "canManageStudents",
  },
  {
    title: "المعلمون",
    href: "/teachers",
    icon: Users,
    permission: "canManageTeachers",
  },
  {
    title: "أولياء الأمور",
    href: "/parents",
    icon: UserCircle,
    permission: "canManageParents",
  },
  {
    title: "المواد الدراسية",
    href: "/courses",
    icon: BookOpen,
    permission: "canManageCourses",
  },
  {
    title: "Sections",
    href: "/sections",
    icon: Building2,
    permission: "canManageAttendance",
  },
  {
    title: "Schedules",
    href: "/schedules",
    icon: CalendarDays,
    permission: "canManageAttendance",
  },
  {
    title: "Assessments",
    href: "/assessments",
    icon: ClipboardList,
    permission: "canManageGrades",
  },
  {
    title: "الحضور",
    href: "/attendance",
    icon: ClipboardCheck,
    permission: "canManageAttendance",
  },
  {
    title: "الصفوف",
    href: "/grades",
    icon: FileSpreadsheet,
    permission: "canManageGrades",
  },
  {
    title: "المدفوعات",
    href: "/payments",
    icon: CreditCard,
    permission: "canManagePayments",
  },
  {
    title: "المصروفات",
    href: "/expenses",
    icon: Receipt,
    permission: "canManageExpenses",
  },
  { title: "الإشعارات", href: "/notifications", icon: Bell },
  {
    title: "التقارير",
    href: "/reports",
    icon: BarChart3,
    permission: "canManageReports",
  },
  { title: "الإعدادات", href: "/settings", icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const permissions = usePermissions();

  const filteredItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return permissions[item.permission as keyof typeof permissions];
  });

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-64 bg-card border-l shadow-lg transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h1 className="text-lg font-bold text-primary">إدارة المدرسة</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex h-[calc(100vh-4rem)] flex-col gap-1 overflow-y-auto p-3">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
