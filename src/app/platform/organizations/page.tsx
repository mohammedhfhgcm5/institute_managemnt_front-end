import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PlatformGuard } from "@/components/platform/PlatformGuard";
import {
  PlatformError,
  PlatformModal,
  PlatformPagination,
} from "@/components/platform/PlatformModal";
import {
  useCreateOrganization,
  useDeleteOrganization,
  useOrganizations,
  useResetOrganizationAdminPassword,
  useUpdateOrganization,
} from "@/hooks/useOrganizations";
import { usePlatformRole } from "@/hooks/usePlatformAuth";
import type {
  CreateOrganizationDto,
  Organization,
  OrganizationCredentials,
} from "@/types/organization.types";
import { resolveAssetUrl } from "@/utils/assets";
import { useLocale } from "@/hooks/useLocale";
import { usePlatformCopy } from "@/components/platform/usePlatformCopy";

const emptyForm: CreateOrganizationDto = {
  nameAr: "",
  nameEn: "",
  type: "school",
  slug: "",
  email: "",
  phone: "",
  address: "",
  logo: "",
  adminPassword: "",
};

const MAX_LOGO_FILE_SIZE = 5 * 1024 * 1024;
function OrganizationForm({
  organization,
  onClose,
  onCreated,
}: {
  organization: Organization | null;
  onClose: () => void;
  onCreated: (credentials: OrganizationCredentials) => void;
}) {
  const { c, isArabic } = usePlatformCopy();
  const [form, setForm] = useState<CreateOrganizationDto>(emptyForm);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const create = useCreateOrganization();
  const update = useUpdateOrganization(organization?.id ?? 0);
  const mutation = organization ? update : create;

  useEffect(() => {
    if (organization) {
      setForm({
        nameAr: organization.nameAr || organization.name,
        nameEn: organization.nameEn || organization.name,
        type: organization.type === "institute" ? "institute" : "school",
        slug: organization.slug,
        email: organization.email,
        phone: organization.phone ?? "",
        address: organization.address ?? "",
        logo: organization.logo ?? "",
        adminPassword: "",
      });
      setLogoPreview(resolveAssetUrl(organization.logo) ?? "");
    } else {
      setForm(emptyForm);
      setLogoPreview("");
    }
    setLogoFile(null);
    setLogoError(null);
  }, [organization]);

  function selectLogo(file: File | undefined) {
    if (!file) return;

    setLogoError(null);
    if (!file.type.startsWith("image/")) {
      setLogoError(isArabic ? "يرجى اختيار ملف صورة صالح." : "Please select a valid image file.");
      return;
    }
    if (file.size > MAX_LOGO_FILE_SIZE) {
      setLogoError(isArabic ? "حجم الصورة يجب ألا يتجاوز 5 ميغابايت." : "Image size must not exceed 5 MB.");
      return;
    }

    if (logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const { logo: _logo, adminPassword, ...organizationDto } = form;
    if (organization) {
      update.mutate(
        { dto: organizationDto, logo: logoFile },
        { onSuccess: onClose },
      );
    } else {
      create.mutate(
        {
          dto: { ...organizationDto, adminPassword },
          logo: logoFile,
        },
        {
          onSuccess: (result) => {
            onClose();
            onCreated(result.credentials);
          },
        },
      );
    }
  }

  const field = (
    key: keyof CreateOrganizationDto,
    label: string,
    type = "text",
    required = false,
  ) => (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <input
        type={type}
        required={required}
        value={form[key] ?? ""}
        onChange={(event) =>
          setForm((current) => ({ ...current, [key]: event.target.value }))
        }
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.045] dark:text-white"
      />
    </label>
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {field("nameAr", c("nameAr"), "text", true)}
        {field("nameEn", c("nameEn"), "text", true)}
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            {c("organizationType")}
          </span>
          <select
            required
            value={form.type}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                type: event.target.value as CreateOrganizationDto["type"],
              }))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.045] dark:text-white"
          >
            <option value="school">{c("school")}</option>
            <option value="institute">{c("institute")}</option>
          </select>
        </label>
        {field("slug", c("slug"), "text", true)}
        {field("email", c("email"), "email", true)}
        {!organization &&
          field("adminPassword", c("adminPassword"), "password", true)}
        {field("phone", c("phone"))}
        <div className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            {c("logo")}
          </span>
          <label className="flex min-h-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-center transition hover:border-blue-500 hover:bg-blue-50 dark:border-white/15 dark:bg-white/[0.035] dark:hover:bg-blue-500/10">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt={c("logo")}
                className="h-24 w-24 rounded-xl object-contain"
              />
            ) : (
              <span className="text-sm text-slate-500">
                {c("chooseImage")}
              </span>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => selectLogo(event.target.files?.[0])}
              className="sr-only"
            />
          </label>
          <p className="mt-2 text-xs text-slate-500">
            {c("imageHint")}
          </p>
          {logoPreview && (
            <button
              type="button"
              onClick={() => {
                if (logoPreview.startsWith("blob:")) {
                  URL.revokeObjectURL(logoPreview);
                }
                setLogoFile(null);
                setLogoPreview("");
              }}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              {c("removeLogo")}
            </button>
          )}
          {logoError && (
            <p className="mt-2 text-sm text-red-600">{logoError}</p>
          )}
        </div>
      </div>
      {field("address", c("address"))}
      {organization && (
        <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
          {isArabic
            ? "حالة المؤسسة تتغير تلقائيًا حسب حالة اشتراكها."
            : "Organization status follows its subscription status automatically."}
        </p>
      )}
      <PlatformError error={mutation.error} />
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-medium transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
        >
          {c("cancel")}
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white disabled:opacity-50"
        >
          {mutation.isPending ? c("saving") : c("save")}
        </button>
      </div>
    </form>
  );
}

export default function PlatformOrganizationsPage() {
  const { isArabic, direction } = useLocale();
  const { c } = usePlatformCopy();
  const organizationName = (organization?: Organization | null) =>
    organization
      ? isArabic
        ? organization.nameAr || organization.name
        : organization.nameEn || organization.name
      : "";
  const organizationType = (organization?: Organization | null) =>
    organization
      ? isArabic
        ? organization.typeAr ||
          (organization.type === "institute" ? "معهد" : "مدرسة")
        : organization.typeEn ||
          (organization.type === "institute" ? "Institute" : "School")
      : "";
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Organization | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Organization | null>(null);
  const [resettingPassword, setResettingPassword] =
    useState<Organization | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [createdCredentials, setCreatedCredentials] =
    useState<OrganizationCredentials | null>(null);
  const organizations = useOrganizations({ page, limit: 10, search });
  const remove = useDeleteOrganization();
  const resetPassword = useResetOrganizationAdminPassword();
  const platformRole = usePlatformRole();

  function applySearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <PlatformGuard>
      <section dir={direction}>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">{c("portal")}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{c("organizations")}</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {c("organizationsSubtitle")}
            </p>
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
            {c("addOrganization")}
          </button>
        </div>

        <form onSubmit={applySearch} className="mb-5 flex max-w-xl gap-2">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={c("searchOrganizations")}
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.045]"
          />
          <button
            type="submit"
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 font-medium shadow-sm transition hover:border-blue-300 hover:text-blue-600 dark:border-white/10 dark:bg-white/[0.045]"
          >
            <Search className="h-4 w-4" />
            {c("search")}
          </button>
        </form>

        <PlatformError error={organizations.error} />
        <div className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/85 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.4)] backdrop-blur dark:border-white/10 dark:bg-white/[0.045]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-start text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                <tr>
                  {[
                    c("name"),
                    c("type"),
                    c("phone"),
                    c("email"),
                    c("studentsCount"),
                    c("status"),
                    c("actions"),
                  ].map((title) => (
                    <th key={title} className="px-5 py-4 font-semibold">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {organizations.isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      {c("loading")}
                    </td>
                  </tr>
                ) : organizations.data?.data.length ? (
                  organizations.data.data.map((organization) => (
                    <tr key={organization.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <td className="px-5 py-4 font-medium">
                        <Link
                          to={`/platform/organizations/${organization.id}`}
                          className="text-blue-700 hover:underline"
                        >
                          {organizationName(organization)}
                        </Link>
                      </td>
                      <td className="px-5 py-4">{organizationType(organization)}</td>
                      <td className="px-5 py-4">{organization.phone || "—"}</td>
                      <td className="px-5 py-4" dir="ltr">
                        {organization.email}
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        {organization._count?.students ?? 0}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            organization.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {organization.isActive ? c("active") : c("inactive")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(organization);
                              setFormOpen(true);
                            }}
                            className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"
                            aria-label={c("edit")}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {platformRole === "super_admin" && (
                            <button
                              type="button"
                              onClick={() => {
                                setNewPassword("");
                                resetPassword.reset();
                                setResettingPassword(organization);
                              }}
                              className="rounded-xl p-2 text-amber-600 transition hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-500/10"
                              aria-label="تغيير كلمة المرور"
                              title="تغيير كلمة مرور مدير المؤسسة"
                            >
                              <KeyRound className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeleting(organization)}
                            className="rounded-xl p-2 text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                            aria-label={c("delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      {c("noOrganizations")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PlatformPagination
            page={page}
            totalPages={organizations.data?.totalPages ?? 1}
            onChange={setPage}
          />
        </div>

        <PlatformModal
          open={formOpen}
          title={editing ? c("editOrganization") : c("addOrganization")}
          onClose={() => setFormOpen(false)}
        >
          <OrganizationForm
            organization={editing}
            onClose={() => setFormOpen(false)}
            onCreated={setCreatedCredentials}
          />
        </PlatformModal>

        <PlatformModal
          open={Boolean(createdCredentials)}
          title={isArabic ? "بيانات دخول المؤسسة" : "Organization credentials"}
          onClose={() => setCreatedCredentials(null)}
        >
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            {isArabic
              ? "احتفظ بهذه البيانات الآن. كلمة المرور لا يمكن عرضها مرة أخرى لأنها تُخزن مشفرة."
              : "Save these credentials now. The password cannot be displayed again because it is stored securely."}
          </p>
          <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
            <div>
              <span className="text-xs text-slate-500">{c("email")}</span>
              <p className="font-mono font-semibold" dir="ltr">
                {createdCredentials?.email}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500">{c("password")}</span>
              <p className="font-mono font-semibold" dir="ltr">
                {createdCredentials?.password}
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setCreatedCredentials(null)}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-white"
            >
              {isArabic ? "تم" : "Done"}
            </button>
          </div>
        </PlatformModal>

        <PlatformModal
          open={Boolean(resettingPassword)}
          title={isArabic ? "تغيير كلمة مرور مدير المؤسسة" : "Change organization admin password"}
          onClose={() => {
            setResettingPassword(null);
            setNewPassword("");
            resetPassword.reset();
          }}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!resettingPassword) return;
              resetPassword.mutate(
                {
                  id: resettingPassword.id,
                  newPassword,
                },
                {
                  onSuccess: () => {
                    setResettingPassword(null);
                    setNewPassword("");
                  },
                },
              );
            }}
            className="space-y-5"
          >
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isArabic ? "سيتم تغيير كلمة مرور مدير مؤسسة " : "Change the administrator password for "}
              <strong>{organizationName(resettingPassword)}</strong>.
            </p>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {isArabic ? "كلمة المرور الجديدة" : "New password"}
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.045]"
              />
            </label>
            <PlatformError error={resetPassword.error} />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setResettingPassword(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5"
              >
                {c("cancel")}
              </button>
              <button
                type="submit"
                disabled={resetPassword.isPending}
                className="rounded-xl bg-amber-600 px-5 py-2.5 text-white disabled:opacity-50"
              >
                {resetPassword.isPending
                  ? isArabic
                    ? "جارٍ التغيير..."
                    : "Changing..."
                  : isArabic
                    ? "تغيير"
                    : "Change"}
              </button>
            </div>
          </form>
        </PlatformModal>

        <PlatformModal
          open={Boolean(deleting)}
          title={isArabic ? "حذف المؤسسة" : "Delete organization"}
          onClose={() => setDeleting(null)}
        >
          <p className="text-slate-700 dark:text-slate-300">
            {isArabic ? "هل تريد حذف مؤسسة " : "Delete "}
            <strong>{organizationName(deleting)}</strong>
            {isArabic
              ? "؟ لا يمكن التراجع عن هذا الإجراء."
              : "? This action cannot be undone."}
          </p>
          <PlatformError error={remove.error} />
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="rounded-xl border border-slate-200 px-5 py-2.5 dark:border-white/10"
            >
              {c("cancel")}
            </button>
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() =>
                deleting &&
                remove.mutate(deleting.id, {
                  onSuccess: () => setDeleting(null),
                })
              }
              className="rounded-xl bg-red-600 px-5 py-2.5 text-white disabled:opacity-50"
            >
              {remove.isPending ? c("deleting") : c("delete")}
            </button>
          </div>
        </PlatformModal>
      </section>
    </PlatformGuard>
  );
}
