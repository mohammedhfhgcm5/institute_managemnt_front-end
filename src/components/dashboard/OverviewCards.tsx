import { useDashboardStats } from "@/hooks/api/useDashboard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  Bell,
  Building2,
  ClipboardCheck,
  GraduationCap,
  TrendingDown,
  Users,
  UserCircle,
  Wallet,
  Landmark,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "@/utils/formatters";
import { useLocale } from "@/hooks/useLocale";
import { cn } from "@/lib/utils";

interface StatCardAdvancedProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ElementType;
  color: string; // hex or css color
  bg: string; // background tint
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  size?: "normal" | "wide";
  badge?: string;
  badgeColor?: string;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  bg,
  trend,
  trendLabel,
  badge,
  badgeColor,
}: StatCardAdvancedProps) {
  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendColor =
    trend === "up" ? "#22c55e" : trend === "down" ? "#ef4444" : "#94a3b8";

  return (
    <div
      className="relative rounded-2xl border border-border/50 p-4 overflow-hidden group hover:border-border hover:shadow-md transition-all duration-200 cursor-default"
      style={{ background: "hsl(var(--card))" }}
    >
      {/* Radial glow */}
      <div
        className="absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-[0.12] group-hover:opacity-20 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 70%)`,
        }}
      />

      {/* Top row: icon + badge */}
      <div className="relative flex items-start justify-between mb-3">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: bg }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>

        {badge && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{
              background: `${badgeColor ?? color}18`,
              color: badgeColor ?? color,
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1 truncate">
          {title}
        </p>
        <p className="text-2xl font-bold text-foreground tabular-nums leading-none">
          {value}
        </p>

        {/* Description or trend */}
        <div className="flex items-center gap-1.5 mt-2 min-h-[18px]">
          {trend && trendLabel && (
            <span
              className="flex items-center gap-0.5 text-[11px] font-semibold"
              style={{ color: trendColor }}
            >
              <TrendIcon className="h-3 w-3" />
              {trendLabel}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-muted-foreground truncate">
              {description}
            </span>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300 rounded-b-2xl"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
    </div>
  );
}

export function OverviewCards() {
  const { text } = useLocale();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  if (!stats) return null;

  const attendanceRate = stats.todayAttendance.total
    ? (stats.todayAttendance.present / stats.todayAttendance.total) * 100
    : 0;

  const isProfit = stats.financial.netBalance >= 0;

  const cards: StatCardAdvancedProps[] = [
    {
      title: text("إجمالي الطلاب", "Total Students"),
      value: formatNumber(stats.overview.students.total),
      description: `${text("نشط", "Active")}: ${formatNumber(stats.overview.students.active)}`,
      icon: GraduationCap,
      color: "#0ea5e9",
      bg: "#0ea5e915",
      trend: "up",
      trendLabel: `${formatNumber(stats.overview.students.active)} ${text("نشط", "active")}`,
    },
    {
      title: text("إجمالي المعلمين", "Total Teachers"),
      value: formatNumber(stats.overview.teachers.total),
      description: `${text("نشط", "Active")}: ${formatNumber(stats.overview.teachers.active)}`,
      icon: Users,
      color: "#22c55e",
      bg: "#22c55e15",
      trend: "up",
      trendLabel: `${formatNumber(stats.overview.teachers.active)} ${text("نشط", "active")}`,
    },
    {
      title: text("أولياء الأمور", "Parents"),
      value: formatNumber(stats.overview.parents),
      icon: UserCircle,
      color: "#8b5cf6",
      bg: "#8b5cf615",
      trend: "neutral",
      trendLabel: text("مسجّل", "registered"),
    },
    {
      title: text("الشعب", "Sections"),
      value: formatNumber(stats.overview.sections),
      icon: Building2,
      color: "#a855f7",
      bg: "#a855f715",
      trend: "neutral",
      trendLabel: text("شعبة", "sections"),
    },
    {
      title: text("حضور اليوم", "Today's Attendance"),
      value: formatPercentage(attendanceRate),
      description: `${formatNumber(stats.todayAttendance.present)} ${text("من", "of")} ${formatNumber(stats.todayAttendance.total)}`,
      icon: ClipboardCheck,
      color: attendanceRate >= 80 ? "#10b981" : "#f97316",
      bg: attendanceRate >= 80 ? "#10b98115" : "#f9731615",
      trend: attendanceRate >= 80 ? "up" : "down",
      trendLabel:
        attendanceRate >= 80
          ? text("ممتاز", "Excellent")
          : text("يحتاج تحسين", "Needs improvement"),
      badge: attendanceRate >= 80 ? text("جيد", "Good") : text("منخفض", "Low"),
      badgeColor: attendanceRate >= 80 ? "#10b981" : "#f97316",
    },
    {
      title: text("إجمالي المدفوعات", "Total Paid"),
      value: formatCurrency(stats.financial.totalPaid),
      icon: Wallet,
      color: "#06b6d4",
      bg: "#06b6d415",
      trend: "up",
      trendLabel: text("مدفوع", "paid"),
    },
    {
      title: text("إجمالي المصروفات", "Total Expenses"),
      value: formatCurrency(stats.financial.totalExpenses),
      icon: TrendingDown,
      color: "#ef4444",
      bg: "#ef444415",
      trend: "down",
      trendLabel: text("منصرف", "spent"),
    },
    {
      title: text("صافي الرصيد", "Net Balance"),
      value: formatCurrency(Math.abs(stats.financial.netBalance)),
      icon: isProfit ? TrendingUp : TrendingDown,
      color: isProfit ? "#22c55e" : "#ef4444",
      bg: isProfit ? "#22c55e15" : "#ef444415",
      trend: isProfit ? "up" : "down",
      trendLabel: isProfit ? text("ربح", "Profit") : text("خسارة", "Loss"),
      badge: isProfit ? text("إيجابي", "Positive") : text("سلبي", "Negative"),
      badgeColor: isProfit ? "#22c55e" : "#ef4444",
    },
    {
      title: text("الإشعارات غير المقروءة", "Unread Notifications"),
      value: formatNumber(stats.notifications.unread),
      icon: Bell,
      color: stats.notifications.unread > 0 ? "#eab308" : "#94a3b8",
      bg: stats.notifications.unread > 0 ? "#eab30815" : "#94a3b815",
      trend: stats.notifications.unread > 0 ? "down" : "neutral",
      trendLabel:
        stats.notifications.unread > 0
          ? text("تحتاج مراجعة", "Need review")
          : text("لا يوجد جديد", "All clear"),
      badge:
        stats.notifications.unread > 0
          ? String(stats.notifications.unread)
          : undefined,
      badgeColor: "#eab308",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/50" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">
          {text("نظرة عامة", "Overview")}
        </span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {cards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>
    </div>
  );
}
