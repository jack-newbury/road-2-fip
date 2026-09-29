"use client";

import { createClient } from "@/lib/supabase/client";
import { Field, TextInput, PrimaryButton } from "@/components/ui";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const supabase = createClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("sent");
    setMessage("If that email exists, we sent a reset link.");
  }

  return (
    <div className="min-h-screen bg-atmosphere px-6 py-16">
      <div className="mx-auto max-w-md">
        <Link href="/login" className="text-sm text-court hover:underline">
          ← Back to sign in
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold text-charcoal">
          Reset password
        </h1>
        <p className="mt-1 text-sm text-muted">
          We&apos;ll email a link to choose a new password.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Email">
            <TextInput
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </Field>
          <PrimaryButton type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Sending…" : "Send reset link"}
          </PrimaryButton>
          {message ? (
            <p
              className={`text-sm ${status === "error" ? "text-danger" : "text-court"}`}
            >
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
