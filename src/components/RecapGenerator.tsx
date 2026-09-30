"use client";

import { generateRecap } from "@/lib/actions";
import type { RecapPeriod } from "@/lib/ai/recap";
import { PrimaryButton } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

function renderRecapBody(content: string) {
  return content.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h3
          key={i}
          className="mt-5 font-display text-base font-semibold text-charcoal first:mt-0"
        >
          {line.replace(/^##\s+/, "")}
        </h3>
      );
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <li key={i} className="ml-4 list-disc text-sm leading-relaxed text-ink">
          {line.replace(/^[-*]\s+/, "")}
        </li>
      );
    }
    if (!line.trim()) return <div key={i} className="h-2" />;
    return (
      <p key={i} className="text-sm leading-relaxed text-ink">
        {line}
      </p>
    );
  });
}

export function RecapGenerator({
  hasApiKey,
}: {
  hasApiKey: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [active, setActive] = useState<RecapPeriod | null>(null);

  function run(period: RecapPeriod) {
    setError(null);
    setActive(period);
    start(async () => {
      const result = await generateRecap(period);
      setActive(null);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setPreview(result.content ?? null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {!hasApiKey ? (
        <p className="rounded-md border border-clay/40 bg-clay-light/30 px-3 py-2 text-sm text-ink">
          Add <code className="text-xs">ANTHROPIC_API_KEY</code> to{" "}
          <code className="text-xs">.env.local</code> and restart the server to
          enable AI recaps.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <PrimaryButton
          type="button"
          disabled={!hasApiKey || pending}
          onClick={() => run("week")}
        >
          {pending && active === "week"
            ? "Writing weekly recap…"
            : "Generate weekly recap"}
        </PrimaryButton>
        <button
          type="button"
          disabled={!hasApiKey || pending}
          onClick={() => run("month")}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-court px-4 py-2.5 text-sm font-semibold text-court transition hover:bg-court/5 disabled:opacity-50 sm:w-auto"
        >
          {pending && active === "month"
            ? "Writing monthly recap…"
            : "Generate monthly recap"}
        </button>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {preview ? (
        <article className="rounded-xl border border-court/20 bg-surface p-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-court">
            Latest generated
          </p>
          <div>{renderRecapBody(preview)}</div>
        </article>
      ) : null}
    </div>
  );
}

export function RecapBody({ content }: { content: string }) {
  return <div>{renderRecapBody(content)}</div>;
}
