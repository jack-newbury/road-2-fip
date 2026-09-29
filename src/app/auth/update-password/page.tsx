"use client";

import { createClient } from "@/lib/supabase/client";
import { Field, TextInput, PrimaryButton } from "@/components/ui";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(Boolean(session));
      if (!session) {
        setMessage("Open the link from your reset email, or sign in first.");
      }
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setStatus("error");
      setMessage("Use at least 8 characters.");
      return;
    }
    setStatus("loading");
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    router.refresh();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-atmosphere px-6 py-16">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-2xl font-bold text-charcoal">
          New password
        </h1>
        <p className="mt-1 text-sm text-muted">
          Choose a password for email sign-in.
        </p>
        {ready ? (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="New password">
              <TextInput
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirm password">
              <TextInput
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </Field>
            <PrimaryButton type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Saving…" : "Save password"}
            </PrimaryButton>
            {message ? (
              <p className="text-sm text-danger">{message}</p>
            ) : null}
          </form>
        ) : (
          <p className="mt-6 text-sm text-muted">{message}</p>
        )}
      </div>
    </div>
  );
}
