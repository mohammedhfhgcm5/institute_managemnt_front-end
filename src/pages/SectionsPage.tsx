import { SectionList } from "@/components/sections/SectionList";

export default function SectionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Section Management</h1>
      <SectionList />
    </div>
  );
}
