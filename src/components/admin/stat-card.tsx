export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="border border-gold-500/12 bg-noir-900/60 p-5">
      <p className="text-[11px] uppercase tracking-[0.22em] text-cream-faint">
        {label}
      </p>
      <p className="mt-3 font-serif text-3xl tabular-nums text-cream">
        {value}
      </p>
      {hint && <p className="mt-1.5 text-xs text-cream-faint">{hint}</p>}
    </div>
  );
}
