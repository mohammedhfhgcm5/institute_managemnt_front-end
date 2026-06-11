import {
  AlertTriangle,
  Building2,
  CircleDollarSign,
  CreditCard,
} from "lucide-react";
import { PlatformGuard } from "@/components/platform/PlatformGuard";
import { PlatformError } from "@/components/platform/PlatformModal";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { usePlatformCopy } from "@/components/platform/usePlatformCopy";

export default function PlatformDashboardPage() {
  const { c, direction, isArabic } = usePlatformCopy();
  const organizations = useOrganizations({ page: 1, limit: 100 });
  const subscriptions = useSubscriptions({ page: 1, limit: 100 });

  const items = subscriptions.data?.data ?? [];
  const cards = [
    {
      label: c("totalOrganizations"),
      value: organizations.data?.total ?? organizations.data?.data?.length ?? 0,
      icon: Building2,
      color: "from-blue-500 to-cyan-400",
      glow: "bg-blue-500/20",
    },
    {
      label: c("activeSubscriptions"),
      value: items.filter((item) => item.status === "active").length,
      icon: CreditCard,
      color: "from-emerald-500 to-teal-400",
      glow: "bg-emerald-500/20",
    },
    {
      label: c("expiredSubscriptions"),
      value: items.filter((item) => item.status === "expired").length,
      icon: AlertTriangle,
      color: "from-rose-500 to-orange-400",
      glow: "bg-rose-500/20",
    },
    {
      label: c("totalRevenue"),
      value: `${new Intl.NumberFormat(isArabic ? "ar-SY" : "en-US").format(
        items.reduce((sum, item) => sum + Number(item.price || 0), 0),
      )} ${isArabic ? "ل.س" : "SYP"}`,
      icon: CircleDollarSign,
      color: "from-violet-500 to-fuchsia-400",
      glow: "bg-violet-500/20",
    },
  ];

  return (
    <PlatformGuard>
      <section dir={direction}>
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-white via-white to-blue-50/70 p-7 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)] dark:border-white/10 dark:from-white/[0.07] dark:via-white/[0.045] dark:to-blue-500/[0.06] sm:p-9">
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
              {c("portal")}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {c("dashboard")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              {c("dashboardSubtitle")}
            </p>
          </div>
        </div>
        <PlatformError error={organizations.error || subscriptions.error} />
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, color, glow }) => (
            <article
              key={label}
              className="group relative overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/85 p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.3)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_-28px_rgba(15,23,42,0.4)] dark:border-white/10 dark:bg-white/[0.05]"
            >
              <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl transition group-hover:scale-125 ${glow}`} />
              <div
                className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${color}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                {label}
              </p>
              <p className="relative mt-2 text-2xl font-bold tracking-tight">
                {organizations.isLoading || subscriptions.isLoading
                  ? "..."
                  : value}
              </p>
            </article>
          ))}
        </div>
      </section>
    </PlatformGuard>
  );
}
