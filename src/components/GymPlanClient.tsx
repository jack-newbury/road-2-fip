"use client";

import {
  generateGymPlan,
  logGymFromPlan,
  toggleGymPlanSession,
} from "@/lib/actions";
import type { GymPlanRow } from "@/lib/body/types";
import {
  Field,
  PrimaryButton,
  SectionCard,
  TextInput,
} from "@/components/ui";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function GymPlanClient({
  weekStart,
  plan,
  hasClaude,
  bodyHint,
}: {
  weekStart: string;
  plan: GymPlanRow | null;
  hasClaude: boolean;
  bodyHint: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <SectionCard title="This week’s padel gym plan">
        <p className="mb-4 text-sm text-muted">
          {hasClaude
            ? "Built from your phase, recovery, upcoming comps, and body metrics — court transfer first."
            : "Template padel S&C (add ANTHROPIC_API_KEY for a custom week)."}
          {bodyHint ? (
            <>
              {" "}
              <span className="text-clay">{bodyHint}</span>
            </>
          ) : (
            <>
              {" "}
              Log metrics on <span className="text-court">Body</span> for better
              loading advice.
            </>
          )}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const fd = new FormData(e.currentTarget);
            start(async () => {
              const result = await generateGymPlan(fd);
              if (!result.ok) setError(result.error ?? "Failed");
              else router.refresh();
            });
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Field label="Week starting">
            <TextInput
              name="week_start"
              type="date"
              required
              defaultValue={weekStart}
            />
          </Field>
          <Field label="Priority this week">
            <TextInput
              name="priority_hint"
              defaultValue="lateral power + shoulder resilience"
              placeholder="e.g. prehab before Midlands event"
            />
          </Field>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <PrimaryButton type="submit" disabled={pending}>
              {pending ? "Designing week…" : "Generate padel gym week"}
            </PrimaryButton>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
          </div>
        </form>
      </SectionCard>

      {plan ? (
        <SectionCard title={`Priority · ${plan.plan.priority}`}>
          <p className="mb-4 text-sm text-ink">{plan.plan.summary}</p>
          {plan.plan.deload_note ? (
            <p className="mb-4 text-xs text-clay">{plan.plan.deload_note}</p>
          ) : null}
          <div className="space-y-6">
            {plan.plan.sessions.map((session) => (
              <article
                key={session.date}
                className="border-b border-line pb-5 last:border-0"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-clay">
                      {session.weekday} · {session.focus} · RPE{" "}
                      {session.rpe_target} · {session.duration_mins}m
                    </p>
                    <h3 className="font-display text-base font-semibold text-charcoal">
                      {session.title}
                    </h3>
                    <p className="mt-1 text-xs text-court">{session.padel_why}</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted">
                    <input
                      type="checkbox"
                      checked={Boolean(session.done)}
                      className="size-4 accent-court"
                      onChange={(e) => {
                        start(async () => {
                          await toggleGymPlanSession(
                            plan.id,
                            session.date,
                            e.target.checked,
                          );
                          router.refresh();
                        });
                      }}
                    />
                    Done
                  </label>
                </div>
                <div className="mt-3 space-y-3">
                  {session.blocks.map((block) => (
                    <div key={block.name}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                        {block.name}
                      </p>
                      <ul className="mt-1 space-y-1 text-sm">
                        {block.exercises.map((ex) => (
                          <li key={ex.name} className="text-ink">
                            <span className="font-medium">{ex.name}</span>
                            <span className="text-muted"> · {ex.sets}</span>
                            {ex.notes ? (
                              <span className="block text-xs text-muted">
                                {ex.notes}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <form
                  className="mt-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    start(async () => {
                      await logGymFromPlan(fd);
                      router.refresh();
                    });
                  }}
                >
                  <input type="hidden" name="plan_id" value={plan.id} />
                  <input type="hidden" name="session_date" value={session.date} />
                  <input
                    type="hidden"
                    name="duration_mins"
                    value={session.duration_mins}
                  />
                  <input type="hidden" name="focus" value={session.focus} />
                  <input type="hidden" name="session_type" value={session.title} />
                  <input
                    type="hidden"
                    name="notes"
                    value={`${session.padel_why}\n${session.blocks
                      .flatMap((b) =>
                        b.exercises.map((x) => `${x.name} ${x.sets}`),
                      )
                      .join("; ")}`}
                  />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-court hover:underline"
                  >
                    Log this session
                  </button>
                </form>
              </article>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
