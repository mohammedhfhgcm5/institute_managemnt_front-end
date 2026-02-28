import { ScheduleList } from "@/components/schedules/ScheduleList";

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Schedule Management</h1>
      <ScheduleList />
    </div>
  );
}
