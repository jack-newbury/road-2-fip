"use client";

import { updateSkillStatus } from "@/lib/actions";
import type { RoadmapSkill, SkillProgress, SkillStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { useTransition } from "react";

const STATUSES: SkillStatus[] = ["todo", "learning", "practiced", "solid"];

export function SkillCard({
  skill,
  progress,
}: {
  skill: RoadmapSkill;
  progress?: SkillProgress;
}) {
  const [pending, start] = useTransition();
  const status = progress?.status ?? "todo";

  return (
    <article className="border-b border-line py-5 last:border-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-clay">
            {skill.category}
          </p>
          <h3 className="mt-1 font-display text-base font-semibold text-charcoal">
            {skill.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            {skill.description}
          </p>
          {skill.drill_hint ? (
            <p className="mt-2 text-xs text-court-deep">
              Drill: {skill.drill_hint}
            </p>
          ) : null}
        </div>
        <select
          disabled={pending}
          value={status}
          onChange={(e) => {
            const next = e.target.value as SkillStatus;
            start(async () => {
              await updateSkillStatus(skill.id, next, progress?.notes ?? undefined);
            });
          }}
          className={`rounded-md border px-2.5 py-1.5 text-xs font-medium outline-none ${
            status === "solid"
              ? "border-success/40 bg-success/10 text-success animate-check-pop"
              : "border-line bg-surface text-ink"
          }`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
