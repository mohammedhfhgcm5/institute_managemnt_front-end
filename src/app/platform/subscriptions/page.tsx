import { useEffect, useState, type FormEvent } from "react";
import { CalendarPlus, Pause, Pencil, Play, Plus, Search, Trash2 } from "lucide-react";
import { PlatformGuard } from "@/components/platform/PlatformGuard";
import {
  PlatformError,
  PlatformModal,
  PlatformPagination,
} from "@/components/platform/PlatformModal";
import { useOrganizations } from "@/hooks/useOrganizations";
import {
  useCreateSubscription,
  useDeleteSubscription,
  useExtendSubscription,
  useSubscriptions,
  useUpdateSubscriptionStatus,
  useUpdateSubscription,
} from "@/hooks/useSubscriptions";
import type {
  CreateSubscriptionDto,
  Subscription,
  SubscriptionStatus,
} from "@/types/subscription.types";
import { useLocale } from "@/hooks/useLocale";
import { usePlatformCopy } from "@/components/platform/usePlatformCopy";

const today = new Date().toISOString().slice(0, 10);

function addOneYear(dateValue: string): string {
  if (!dateValue) return "";
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year + 1, month - 1, day));

  // February 29 becomes February 28 when the following year is not a leap year.
  if (date.getUTCMonth() !== month - 1) {
    date.setUTCDate(0);
  }

  return date.toISOString().slice(0, 10);
}

const statusStyle: Record<SubscriptionStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  expired: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  paused: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

const emptyForm: CreateSubscriptionDto = {
  organizationId: 0,
  plan: "",
  price: 0,
  startDate: "",
  endDate: "",
};

function SubscriptionForm({
  subscription,
  onClose,
}: {
  subscription: Subscription | null;
  onClose: () => void;
}) {
  const { c, isArabic } = usePlatformCopy();
  const [form, setForm] = useState<CreateSubscriptionDto>(emptyForm);
  const organizations = useOrganizations({ page: 1, limit: 100 });
  const create = useCreateSubscription();
  const update = useUpdateSubscription(subscription?.id ?? 0);
  const mutation = subscription ? update : create;

  useEffect(() => {
    if (subscription) {
      setForm({
        organizationId: subscription.organizationId,
        plan: subscription.plan,
        price: Number(subscription.price),
        startDate: subscription.startDate.slice(0, 10),
        endDate: subscription.endDate.slice(0, 10),
      });
    } else {
      setForm(emptyForm);
    }
  }, [subscription]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (subscription) {
      update.mutate(form, { onSuccess: onClose });
    } else {
      create.mutate(form, { onSuccess: onClose });
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{c("organization")}</span>
          <select
            required
            value={form.organizationId || ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                organizationId: Number(event.target.value),
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.045]"
          >
            <option value="">{c("chooseOrganization")}</option>
            {organizations.data?.data.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {isArabic
                  ? organization.nameAr || organization.name
                  : organization.nameEn || organization.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{c("plan")}</span>
          <input
            required
            value={form.plan}
            onChange={(event) =>
              setForm((current) => ({ ...current, plan: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.045]"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{c("price")}</span>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={form.price}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                price: Number(event.target.value),
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.045]"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{c("startDate")}</span>
          <input
            type="date"
            required
            min={subscription ? undefined : today}
            value={form.startDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                startDate: event.target.value,
                endDate: addOneYear(event.target.value),
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.045]"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{c("endDate")}</span>
          <input
            type="date"
            required
            min={form.startDate || today}
            value={form.endDate}
            onChange={(event) =>
              setForm((current) => ({ ...current, endDate: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.045]"
          />
        </label>
      </div>
      <PlatformError error={mutation.error || organizations.error} />
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-2.5 font-medium dark:border-white/10">
          {c("cancel")}
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-white disabled:opacity-50"
        >
          {mutation.isPending ? c("saving") : c("save")}
        </button>
      </div>
    </form>
  );
}

function ExtendForm({
  subscription,
  onClose,
}: {
  subscription: Subscription;
  onClose: () => void;
}) {
  const { c } = usePlatformCopy();
  const [endDate, setEndDate] = useState(subscription.endDate.slice(0, 10));
  const extend = useExtendSubscription(subscription.id);

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        extend.mutate({ endDate }, { onSuccess: onClose });
      }}
    >
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{c("newEndDate")}</span>
        <input
          type="date"
          required
          min={subscription.endDate.slice(0, 10)}
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.045]"
        />
      </label>
      <PlatformError error={extend.error} />
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-2.5 dark:border-white/10">{c("cancel")}</button>
        <button type="submit" disabled={extend.isPending} className="rounded-xl bg-blue-600 px-5 py-2.5 text-white disabled:opacity-50">
          {extend.isPending ? c("extending") : c("extendSubscription")}
        </button>
      </div>
    </form>
  );
}

type ConfirmAction = {
  type: "status" | "delete";
  subscription: Subscription;
};

export default function PlatformSubscriptionsPage() {
  const { isArabic, direction } = useLocale();
  const { c } = usePlatformCopy();
  const statusLabel: Record<SubscriptionStatus, string> = {
    active: c("activeStatus"),
    expired: c("expiredStatus"),
    paused: c("pausedStatus"),
  };
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [extending, setExtending] = useState<Subscription | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const subscriptions = useSubscriptions({ page, limit: 10, search });
  const updateStatus = useUpdateSubscriptionStatus();
  const remove = useDeleteSubscription();
  const confirmMutation = confirm?.type === "status" ? updateStatus : remove;

  function applySearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function executeConfirm() {
    if (!confirm) return;
    if (confirm.type === "status") {
      updateStatus.mutate(
        {
          id: confirm.subscription.id,
          status:
            confirm.subscription.status === "paused" ? "active" : "paused",
        },
        { onSuccess: () => setConfirm(null) },
      );
      return;
    }
    remove.mutate(confirm.subscription.id, {
      onSuccess: () => setConfirm(null),
    });
  }

  return (
    <PlatformGuard>
      <section dir={direction}>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">{c("portal")}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{c("subscriptions")}</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">{c("subscriptionsSubtitle")}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            {c("addSubscription")}
          </button>
        </div>

        <form onSubmit={applySearch} className="mb-5 flex max-w-xl gap-2">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={c("searchSubscriptions")}
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.045]"
          />
          <button type="submit" className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 font-medium dark:border-white/10 dark:bg-white/[0.045]">
            <Search className="h-4 w-4" />
            {c("search")}
          </button>
        </form>

        <PlatformError error={subscriptions.error} />
        <div className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/85 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.4)] backdrop-blur dark:border-white/10 dark:bg-white/[0.045]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-start text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                <tr>
                  {[c("organization"), c("plan"), c("price"), c("startDate"), c("endDate"), c("status"), c("actions")].map((title) => (
                    <th key={title} className="px-5 py-4 font-semibold">{title}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subscriptions.isLoading ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center">{c("loading")}</td></tr>
                ) : subscriptions.data?.data.length ? (
                  subscriptions.data.data.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <td className="px-5 py-4 font-medium">
                        {subscription.organization
                          ? isArabic
                            ? subscription.organization.nameAr || subscription.organization.name
                            : subscription.organization.nameEn || subscription.organization.name
                          : `#${subscription.organizationId}`}
                      </td>
                      <td className="px-5 py-4">{subscription.plan}</td>
                      <td className="px-5 py-4">{subscription.price}</td>
                      <td className="px-5 py-4">{new Date(subscription.startDate).toLocaleDateString(isArabic ? "ar-SY" : "en-US")}</td>
                      <td className="px-5 py-4">{new Date(subscription.endDate).toLocaleDateString(isArabic ? "ar-SY" : "en-US")}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle[subscription.status]}`}>
                          {statusLabel[subscription.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button type="button" onClick={() => { setEditing(subscription); setFormOpen(true); }} className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10" aria-label={c("edit")}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => setExtending(subscription)} className="rounded-xl p-2 text-violet-600 transition hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-500/10" aria-label={c("extendSubscription")}>
                            <CalendarPlus className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={subscription.status === "expired"}
                            onClick={() => setConfirm({ type: "status", subscription })}
                            className={`rounded-lg p-2 disabled:opacity-30 ${
                              subscription.status === "paused"
                                ? "text-emerald-600 hover:bg-emerald-50"
                                : "text-amber-600 hover:bg-amber-50"
                            }`}
                            aria-label={subscription.status === "paused" ? c("activate") : c("pause")}
                          >
                            {subscription.status === "paused" ? (
                              <Play className="h-4 w-4" />
                            ) : (
                              <Pause className="h-4 w-4" />
                            )}
                          </button>
                          <button type="button" onClick={() => setConfirm({ type: "delete", subscription })} className="rounded-xl p-2 text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10" aria-label={c("delete")}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">{c("noSubscriptions")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <PlatformPagination page={page} totalPages={subscriptions.data?.totalPages ?? 1} onChange={setPage} />
        </div>

        <PlatformModal open={formOpen} title={editing ? c("editSubscription") : c("addSubscription")} onClose={() => setFormOpen(false)}>
          <SubscriptionForm subscription={editing} onClose={() => setFormOpen(false)} />
        </PlatformModal>

        <PlatformModal open={Boolean(extending)} title={c("extendSubscription")} onClose={() => setExtending(null)}>
          {extending && <ExtendForm subscription={extending} onClose={() => setExtending(null)} />}
        </PlatformModal>

        <PlatformModal
          open={Boolean(confirm)}
          title={
            confirm?.type === "status"
              ? confirm.subscription.status === "paused"
                ? c("activateSubscription")
                : c("pauseSubscription")
              : c("deleteSubscription")
          }
          onClose={() => setConfirm(null)}
        >
          <p className="text-slate-700 dark:text-slate-300">
            {confirm?.type === "status"
              ? confirm.subscription.status === "paused"
                ? c("activatePrompt")
                : c("pausePrompt")
              : c("deleteSubscriptionPrompt")}
          </p>
          <PlatformError error={confirmMutation.error} />
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setConfirm(null)} className="rounded-xl border border-slate-200 px-5 py-2.5 dark:border-white/10">{c("cancel")}</button>
            <button
              type="button"
              disabled={confirmMutation.isPending}
              onClick={executeConfirm}
              className={`rounded-xl px-5 py-2.5 text-white disabled:opacity-50 ${
                confirm?.type === "status"
                  ? confirm.subscription.status === "paused"
                    ? "bg-emerald-600"
                    : "bg-amber-600"
                  : "bg-red-600"
              }`}
            >
              {confirmMutation.isPending ? c("processing") : c("confirm")}
            </button>
          </div>
        </PlatformModal>
      </section>
    </PlatformGuard>
  );
}
