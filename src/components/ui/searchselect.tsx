// src/component/ui/searchselect
import { useLocale } from "@/hooks/useLocale";
import { Input } from "@/components/ui/input";

export function SearchSelect({
  label,
  query,
  setQuery,
  results,
  setResults,
  selected,
  setSelected,
  setValue,
  display,
  required = true,
}: {
  label: string;
  query: string;
  setQuery: (q: string) => void;
  results: any[];
  setResults: (r: any[]) => void;
  selected: { id: number; name: string } | null;
  setSelected: (s: any) => void;
  setValue: (id: number) => void;
  display: (item: any) => string;
  required?: boolean;
}) {
  const { text } = useLocale();

  const getItemLabel = (item: any): string => {
    const directName =
      typeof item?.name === "string"
        ? item.name
        : typeof item?.fullName === "string"
          ? item.fullName
          : [item?.firstName, item?.lastName]
              .filter((part) => typeof part === "string" && part.trim().length > 0)
              .join(" ");

    if (directName && directName.trim().length > 0) return directName;

    const fallback = display(item);
    return typeof fallback === "string" ? fallback : "";
  };

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>

      <Input
        type="text"
        value={query ?? ""}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={text(`Search ${label}...`, `Search ${label}...`)}
        className="h-10 px-4 py-2.5"
      />

      {results.length > 0 && (
        <ul className="absolute z-20 mt-2 max-h-48 w-full overflow-auto rounded-lg border border-[hsl(var(--field-border))] bg-card shadow-[0_18px_40px_-24px_hsl(var(--field-shadow)),0_8px_18px_-14px_hsl(var(--field-shadow))]">
          {results.map((r) => (
            <li
              key={r.id}
              onClick={() => {
                const itemLabel = getItemLabel(r);
                setSelected({ id: r.id, name: itemLabel });
                setQuery(itemLabel);
                setResults([]);
                setValue(r.id);
              }}
              className="cursor-pointer border-b border-border/50 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/60 last:border-b-0"
            >
              {display(r)}
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {text("Selected", "Selected")} {label}: {selected.name} (ID: {selected.id})
        </p>
      )}
    </div>
  );
}
