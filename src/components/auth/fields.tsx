"use client";

// Small form primitives so every auth form looks the same.

export function TextField({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = props.id ?? props.name;
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-cream-muted">
        {label}
      </span>
      <input
        id={id}
        {...props}
        className="w-full border border-gold-500/20 bg-noir-950 px-4 py-3 text-sm text-cream placeholder:text-cream-faint focus:border-gold-400 focus:outline-none"
      />
    </label>
  );
}

export function SubmitButton({
  children,
  busy,
}: {
  children: React.ReactNode;
  busy?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full cursor-pointer bg-gold-500 px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.2em] text-noir-950 transition-colors duration-300 hover:bg-gold-400 disabled:cursor-wait disabled:opacity-60"
    >
      {busy ? "One moment" : children}
    </button>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-300">
      {message}
    </p>
  );
}

export function FormNotice({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="border border-gold-500/25 bg-gold-500/10 px-4 py-3 text-sm text-gold-300">
      {message}
    </p>
  );
}
