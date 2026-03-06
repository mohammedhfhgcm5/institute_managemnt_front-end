import { useLocale } from "@/hooks/useLocale";
import { GraduationCap, Shield, Activity } from "lucide-react";
import { useState, useEffect } from "react";

function LiveStatus() {
  const [pulse, setPulse] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
        Online
      </span>
    </div>
  );
}

export function Footer() {
  const { text, isArabic } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative border-t border-border/40 overflow-hidden"
      style={{ background: "hsl(var(--card))" }}
    >
      {/* Top shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--primary)/.5) 40%, hsl(var(--primary)/.5) 60%, transparent 100%)",
        }}
      />

      {/* Faint background orb */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-16 w-64 opacity-[0.04] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, hsl(var(--primary)), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-2 px-6 py-3.5 sm:flex-row sm:justify-between sm:gap-0">
        {/* Left — Brand */}
        <div className="flex items-center gap-2.5">
          <div
            className="h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/.6) 100%)",
              boxShadow: "0 2px 8px hsl(var(--primary)/.25)",
            }}
          >
            <GraduationCap className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <div
            className={`flex items-center gap-1.5 ${isArabic ? "flex-row-reverse" : ""}`}
          >
            <span className="text-[11px] font-bold text-foreground/80 tracking-tight">
              {text("نظام إدارة المدرسة", "School Management System")}
            </span>
            <span className="text-muted-foreground/30 text-[10px]">·</span>
            <span className="text-[11px] text-muted-foreground/50 tabular-nums">
              v1.0.0
            </span>
          </div>
        </div>

        {/* Center — Copyright */}
        <p className="text-[11px] text-muted-foreground/50 tabular-nums select-none">
          © {year} {text("جميع الحقوق محفوظة", "All rights reserved")}
        </p>
      </div>
    </footer>
  );
}
