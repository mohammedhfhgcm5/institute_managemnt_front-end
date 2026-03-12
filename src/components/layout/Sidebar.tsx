import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useLocale } from "@/hooks/useLocale";
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
  Wallet,
  Receipt,
  Bell,
  BarChart3,
  Settings,
  UserCircle,
  X,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useCallback } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  title: { ar: string; en: string };
  href: string;
  icon: React.ElementType;
  permission?: string;
  group?: string;
}

const navGroups = {
  core: { ar: "Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©", en: "Core" },
  people: { ar: "Ø§Ù„Ø£Ø´Ø®Ø§Øµ", en: "People" },
  academic: { ar: "Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠ", en: "Academic" },
  finance: { ar: "Ø§Ù„Ù…Ø§Ù„ÙŠØ©", en: "Finance" },
  system: { ar: "Ø§Ù„Ù†Ø¸Ø§Ù…", en: "System" },
};

const navItems: NavItem[] = [
  {
    title: { ar: "Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…", en: "Dashboard" },
    href: "/",
    icon: LayoutDashboard,
    group: "core",
  },
  {
    title: { ar: "Ø§Ù„Ø·Ù„Ø§Ø¨", en: "Students" },
    href: "/students",
    icon: GraduationCap,
    permission: "canManageStudents",
    group: "people",
  },
  {
    title: { ar: "Ø§Ù„Ù…Ø¹Ù„Ù…ÙˆÙ†", en: "Teachers" },
    href: "/teachers",
    icon: Users,
    permission: "canManageTeachers",
    group: "people",
  },
  {
    title: { ar: "Ø£ÙˆÙ„ÙŠØ§Ø¡ Ø§Ù„Ø£Ù…ÙˆØ±", en: "Parents" },
    href: "/parents",
    icon: UserCircle,
    permission: "canManageParents",
    group: "people",
  },
  {
    title: { ar: "الاستقبال", en: "Reception" },
    href: "/reception",
    icon: Users,
    permission: "isAdmin",
    group: "people",
  },
  {
    title: { ar: "Ø§Ù„Ù…ÙˆØ§Ø¯ Ø§Ù„Ø¯Ø±Ø§Ø³ÙŠØ©", en: "Subjects" },
    href: "/courses",
    icon: BookOpen,
    permission: "canManageCourses",
    group: "academic",
  },
  {
    title: { ar: "Ø§Ù„Ø´Ø¹Ø¨", en: "Sections" },
    href: "/sections",
    icon: Building2,
    permission: "canManageAttendance",
    group: "academic",
  },
  {
    title: { ar: "Ø§Ù„Ø¬Ø¯Ø§ÙˆÙ„", en: "Schedules" },
    href: "/schedules",
    icon: CalendarDays,
    permission: "canManageAttendance",
    group: "academic",
  },
  {
    title: { ar: "Ø§Ù„ØªÙ‚ÙŠÙŠÙ…Ø§Øª", en: "Assessments" },
    href: "/assessments",
    icon: ClipboardList,
    permission: "canManageGrades",
    group: "academic",
  },
  {
    title: { ar: "Ø§Ù„Ø­Ø¶ÙˆØ±", en: "Attendance" },
    href: "/attendance",
    icon: ClipboardCheck,
    permission: "canManageAttendance",
    group: "academic",
  },
  {
    title: { ar: "Ø§Ù„ØµÙÙˆÙ", en: "Grades" },
    href: "/grades",
    icon: FileSpreadsheet,
    permission: "canManageGrades",
    group: "academic",
  },
  {
    title: { ar: "Ø§Ù„Ù…Ø¯ÙÙˆØ¹Ø§Øª", en: "Payments" },
    href: "/payments",
    icon: CreditCard,
    permission: "canManagePayments",
    group: "finance",
  },
  {
    title: { ar: "Ø§Ù„Ø£Ù‚Ø³Ø§Ø·", en: "Tuition Fees" },
    href: "/tuition-fees",
    icon: Wallet,
    permission: "canManagePayments",
    group: "finance",
  },
  {
    title: { ar: "Ø§Ù„Ù…ØµØ±ÙˆÙØ§Øª", en: "Expenses" },
    href: "/expenses",
    icon: Receipt,
    permission: "canManageExpenses",
    group: "finance",
  },
  {
    title: { ar: "Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª", en: "Notifications" },
    href: "/notifications",
    icon: Bell,
    group: "system",
  },
  {
    title: { ar: "Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±", en: "Reports" },
    href: "/reports",
    icon: BarChart3,
    permission: "canManageReports",
    group: "system",
  },
  {
    title: { ar: "Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª", en: "Settings" },
    href: "/settings",
    icon: Settings,
    group: "system",
  },
];

const COLLAPSED_W = 64;
const EXPANDED_W = 260;
const MOBILE_MAX_W = 300;
const PEEK_PX = 20; // proximity in px from screen edge that triggers expand

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const permissions = usePermissions();
  const { isArabic, text } = useLocale();

  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHovered(true);
  }, []);
  const close = useCallback(() => {
    leaveTimer.current = setTimeout(() => setHovered(false), 220);
  }, []);

  // Proximity detection â€” mouse within PEEK_PX of the sidebar edge triggers expand
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (pinned) return;
      const dist = isArabic ? window.innerWidth - e.clientX : e.clientX;
      if (dist <= PEEK_PX) open();
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [isArabic, pinned, open]);

  const isExpanded = pinned || hovered;

  const filteredItems = navItems.filter(
    (item) =>
      !item.permission ||
      permissions[item.permission as keyof typeof permissions],
  );

  const groupedItems = Object.entries(navGroups)
    .map(([key, label]) => ({
      key,
      label,
      items: filteredItems.filter((i) => i.group === key),
    }))
    .filter((g) => g.items.length > 0);

  const toggleGroup = (key: string) =>
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const innerContent = (expanded: boolean, mobile: boolean) => (
    <>
      {/* â”€â”€ Header â”€â”€ */}
      <div className="relative flex h-16 items-center border-b border-border/60 px-3 gap-2 flex-shrink-0 overflow-hidden">
        {/* Logo mark */}
        <div
          className="relative flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/.7) 100%)",
            boxShadow: "0 4px 14px hsl(var(--primary)/.35)",
          }}
        >
          <GraduationCap className="h-4 w-4 text-primary-foreground" />
          <div className="absolute inset-0 opacity-25 bg-gradient-to-br from-white to-transparent" />
        </div>

        {/* Title */}
        <div
          className="flex-1 min-w-0"
          style={{
            opacity: expanded ? 1 : 0,
            transform: expanded ? "translateX(0)" : "translateX(-6px)",
            transition: "opacity 200ms ease, transform 200ms ease",
            pointerEvents: expanded ? "auto" : "none",
          }}
        >
          <h1 className="text-[13px] font-bold tracking-tight text-foreground leading-none truncate">
            {text("Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø¯Ø±Ø³Ø©", "School Admin")}
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wider uppercase truncate">
            {text("Ù†Ø¸Ø§Ù… Ù…ØªÙƒØ§Ù…Ù„", "Management System")}
          </p>
        </div>

        {/* Pin / close button */}
        <div
          style={{
            opacity: expanded ? 1 : 0,
            transition: "opacity 200ms ease",
            pointerEvents: expanded ? "auto" : "none",
          }}
        >
          {mobile ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-accent"
              onClick={() => setPinned((p) => !p)}
              title={pinned ? "Unpin sidebar" : "Pin sidebar open"}
            >
              {pinned ? (
                <PanelLeftClose className="h-3.5 w-3.5 text-primary" />
              ) : (
                <PanelLeftOpen className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* â”€â”€ Nav â”€â”€ */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
        {groupedItems.map(({ key, label, items }) => {
          const groupCollapsed = collapsedGroups[key];
          return (
            <div key={key} className="mb-1">
              {/* Group header */}
              <div
                style={{
                  maxHeight: expanded ? "32px" : "0px",
                  opacity: expanded ? 1 : 0,
                  marginBottom: expanded ? "2px" : "6px",
                  overflow: "hidden",
                  transition:
                    "max-height 220ms ease, opacity 180ms ease, margin 220ms ease",
                }}
              >
                <button
                  onClick={() => toggleGroup(key)}
                  className="w-full flex items-center justify-between px-2 py-1 rounded-md group hover:bg-accent/40 transition-colors"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                    {isArabic ? label.ar : label.en}
                  </span>
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 text-muted-foreground/40 transition-transform duration-200",
                      !groupCollapsed && "rotate-90",
                    )}
                  />
                </button>
              </div>

              {/* Separator between icon-only groups */}
              {!expanded && <div className="h-px bg-border/40 mx-2 mb-2" />}

              {/* Items */}
              <div
                style={{
                  maxHeight: groupCollapsed && expanded ? "0px" : "600px",
                  opacity: groupCollapsed && expanded ? 0 : 1,
                  overflow: "hidden",
                  transition: "max-height 220ms ease, opacity 180ms ease",
                }}
                className="space-y-0.5"
              >
                {items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={mobile ? onClose : undefined}
                      className={cn(
                        "group relative flex items-center rounded-lg transition-all duration-150 text-sm font-medium overflow-visible",
                        expanded
                          ? "gap-3 px-2 py-2.5"
                          : "justify-center py-2.5",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                      style={
                        isActive
                          ? { boxShadow: "0 2px 10px hsl(var(--primary)/.28)" }
                          : {}
                      }
                    >
                      {/* Active indicator */}
                      {isActive && expanded && (
                        <span
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary-foreground/50",
                            isArabic ? "right-0" : "left-0",
                          )}
                        />
                      )}

                      {/* Icon */}
                      <span
                        className={cn(
                          "flex-shrink-0 flex items-center justify-center rounded-md transition-all duration-150",
                          expanded ? "h-7 w-7" : "h-8 w-8",
                          isActive
                            ? "bg-primary-foreground/15"
                            : "group-hover:bg-accent-foreground/8",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </span>

                      {/* Label */}
                      <span
                        className="truncate whitespace-nowrap"
                        style={{
                          opacity: expanded ? 1 : 0,
                          maxWidth: expanded ? "180px" : "0px",
                          overflow: "hidden",
                          transition:
                            "opacity 180ms ease, max-width 220ms ease",
                          display: "block",
                        }}
                      >
                        {isArabic ? item.title.ar : item.title.en}
                      </span>

                      {/* Tooltip (icon-only mode) */}
                      {!expanded && (
                        <span
                          className={cn(
                            "pointer-events-none absolute z-[9999] whitespace-nowrap rounded-lg px-3 py-1.5",
                            "text-[11px] font-semibold shadow-lg border border-border",
                            "bg-popover text-popover-foreground",
                            "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                            isArabic ? "right-full mr-3" : "left-full ml-3",
                          )}
                        >
                          {isArabic ? item.title.ar : item.title.en}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* â”€â”€ Status strip â”€â”€ */}
      <div
        className="border-t border-border/60 flex items-center flex-shrink-0 overflow-hidden"
        style={{
          padding: expanded ? "10px 16px" : "10px 0",
          justifyContent: expanded ? "flex-start" : "center",
          background: "hsl(var(--muted)/.4)",
          transition: "padding 250ms ease",
        }}
      >
        <span className="relative flex-shrink-0 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span
          className="text-[11px] text-muted-foreground whitespace-nowrap overflow-hidden"
          style={{
            maxWidth: expanded ? "200px" : "0px",
            opacity: expanded ? 1 : 0,
            marginLeft: expanded ? "8px" : "0px",
            transition:
              "max-width 220ms ease, opacity 180ms ease, margin 220ms ease",
          }}
        >
          {text("Ø§Ù„Ù†Ø¸Ø§Ù… ÙŠØ¹Ù…Ù„", "System Online")}
        </span>
      </div>
    </>
  );

  return (
    <>
      {/* â”€â”€ Mobile backdrop â”€â”€ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* â”€â”€ Desktop hover sidebar â”€â”€ */}
      {/* Wrapper width follows sidebar open/collapse state */}
      <div
        className="hidden h-dvh flex-shrink-0 transition-[width] duration-300 ease-out lg:block"
        style={{ width: isExpanded ? EXPANDED_W : COLLAPSED_W }}
      >
        <aside
          onMouseEnter={open}
          onMouseLeave={close}
          className={cn(
            "z-50 flex h-full w-full flex-col",
            isArabic ? "border-l" : "border-r",
            "border-border/60",
          )}
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--card)/.98) 100%)",
            boxShadow:
              isExpanded && !pinned
                ? "4px 0 28px -4px hsl(var(--foreground)/.1)"
                : "none",
            transition: "box-shadow 260ms ease",
          }}
        >
          {innerContent(isExpanded, false)}
        </aside>
      </div>

      {/* â”€â”€ Mobile slide-in sidebar â”€â”€ */}
      <aside
        className={cn(
          "fixed top-0 z-50 h-full flex flex-col lg:hidden",
          isArabic ? "right-0 border-l" : "left-0 border-r",
          "border-border/60",
          isOpen
            ? "translate-x-0"
            : isArabic
              ? "translate-x-full"
              : "-translate-x-full",
        )}
        style={{
          width: `min(86vw, ${MOBILE_MAX_W}px)`,
          maxWidth: EXPANDED_W,
          transition: "transform 300ms cubic-bezier(0.4,0,0.2,1)",
          background:
            "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--card)/.98) 100%)",
        }}
      >
        {innerContent(true, true)}
      </aside>
    </>
  );
}
