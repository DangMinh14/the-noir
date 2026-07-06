"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormError, SubmitButton, TextField } from "@/components/auth/fields";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Only ever redirect to a same-site path, never an attacker-supplied URL.
  const redirectParam = searchParams.get("redirect");
  const redirectTo = redirectParam?.startsWith("/") ? redirectParam : "/";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await login(String(form.get("email")), String(form.get("password")));
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <AuthShell
      overline="Welcome back"
      title={
        <>
          Sign in to <em className="italic text-gold-300">the maison</em>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          required
        />
        <FormError message={error} />
        <SubmitButton busy={busy}>Sign in</SubmitButton>
      </form>

      <div className="mt-7 flex flex-col gap-2 text-sm text-cream-muted">
        <p>
          New here?{" "}
          <Link href="/register" className="text-gold-300 hover:text-gold-400">
            Create an account
          </Link>
        </p>
        <p>
          <Link
            href="/forgot-password"
            className="text-cream-faint underline-offset-4 hover:text-gold-300"
          >
            Forgot your password?
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
