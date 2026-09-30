"use client";

import {
  deleteSupplement,
  markAllSupplementsTaken,
  toggleSupplementTaken,
  upsertSupplement,
} from "@/lib/actions";
import type { Supplement } from "@/lib/supplements/types";
import {
  DangerButton,
  Field,
  PrimaryButton,
  SectionCard,
  TextInput,
} from "@/components/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

export function SupplementTracker({
  logDate,
  supplements,
  takenIds,
}: {
  logDate: string;
  supplements: Supplement[];
  takenIds: string[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const taken = useMemo(() => new Set(takenIds), [takenIds]);

  const active = supplements.filter((s) => s.active);
  const done = active.filter((s) => taken.has(s.id)).length;

  return (
    <div className="space-y-6">
      <SectionCard
        title={`Today’s supplements · ${done}/${active.length || 0}`}
        action={
          active.length ? (
            <button
              type="button"
              disabled={pending || done === active.length}
              className="text-xs font-semibold text-court hover:underline disabled:opacity-40"
              onClick={() => {
                setError(null);
                start(async () => {
                  try {
                    await markAllSupplementsTaken(logDate);
                    router.refresh();
                  } catch (err) {
                    setError(
                      err instanceof Error ? err.message : "Could not update",
                    );
                  }
                });
              }}
            >
              Mark all taken
            </button>
          ) : null
        }
      >
        <p className="mb-4 text-sm text-muted">
          Tick off creatine, multivitamin, omega-3 (and anything else in your
          stack) each day.
        </p>
        {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
        {active.length ? (
          <ul className="space-y-3">
            {active.map((s) => {
              const isTaken = taken.has(s.id);
              return (
                <li key={s.id}>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isTaken}
                      disabled={pending}
                      className="mt-1 size-4 accent-court"
                      onChange={(e) => {
                        const next = e.target.checked;
                        setError(null);
                        start(async () => {
                          try {
                            await toggleSupplementTaken(s.id, logDate, next);
                            router.refresh();
                          } catch (err) {
                            setError(
                              err instanceof Error
                                ? err.message
                                : "Could not update",
                            );
                          }
                        });
                      }}
                    />
                    <span>
                      <span
                        className={`block text-sm font-medium ${isTaken ? "text-muted line-through" : "text-charcoal"}`}
                      >
                        {s.name}
                        {s.dose ? (
                          <span className="font-normal text-muted">
                            {" "}
                            · {s.dose}
                          </span>
                        ) : null}
                      </span>
                      {s.timing ? (
                        <span className="mt-0.5 block text-xs text-court">
                          {s.timing}
                        </span>
                      ) : null}
                      {s.notes ? (
                        <span className="mt-0.5 block text-xs text-muted">
                          {s.notes}
                        </span>
                      ) : null}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">
            No active supplements yet — add your stack below (defaults:
            creatine, multivitamin, omega-3).
          </p>
        )}
      </SectionCard>

      <SectionCard title="Your stack">
        <form
          className="mb-6 grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            setError(null);
            start(async () => {
              try {
                await upsertSupplement(fd);
                form.reset();
                router.refresh();
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Could not save",
                );
              }
            });
          }}
        >
          <Field label="Name">
            <TextInput name="name" required placeholder="e.g. Vitamin D" />
          </Field>
          <Field label="Dose">
            <TextInput name="dose" placeholder="e.g. 2000 IU" />
          </Field>
          <Field label="When to take">
            <TextInput name="timing" placeholder="e.g. With breakfast" />
          </Field>
          <Field label="Notes">
            <TextInput name="notes" placeholder="Optional" />
          </Field>
          <div className="sm:col-span-2">
            <PrimaryButton type="submit" disabled={pending}>
              Add supplement
            </PrimaryButton>
          </div>
        </form>

        <ul className="divide-y divide-line text-sm">
          {supplements.map((s) => (
            <li
              key={s.id}
              className="flex items-start justify-between gap-3 py-3"
            >
              <div>
                <p className={`font-medium ${s.active ? "text-ink" : "text-muted"}`}>
                  {s.name}
                  {!s.active ? " (paused)" : ""}
                </p>
                <p className="text-xs text-muted">
                  {[s.dose, s.timing].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <form
                action={deleteSupplement.bind(null, s.id)}
                onSubmit={(e) => {
                  e.preventDefault();
                  start(async () => {
                    await deleteSupplement(s.id);
                    router.refresh();
                  });
                }}
              >
                <DangerButton type="submit" disabled={pending}>
                  Remove
                </DangerButton>
              </form>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
