"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  FormError,
  FormNotice,
  SubmitButton,
  TextField,
} from "@/components/auth/fields";
import { api, ApiError, type ForgotPasswordResponse } from "@/lib/api";

// Step 1 asks for the email; step 2 takes the reset code plus a new password.
// While there is no email service, the API returns the code directly and we
// pre-fill it here.
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const step = issuedToken === null ? 1 : 2;

  async function requestCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = String(form.get("email"));
    setBusy(true);
    setError(null);
    try {
      const res = await api<ForgotPasswordResponse>(
        "/api/auth/forgot-password",
        { method: "POST", body: { email: value } },
      );
      setEmail(value);
      setIssuedToken(res.resetToken ?? "");
      setNotice(
        res.resetToken
          ? "Email delivery is not set up yet, so your reset code was filled in below."
          : res.message,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("newPassword"));
    if (newPassword !== String(form.get("confirm"))) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api("/api/auth/reset-password", {
        method: "POST",
        body: {
          email,
          resetToken: String(form.get("resetToken")),
          newPassword,
        },
      });
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <AuthShell
      overline="Account recovery"
      title={
        <>
          Reset your <em className="italic text-gold-300">password</em>
        </>
      }
    >
      {step === 1 ? (
        <form onSubmit={requestCode} className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-cream-muted">
            Tell us the email you registered with and we will issue a reset
            code.
          </p>
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          <FormError message={error} />
          <SubmitButton busy={busy}>Send reset code</SubmitButton>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="flex flex-col gap-5">
          <FormNotice message={notice} />
          <TextField
            label="Reset code"
            name="resetToken"
            defaultValue={issuedToken ?? ""}
            placeholder="Paste your reset code"
            autoComplete="one-time-code"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            required
          />
          <TextField
            label="New password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
          <TextField
            label="Confirm new password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Type it once more"
            minLength={8}
            required
          />
          <FormError message={error} />
          <SubmitButton busy={busy}>Set new password</SubmitButton>
        </form>
      )}

      <p className="mt-7 text-sm text-cream-muted">
        Remembered it after all?{" "}
        <Link href="/login" className="text-gold-300 hover:text-gold-400">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
