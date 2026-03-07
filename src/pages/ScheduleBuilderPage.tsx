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
import { useGrades } from "@/hooks/api/useGrades";
import { useSectionsByGrade } from "@/hooks/api/useSections";
import { useLocale } from "@/hooks/useLocale";
import { Grade } from "@/types/grade.types";
import { Section } from "@/types/section.types";

export default function ScheduleBuilderPage() {
  const { text, isArabic } = useLocale();
  const navigate = useNavigate();
  const [selectedGradeId, setSelectedGradeId] = useState<number>(0);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedSectionName, setSelectedSectionName] = useState<string>("");

  const { data: gradesData, isLoading: isGradesLoading } = useGrades({
    page: 1,
    limit: 100,
  });
  const { data: sectionsData, isLoading: isSectionsLoading } =
    useSectionsByGrade(selectedGradeId);

  const grades = useMemo(
    () => ((gradesData?.data as Grade[] | undefined) ?? []),
    [gradesData]
  );
  const sections = useMemo(
    () => ((sectionsData as Section[] | undefined) ?? []),
    [sectionsData]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/15 p-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{text("Ù…Ù†Ø´Ø¦ Ø§Ù„Ø¬Ø¯Ø§ÙˆÙ„", "Schedule Builder")}</h1>
            <p className="text-sm text-muted-foreground">
              {text(
                "Ø§Ø®ØªØ± Ø§Ù„ØµÙ Ø£ÙˆÙ„Ø§Ù‹ Ø«Ù… Ø§Ø®ØªØ± Ø§Ù„Ø´Ø¹Ø¨Ø© Ù„Ø¨Ù†Ø§Ø¡ Ø¬Ø¯ÙˆÙ„Ù‡Ø§.",
                "Select grade first, then choose a section to build its schedule."
              )}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/schedules")}>
          <ArrowLeft className={isArabic ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
          {text("Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ø¬Ø¯Ø§ÙˆÙ„", "Back to Schedules")}
        </Button>
      </div>

      {!selectedSectionId ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {text("Ø§Ù„ØµÙ", "Grade")}
              </label>
              <Select
                value={selectedGradeId ? String(selectedGradeId) : undefined}
                onValueChange={(value) => {
                  setSelectedGradeId(Number(value));
                  setSelectedSectionId(null);
                  setSelectedSectionName("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isGradesLoading
                        ? text("Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙÙˆÙ...", "Loading grades...")
                        : text("Ø§Ø®ØªØ± Ø§Ù„ØµÙ...", "Choose grade...")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={String(grade.id)}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {text("Ø§Ù„Ø´Ø¹Ø¨Ø©", "Section")}
              </label>
              <Select
                value={selectedSectionId ? String(selectedSectionId) : undefined}
                onValueChange={(value) => {
                  const section = sections.find((item) => item.id === Number(value));
                  if (!section) return;
                  setSelectedSectionId(section.id);
                  setSelectedSectionName(section.name);
                }}
                disabled={!selectedGradeId || isSectionsLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      !selectedGradeId
                        ? text("Ø§Ø®ØªØ± Ø§Ù„ØµÙ Ø£ÙˆÙ„Ø§Ù‹", "Choose grade first")
                        : isSectionsLoading
                          ? text("Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø´Ø¹Ø¨...", "Loading sections...")
                          : text("Ø§Ø®ØªØ± Ø§Ù„Ø´Ø¹Ø¨Ø©...", "Choose section...")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={String(section.id)}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
              {text("ØªØºÙŠÙŠØ± Ø§Ù„Ø´Ø¹Ø¨Ø©", "Change Section")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

