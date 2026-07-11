"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminShell } from "@/components/admin/admin-shell";

function LoadingScreen() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-noir-950">
      <p className="text-sm uppercase tracking-[0.3em] text-cream-faint">Loading</p>
    </main>
  );
}

// Auth gate + role check + shell chrome shared by every /admin route (the
// tabbed list at /admin and each /admin/<entity>/<id> edit screen).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return <LoadingScreen />;

  if (user.role !== "Admin") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-noir-950 px-5 text-center">
        <h1 className="font-serif text-3xl text-cream">
          This room is <em className="italic text-gold-300">admins only</em>
        </h1>
        <p className="max-w-sm text-sm text-cream-muted">
          Your account does not have admin access. If it should, ask another
          admin to change your role.
        </p>
        <Link
          href="/"
          className="border border-gold-500/40 px-6 py-3 text-[12px] uppercase tracking-[0.2em] text-gold-300 hover:border-gold-400 hover:bg-gold-500/10"
        >
          Back to the maison
        </Link>
      </main>
    );
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
