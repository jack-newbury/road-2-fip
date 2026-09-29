import type { Profile, SkillProgress, SkillStatus } from "./types";

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function startOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function monthsSince(dateStr: string): number {
  const start = new Date(dateStr + "T00:00:00");
  const now = new Date();
  return (
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth())
  );
}

/** Infer roadmap phase from months since padel start (includes ~4 months already). */
export function currentPhase(profile: Profile): 1 | 2 | 3 {
  const months = monthsSince(profile.started_padel_at);
  if (months < 12) return 1;
  if (months < 24) return 2;
  return 3;
}

export function statusWeight(status: SkillStatus): number {
  switch (status) {
    case "todo":
      return 0;
    case "learning":
      return 0.33;
    case "practiced":
      return 0.66;
    case "solid":
      return 1;
  }
}

export function phaseProgress(
  skillIds: string[],
  progress: SkillProgress[],
): number {
  if (skillIds.length === 0) return 0;
  const map = new Map(progress.map((p) => [p.skill_id, p.status]));
  const total = skillIds.reduce(
    (sum, id) => sum + statusWeight(map.get(id) ?? "todo"),
    0,
  );
  return Math.round((total / skillIds.length) * 100);
}

export function defaultStartedPadelAt(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 4);
  return d.toISOString().slice(0, 10);
}

export function defaultGoalDate(years = 3): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
