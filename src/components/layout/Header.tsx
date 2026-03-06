import {
  Menu,
  Moon,
  Sun,
  LogOut,
  User,
  Languages,
  ChevronDown,
  Shield,
  Home,
  ChevronRight,
  Settings,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/hooks/useLocale";
import { getStatusLabel } from "@/utils/formatters";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { NotificationBell } from "../notifications/NotificationBell";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
}

// ── Route metadata ──────────────────────────────────────────────────
interface RouteInfo {
  ar: string;
  en: string;
  parent?: string;
  icon?: React.ElementType;
  color?: string;
}

const routeMeta: Record<string, RouteInfo> = {
  "/": { ar: "لوحة التحكم", en: "Dashboard", icon: Activity, color: "#6366f1" },
  "/students": { ar: "الطلاب", en: "Students", parent: "/", color: "#0ea5e9" },
  "/teachers": {
    ar: "المعلمون",
    en: "Teachers",
    parent: "/",
    color: "#8b5cf6",
  },
  "/parents": {
    ar: "أولياء الأمور",
    en: "Parents",
    parent: "/",
    color: "#ec4899",
  },
  "/courses": {
    ar: "المواد الدراسية",
    en: "Subjects",
    parent: "/",
    color: "#f59e0b",
  },
  "/sections": { ar: "الشعب", en: "Sections", parent: "/", color: "#10b981" },
  "/schedules": {
    ar: "الجداول",
    en: "Schedules",
    parent: "/",
    color: "#14b8a6",
  },
  "/assessments": {
    ar: "التقييمات",
    en: "Assessments",
    parent: "/",
    color: "#f97316",
  },
  "/attendance": {
    ar: "الحضور",
    en: "Attendance",
    parent: "/",
    color: "#22c55e",
  },
  "/grades": { ar: "الصفوف", en: "Grades", parent: "/", color: "#a855f7" },
  "/payments": {
    ar: "المدفوعات",
    en: "Payments",
    parent: "/",
    color: "#06b6d4",
  },
  "/expenses": {
    ar: "المصروفات",
    en: "Expenses",
    parent: "/",
    color: "#ef4444",
  },
  "/notifications": {
    ar: "الإشعارات",
    en: "Notifications",
    parent: "/",
    color: "#eab308",
  },
  "/reports": { ar: "التقارير", en: "Reports", parent: "/", color: "#3b82f6" },
  "/settings": {
    ar: "الإعدادات",
    en: "Settings",
    parent: "/",
    color: "#64748b",
  },
  "/profile": {
    ar: "الملف الشخصي",
    en: "Profile",
    parent: "/",
    color: "#6366f1",
  },
};

// ── Breadcrumb ──────────────────────────────────────────────────────
function Breadcrumb({
  pathname,
  isArabic,
}: {
  pathname: string;
  isArabic: boolean;
}) {
  const current = routeMeta[pathname];
  if (!current) return null;

  const crumbs: Array<{ href: string; label: string; color?: string }> = [];

  if (current.parent) {
    const parent = routeMeta[current.parent];
    if (parent)
      crumbs.push({
        href: current.parent,
        label: isArabic ? parent.ar : parent.en,
        color: parent.color,
      });
  }
  crumbs.push({
    href: pathname,
    label: isArabic ? current.ar : current.en,
    color: current.color,
  });

  return (
    <nav className="hidden md:flex items-center gap-1 text-sm">
      <Link
        to="/"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
          {i === crumbs.length - 1 ? (
            <span
              className="font-semibold px-2 py-0.5 rounded-md text-[12px]"
              style={{ color: crumb.color, background: `${crumb.color}18` }}
            >
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors text-[12px]"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

// ── IconButton with tooltip ─────────────────────────────────────────
function IconBtn({
  onClick,
  tooltip,
  children,
  className,
  isArabic,
}: {
  onClick?: () => void;
  tooltip: string;
  children: React.ReactNode;
  className?: string;
  isArabic?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-150",
        "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border/50",
        className,
      )}
    >
      {children}
      <span
        className={cn(
          "pointer-events-none absolute top-full mt-2 whitespace-nowrap rounded-lg px-2.5 py-1.5 z-50",
          "text-[11px] font-medium bg-popover text-popover-foreground border border-border shadow-lg",
          "opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-150",
          isArabic ? "right-0" : "left-0",
        )}
      >
        {tooltip}
      </span>
    </button>
  );
}

// ── Main Header ──────────────────────────────────────────────────────
export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, isArabic, text, toggleLanguage } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const userInitials = user?.email?.substring(0, 2).toUpperCase() ?? "US";
  const userName = user?.email?.split("@")[0] ?? "User";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between px-4 gap-3 transition-shadow duration-200",
        "border-b border-border/60",
        scrolled ? "shadow-md" : "shadow-none",
      )}
      style={{
        background: "hsl(var(--card) / 0.92)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
      }}
    >
      {/* ── LEFT ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border/50 transition-all duration-150"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <Breadcrumb pathname={location.pathname} isArabic={isArabic} />

        {/* Mobile page title fallback */}
        <span className="md:hidden text-sm font-semibold text-foreground truncate">
          {(() => {
            const r = routeMeta[location.pathname];
            return r ? (isArabic ? r.ar : r.en) : "";
          })()}
        </span>
      </div>

      {/* ── RIGHT ────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Language */}
        <IconBtn
          tooltip={isArabic ? "Switch to English" : "التبديل للعربية"}
          onClick={toggleLanguage}
          isArabic={isArabic}
        >
          <Languages className="h-4 w-4" />
        </IconBtn>

        {/* Theme */}
        <IconBtn
          tooltip={
            theme === "light"
              ? text("الوضع المظلم", "Dark mode")
              : text("الوضع الفاتح", "Light mode")
          }
          onClick={toggleTheme}
          isArabic={isArabic}
          className="overflow-hidden"
        >
          <span
            className="absolute inset-0 flex items-center justify-center transition-all duration-300"
            style={{
              opacity: theme === "light" ? 1 : 0,
              transform:
                theme === "light"
                  ? "rotate(0deg) scale(1)"
                  : "rotate(90deg) scale(0.5)",
            }}
          >
            <Moon className="h-4 w-4" />
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center transition-all duration-300"
            style={{
              opacity: theme === "dark" ? 1 : 0,
              transform:
                theme === "dark"
                  ? "rotate(0deg) scale(1)"
                  : "rotate(-90deg) scale(0.5)",
            }}
          >
            <Sun className="h-4 w-4" />
          </span>
        </IconBtn>

        {/* Notification bell */}
        <NotificationBell />

        {/* Divider */}
        <div className="h-6 w-px bg-border/50 mx-0.5" />

        {/* ── User menu ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all duration-150 hover:bg-accent border border-transparent hover:border-border/50 outline-none">
              {/* Avatar */}
              <div className="relative">
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-[12px] font-bold text-primary-foreground ring-2 ring-transparent group-hover:ring-primary/25 transition-all duration-200"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/.7) 100%)",
                    boxShadow: "0 2px 8px hsl(var(--primary)/.3)",
                  }}
                >
                  {userInitials}
                </div>
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card" />
              </div>

              {/* Name + role */}
              <div
                className={cn(
                  "hidden sm:block leading-none",
                  isArabic ? "text-right" : "text-left",
                )}
              >
                <p className="text-[12px] font-semibold text-foreground capitalize">
                  {userName}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                  <Shield className="h-2.5 w-2.5" />
                  {user?.role ? getStatusLabel(user.role) : "User"}
                </p>
              </div>

              <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform duration-200" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align={isArabic ? "start" : "end"}
            sideOffset={8}
            className="w-72 rounded-2xl p-0 overflow-hidden border-border shadow-xl"
            style={{ background: "hsl(var(--card))" }}
          >
            {/* Profile hero */}
            <div
              className="relative px-4 pt-5 pb-4 overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary)/.12) 0%, hsl(var(--primary)/.04) 100%)",
                borderBottom: "1px solid hsl(var(--border)/.6)",
              }}
            >
              {/* Decorative orb */}
              <div
                className="absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-20"
                style={{
                  background:
                    "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
                }}
              />

              <div className="relative flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-bold text-primary-foreground"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/.75) 100%)",
                      boxShadow: "0 4px 16px hsl(var(--primary)/.35)",
                    }}
                  >
                    {userInitials}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-card" />
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-foreground capitalize truncate">
                    {userName}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: "hsl(var(--primary)/.15)",
                        color: "hsl(var(--primary))",
                      }}
                    >
                      <Shield className="h-2.5 w-2.5" />
                      {user?.role ? getStatusLabel(user.role) : "User"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-600">
                      ● {text("متصل", "Online")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-2">
              <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group"
              >
                <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-muted flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <User className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {text("الملف الشخصي", "Profile")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {text("إدارة بياناتك", "Manage your account")}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    "ml-auto h-3.5 w-3.5 text-muted-foreground/40",
                    isArabic && "rotate-180",
                  )}
                />
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => navigate("/settings")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group"
              >
                <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-muted flex-shrink-0 group-hover:bg-violet-500/10 transition-colors">
                  <Settings className="h-3.5 w-3.5 text-muted-foreground group-hover:text-violet-500 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {text("الإعدادات", "Settings")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {text("تفضيلات النظام", "System preferences")}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    "ml-auto h-3.5 w-3.5 text-muted-foreground/40",
                    isArabic && "rotate-180",
                  )}
                />
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="bg-border/60 mx-2" />

            {/* Logout */}
            <div className="p-2">
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/8 group"
              >
                <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-destructive/8 flex-shrink-0">
                  <LogOut className="h-3.5 w-3.5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {text("تسجيل الخروج", "Sign out")}
                  </p>
                  <p className="text-[10px] text-destructive/70">
                    {text("إنهاء الجلسة الحالية", "End current session")}
                  </p>
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
