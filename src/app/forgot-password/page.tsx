"use client";

import { useEffect, useRef, useState } from "react";
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

// Step 1 asks for the email; step 2 takes the reset code (delivered by
// email) plus a new password.
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const resetTokenRef = useRef<HTMLInputElement>(null);

  // Belt-and-suspenders against browser autofill: some browsers still treat
  // a plain text field sitting before two password fields as a "username"
  // and silently fill it with a saved email, even with
  // autoComplete="one-time-code" set. Clear it right after this step mounts
  // so a stray autofill never survives into the submitted request.
  useEffect(() => {
    if (step === 2 && resetTokenRef.current) resetTokenRef.current.value = "";
  }, [step]);

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
      setStep(2);
      setNotice(res.message);
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
            Tell us the email you registered with and we will send a reset
            code to your inbox.
          </p>
          <TextField
            label="Email or username"
            name="email"
            type="text"
            autoComplete="username"
            placeholder="you@example.com"
            required
          />
          <FormError message={error} />
          <SubmitButton busy={busy}>Send reset code</SubmitButton>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="flex flex-col gap-5">
          <FormNotice message={notice ?? `Check ${email} for your reset code.`} />
          <TextField
            ref={resetTokenRef}
            label="Reset code"
            name="resetToken"
            placeholder="Paste the code from your email"
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
