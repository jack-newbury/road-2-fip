"use client";

import {
  generateMealPlan,
  togglePrepStep,
  toggleShoppingItem,
} from "@/lib/actions";
import type { MealPlanRow } from "@/lib/meal-prep/types";
import { SLOT_LABELS, defaultEatTime } from "@/lib/meal-prep/types";
import { defaultPreferences } from "@/lib/meal-prep/plan";
import {
  Field,
  PrimaryButton,
  SectionCard,
  TextInput,
  TextSelect,
  TextTextarea,
} from "@/components/ui";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type MealPlanHistoryItem = {
  id: string;
  week_start: string;
  title: string;
  updated_at: string;
  summary: string | null;
};

export function MealPrepClient({
  weekStart,
  plan,
  hasClaude,
  defaultPrefs,
  history,
}: {
  weekStart: string;
  plan: MealPlanRow | null;
  hasClaude: boolean;
  defaultPrefs?: ReturnType<typeof defaultPreferences>;
  history: MealPlanHistoryItem[];
}) {
  const router = useRouter();
  const prefs = plan?.preferences ?? defaultPrefs ?? defaultPreferences();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shoppingProgress = useMemo(() => {
    const items = plan?.plan.shopping || [];
    if (!items.length) return { done: 0, total: 0 };
    return {
      done: items.filter((i) => i.checked).length,
      total: items.length,
    };
  }, [plan]);

  const prepProgress = useMemo(() => {
    const items = plan?.plan.prep || [];
    if (!items.length) return { done: 0, total: 0 };
    return {
      done: items.filter((i) => i.done).length,
      total: items.length,
    };
  }, [plan]);

  function onGenerate(formData: FormData) {
    setError(null);
    start(async () => {
      const result = await generateMealPlan(formData);
      if (!result.ok) {
        setError(result.error ?? "Failed to generate");
        return;
      }
      const week = result.weekStart || weekStart;
      router.push(`/meal-prep?week=${week}`);
      router.refresh();
    });
  }

  function copyList() {
    if (!plan?.plan.shopping) return;
    const byAisle = new Map<string, string[]>();
    for (const item of plan.plan.shopping) {
      if (item.checked) continue;
      const list = byAisle.get(item.aisle) || [];
      list.push(`${item.name} — ${item.qty}`);
      byAisle.set(item.aisle, list);
    }
    const lines = ["Shopping list (to order)"];
    for (const [aisle, items] of byAisle) {
      lines.push("", aisle.toUpperCase(), ...items.map((i) => `• ${i}`));
    }
    void navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-8">
      {history.length > 0 ? (
        <SectionCard title="Saved weeks">
          <p className="mb-3 text-sm text-muted">
            Plans are saved per week — open any past week to review shopping and
            prep.
          </p>
          <ul className="divide-y divide-line text-sm">
            {history.map((h) => {
              const active = h.week_start === weekStart;
              return (
                <li key={h.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <Link
                      href={`/meal-prep?week=${h.week_start}`}
                      className={`font-medium hover:underline ${active ? "text-court" : "text-ink"}`}
                    >
                      Week of {h.week_start}
                      {active ? " · viewing" : ""}
                    </Link>
                    {h.summary ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                        {h.summary}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {new Date(h.updated_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      ) : null}

      <SectionCard title="Build this week’s plan">
        <p className="mb-4 text-sm text-muted">
          {hasClaude
            ? "AI builds a padel-fuelled week, then saves it here so you can reopen it anytime."
            : "Template plan (add ANTHROPIC_API_KEY for a custom AI plan)."}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onGenerate(new FormData(e.currentTarget));
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Field label="Week starting (Monday)">
            <TextInput
              name="week_start"
              type="date"
              required
              defaultValue={weekStart}
            />
          </Field>
          <Field label="People">
            <TextInput
              name="people"
              type="number"
              min={1}
              max={6}
              defaultValue={prefs.people}
            />
          </Field>
          <Field label="Calories / day (approx)">
            <TextInput
              name="calories_target"
              type="number"
              defaultValue={prefs.calories_target}
            />
          </Field>
          <Field label="Protein g / day">
            <TextInput
              name="protein_g"
              type="number"
              defaultValue={prefs.protein_g}
            />
          </Field>
          <Field label="Body goal">
            <TextSelect
              name="body_goal"
              defaultValue={prefs.body_goal || "recomp"}
            >
              <option value="lose_fat">Lose fat (keep power)</option>
              <option value="recomp">Recomp</option>
              <option value="maintain">Maintain</option>
              <option value="gain">Gain lean mass</option>
            </TextSelect>
          </Field>
          <Field label="Diet">
            <TextSelect name="diet" defaultValue={prefs.diet}>
              <option value="omnivore">Omnivore</option>
              <option value="pescatarian">Pescatarian</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="high_protein">High protein flex</option>
            </TextSelect>
          </Field>
          <Field label="Shop / order from">
            <TextInput name="store" defaultValue={prefs.store} />
          </Field>
          <Field label="Sunday cook time (mins)">
            <TextInput
              name="cook_time_mins"
              type="number"
              defaultValue={prefs.cook_time_mins}
            />
          </Field>
          <Field label="Court days hint">
            <TextInput
              name="court_days_hint"
              defaultValue={prefs.court_days_hint}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Dislikes / allergies">
              <TextTextarea
                name="dislikes"
                defaultValue={prefs.dislikes}
                placeholder="e.g. no shellfish, hate coriander"
              />
            </Field>
          </div>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <PrimaryButton type="submit" disabled={pending}>
              {pending ? "Building meal prep…" : "Generate week meal prep"}
            </PrimaryButton>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
          </div>
        </form>
      </SectionCard>

      {plan ? (
        <>
          <SectionCard title="Week overview">
            <p className="text-sm leading-relaxed text-ink">{plan.plan.summary}</p>
            {(plan.plan.order_tips || []).length > 0 ? (
              <ul className="mt-4 space-y-1 text-sm text-muted">
                {(plan.plan.order_tips || []).map((tip) => (
                  <li key={tip}>· {tip}</li>
                ))}
              </ul>
            ) : null}
          </SectionCard>

          <SectionCard
            title={`Order list · ${shoppingProgress.done}/${shoppingProgress.total}`}
            action={
              <button
                type="button"
                onClick={copyList}
                className="text-xs font-semibold text-court hover:underline"
              >
                {copied ? "Copied" : "Copy for supermarket order"}
              </button>
            }
          >
            <div className="space-y-4">
              {Object.entries(
                (plan.plan.shopping || []).reduce<
                  Record<string, typeof plan.plan.shopping>
                >((acc, item) => {
                  (acc[item.aisle] ||= []).push(item);
                  return acc;
                }, {}),
              ).map(([aisle, items]) => (
                <div key={aisle}>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-clay">
                    {aisle}
                  </p>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item.id}>
                        <label className="flex cursor-pointer items-start gap-3 text-sm">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            className="mt-1 size-4 accent-court"
                            onChange={(e) => {
                              start(async () => {
                                await toggleShoppingItem(
                                  plan.id,
                                  item.id,
                                  e.target.checked,
                                );
                                router.refresh();
                              });
                            }}
                          />
                          <span
                            className={
                              item.checked
                                ? "text-muted line-through"
                                : "text-ink"
                            }
                          >
                            <span className="font-medium">{item.name}</span>
                            <span className="text-muted"> · {item.qty}</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title={`Sunday prep · ${prepProgress.done}/${prepProgress.total}`}
          >
            <ul className="space-y-3">
              {(plan.plan.prep || []).map((step) => (
                <li key={step.id}>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={step.done}
                      className="mt-1 size-4 accent-court"
                      onChange={(e) => {
                        start(async () => {
                          await togglePrepStep(plan.id, step.id, e.target.checked);
                          router.refresh();
                        });
                      }}
                    />
                    <span>
                      <span
                        className={`block text-sm font-medium ${step.done ? "text-muted line-through" : "text-charcoal"}`}
                      >
                        {step.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {step.detail}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Daily meals">
            <div className="space-y-6">
              {(plan.plan.days || []).map((day) => (
                <div key={day.date} className="border-b border-line pb-5 last:border-0">
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-base font-semibold text-charcoal">
                      {day.weekday}
                    </h3>
                    <span className="text-xs text-muted">{day.date}</span>
                  </div>
                  {day.training_note ? (
                    <p className="mb-2 text-xs text-court">{day.training_note}</p>
                  ) : null}
                  <ul className="space-y-2">
                    {(day.meals || []).map((meal, idx) => {
                      const time =
                        meal.eat_time ||
                        defaultEatTime(meal.slot, {
                          courtEvening: Boolean(day.training_note),
                        });
                      return (
                        <li key={`${day.date}-${idx}`} className="text-sm">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="font-mono text-[11px] font-semibold tabular-nums text-court">
                              {time}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-clay">
                              {SLOT_LABELS[meal.slot] || meal.slot}
                            </span>
                          </div>
                          <p className="font-medium text-ink">{meal.name}</p>
                          <p className="text-xs text-muted">{meal.notes}</p>
                          {meal.prep_batch ? (
                            <p className="text-xs text-court">
                              From prep: {meal.prep_batch}
                            </p>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      ) : (
        <SectionCard title="This week">
          <p className="text-sm text-muted">
            No saved plan for week of {weekStart} yet. Generate one above — it
            will be stored so you can come back to it later.
          </p>
        </SectionCard>
      )}
    </div>
  );
}
