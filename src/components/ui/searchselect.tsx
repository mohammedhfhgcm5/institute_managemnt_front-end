// src/component/ui/searchselect
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
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${label}...`}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />

      {results.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-200 mt-2 w-full rounded-lg shadow-lg max-h-48 overflow-auto">
          {results.map((r) => (
            <li
              key={r.id}
              onClick={() => {
                setSelected({ id: r.id, name: r.name || r.fullName });
                setQuery(r.name || r.fullName);
                setResults([]);
                setValue(r.id);
              }}
              className="px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
            >
              {display(r)}
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <p className="text-xs text-green-600 mt-2 font-medium">
          Selected {label}: {selected.name} (ID: {selected.id})
        </p>
      )}
    </div>
  );
}