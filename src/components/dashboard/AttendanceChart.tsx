import { useAttendanceSummary } from "@/hooks/api/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { formatNumber, formatPercentage } from "@/utils/formatters";
import { useLocale } from "@/hooks/useLocale";
import { useState } from "react";
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const getTopAbsenteeName = (
  item: Record<string, unknown>,
  index: number,
): string => {
  const studentName = item.studentName;
  if (typeof studentName === "string" && studentName.trim()) return studentName;
  const fullName = item.fullName;
  if (typeof fullName === "string" && fullName.trim()) return fullName;
  const firstName =
    typeof item.firstName === "string" ? item.firstName.trim() : "";
  const lastName =
    typeof item.lastName === "string" ? item.lastName.trim() : "";
  const combined = `${firstName} ${lastName}`.trim();
  if (combined) return combined;
  return `Student ${index + 1}`;
};

const getTopAbsenceCount = (item: Record<string, unknown>): number => {
  const absentCount = item.absentCount;
  if (typeof absentCount === "number" && Number.isFinite(absentCount))
    return absentCount;
  const totalAbsences = item.totalAbsences;
  if (typeof totalAbsences === "number" && Number.isFinite(totalAbsences))
    return totalAbsences;
  return 0;
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ background: entry.fill }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">
            {formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

type ViewMode = "bar" | "radial";

export function AttendanceChart() {
  const { text } = useLocale();
  const { data, isLoading } = useAttendanceSummary();
  const [view, setView] = useState<ViewMode>("bar");

  if (isLoading)
    return (
      <Card className="flex items-center justify-center min-h-[420px]">
        <LoadingSpinner />
      </Card>
    );
  if (!data) return null;

  const total = data.total || 1;
  const attendanceRate = data.attendanceRate ?? (data.present / total) * 100;
  const isGood = attendanceRate >= 80;

  const statCards = [
    {
      label: text("إجمالي السجلات", "Total Records"),
      value: formatNumber(data.total),
      icon: Users,
      color: "hsl(var(--primary))",
      bg: "hsl(var(--primary) / 0.1)",
      sub: text("سجل", "records"),
    },
    {
      label: text("حاضر", "Present"),
      value: formatNumber(data.present),
      icon: CheckCircle2,
      color: "#22c55e",
      bg: "#22c55e18",
      sub: `${((data.present / total) * 100).toFixed(1)}%`,
    },
    {
      label: text("غائب", "Absent"),
      value: formatNumber(data.absent),
      icon: AlertCircle,
      color: "#ef4444",
      bg: "#ef444418",
      sub: `${((data.absent / total) * 100).toFixed(1)}%`,
    },
    {
      label: text("نسبة الحضور", "Attendance Rate"),
      value: formatPercentage(attendanceRate),
      icon: isGood ? TrendingUp : TrendingDown,
      color: isGood ? "#22c55e" : "#f97316",
      bg: isGood ? "#22c55e18" : "#f9731618",
      sub: isGood
        ? text("ممتاز", "Excellent")
        : text("يحتاج تحسين", "Needs improvement"),
    },
  ];

  const chartData = [
    {
      name: text("الحضور", "Attendance"),
      present: data.present,
      late: data.late,
      excused: data.excused,
      absent: data.absent,
    },
  ];

  const radialData = [
    { name: text("حاضر", "Present"), value: data.present, fill: "#22c55e" },
    { name: text("متأخر", "Late"), value: data.late, fill: "#eab308" },
    { name: text("معذور", "Excused"), value: data.excused, fill: "#3b82f6" },
    { name: text("غائب", "Absent"), value: data.absent, fill: "#ef4444" },
  ];

  const maxAbsences = Math.max(
    ...data.topAbsentees.map((i) => getTopAbsenceCount(i)),
    1,
  );

  return (
    <Card
      className="overflow-hidden border-border/60"
      style={{ background: "hsl(var(--card))" }}
    >
      {/* Header */}
      <CardHeader className="pb-2 border-b border-border/40">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "hsl(var(--primary) / 0.12)" }}
            >
              <Users className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                {text("ملخص الحضور", "Attendance Summary")}
              </CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {text(
                  "نظرة عامة على سجلات الحضور والغياب",
                  "Overview of attendance & absence records",
                )}
              </p>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border/60 p-1 bg-muted/30">
            {(["bar", "radial"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1 rounded-md text-[11px] font-semibold transition-all duration-150",
                  view === v
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v === "bar" ? text("أعمدة", "Bar") : text("دائري", "Radial")}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {statCards.map((s, i) => (
            <div
              key={i}
              className="relative rounded-xl p-3 border border-border/50 overflow-hidden group hover:border-border transition-colors duration-150"
              style={{ background: "hsl(var(--muted) / 0.3)" }}
            >
              {/* Glow orb */}
              <div
                className="absolute -top-4 -right-4 h-14 w-14 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"
                style={{
                  background: `radial-gradient(circle, ${s.color}, transparent 70%)`,
                }}
              />
              <div className="relative">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center mb-2"
                  style={{ background: s.bg }}
                >
                  <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">
                  {s.label}
                </p>
                <p className="text-xl font-bold text-foreground tabular-nums leading-tight mt-0.5">
                  {s.value}
                </p>
                <p
                  className="text-[10px] mt-0.5 font-medium"
                  style={{ color: s.color }}
                >
                  {s.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Attendance rate progress bar */}
        <div
          className="rounded-xl border border-border/50 p-4"
          style={{ background: "hsl(var(--muted) / 0.2)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {text("معدل الحضور الكلي", "Overall Attendance Rate")}
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: isGood ? "#22c55e" : "#f97316" }}
            >
              {formatPercentage(attendanceRate)}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(attendanceRate, 100)}%`,
                background: isGood
                  ? "linear-gradient(90deg, #22c55e, #4ade80)"
                  : "linear-gradient(90deg, #f97316, #fb923c)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
            <span>0%</span>
            <span className="text-yellow-500 font-medium">
              80% {text("الحد الأدنى", "minimum")}
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          {view === "bar" ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "hsl(var(--muted) / 0.4)", radius: 6 }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                />
                <Bar
                  dataKey="present"
                  name={text("حاضر", "Present")}
                  fill="#22c55e"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="late"
                  name={text("متأخر", "Late")}
                  fill="#eab308"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="excused"
                  name={text("معذور", "Excused")}
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="absent"
                  name={text("غائب", "Absent")}
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="25%"
                outerRadius="90%"
                data={radialData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={6}
                  label={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </RadialBarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top absentees */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm font-semibold">
              {text("الأكثر غياباً", "Top Absentees")}
            </p>
          </div>

          {data.topAbsentees.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 rounded-xl border border-border/50 bg-muted/20 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-60" />
              <p className="text-sm text-muted-foreground">
                {text("لا توجد سجلات غياب.", "No absentee records found.")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.topAbsentees.slice(0, 5).map((item, index) => {
                const name = getTopAbsenteeName(item, index);
                const count = getTopAbsenceCount(item);
                const pct = (count / maxAbsences) * 100;
                const initials = name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();
                const colors = [
                  "#ef4444",
                  "#f97316",
                  "#eab308",
                  "#22c55e",
                  "#3b82f6",
                ];
                const color = colors[index % colors.length];

                return (
                  <div
                    key={`${name}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-border/50 px-3 py-2.5 hover:border-border transition-colors duration-150 group"
                    style={{ background: "hsl(var(--muted) / 0.2)" }}
                  >
                    {/* Rank */}
                    <span className="text-[11px] font-bold text-muted-foreground w-4 text-center flex-shrink-0">
                      #{index + 1}
                    </span>

                    {/* Avatar */}
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                      style={{ background: `${color}cc` }}
                    >
                      {initials}
                    </div>

                    {/* Name + bar */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {name}
                      </p>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </div>

                    {/* Count badge */}
                    <span
                      className="flex-shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold"
                      style={{ background: `${color}18`, color }}
                    >
                      {formatNumber(count)} {text("غ", "abs")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
