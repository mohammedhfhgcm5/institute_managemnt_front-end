import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { ScheduleBuilder } from "@/components/schedules/ScheduleBuilder";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSections } from "@/hooks/api/useSections";
import { Section } from "@/types/section.types";

export default function ScheduleBuilderPage() {
  const navigate = useNavigate();
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedSectionName, setSelectedSectionName] = useState<string>("");

  const { data: sectionsData, isLoading } = useSections();

  const sections = useMemo(() => {
    if (!sectionsData) return [];
    if (Array.isArray(sectionsData)) return sectionsData as Section[];
    if (
      typeof sectionsData === "object" &&
      "data" in sectionsData &&
      Array.isArray(sectionsData.data)
    ) {
      return sectionsData.data as Section[];
    }
    return [];
  }, [sectionsData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <LayoutGrid className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Schedule Builder</h1>
            <p className="text-sm text-slate-500">Build schedules for a specific section.</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/schedules")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Schedules
        </Button>
      </div>

      {!selectedSectionId ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Select a section to build its schedule
          </label>
          {isLoading ? (
            <div className="py-4 text-center text-slate-500">Loading sections...</div>
          ) : sections.length === 0 ? (
            <div className="py-4 text-center text-slate-500">No sections available</div>
          ) : (
            <Select
              onValueChange={(value) => {
                const section = sections.find((item) => item.id === Number(value));
                if (!section) return;
                setSelectedSectionId(section.id);
                setSelectedSectionName(section.name);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a section..." />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id.toString()}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ) : (
        <>
          <ScheduleBuilder sectionId={selectedSectionId} sectionName={selectedSectionName} />
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSectionId(null);
                setSelectedSectionName("");
              }}
            >
              Change Section
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
