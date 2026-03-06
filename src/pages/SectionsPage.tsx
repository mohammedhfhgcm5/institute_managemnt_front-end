import { SectionList } from "@/components/sections/SectionList";
import { useLocale } from "@/hooks/useLocale";

export default function SectionsPage() {
  const { text } = useLocale();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{text("إدارة الشعب", "Section Management")}</h1>
      <SectionList />
    </div>
  );
}
