import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useLocale } from "@/hooks/useLocale";

export default function DashboardPage() {
  const { text } = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          {text("لوحة التحكم", "Dashboard")}
        </h1>
      </div>

      <OverviewCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <AttendanceChart />
        <FinancialChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivities />
        <QuickActions />
      </div>
    </div>
  );
}
