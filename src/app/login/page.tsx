"use client";

import { createClient } from "@/lib/supabase/client";
import { Field, TextInput, PrimaryButton } from "@/components/ui";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const supabase = createClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("sent");
    setMessage("Check your email for the magic link.");
  }

  return (
    <div className="flex min-h-screen flex-col bg-atmosphere">
      <div className="hero-plane flex flex-1 flex-col justify-end px-6 pb-16 pt-24 md:px-12 md:pb-24">
        <p className="font-display text-5xl font-extrabold tracking-tight text-white md:text-7xl">
          Road to FIP
        </p>
        <p className="mt-4 max-w-md text-base text-white/80">
          Your synced padel OS — Northampton base, UK top 100 climb, first FIP
          points.
        </p>
      </div>
      <div className="mx-auto w-full max-w-md px-6 py-10">
        <h1 className="font-display text-2xl font-bold text-charcoal">Sign in</h1>
        <p className="mt-1 text-sm text-muted">
          Magic link to your email — no password.
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
            {status === "loading" ? "Sending…" : "Send magic link"}
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
