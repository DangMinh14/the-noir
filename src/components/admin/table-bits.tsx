"use client";

import { Search } from "lucide-react";
import { ApiError } from "@/lib/api";

export const thClass =
  "px-4 py-3 text-left text-[11px] uppercase tracking-[0.2em] text-gold-400";
export const tdClass = "px-4 py-3 text-sm text-cream-muted";

export function errorText(err: unknown) {
  return err instanceof ApiError ? err.message : "Something went wrong.";
}

export function PanelHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="font-serif text-2xl text-cream lg:hidden">{title}</h2>
        {description && (
          <p className="mt-1 max-w-md text-sm text-cream-faint">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer bg-gold-500 px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.2em] text-noir-950 transition-colors hover:bg-gold-400"
    >
      {children}
    </button>
  );
}

export function RowButton({
  children,
  onClick,
  danger,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer text-[11px] uppercase tracking-[0.18em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "text-red-400/70 hover:text-red-300"
          : "text-gold-400 hover:text-gold-300"
      }`}
    >
      {children}
    </button>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="relative block w-full sm:w-64">
      <Search
        size={15}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-faint"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full border border-gold-500/20 bg-noir-950 py-2.5 pl-10 pr-4 text-sm text-cream placeholder:text-cream-faint focus:border-gold-400 focus:outline-none"
      />
    </label>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-gold-500/15 px-6 py-14 text-center text-sm text-cream-faint">
      {message}
    </div>
  );
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
