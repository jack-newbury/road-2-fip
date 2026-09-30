import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DualGoalStrip } from "@/components/DualGoalStrip";
import { WeekChecklist } from "@/components/WeekChecklist";
import { SectionCard } from "@/components/ui";
import type { Profile, RoadmapSkill, SkillProgress } from "@/lib/types";
import { PHASE_META } from "@/lib/types";
import {
  currentPhase,
  formatDate,
  phaseProgress,
  startOfWeekISO,
  todayISO,
} from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const weekStart = startOfWeekISO();
  const today = todayISO();

  const [
    { data: profile },
    { data: skills },
    { data: progress },
    { data: practice },
    { data: gym },
    { data: coaching },
    { data: recovery },
    { data: nutrition },
    { data: recentPractice },
    { data: recentComps },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("roadmap_skills").select("*").order("sort_order"),
    supabase.from("skill_progress").select("*").eq("user_id", user.id),
    supabase
      .from("practice_sessions")
      .select("id")
      .eq("user_id", user.id)
      .gte("session_date", weekStart),
    supabase
      .from("gym_sessions")
      .select("id")
      .eq("user_id", user.id)
      .gte("session_date", weekStart),
    supabase
      .from("coaching_sessions")
      .select("id")
      .eq("user_id", user.id)
      .gte("session_date", weekStart),
    supabase
      .from("recovery_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle(),
    supabase
      .from("nutrition_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle(),
    supabase
      .from("practice_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("session_date", { ascending: false })
      .limit(3),
    supabase
      .from("competitions")
      .select("*")
      .eq("user_id", user.id)
      .order("event_date", { ascending: false })
      .limit(2),
  ]);

  const p = profile as Profile;
  const phase = currentPhase(p);
  const phaseSkills = ((skills as RoadmapSkill[]) || []).filter(
    (s) => s.phase === phase,
  );
  const pct = phaseProgress(
    phaseSkills.map((s) => s.id),
    (progress as SkillProgress[]) || [],
  );

  return (
    <div className="space-y-8">
      <section className="hero-plane animate-fade-up relative overflow-hidden rounded-2xl px-4 py-8 text-white sm:px-6 sm:py-10 md:px-10 md:py-14">
        <p className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          Road to FIP
        </p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 md:text-base">
          {p.display_name} · {p.home_base}. Build the UK ladder, then take the
          FIP points.
        </p>
        <div className="mt-6 sm:mt-8">
          <DualGoalStrip profile={p} />
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
          <Link
            href="/practice"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-clay px-4 py-2.5 text-center text-sm font-semibold text-[#1c1c1c] transition hover:brightness-110"
          >
            Log today’s session
          </Link>
          <Link
            href="/roadmap"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/30 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-white/10"
          >
            View roadmap
          </Link>
        </div>
      </section>

      <SectionCard
        title="Kourtos · Playtomic"
        action={
          <Link href="/kourtos" className="text-xs font-semibold text-court hover:underline">
            Open
          </Link>
        }
      >
        {p.playtomic_level != null || p.kourtos_overview ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted">Level</p>
              <p className="font-display text-xl font-bold text-clay">
                {p.playtomic_level != null
                  ? p.playtomic_level.toFixed(2)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted">Win rate</p>
              <p className="font-display text-xl font-bold">
                {(p.kourtos_overview as { win_rate?: number | null } | null)
                  ?.win_rate != null
                  ? `${Math.round(((p.kourtos_overview as { win_rate: number }).win_rate) * 100)}%`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted">Games</p>
              <p className="font-display text-xl font-bold">
                {(p.kourtos_overview as { games_count?: number } | null)
                  ?.games_count ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted">Synced</p>
              <p className="text-sm text-muted">
                {p.kourtos_synced_at
                  ? formatDate(p.kourtos_synced_at.slice(0, 10))
                  : "Never"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Connect Kourtos to pull Playtomic level and match history.{" "}
            <Link href="/kourtos" className="text-court underline">
              Set up sync
            </Link>
          </p>
        )}
      </SectionCard>

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title={`Phase ${phase} · ${PHASE_META[phase].title}`}>
          <p className="mb-3 text-sm text-muted">{PHASE_META[phase].subtitle}</p>
          <div className="mb-2 flex justify-between text-sm">
            <span>Phase progress</span>
            <span className="font-semibold text-court">{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-court animate-fill-bar"
              style={{ width: `${pct}%` }}
            />
          </div>
        </SectionCard>

        <SectionCard title="This week">
          <WeekChecklist
            targets={p.weekly_targets}
            courtCount={practice?.length ?? 0}
            gymCount={gym?.length ?? 0}
            coachingCount={coaching?.length ?? 0}
            hasRecovery={Boolean(recovery)}
            hasNutrition={Boolean(nutrition)}
          />
        </SectionCard>
      </div>

      <SectionCard title="Recent activity">
        <ul className="space-y-3 text-sm">
          {(recentPractice || []).map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-1 border-b border-line pb-3 last:border-0 sm:flex-row sm:justify-between sm:gap-3"
            >
              <span className="min-w-0 break-words">
                Court · {s.session_type} · {s.duration_mins}m
                {s.focus ? ` · ${s.focus}` : ""}
              </span>
              <span className="shrink-0 text-muted">
                {formatDate(s.session_date)}
              </span>
            </li>
          ))}
          {(recentComps || []).map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-1 border-b border-line pb-3 last:border-0 sm:flex-row sm:justify-between sm:gap-3"
            >
              <span className="min-w-0 break-words">
                Comp · {c.name} ({c.level})
                {c.result ? ` · ${c.result}` : ""}
              </span>
              <span className="shrink-0 text-muted">
                {formatDate(c.event_date)}
              </span>
            </li>
          ))}
          {!recentPractice?.length && !recentComps?.length ? (
            <li className="text-muted">
              No sessions yet — log your first court session to start the streak.
            </li>
          ) : null}
        </ul>
      </SectionCard>
    </div>
  );
}
