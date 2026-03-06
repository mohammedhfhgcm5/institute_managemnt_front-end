import { ScheduleList } from "@/components/schedules/ScheduleList";
import { useLocale } from "@/hooks/useLocale";

export default function SchedulePage() {
  const { text } = useLocale();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{text("إدارة الجداول", "Schedule Management")}</h1>
      <ScheduleList />
    </div>
  );
}
