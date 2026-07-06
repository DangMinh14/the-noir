// Horizontal bar chart: label + value shown directly on each row, so no
// separate legend is needed. Used for "top products" and "revenue by
// category" — small lists where a bar's relative length reads at a glance.
export function BarChart({
  data,
  formatValue = (v) => v.toLocaleString("vi-VN"),
}: {
  data: { label: string; value: number }[];
  formatValue?: (value: number) => string;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-cream-faint">No data yet.</p>;
  }

  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <ul className="flex flex-col gap-3.5">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate text-cream-muted">{d.label}</span>
            <span className="shrink-0 tabular-nums text-gold-400">
              {formatValue(d.value)}
            </span>
          </div>
          <div className="h-2 w-full bg-noir-800">
            <div
              className="h-full bg-gold-500"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
