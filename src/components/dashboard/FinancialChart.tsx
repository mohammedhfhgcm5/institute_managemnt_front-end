import { useFinancialSummary } from "@/hooks/api/useDashboard";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/utils/formatters";
import { useLocale } from "@/hooks/useLocale";
import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm px-3 py-2 shadow-xl text-sm">
      <p className="font-semibold text-foreground">{payload[0].name}</p>
      <p className="text-muted-foreground">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
};

type ViewMode = "bar" | "pie";

const PIE_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#f97316",
  "#a855f7",
  "#14b8a6",
];

export function FinancialChart() {
  const { text } = useLocale();
  const { data, isLoading } = useFinancialSummary();
  const [view, setView] = useState<ViewMode>("bar");

  if (isLoading)
    return (
      <Card className="flex items-center justify-center min-h-[420px]">
        <LoadingSpinner />
      </Card>
    );
  if (!data) return null;

  const isProfit = data.net >= 0;
  const netColor = isProfit ? "#22c55e" : "#ef4444";
  const NetIcon = isProfit ? TrendingUp : TrendingDown;
  const netBg = isProfit ? "#22c55e15" : "#ef444415";

  const monthlyData = [
    {
      label: `${data.month}/${data.year}`,
      income: data.income,
      expenses: data.expenses,
      net: data.net,
    },
  ];

  const statCards = [
    {
      label: text("الدخل", "Income"),
      value: formatCurrency(data.income),
      icon: ArrowUpRight,
      color: "#22c55e",
      bg: "#22c55e15",
      sub: text("إجمالي الإيرادات", "Total revenue"),
    },
    {
      label: text("المصروفات", "Expenses"),
      value: formatCurrency(data.expenses),
      icon: ArrowDownRight,
      color: "#ef4444",
      bg: "#ef444415",
      sub: text("إجمالي النفقات", "Total spending"),
    },
    {
      label: text("الصافي", "Net"),
      value: formatCurrency(Math.abs(data.net)),
      icon: NetIcon,
      color: netColor,
      bg: netBg,
      sub: isProfit
        ? text("ربح صافي", "Net profit")
        : text("خسارة صافية", "Net loss"),
      prefix: isProfit ? "+" : "-",
    },
  ];

  // Pie data from expenses by category
  const pieData = data.expensesByCategory.map((item, i) => ({
    name: item.category,
    value: item.amount,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const totalExpenses =
    data.expensesByCategory.reduce((s, i) => s + i.amount, 0) || 1;

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
              <Wallet className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                {text("الملخص المالي الشهري", "Monthly Financial Summary")}
              </CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {data.month}/{data.year} —{" "}
                {text(
                  "نظرة عامة على الإيرادات والمصروفات",
                  "Revenue & expenses overview",
                )}
              </p>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border/60 p-1 bg-muted/30">
            {(["bar", "pie"] as ViewMode[]).map((v) => (
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
                {v === "bar" ? text("أعمدة", "Bar") : text("دائري", "Pie")}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {statCards.map((s, i) => (
            <div
              key={i}
              className="relative rounded-xl p-4 border border-border/50 overflow-hidden group hover:border-border transition-colors duration-150"
              style={{ background: "hsl(var(--muted) / 0.3)" }}
            >
              <div
                className="absolute -top-5 -right-5 h-16 w-16 rounded-full opacity-15 group-hover:opacity-25 transition-opacity"
                style={{
                  background: `radial-gradient(circle, ${s.color}, transparent 70%)`,
                }}
              />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {s.label}
                  </p>
                  <p className="text-xl font-bold text-foreground tabular-nums leading-tight mt-1">
                    {s.prefix && (
                      <span style={{ color: s.color }}>{s.prefix}</span>
                    )}
                    {s.value}
                  </p>
                  <p
                    className="text-[10px] mt-1 font-medium"
                    style={{ color: s.color }}
                  >
                    {s.sub}
                  </p>
                </div>
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: s.bg }}
                >
                  <s.icon className="h-4 w-4" style={{ color: s.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Income vs Expenses ratio bar */}
        <div
          className="rounded-xl border border-border/50 p-4"
          style={{ background: "hsl(var(--muted) / 0.2)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {text("نسبة الدخل إلى المصروفات", "Income vs Expenses ratio")}
            </span>
            <span
              className="text-[11px] font-bold"
              style={{ color: isProfit ? "#22c55e" : "#ef4444" }}
            >
              {data.income > 0
                ? ((data.expenses / data.income) * 100).toFixed(1)
                : 0}
              % {text("من الدخل", "of income")}
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
            <div
              className="h-full rounded-l-full transition-all duration-700"
              style={{
                width: `${data.income > 0 ? Math.min((data.income / (data.income + data.expenses)) * 100, 100) : 50}%`,
                background: "linear-gradient(90deg, #22c55e, #4ade80)",
              }}
            />
            <div
              className="h-full rounded-r-full transition-all duration-700"
              style={{
                flex: 1,
                background: "linear-gradient(90deg, #f87171, #ef4444)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px]">
            <span className="text-emerald-500 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              {text("دخل", "Income")}
            </span>
            <span className="text-red-500 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />
              {text("مصروفات", "Expenses")}
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          {view === "bar" ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barCategoryGap="30%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    formatCurrency(v).replace(/(\.\d+)/, "")
                  }
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "hsl(var(--muted) / 0.4)", radius: 6 }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                />
                <Bar
                  dataKey="income"
                  name={text("الدخل", "Income")}
                  fill="#22c55e"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  name={text("المصروفات", "Expenses")}
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="net"
                  name={text("الصافي", "Net")}
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius="45%"
                  outerRadius="75%"
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expenses by category */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">
              {text("المصروفات حسب التصنيف", "Expenses by Category")}
            </p>
          </div>

          {data.expensesByCategory.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 rounded-xl border border-border/50 bg-muted/20 text-center">
              <Minus className="h-8 w-8 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">
                {text(
                  "لا توجد مصروفات مسجلة لهذا الشهر.",
                  "No expense categories found for this month.",
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.expensesByCategory.map((item, i) => {
                const pct = (item.amount / totalExpenses) * 100;
                const color = PIE_COLORS[i % PIE_COLORS.length];
                return (
                  <div
                    key={item.category}
                    className="flex items-center gap-3 rounded-xl border border-border/50 px-3 py-2.5 hover:border-border transition-colors duration-150 group"
                    style={{ background: "hsl(var(--muted) / 0.2)" }}
                  >
                    {/* Color dot */}
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />

                    {/* Category + bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground capitalize truncate">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </div>

                    {/* Amount */}
                    <span
                      className="flex-shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold"
                      style={{ background: `${color}18`, color }}
                    >
                      {formatCurrency(item.amount)}
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
