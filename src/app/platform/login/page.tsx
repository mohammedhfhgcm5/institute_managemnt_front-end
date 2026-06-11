import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Languages,
  LockKeyhole,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
} from "lucide-react";
import { usePlatformLogin } from "@/hooks/usePlatformAuth";
import { platformAuthService } from "@/services/platform-auth.service";
import { PlatformError } from "@/components/platform/PlatformModal";
import { usePlatformCopy } from "@/components/platform/usePlatformCopy";
import { useTheme } from "@/context/ThemeContext";

export default function PlatformLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { c, isArabic, direction, toggleLanguage } = usePlatformCopy();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = usePlatformLogin(() => {
    const requested = (location.state as { from?: string } | null)?.from;
    navigate(requested || "/platform/dashboard", { replace: true });
  });

  if (platformAuthService.isAuthenticated()) {
    return <Navigate to="/platform/dashboard" replace />;
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <main
      className="relative flex min-h-screen overflow-hidden bg-[#f4f7fb] text-slate-950 transition-colors dark:bg-[#060914] dark:text-white"
      dir={direction}
    >
      <div className="absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[36rem] w-[36rem] rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.05)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.45)_100%)]" />
      </div>

      <div className="absolute top-5 z-20 flex items-center gap-2 ltr:right-5 rtl:left-5">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/70 text-slate-600 shadow-sm backdrop-blur transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300"
          aria-label={theme === "dark" ? c("light") : c("dark")}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 text-xs font-bold text-slate-600 shadow-sm backdrop-blur transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300"
        >
          <Languages className="h-4 w-4" />
          {isArabic ? "EN" : "AR"}
        </button>
      </div>

      <section className="relative z-10 hidden w-1/2 flex-col justify-between overflow-hidden border-slate-200/80 bg-gradient-to-br from-white via-blue-50 to-violet-100/80 p-12 text-slate-950 transition-colors duration-300 dark:border-white/10 dark:from-[#09142f] dark:via-[#030819] dark:to-[#190c3f] dark:text-white lg:flex ltr:border-r rtl:border-l xl:p-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.055)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] dark:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)]" />
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-400/25 blur-3xl dark:bg-blue-500/20" />
        <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-600/20" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-xl shadow-blue-500/25 dark:shadow-blue-950/60">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-blue-600 dark:text-blue-300">{c("administration")}</p>
            <h1 className="mt-1 text-xl font-bold">{c("portal")}</h1>
          </div>
        </div>
        <div className="relative max-w-xl">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200/80 bg-white/70 shadow-lg shadow-blue-500/10 backdrop-blur dark:border-white/10 dark:bg-white/[0.08] dark:shadow-none">
            <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <h2 className="text-4xl font-bold leading-tight xl:text-5xl">
            {isArabic
              ? "أدر مؤسساتك باحتراف من مكان واحد"
              : "Run every organization from one command center"}
          </h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-slate-600 dark:text-slate-400">
            {isArabic
              ? "لوحة موحدة لمتابعة المؤسسات والاشتراكات والصلاحيات بوضوح وأمان."
              : "A unified workspace for organizations, subscriptions, access control, and operational clarity."}
          </p>
        </div>
        <div className="relative flex w-fit items-center gap-3 rounded-2xl border border-white/80 bg-white/60 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.045] dark:text-slate-400">
          <ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
          {c("secureAccess")}
        </div>
      </section>

      <section className="relative z-10 flex w-full items-center justify-center px-5 py-20 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">{c("administration")}</p>
                <p className="font-bold">{c("portal")}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/80 p-7 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/50 sm:p-9">
            <div className="mb-8">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">{c("welcomeBack")}</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">{c("loginTitle")}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{c("loginSubtitle")}</p>
            </div>

            <form className="space-y-5" onSubmit={submit}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{c("email")}</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.05] dark:text-white"
                  placeholder="admin@example.com"
                  dir="ltr"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{c("password")}</span>
                <div className="relative">
                  <LockKeyhole className="absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ltr:left-4 rtl:right-4" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.05] dark:text-white ltr:pl-11 ltr:pr-4 rtl:pl-4 rtl:pr-11"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </label>
              <PlatformError error={login.error} />
              <button
                type="submit"
                disabled={login.isPending}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {login.isPending ? c("signingIn") : c("signIn")}
                {!login.isPending && (
                  <ArrowRight className={`h-4 w-4 transition group-hover:translate-x-1 ${isArabic ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
