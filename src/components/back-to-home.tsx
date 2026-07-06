import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Shared "return to the landing page" link for the auth and admin screens.
export function BackToHome({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-cream-muted transition-colors duration-200 hover:text-gold-300 ${className}`}
    >
      <ArrowLeft
        size={15}
        aria-hidden
        className="transition-transform duration-200 group-hover:-translate-x-0.5"
      />
      Back to home
    </Link>
  );
}
