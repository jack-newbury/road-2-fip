"use client";

import { updateSkillStatus } from "@/lib/actions";
import type {
  RoadmapSkill,
  SkillCategory,
  SkillProgress,
  SkillStatus,
} from "@/lib/types";
import { PHASE_META, STATUS_LABELS } from "@/lib/types";
import { phaseProgress } from "@/lib/utils";
import { useEffect, useMemo, useState, useTransition } from "react";

const CATEGORY_ORDER: SkillCategory[] = [
  "technique",
  "tactics",
  "physical",
  "mental",
  "competition",
];

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  technique: "Technique",
  tactics: "Tactics",
  physical: "Physical",
  mental: "Mental",
  competition: "Competition",
};

const STATUSES: SkillStatus[] = ["todo", "learning", "practiced", "solid"];

function statusClasses(status: SkillStatus): string {
  switch (status) {
    case "solid":
      return "border-success/50 bg-success/20 text-success shadow-[0_0_0_1px_rgba(61,184,120,0.15)]";
    case "practiced":
      return "border-court/50 bg-court/15 text-court";
    case "learning":
      return "border-clay/50 bg-clay/10 text-clay";
    default:
      return "border-line bg-surface/80 text-muted hover:border-muted/60 hover:text-ink";
  }
}

function Milestone({
  phase,
  active,
  pct,
}: {
  phase: 1 | 2 | 3;
  active: boolean;
  pct: number;
}) {
  const meta = PHASE_META[phase];
  return (
    <div className="relative z-10 mx-auto w-full max-w-md">
      <div
        className={`rounded-xl border px-4 py-3.5 text-center sm:px-5 sm:py-4 ${
          active
            ? "border-court bg-court/20 shadow-[0_0_40px_rgba(45,154,98,0.15)]"
            : "border-line bg-surface"
        }`}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-clay">
          Tier {phase}
          {active ? " · current" : ""}
        </p>
        <h2 className="mt-1 font-display text-lg font-bold text-charcoal sm:text-xl md:text-2xl">
          {meta.title}
        </h2>
        <p className="mt-1 text-xs text-muted">
          {meta.subtitle} · {meta.months}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-court animate-fill-bar"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-court">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

function Spine() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-line via-court/40 to-line"
    />
  );
}

function SkillNode({
  skill,
  status,
  selected,
  onSelect,
}: {
  skill: RoadmapSkill;
  status: SkillStatus;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-md border px-3 py-2.5 text-left text-sm font-medium transition ${statusClasses(status)} ${
        selected ? "ring-2 ring-court/60" : ""
      }`}
    >
      <span className="line-clamp-2 leading-snug">{skill.title}</span>
      <span className="mt-1 block text-[10px] uppercase tracking-wide opacity-70">
        {STATUS_LABELS[status]}
      </span>
    </button>
  );
}

function DetailPanel({
  skill,
  progress,
  onClose,
  className = "",
}: {
  skill: RoadmapSkill;
  progress?: SkillProgress;
  onClose: () => void;
  className?: string;
}) {
  const [pending, start] = useTransition();
  const status = progress?.status ?? "todo";

  return (
    <div
      className={`rounded-xl border border-court/30 bg-surface p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)] animate-fade-up sm:p-5 ${className}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-clay">
            {CATEGORY_LABELS[skill.category]} · Tier {skill.phase}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-charcoal">
            {skill.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-9 shrink-0 rounded-md px-2 text-sm text-muted hover:text-charcoal"
        >
          Close
        </button>
      </div>
      <p className="text-sm leading-relaxed text-muted">{skill.description}</p>
      {skill.drill_hint ? (
        <p className="mt-3 rounded-md border border-line bg-background/60 px-3 py-2 text-xs text-court">
          Drill · {skill.drill_hint}
        </p>
      ) : null}
      <label className="mt-4 block space-y-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
          Status
        </span>
        <select
          disabled={pending}
          value={status}
          onChange={(e) => {
            const next = e.target.value as SkillStatus;
            start(async () => {
              await updateSkillStatus(
                skill.id,
                next,
                progress?.notes ?? undefined,
              );
            });
          }}
          className="w-full min-h-11 rounded-md border border-line bg-background px-3 py-2.5 text-base text-ink outline-none ring-court/30 focus:ring-2 sm:min-h-0 sm:py-2 sm:text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function RoadmapBoard({
  skills,
  progress,
  activePhase,
}: {
  skills: RoadmapSkill[];
  progress: SkillProgress[];
  activePhase: 1 | 2 | 3;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const progressMap = useMemo(
    () => new Map(progress.map((p) => [p.skill_id, p])),
    [progress],
  );
  const selected = skills.find((s) => s.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selected]);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
      <div className="relative space-y-0 pb-8">
        <Spine />

        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-wide text-muted sm:gap-3">
          {(
            [
              ["todo", "To do"],
              ["learning", "Learning"],
              ["practiced", "Practiced"],
              ["solid", "Solid"],
            ] as const
          ).map(([key, label]) => (
            <span
              key={key}
              className={`rounded border px-2 py-1 ${statusClasses(key)}`}
            >
              {label}
            </span>
          ))}
        </div>

        {([1, 2, 3] as const).map((phase, phaseIdx) => {
          const phaseSkills = skills.filter((s) => s.phase === phase);
          const pct = phaseProgress(
            phaseSkills.map((s) => s.id),
            progress,
          );
          const byCategory = CATEGORY_ORDER.map((cat) => ({
            cat,
            items: phaseSkills.filter((s) => s.category === cat),
          })).filter((g) => g.items.length > 0);

          return (
            <section key={phase} className="relative pb-10">
              <Milestone phase={phase} active={phase === activePhase} pct={pct} />

              <div className="relative mx-auto mt-6 max-w-3xl space-y-5 px-1">
                {byCategory.map((group, groupIdx) => (
                  <div key={group.cat} className="relative">
                    {groupIdx === 0 ? (
                      <div
                        aria-hidden
                        className="mx-auto mb-3 h-6 w-px bg-court/40"
                      />
                    ) : null}
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <span className="h-px w-8 bg-line" />
                      <p className="rounded-full border border-line bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-clay">
                        {CATEGORY_LABELS[group.cat]}
                      </p>
                      <span className="h-px w-8 bg-line" />
                    </div>
                    <div
                      className={`grid gap-2 ${
                        group.items.length === 1
                          ? "mx-auto max-w-xs grid-cols-1"
                          : group.items.length === 2
                            ? "mx-auto max-w-xl grid-cols-1 sm:grid-cols-2"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      }`}
                    >
                      {group.items.map((skill) => (
                        <SkillNode
                          key={skill.id}
                          skill={skill}
                          status={progressMap.get(skill.id)?.status ?? "todo"}
                          selected={selectedId === skill.id}
                          onSelect={() =>
                            setSelectedId((id) =>
                              id === skill.id ? null : skill.id,
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {phaseIdx < 2 ? (
                <div className="relative z-10 mx-auto mt-6 flex flex-col items-center gap-1 text-court/70">
                  <div className="h-8 w-px bg-court/40" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest">
                    Next tier
                  </span>
                  <div className="h-4 w-px bg-court/40" />
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      <aside className="hidden lg:block">
        {selected ? (
          <DetailPanel
            className="sticky top-4"
            skill={selected}
            progress={progressMap.get(selected.id)}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <div className="sticky top-4 rounded-xl border border-dashed border-line bg-surface/40 p-5 text-sm text-muted">
            Select a skill node to see why it matters, the drill, and update your
            status — same idea as the interactive nodes on{" "}
            <a
              href="https://roadmap.sh/devops"
              target="_blank"
              rel="noreferrer"
              className="text-court underline"
            >
              roadmap.sh
            </a>
            .
          </div>
        )}
      </aside>

      {selected ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal
        >
          <button
            type="button"
            aria-label="Close skill detail"
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedId(null)}
          />
          <div
            className="absolute inset-x-0 bottom-0 max-h-[70dvh] overflow-y-auto rounded-t-2xl border border-line bg-surface p-3 pb-[calc(4.75rem+env(safe-area-inset-bottom))] shadow-2xl"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
            <DetailPanel
              skill={selected}
              progress={progressMap.get(selected.id)}
              onClose={() => setSelectedId(null)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
