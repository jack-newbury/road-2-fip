"use client";

import { createClient } from "@/lib/supabase/client";
import { Field, TextInput, PrimaryButton } from "@/components/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthMethod = "password" | "magic";
type PasswordMode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<AuthMethod>("password");
  const [passwordMode, setPasswordMode] = useState<PasswordMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onMagicLink(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
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

  async function onPassword(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const supabase = createClient();

    if (passwordMode === "signup") {
      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }
      if (data.session) {
        router.refresh();
        router.push("/");
        return;
      }
      setStatus("sent");
      setMessage(
        "Account created. Check your email to confirm, then sign in with your password.",
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    router.refresh();
    router.push("/");
  }

  return (
    <div className="flex min-h-dvh min-h-screen flex-col bg-atmosphere">
      <div className="hero-plane flex flex-1 flex-col justify-end px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24 md:px-12 md:pb-24">
        <p className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-7xl">
          Road to FIP
        </p>
        <p className="mt-3 max-w-md text-sm text-white/80 sm:mt-4 sm:text-base">
          Your synced padel OS — Northampton base, UK top 100 climb, first FIP
          points.
        </p>
      </div>
      <div className="mx-auto w-full max-w-md px-4 py-8 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-10">
        <h1 className="font-display text-2xl font-bold text-charcoal">Sign in</h1>
        <p className="mt-1 text-sm text-muted">
          Password (recommended) or magic link if email is rate-limited.
        </p>

        <div className="mt-4 flex gap-2 rounded-xl bg-white/60 p-1">
          <button
            type="button"
            onClick={() => {
              setMethod("password");
              setStatus("idle");
              setMessage("");
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              method === "password"
                ? "bg-charcoal text-white"
                : "text-muted hover:text-charcoal"
            }`}
          >
            Email & password
          </button>
          <button
            type="button"
            onClick={() => {
              setMethod("magic");
              setStatus("idle");
              setMessage("");
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              method === "magic"
                ? "bg-charcoal text-white"
                : "text-muted hover:text-charcoal"
            }`}
          >
            Magic link
          </button>
        </div>

        {method === "password" ? (
          <form onSubmit={onPassword} className="mt-6 space-y-4">
            <div className="flex gap-4 text-sm">
              <button
                type="button"
                onClick={() => {
                  setPasswordMode("signin");
                  setStatus("idle");
                  setMessage("");
                }}
                className={
                  passwordMode === "signin"
                    ? "font-semibold text-charcoal"
                    : "text-muted hover:text-charcoal"
                }
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasswordMode("signup");
                  setStatus("idle");
                  setMessage("");
                }}
                className={
                  passwordMode === "signup"
                    ? "font-semibold text-charcoal"
                    : "text-muted hover:text-charcoal"
                }
              >
                Create account
              </button>
            </div>
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
            <Field label="Password">
              <TextInput
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  passwordMode === "signup" ? "At least 8 characters" : "••••••••"
                }
                autoComplete={
                  passwordMode === "signup" ? "new-password" : "current-password"
                }
              />
            </Field>
            {passwordMode === "signin" ? (
              <p className="text-right text-sm">
                <Link
                  href="/login/forgot-password"
                  className="text-court hover:underline"
                >
                  Forgot password?
                </Link>
              </p>
            ) : null}
            <PrimaryButton type="submit" disabled={status === "loading"}>
              {status === "loading"
                ? "Working…"
                : passwordMode === "signup"
                  ? "Create account"
                  : "Sign in"}
            </PrimaryButton>
            {message ? (
              <p
                className={`text-sm ${status === "error" ? "text-danger" : "text-court"}`}
              >
                {message}
              </p>
            ) : null}
          </form>
        ) : (
          <form onSubmit={onMagicLink} className="mt-6 space-y-4">
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
        )}
      </div>
    </div>
  );
}
