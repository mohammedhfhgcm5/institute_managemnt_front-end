import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Building2,
  CreditCard,
  Languages,
  LayoutDashboard,
  LogOut,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
} from "lucide-react";
import { usePlatformLogout, usePlatformUser } from "@/hooks/usePlatformAuth";
import { useTheme } from "@/context/ThemeContext";
import { usePlatformCopy } from "@/components/platform/usePlatformCopy";

export default function PlatformLayout() {
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const navigate = useNavigate();
  const user = usePlatformUser();
  const { c, isArabic, direction, toggleLanguage } = usePlatformCopy();
  const { theme, toggleTheme } = useTheme();
  const logout = usePlatformLogout(() =>
    navigate("/platform/login", { replace: true }),
  );

  const links = [
    { to: "/platform/dashboard", label: c("dashboard"), icon: LayoutDashboard },
    { to: "/platform/organizations", label: c("organizations"), icon: Building2 },
    { to: "/platform/subscriptions", label: c("subscriptions"), icon: CreditCard },
  ];

  return (
    <div
      className="min-h-screen bg-[#f6f8fc] text-slate-950 transition-colors duration-300 dark:bg-[#070b14] dark:text-slate-100"
      dir={direction}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/4 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-600/10" />
      </div>

      <aside
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={`fixed inset-y-0 z-30 hidden flex-col overflow-hidden border-slate-200/80 bg-white/90 text-slate-900 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-[width,background-color,border-color] duration-300 ease-out dark:border-white/10 dark:bg-[#090e19]/95 dark:text-white md:flex ${
          isArabic ? "right-0 border-l" : "left-0 border-r"
        }`}
        style={{ width: sidebarHovered ? 288 : 80 }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 top-8 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/20" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-600/15" />
        </div>

        <div className="relative border-b border-slate-200/80 px-[18px] py-6 dark:border-white/10">
          <div className="flex h-11 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-600/20 dark:shadow-blue-950/50">
              <Building2 className="h-5 w-5" />
            </div>
            <div
              className={`min-w-0 whitespace-nowrap transition-all duration-200 ${
                sidebarHovered
                  ? "translate-x-0 opacity-100"
                  : isArabic
                    ? "translate-x-3 opacity-0"
                    : "-translate-x-3 opacity-0"
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-300">
                {c("administration")}
              </p>
              <h1 className="mt-1 truncate text-lg font-bold">{c("portal")}</h1>
            </div>
          </div>
        </div>

        <nav className="relative flex-1 space-y-2 px-3 py-4">
          <p
            className={`overflow-hidden whitespace-nowrap px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 transition-all duration-200 dark:text-slate-500 ${
              sidebarHovered ? "h-8 opacity-100" : "h-0 py-0 opacity-0"
            }`}
          >
            {isArabic ? "مساحة العمل" : "Workspace"}
          </p>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group relative flex h-12 items-center overflow-hidden rounded-2xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20 dark:shadow-blue-950/35"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                }`
              }
            >
              <span className="flex w-14 shrink-0 items-center justify-center">
                <Icon className="h-5 w-5" />
              </span>
              <span
                className={`whitespace-nowrap transition-all duration-200 ${
                  sidebarHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                {label}
              </span>
              {!sidebarHovered && (
                <span
                  className={`pointer-events-none fixed z-50 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 ${
                    isArabic ? "right-[88px]" : "left-[88px]"
                  }`}
                >
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="relative m-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-2 backdrop-blur transition-colors dark:border-white/10 dark:bg-white/[0.05]">
          <div className={`flex items-center ${sidebarHovered ? "gap-3 px-1" : "justify-center"}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div
              className={`min-w-0 overflow-hidden whitespace-nowrap transition-all duration-200 ${
                sidebarHovered ? "w-48 opacity-100" : "w-0 opacity-0"
              }`}
            >
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{user?.email}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {user?.role?.replace("_", " ")}
              </p>
            </div>
          </div>
          <div className={`mt-2 grid gap-2 ${sidebarHovered ? "grid-cols-2" : "grid-cols-1"}`}>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-950 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {sidebarHovered && (theme === "dark" ? c("light") : c("dark"))}
            </button>
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-950 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <Languages className="h-4 w-4" />
              {isArabic ? "EN" : "AR"}
            </button>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-xs font-medium text-red-600 transition hover:bg-red-500/10 dark:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            {sidebarHovered && c("signOut")}
          </button>
        </div>
      </aside>

      <div className={`relative min-h-screen transition-[margin] duration-300 ${isArabic ? "md:mr-20" : "md:ml-20"}`}>
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/75 px-3 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b101b]/80 md:hidden">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold">{c("portal")}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={toggleTheme} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button onClick={toggleLanguage} className="rounded-xl px-2 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10">
                {isArabic ? "EN" : "AR"}
              </button>
            </div>
          </div>
          <nav className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-white/[0.05]">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[11px] font-medium transition ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-300"
                      : "text-slate-500 dark:text-slate-400"
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="relative mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8 xl:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
