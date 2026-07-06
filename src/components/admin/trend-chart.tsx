// 14-day revenue bar chart. A native `title` tooltip on each bar carries
// the exact value; day-of-month labels sit below for a quick x-axis read.
export function TrendChart({
  data,
}: {
  data: { date: string; revenueVnd: number }[];
}) {
  const hasRevenue = data.some((d) => d.revenueVnd > 0);
  if (!hasRevenue) {
    return <p className="text-sm text-cream-faint">No revenue in the last 14 days.</p>;
  }

  const max = Math.max(1, ...data.map((d) => d.revenueVnd));

  return (
    <div>
      <div className="flex h-32 items-end gap-1.5">
        {data.map((d) => (
          <div
            key={d.date}
            title={`${new Date(d.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })}: ${d.revenueVnd.toLocaleString("vi-VN")}₫`}
            className="flex-1 bg-gold-500/70 transition-colors hover:bg-gold-400"
            style={{ height: `${Math.max(2, (d.revenueVnd / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {data.map((d) => (
          <span key={d.date} className="flex-1 text-center text-[9px] text-cream-faint">
            {new Date(d.date).getDate()}
          </span>
        ))}
      </div>
    </div>
  );
}
