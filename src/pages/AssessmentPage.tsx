import { AssessmentList } from "@/components/assessments/AssessmentList";

export default function AssessmentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assessment Management</h1>
      <AssessmentList />
    </div>
  );
}
