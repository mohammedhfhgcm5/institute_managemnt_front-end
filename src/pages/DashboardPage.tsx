import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useLocale } from "@/hooks/useLocale";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { text } = useLocale();
  const { user } = useAuth();
  const organization = user?.organization;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {organization?.logo && (
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-sm">
              <img
                src={organization.logo}
                alt={organization.name}
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {organization?.name || text("لوحة التحكم", "Dashboard")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {organization?.type ||
                text("لوحة تحكم المؤسسة", "Organization dashboard")}
            </p>
          </div>
        </div>
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
