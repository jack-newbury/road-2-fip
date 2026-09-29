import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, RoadmapSkill, SkillProgress } from "@/lib/types";
import { PHASE_META } from "@/lib/types";
import { currentPhase, phaseProgress } from "@/lib/utils";

export type RecapPeriod = "week" | "month";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function periodRange(period: RecapPeriod): {
  start: string;
  end: string;
  label: string;
} {
  const end = todayISO();
  const start = period === "week" ? isoDaysAgo(6) : isoDaysAgo(29);
  return {
    start,
    end,
    label: period === "week" ? "Weekly" : "Monthly",
  };
}

export async function buildProgressSnapshot(
  supabase: SupabaseClient,
  userId: string,
  period: RecapPeriod,
) {
  const { start, end, label } = periodRange(period);

  const [
    { data: profile },
    { data: skills },
    { data: progress },
    { data: practice },
    { data: gym },
    { data: coaching },
    { data: competitions },
    { data: recovery },
    { data: nutrition },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("roadmap_skills").select("*"),
    supabase.from("skill_progress").select("*").eq("user_id", userId),
    supabase
      .from("practice_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("session_date", start)
      .lte("session_date", end),
    supabase
      .from("gym_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("session_date", start)
      .lte("session_date", end),
    supabase
      .from("coaching_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("session_date", start)
      .lte("session_date", end),
    supabase
      .from("competitions")
      .select("*")
      .eq("user_id", userId)
      .gte("event_date", start)
      .lte("event_date", end),
    supabase
      .from("recovery_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", start)
      .lte("log_date", end),
    supabase
      .from("nutrition_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", start)
      .lte("log_date", end),
  ]);

  const p = profile as Profile;
  const allSkills = (skills as RoadmapSkill[]) || [];
  const allProgress = (progress as SkillProgress[]) || [];
  const phase = currentPhase(p);
  const phaseSkills = allSkills.filter((s) => s.phase === phase);
  const pct = phaseProgress(
    phaseSkills.map((s) => s.id),
    allProgress,
  );

  const statusCounts = { todo: 0, learning: 0, practiced: 0, solid: 0 };
  for (const row of allProgress) {
    statusCounts[row.status] += 1;
  }

  const courtMins = (practice || []).reduce(
    (sum, s) => sum + (s.duration_mins || 0),
    0,
  );
  const gymMins = (gym || []).reduce(
    (sum, s) => sum + (s.duration_mins || 0),
    0,
  );

  const avg = (nums: number[]) =>
    nums.length
      ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
      : null;

  const readiness = avg(
    (recovery || [])
      .map((r) => r.readiness)
      .filter((n): n is number => n != null),
  );
  const sleep = avg(
    (recovery || [])
      .map((r) => Number(r.sleep_hours))
      .filter((n) => !Number.isNaN(n)),
  );
  const energy = avg(
    (nutrition || [])
      .map((n) => n.energy)
      .filter((n): n is number => n != null),
  );

  const targets = p.weekly_targets;
  const weeksInPeriod = period === "week" ? 1 : 4;

  return {
    period,
    label,
    start,
    end,
    athlete: {
      name: p.display_name,
      home_base: p.home_base,
      uk_ranking: p.uk_ranking,
      started_padel_at: p.started_padel_at,
      goal_fip_at: p.goal_fip_at,
      goal_uk_top100_at: p.goal_uk_top100_at,
      weekly_targets: targets,
      playtomic_level: p.playtomic_level ?? null,
      playtomic_level_confidence: p.playtomic_level_confidence ?? null,
      kourtos_synced_at: p.kourtos_synced_at ?? null,
      kourtos_overview: p.kourtos_overview ?? null,
    },
    phase: {
      number: phase,
      title: PHASE_META[phase].title,
      subtitle: PHASE_META[phase].subtitle,
      progress_pct: pct,
    },
    skill_status_counts: statusCounts,
    volume: {
      practice_sessions: practice?.length ?? 0,
      practice_minutes: courtMins,
      gym_sessions: gym?.length ?? 0,
      gym_minutes: gymMins,
      coaching_sessions: coaching?.length ?? 0,
      competitions: competitions?.length ?? 0,
      recovery_logs: recovery?.length ?? 0,
      nutrition_logs: nutrition?.length ?? 0,
      target_court_for_period: targets.court * weeksInPeriod,
      target_gym_for_period: targets.gym * weeksInPeriod,
      target_coaching_for_period: targets.coaching * weeksInPeriod,
    },
    practice_focuses: (practice || [])
      .map((s) => s.focus)
      .filter(Boolean)
      .slice(0, 12),
    coaching_takeaways: (coaching || [])
      .map((s) => s.takeaways || s.focus)
      .filter(Boolean)
      .slice(0, 8),
    competitions_detail: (competitions || []).map((c) => ({
      name: c.name,
      level: c.level,
      result: c.result,
      ranking_notes: c.ranking_notes,
    })),
    recovery: { avg_readiness: readiness, avg_sleep_hours: sleep },
    nutrition: {
      avg_energy: energy,
      protein_focus_days: (nutrition || []).filter((n) => n.protein_focus)
        .length,
    },
  };
}

export function buildRecapSystemPrompt(): string {
  return `You are the internal coach for "Road to FIP" — a padel progress app for an adult amateur in Northampton, Northamptonshire, UK.

Primary goal: first FIP ranking points within ~3 years.
Secondary goal: UK top 100.

Write like a sharp, encouraging high-level padel coach. Be specific to the data. No fluff, no emojis, no markdown tables.

Structure exactly:

## Headline
One punchy line on the period.

## What went well
3–5 bullets grounded in the numbers/logs.

## Gaps & risks
2–4 bullets (volume vs targets, recovery, competition exposure, skill plateaus).

## Focus for next period
3–5 concrete actions (on-court drills, gym, recovery, which event types to enter from Northampton/Midlands upward).

## Skill pointers
2–3 technical/tactical tips tied to their current roadmap phase and logged focuses.

Keep total length under ~450 words.`;
}
