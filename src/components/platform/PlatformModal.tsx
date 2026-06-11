import type { ReactNode } from "react";
import { X } from "lucide-react";
import { usePlatformCopy } from "./usePlatformCopy";

interface PlatformModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function PlatformModal({
  open,
  title,
  children,
  onClose,
}: PlatformModalProps) {
  const { direction, c } = usePlatformCopy();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
      dir={direction}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border border-white/20 bg-white shadow-[0_32px_100px_-30px_rgba(2,6,23,0.7)] dark:border-white/10 dark:bg-[#0c1220]">
        <div className="z-10 flex shrink-0 items-center justify-between border-b border-slate-200/70 bg-white/95 px-6 py-5 backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1220]/95">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label={c("close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 [scrollbar-color:#94a3b8_transparent] [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:bg-slate-400/80 hover:[&::-webkit-scrollbar-thumb]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-3 dark:[scrollbar-color:#475569_transparent] dark:[&::-webkit-scrollbar-thumb]:bg-slate-600/80 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-500"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function PlatformError({ error }: { error: unknown }) {
  const { c } = usePlatformCopy();
  if (!error) return null;
  return (
    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
      {error instanceof Error
        ? error.message
        : c("unexpectedError")}
    </p>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function PlatformPagination({
  page,
  totalPages,
  onChange,
}: PaginationProps) {
  const { c, isArabic } = usePlatformCopy();
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 dark:border-slate-800">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-blue-500/40"
      >
        {c("previous")}
      </button>
      <span className="text-sm text-slate-600 dark:text-slate-300">
        {isArabic ? `الصفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-blue-500/40"
      >
        {c("next")}
      </button>
    </div>
  );
}
