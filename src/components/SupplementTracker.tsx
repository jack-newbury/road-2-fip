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
import { useState, useTransition } from "react";

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
  const [savingStack, startStack] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [taken, setTaken] = useState(() => new Set(takenIds));
  const takenKey = `${logDate}:${takenIds.slice().sort().join(",")}`;
  const [syncedTakenKey, setSyncedTakenKey] = useState(takenKey);
  if (takenKey !== syncedTakenKey) {
    setSyncedTakenKey(takenKey);
    setTaken(new Set(takenIds));
  }

  const active = supplements.filter((s) => s.active);
  const done = active.filter((s) => taken.has(s.id)).length;

  function onToggle(id: string, next: boolean) {
    setError(null);
    setTaken((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(id);
      else copy.delete(id);
      return copy;
    });
    void toggleSupplementTaken(id, logDate, next).catch((err) => {
      setTaken((prev) => {
        const copy = new Set(prev);
        if (next) copy.delete(id);
        else copy.add(id);
        return copy;
      });
      setError(err instanceof Error ? err.message : "Could not update");
    });
  }

  function onMarkAll() {
    setError(null);
    const prev = new Set(taken);
    setTaken(new Set(active.map((s) => s.id)));
    void markAllSupplementsTaken(logDate).catch((err) => {
      setTaken(prev);
      setError(err instanceof Error ? err.message : "Could not update");
    });
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title={`Today’s supplements · ${done}/${active.length || 0}`}
        action={
          active.length ? (
            <button
              type="button"
              disabled={done === active.length}
              className="text-xs font-semibold text-court hover:underline disabled:opacity-40"
              onClick={onMarkAll}
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
                      className="mt-1 size-4 accent-court"
                      onChange={(e) => onToggle(s.id, e.target.checked)}
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
            startStack(async () => {
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
            <PrimaryButton type="submit" disabled={savingStack}>
              {savingStack ? "Adding…" : "Add supplement"}
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
                onSubmit={(e) => {
                  e.preventDefault();
                  startStack(async () => {
                    await deleteSupplement(s.id);
                    router.refresh();
                  });
                }}
              >
                <DangerButton type="submit" disabled={savingStack}>
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
