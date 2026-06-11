import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  UserRound,
  Users,
} from "lucide-react";
import { PlatformGuard } from "@/components/platform/PlatformGuard";
import { PlatformError } from "@/components/platform/PlatformModal";
import { usePlatformCopy } from "@/components/platform/usePlatformCopy";
import { useOrganization } from "@/hooks/useOrganizations";
import { resolveAssetUrl } from "@/utils/assets";
import type { SubscriptionStatus } from "@/types/subscription.types";

export default function PlatformOrganizationDetailsPage() {
  const { id } = useParams();
  const { c, isArabic, direction } = usePlatformCopy();
  const organizationId = Number(id);
  const organization = useOrganization(organizationId);
  const BackIcon = isArabic ? ArrowRight : ArrowLeft;

  const statusLabels: Record<SubscriptionStatus, string> = {
    active: c("activeStatus"),
    expired: c("expiredStatus"),
    paused: c("pausedStatus"),
  };
  const statusStyles: Record<SubscriptionStatus, string> = {
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    expired: "bg-red-500/10 text-red-600 dark:text-red-300",
    paused: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  };

  return (
    <PlatformGuard>
      <section dir={direction}>
        <Link
          to="/platform/organizations"
          className="mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-500/10 dark:text-blue-300"
        >
          <BackIcon className="h-4 w-4" />
          {c("backToOrganizations")}
        </Link>

        <PlatformError
          error={
            Number.isFinite(organizationId)
              ? organization.error
              : new Error(c("invalidOrganization"))
          }
        />

        {organization.isLoading ? (
          <div className="rounded-[1.75rem] border border-white/80 bg-white/80 p-10 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            {c("loading")}
          </div>
        ) : organization.data ? (
          <>
            <article className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-white via-white to-blue-50/70 p-7 shadow-[0_25px_70px_-40px_rgba(15,23,42,0.45)] dark:border-white/10 dark:from-white/[0.07] dark:via-white/[0.045] dark:to-blue-500/[0.07] sm:p-9">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-white/[0.06]">
                    {organization.data.logo ? (
                      <img
                        src={resolveAssetUrl(organization.data.logo) ?? ""}
                        alt={organization.data.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
                      {c("organization")}
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight">
                      {isArabic
                        ? organization.data.nameAr || organization.data.name
                        : organization.data.nameEn || organization.data.name}
                    </h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                      {organization.data.type}
                    </p>
                  </div>
                </div>
                <span
                  className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                    organization.data.isActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                      : "bg-slate-500/10 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {organization.data.isActive ? c("active") : c("inactive")}
                </span>
              </div>

              <dl className="relative mt-8 grid gap-4 border-t border-slate-200/70 pt-6 dark:border-white/10 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  [c("email"), organization.data.email, Mail],
                  [c("phone"), organization.data.phone || "—", Phone],
                  [c("slug"), organization.data.slug, Building2],
                  [c("address"), organization.data.address || "—", MapPin],
                ].map(([label, value, Icon]) => {
                  const DetailIcon = Icon as typeof Mail;
                  return (
                    <div key={String(label)} className="rounded-2xl bg-slate-50/80 p-4 dark:bg-white/[0.035]">
                      <DetailIcon className="h-4 w-4 text-blue-500" />
                      <dt className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">{String(label)}</dt>
                      <dd className="mt-1 truncate text-sm font-semibold">{String(value)}</dd>
                    </div>
                  );
                })}
              </dl>
            </article>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {[
                [c("users"), organization.data._count?.users ?? 0, Users, "from-blue-500 to-cyan-400"],
                [c("students"), organization.data._count?.students ?? 0, GraduationCap, "from-violet-500 to-fuchsia-400"],
                [c("teachers"), organization.data._count?.teachers ?? 0, UserRound, "from-emerald-500 to-teal-400"],
              ].map(([label, count, Icon, gradient]) => {
                const CountIcon = Icon as typeof Users;
                return (
                  <article key={String(label)} className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.045]">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white ${gradient}`}>
                      <CountIcon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{String(label)}</p>
                    <p className="mt-1 text-3xl font-bold">{String(count)}</p>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/85 shadow-sm dark:border-white/10 dark:bg-white/[0.045]">
              <h2 className="border-b border-slate-200/70 px-6 py-5 text-lg font-bold dark:border-white/10">
                {c("subscriptionHistory")}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-start text-sm">
                  <thead className="bg-slate-50/80 text-slate-500 dark:bg-white/[0.035] dark:text-slate-400">
                    <tr>
                      {[c("plan"), c("price"), c("startDate"), c("endDate"), c("status")].map((title) => (
                        <th key={title} className="px-5 py-4 font-semibold">{title}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                    {organization.data.subscriptions?.length ? (
                      organization.data.subscriptions.map((subscription) => (
                        <tr key={subscription.id} className="transition hover:bg-slate-50/70 dark:hover:bg-white/[0.025]">
                          <td className="px-5 py-4 font-semibold">{subscription.plan}</td>
                          <td className="px-5 py-4">{subscription.price}</td>
                          <td className="px-5 py-4">{new Date(subscription.startDate).toLocaleDateString(isArabic ? "ar-SY" : "en-US")}</td>
                          <td className="px-5 py-4">{new Date(subscription.endDate).toLocaleDateString(isArabic ? "ar-SY" : "en-US")}</td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[subscription.status]}`}>
                              {statusLabels[subscription.status]}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                          {c("noSubscriptionHistory")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </PlatformGuard>
  );
}
