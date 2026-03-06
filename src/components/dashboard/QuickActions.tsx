import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/hooks/useLocale";
import {
  UserPlus,
  ClipboardCheck,
  CreditCard,
  FileText,
  Bell,
  BookPlus,
  Zap,
  ArrowUpRight,
} from "lucide-react";

const actions = [
  {
    title: { ar: "إضافة طالب", en: "Add Student" },
    desc: { ar: "تسجيل طالب جديد", en: "Register new student" },
    icon: UserPlus,
    href: "/students",
    color: "#0ea5e9",
  },
  {
    title: { ar: "تسجيل حضور", en: "Take Attendance" },
    desc: { ar: "سجّل حضور اليوم", en: "Record today's attendance" },
    icon: ClipboardCheck,
    href: "/attendance",
    color: "#22c55e",
  },
  {
    title: { ar: "إضافة دفعة", en: "Add Payment" },
    desc: { ar: "تسجيل دفعة مالية", en: "Log a payment" },
    icon: CreditCard,
    href: "/payments",
    color: "#eab308",
  },
  {
    title: { ar: "إنشاء تقرير", en: "Create Report" },
    desc: { ar: "توليد تقرير جديد", en: "Generate a new report" },
    icon: FileText,
    href: "/reports",
    color: "#a855f7",
  },
  {
    title: { ar: "إرسال إشعار", en: "Send Notification" },
    desc: { ar: "إرسال تنبيه للمستخدمين", en: "Notify users" },
    icon: Bell,
    href: "/notifications",
    color: "#f97316",
  },
  {
    title: { ar: "إضافة مادة", en: "Add Subject" },
    desc: { ar: "إضافة مادة دراسية جديدة", en: "Add a new subject" },
    icon: BookPlus,
    href: "/courses",
    color: "#6366f1",
  },
];

export function QuickActions() {
  const navigate = useNavigate();
  const { isArabic, text } = useLocale();

  return (
    <Card
      className="overflow-hidden border-border/60"
      style={{ background: "hsl(var(--card))" }}
    >
      <CardHeader className="pb-2 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "hsl(var(--primary) / 0.12)" }}
          >
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">
              {text("إجراءات سريعة", "Quick Actions")}
            </CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {text("وصول سريع للمهام الشائعة", "Fast access to common tasks")}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {actions.map((action) => (
            <button
              key={action.href}
              onClick={() => navigate(action.href)}
              className="group relative flex flex-col items-start gap-3 rounded-xl border border-border/50 p-3.5 text-left overflow-hidden transition-all duration-200 hover:border-border hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: "hsl(var(--muted) / 0.3)" }}
            >
              {/* Glow */}
              <div
                className="absolute -top-5 -right-5 h-16 w-16 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle, ${action.color}, transparent 70%)`,
                }}
              />

              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300 rounded-b-xl"
                style={{
                  background: `linear-gradient(90deg, ${action.color}, transparent)`,
                }}
              />

              {/* Icon row */}
              <div className="relative flex items-center justify-between w-full">
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `${action.color}18` }}
                >
                  <action.icon
                    className="h-4.5 w-4.5"
                    style={{ color: action.color }}
                  />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              {/* Text */}
              <div className="relative min-w-0 w-full">
                <p className="text-[12px] font-bold text-foreground leading-tight truncate">
                  {isArabic ? action.title.ar : action.title.en}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate leading-tight">
                  {isArabic ? action.desc.ar : action.desc.en}
                </p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
