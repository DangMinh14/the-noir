"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormError, SubmitButton, TextField } from "@/components/auth/fields";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    if (password !== String(form.get("confirm"))) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await register(
        String(form.get("email")),
        String(form.get("displayName")),
        password,
      );
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <AuthShell
      overline="Join us"
      title={
        <>
          Create your <em className="italic text-gold-300">account</em>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <TextField
          label="Display name"
          name="displayName"
          autoComplete="name"
          placeholder="How should we address you?"
          maxLength={100}
          required
        />
        <TextField
          label="Email or username"
          name="email"
          type="text"
          autoComplete="username"
          placeholder="you@example.com"
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
        <TextField
          label="Confirm password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Type it once more"
          minLength={8}
          required
        />
        <FormError message={error} />
        <SubmitButton busy={busy}>Create account</SubmitButton>
      </form>

      <p className="mt-7 text-sm text-cream-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-gold-300 hover:text-gold-400">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
