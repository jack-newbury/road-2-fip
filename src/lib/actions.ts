"use server";

import {
  buildProgressSnapshot,
  buildRecapSystemPrompt,
  type RecapPeriod,
} from "@/lib/ai/recap";
import {
  buildTemplateGymPlan,
  buildTemplatePlan,
  gymPlanSystemPrompt,
  mealPrepSystemPrompt,
  suggestCalories,
} from "@/lib/body/coaching";
import type { BodyGoal, GymWeekPlan } from "@/lib/body/types";
import { fetchKourtosSnapshot } from "@/lib/kourtos/client";
import { fetchLtaRanking } from "@/lib/lta/client";
import { mondayOfWeek, toWeekStartMonday } from "@/lib/meal-prep/plan";
import { parseMealPlanJson } from "@/lib/meal-prep/normalize";
import type {
  MealPlanContent,
  MealPlanPreferences,
} from "@/lib/meal-prep/types";
import { DEFAULT_SUPPLEMENTS } from "@/lib/supplements/types";
import { claudeJson, claudeText, isClaudeConfigured } from "@/lib/ai/claude";
import { createClient } from "@/lib/supabase/server";
import { currentPhase } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  CompetitionLevel,
  GymFocus,
  PracticeSessionType,
  Profile,
  RecoveryActivity,
  SkillStatus,
  WeeklyTargets,
} from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function completeOnboarding(formData: FormData) {
  const { supabase, user } = await requireUser();

  const display_name = String(formData.get("display_name") || "").trim();
  const home_base =
    String(formData.get("home_base") || "").trim() ||
    "Northampton, Northamptonshire";
  const started_padel_at = String(formData.get("started_padel_at"));
  const goal_fip_at = String(formData.get("goal_fip_at"));
  const goal_uk_top100_at = String(formData.get("goal_uk_top100_at"));

  const weekly_targets: WeeklyTargets = {
    court: Number(formData.get("target_court") || 3),
    gym: Number(formData.get("target_gym") || 2),
    coaching: Number(formData.get("target_coaching") || 1),
  };

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: display_name || "Athlete",
    home_base,
    started_padel_at,
    goal_fip_at,
    goal_uk_top100_at,
    weekly_targets,
    onboarding_complete: true,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await requireUser();

  const ukRaw = String(formData.get("uk_ranking") || "").trim();
  const heightRaw = String(formData.get("height_cm") || "").trim();
  const sexRaw = String(formData.get("sex") || "").trim();
  const weekly_targets: WeeklyTargets = {
    court: Number(formData.get("target_court") || 3),
    gym: Number(formData.get("target_gym") || 2),
    coaching: Number(formData.get("target_coaching") || 1),
  };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: String(formData.get("display_name") || "").trim(),
      home_base: String(formData.get("home_base") || "").trim(),
      started_padel_at: String(formData.get("started_padel_at")),
      goal_fip_at: String(formData.get("goal_fip_at")),
      goal_uk_top100_at: String(formData.get("goal_uk_top100_at")),
      uk_ranking: ukRaw ? Number(ukRaw) : null,
      height_cm: heightRaw ? Number(heightRaw) : null,
      sex: sexRaw || null,
      body_goal: String(formData.get("body_goal") || "recomp"),
      weekly_targets,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/profile");
  revalidatePath("/meal-prep");
  revalidatePath("/body");
  revalidatePath("/");
}

export async function updateSkillStatus(
  skillId: string,
  status: SkillStatus,
  notes?: string,
) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("skill_progress").upsert(
    {
      user_id: user.id,
      skill_id: skillId,
      status,
      notes: notes ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,skill_id" },
  );
  if (error) throw new Error(error.message);
  revalidatePath("/roadmap");
}

export async function addPracticeSession(formData: FormData) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("practice_sessions").insert({
    user_id: user.id,
    session_date: String(formData.get("session_date")),
    duration_mins: Number(formData.get("duration_mins")),
    focus: String(formData.get("focus") || "") || null,
    session_type: String(
      formData.get("session_type") || "drill",
    ) as PracticeSessionType,
    intensity: formData.get("intensity")
      ? Number(formData.get("intensity"))
      : null,
    rpe: formData.get("rpe") ? Number(formData.get("rpe")) : null,
    notes: String(formData.get("notes") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/practice");
}

export async function deletePracticeSession(id: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("practice_sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/practice");
}

export async function addCoachingSession(formData: FormData) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("coaching_sessions").insert({
    user_id: user.id,
    session_date: String(formData.get("session_date")),
    duration_mins: Number(formData.get("duration_mins")),
    coach_name: String(formData.get("coach_name") || "") || null,
    focus: String(formData.get("focus") || "") || null,
    takeaways: String(formData.get("takeaways") || "") || null,
    homework: String(formData.get("homework") || "") || null,
    notes: String(formData.get("notes") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/coaching");
}

export async function deleteCoachingSession(id: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("coaching_sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/coaching");
}

export async function addGymSession(formData: FormData) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("gym_sessions").insert({
    user_id: user.id,
    session_date: String(formData.get("session_date")),
    duration_mins: Number(formData.get("duration_mins")),
    focus: String(formData.get("focus") || "full") as GymFocus,
    session_type: String(formData.get("session_type") || "") || null,
    notes: String(formData.get("notes") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/gym");
}

export async function deleteGymSession(id: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("gym_sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/gym");
}

export async function addCompetition(formData: FormData) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("competitions").insert({
    user_id: user.id,
    event_date: String(formData.get("event_date")),
    name: String(formData.get("name") || "").trim(),
    level: String(formData.get("level") || "club") as CompetitionLevel,
    result: String(formData.get("result") || "") || null,
    partner: String(formData.get("partner") || "") || null,
    ranking_notes: String(formData.get("ranking_notes") || "") || null,
    notes: String(formData.get("notes") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/competitions");
}

export async function deleteCompetition(id: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("competitions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/competitions");
}

export async function upsertRecovery(formData: FormData) {
  const { supabase, user } = await requireUser();
  const log_date = String(formData.get("log_date"));
  const { error } = await supabase.from("recovery_logs").upsert(
    {
      user_id: user.id,
      log_date,
      sleep_hours: formData.get("sleep_hours")
        ? Number(formData.get("sleep_hours"))
        : null,
      soreness: formData.get("soreness")
        ? Number(formData.get("soreness"))
        : null,
      readiness: formData.get("readiness")
        ? Number(formData.get("readiness"))
        : null,
      activity: (String(formData.get("activity") || "") ||
        null) as RecoveryActivity | null,
      notes: String(formData.get("notes") || "") || null,
    },
    { onConflict: "user_id,log_date" },
  );
  if (error) throw new Error(error.message);
  revalidatePath("/recovery");
}

export async function upsertNutrition(formData: FormData) {
  const { supabase, user } = await requireUser();
  const log_date = String(formData.get("log_date"));
  const { error } = await supabase.from("nutrition_logs").upsert(
    {
      user_id: user.id,
      log_date,
      protein_focus: formData.get("protein_focus") === "on",
      hydration_litres: formData.get("hydration_litres")
        ? Number(formData.get("hydration_litres"))
        : null,
      energy: formData.get("energy")
        ? Number(formData.get("energy"))
        : null,
      pre_court: String(formData.get("pre_court") || "") || null,
      post_court: String(formData.get("post_court") || "") || null,
      notes: String(formData.get("notes") || "") || null,
    },
    { onConflict: "user_id,log_date" },
  );
  if (error) throw new Error(error.message);
  revalidatePath("/nutrition");
}

/** Ensure the user has a default stack (creatine, multi, omega-3). */
export async function ensureDefaultSupplements() {
  try {
    const { supabase, user } = await requireUser();
    const { count, error: countError } = await supabase
      .from("supplements")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      return {
        ok: false as const,
        error: `${countError.message}. Run supabase/migrations/007_supplements.sql in Supabase.`,
      };
    }

    if ((count ?? 0) > 0) return { ok: true as const };

    const { error } = await supabase.from("supplements").insert(
      DEFAULT_SUPPLEMENTS.map((s) => ({
        user_id: user.id,
        ...s,
        active: true,
      })),
    );
    if (error) {
      return {
        ok: false as const,
        error: `${error.message}. Run supabase/migrations/007_supplements.sql in Supabase.`,
      };
    }
    return { ok: true as const };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Could not seed supplements.",
    };
  }
}

export async function upsertSupplement(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = String(formData.get("id") || "").trim();
  const payload = {
    user_id: user.id,
    name: String(formData.get("name") || "").trim(),
    dose: String(formData.get("dose") || "").trim() || null,
    timing: String(formData.get("timing") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    active: formData.get("active") !== "off",
    sort_order: Number(formData.get("sort_order") || 99),
  };
  if (!payload.name) throw new Error("Supplement name is required.");

  const { error } = id
    ? await supabase.from("supplements").update(payload).eq("id", id).eq("user_id", user.id)
    : await supabase.from("supplements").insert(payload);

  if (error) {
    throw new Error(
      `${error.message}. Run supabase/migrations/007_supplements.sql if needed.`,
    );
  }
  revalidatePath("/nutrition");
  revalidatePath("/meal-prep");
}

export async function deleteSupplement(id: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("supplements")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/nutrition");
  revalidatePath("/meal-prep");
}

export async function toggleSupplementTaken(
  supplementId: string,
  logDate: string,
  taken: boolean,
) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("supplement_logs").upsert(
    {
      user_id: user.id,
      supplement_id: supplementId,
      log_date: logDate,
      taken,
    },
    { onConflict: "user_id,supplement_id,log_date" },
  );
  if (error) throw new Error(error.message);
  // Optimistic clients own the UI; skip revalidate to keep toggles snappy
}

export async function markAllSupplementsTaken(logDate: string) {
  const { supabase, user } = await requireUser();
  const { data: stack } = await supabase
    .from("supplements")
    .select("id")
    .eq("user_id", user.id)
    .eq("active", true);

  if (!stack?.length) return;

  const { error } = await supabase.from("supplement_logs").upsert(
    stack.map((s) => ({
      user_id: user.id,
      supplement_id: s.id,
      log_date: logDate,
      taken: true,
    })),
    { onConflict: "user_id,supplement_id,log_date" },
  );
  if (error) throw new Error(error.message);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function syncKourtos(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const { supabase, user } = await requireUser();

  try {
    const { overview, matches } = await fetchKourtosSnapshot();
    const level = overview.playtomic_level_value
      ? Number(overview.playtomic_level_value)
      : null;
    const confidence = overview.playtomic_level_confidence
      ? Number(overview.playtomic_level_confidence)
      : null;

    const { error } = await supabase
      .from("profiles")
      .update({
        playtomic_level: Number.isFinite(level) ? level : null,
        playtomic_level_confidence: Number.isFinite(confidence)
          ? confidence
          : null,
        kourtos_overview: overview,
        kourtos_recent_matches: matches,
        kourtos_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return {
        ok: false,
        error: `${error.message}. Run supabase/migrations/003_kourtos.sql if columns are missing.`,
      };
    }

    revalidatePath("/");
    revalidatePath("/kourtos");
    revalidatePath("/recaps");
    revalidatePath("/profile");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Kourtos sync failed.",
    };
  }
}

export async function syncLtaRanking(formData?: FormData): Promise<{
  ok: boolean;
  error?: string;
  rank?: number | null;
}> {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("lta_player_number, lta_profile_guid")
    .eq("id", user.id)
    .single();

  const fromForm = formData
    ? String(formData.get("lta_player_number") || "").trim()
    : "";
  const playerNumber =
    fromForm ||
    profile?.lta_player_number ||
    process.env.LTA_PLAYER_NUMBER?.trim() ||
    "";

  if (!playerNumber) {
    return {
      ok: false,
      error: "Add your LTA player number (e.g. 136873792), then sync.",
    };
  }

  try {
    const snapshot = await fetchLtaRanking(
      playerNumber,
      profile?.lta_profile_guid,
    );

    const { error } = await supabase
      .from("profiles")
      .update({
        lta_player_number: snapshot.player_number,
        lta_profile_guid: snapshot.profile_guid,
        lta_ranking: snapshot,
        lta_synced_at: snapshot.synced_at,
        uk_ranking: snapshot.primary?.rank ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return {
        ok: false,
        error: `${error.message}. Run supabase/migrations/008_lta_ranking.sql in Supabase.`,
      };
    }

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/recaps");
    return { ok: true, rank: snapshot.primary?.rank ?? null };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "LTA ranking sync failed.",
    };
  }
}

export async function generateRecap(period: RecapPeriod): Promise<{
  ok: boolean;
  error?: string;
  content?: string;
  id?: string;
}> {
  if (!isClaudeConfigured()) {
    return {
      ok: false,
      error:
        "Add ANTHROPIC_API_KEY to .env.local and restart the server to enable AI recaps.",
    };
  }

  const { supabase, user } = await requireUser();
  const snapshot = await buildProgressSnapshot(supabase, user.id, period);

  try {
    const { text: content } = await claudeText({
      system: buildRecapSystemPrompt(),
      user: `Generate a ${snapshot.label.toLowerCase()} recap for this athlete using only this data:\n\n${JSON.stringify(snapshot, null, 2)}`,
      temperature: 0.6,
      maxTokens: 2500,
    });
    if (!content) {
      return { ok: false, error: "The AI returned an empty recap. Try again." };
    }

    const { data, error } = await supabase
      .from("recaps")
      .insert({
        user_id: user.id,
        period,
        period_start: snapshot.start,
        period_end: snapshot.end,
        content,
      })
      .select("id")
      .single();

    if (error) {
      return {
        ok: false,
        error: `Recap generated but failed to save: ${error.message}. Run supabase/migrations/002_recaps.sql in Supabase.`,
      };
    }

    revalidatePath("/recaps");
    return { ok: true, content, id: data.id };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate recap.";
    return { ok: false, error: message };
  }
}

function prefsFromForm(formData: FormData): MealPlanPreferences {
  return {
    people: Number(formData.get("people") || 1),
    calories_target: Number(formData.get("calories_target") || 2600),
    protein_g: Number(formData.get("protein_g") || 160),
    diet: String(formData.get("diet") || "omnivore"),
    dislikes: String(formData.get("dislikes") || ""),
    store: String(formData.get("store") || "Tesco / Ocado (UK)"),
    cook_time_mins: Number(formData.get("cook_time_mins") || 90),
    court_days_hint: String(
      formData.get("court_days_hint") ||
        "Tue, Thu evening + weekend match possible",
    ),
    body_goal: String(formData.get("body_goal") || "recomp"),
  };
}

async function generatePlanContent(
  weekStart: string,
  prefs: MealPlanPreferences,
  context: unknown,
): Promise<MealPlanContent> {
  if (!isClaudeConfigured()) {
    return buildTemplatePlan(weekStart, prefs);
  }

  const raw = await claudeJson({
    system: mealPrepSystemPrompt(),
    user: JSON.stringify({
      week_start: weekStart,
      preferences: prefs,
      context,
    }),
    temperature: 0.5,
    maxTokens: 8192,
  });

  return parseMealPlanJson(raw);
}

export async function generateMealPlan(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
  weekStart?: string;
}> {
  const { supabase, user } = await requireUser();
  const weekStart = toWeekStartMonday(
    String(formData.get("week_start") || "").trim() || mondayOfWeek(),
  );
  let prefs = prefsFromForm(formData);

  const [
    { data: profile },
    { data: latestMetric },
    { data: recentRecovery },
    { data: supplementStack },
  ] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "display_name, home_base, weekly_targets, playtomic_level, height_cm, sex, body_goal, started_padel_at",
        )
        .eq("id", user.id)
        .single(),
      supabase
        .from("body_metrics")
        .select("*")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("recovery_logs")
        .select("readiness, soreness, sleep_hours, log_date")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false })
        .limit(5),
      supabase
        .from("supplements")
        .select("name, dose, timing, notes, active")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("sort_order"),
    ]);

  const goal = (prefs.body_goal ||
    profile?.body_goal ||
    "recomp") as BodyGoal;
  prefs.body_goal = goal;

  if (
    !formData.get("calories_target") ||
    Number(formData.get("calories_target")) <= 0
  ) {
    const suggested = suggestCalories({
      weightKg: latestMetric ? Number(latestMetric.weight_kg) : null,
      bodyFatPct: latestMetric?.body_fat_pct
        ? Number(latestMetric.body_fat_pct)
        : null,
      heightCm: profile?.height_cm ? Number(profile.height_cm) : null,
      sex: profile?.sex ?? null,
      goal,
    });
    prefs.calories_target = suggested.calories;
    prefs.protein_g = suggested.protein_g;
  }

  const currentStack =
    supplementStack?.length
      ? supplementStack
      : DEFAULT_SUPPLEMENTS.map(({ name, dose, timing, notes }) => ({
          name,
          dose,
          timing,
          notes,
          active: true,
        }));

  try {
    const plan = await generatePlanContent(weekStart, prefs, {
      profile,
      latest_body_metric: latestMetric,
      recent_recovery: recentRecovery,
      current_supplements: currentStack,
    });

    const { data, error } = await supabase
      .from("meal_plans")
      .upsert(
        {
          user_id: user.id,
          week_start: weekStart,
          title: `Meal prep · week of ${weekStart}`,
          preferences: prefs,
          plan,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,week_start" },
      )
      .select("id, week_start")
      .single();

    if (error) {
      return {
        ok: false,
        error: `${error.message}. Run supabase/migrations/004_meal_prep.sql (and 005_body_gym.sql) in Supabase.`,
      };
    }

    revalidatePath("/meal-prep");
    revalidatePath("/nutrition");
    return { ok: true, weekStart: data.week_start };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to generate meal plan.",
    };
  }
}

export async function toggleShoppingItem(
  planId: string,
  itemId: string,
  checked: boolean,
) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("meal_plans")
    .select("plan")
    .eq("id", planId)
    .eq("user_id", user.id)
    .single();

  if (!data?.plan) return;

  const plan = data.plan as MealPlanContent;
  plan.shopping = plan.shopping.map((item) =>
    item.id === itemId ? { ...item, checked } : item,
  );

  await supabase
    .from("meal_plans")
    .update({ plan, updated_at: new Date().toISOString() })
    .eq("id", planId)
    .eq("user_id", user.id);
}

export async function togglePrepStep(
  planId: string,
  stepId: string,
  done: boolean,
) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("meal_plans")
    .select("plan")
    .eq("id", planId)
    .eq("user_id", user.id)
    .single();

  if (!data?.plan) return;

  const plan = data.plan as MealPlanContent;
  plan.prep = plan.prep.map((step) =>
    step.id === stepId ? { ...step, done } : step,
  );

  await supabase
    .from("meal_plans")
    .update({ plan, updated_at: new Date().toISOString() })
    .eq("id", planId)
    .eq("user_id", user.id);
}

export async function copyShoppingListText(planId: string): Promise<string> {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("meal_plans")
    .select("plan")
    .eq("id", planId)
    .eq("user_id", user.id)
    .single();

  const plan = data?.plan as MealPlanContent | undefined;
  if (!plan?.shopping?.length) return "";

  const byAisle = new Map<string, string[]>();
  for (const item of plan.shopping) {
    if (item.checked) continue;
    const list = byAisle.get(item.aisle) || [];
    list.push(`${item.name} — ${item.qty}`);
    byAisle.set(item.aisle, list);
  }

  const lines: string[] = ["Shopping list (unchecked)"];
  for (const [aisle, items] of byAisle) {
    lines.push("", aisle.toUpperCase());
    lines.push(...items.map((i) => `• ${i}`));
  }
  return lines.join("\n");
}

export async function upsertBodyMetric(formData: FormData) {
  const { supabase, user } = await requireUser();
  const log_date = String(formData.get("log_date"));
  const { error } = await supabase.from("body_metrics").upsert(
    {
      user_id: user.id,
      log_date,
      weight_kg: Number(formData.get("weight_kg")),
      body_fat_pct: formData.get("body_fat_pct")
        ? Number(formData.get("body_fat_pct"))
        : null,
      waist_cm: formData.get("waist_cm")
        ? Number(formData.get("waist_cm"))
        : null,
      chest_cm: formData.get("chest_cm")
        ? Number(formData.get("chest_cm"))
        : null,
      hips_cm: formData.get("hips_cm")
        ? Number(formData.get("hips_cm"))
        : null,
      notes: String(formData.get("notes") || "") || null,
    },
    { onConflict: "user_id,log_date" },
  );
  if (error) {
    throw new Error(
      `${error.message}. Run supabase/migrations/005_body_gym.sql if needed.`,
    );
  }
  revalidatePath("/body");
  revalidatePath("/meal-prep");
  revalidatePath("/gym");
  revalidatePath("/");
}

export async function deleteBodyMetric(id: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("body_metrics")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/body");
  revalidatePath("/meal-prep");
}

async function generateGymWeekContent(
  weekStart: string,
  context: unknown,
  priority: string,
): Promise<GymWeekPlan> {
  if (!isClaudeConfigured()) {
    return buildTemplateGymPlan(weekStart, priority);
  }

  try {
    const raw = await claudeJson({
      system: gymPlanSystemPrompt(),
      user: JSON.stringify({ week_start: weekStart, context }),
      temperature: 0.55,
      maxTokens: 6144,
    });

    const parsed = JSON.parse(raw) as GymWeekPlan;
    if (!parsed.sessions?.length) {
      return buildTemplateGymPlan(weekStart, priority);
    }
    parsed.sessions = parsed.sessions.map((s) => ({
      ...s,
      done: Boolean(s.done),
    }));
    return parsed;
  } catch {
    return buildTemplateGymPlan(weekStart, priority);
  }
}

export async function generateGymPlan(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
}> {
  const { supabase, user } = await requireUser();
  const weekStart =
    String(formData.get("week_start") || "").trim() || mondayOfWeek();
  const priorityHint = String(
    formData.get("priority_hint") || "padel transfer this week",
  );

  const [
    { data: profile },
    { data: latestMetric },
    { data: recovery },
    { data: practice },
    { data: comps },
    { data: recentGym },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("body_metrics")
      .select("*")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("recovery_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(5),
    supabase
      .from("practice_sessions")
      .select("session_date, duration_mins, session_type, intensity, rpe")
      .eq("user_id", user.id)
      .order("session_date", { ascending: false })
      .limit(8),
    supabase
      .from("competitions")
      .select("event_date, name, level")
      .eq("user_id", user.id)
      .gte("event_date", weekStart)
      .order("event_date", { ascending: true })
      .limit(5),
    supabase
      .from("gym_sessions")
      .select("session_date, focus, duration_mins")
      .eq("user_id", user.id)
      .order("session_date", { ascending: false })
      .limit(6),
  ]);

  const p = profile as Profile | null;
  const phase = p ? currentPhase(p) : 1;
  const context = {
    priority_hint: priorityHint,
    roadmap_phase: phase,
    body_goal: p?.body_goal ?? "recomp",
    latest_body_metric: latestMetric,
    recent_recovery: recovery,
    recent_practice: practice,
    upcoming_competitions: comps,
    recent_gym: recentGym,
    weekly_targets: p?.weekly_targets,
  };

  try {
    const plan = await generateGymWeekContent(
      weekStart,
      context,
      priorityHint,
    );

    const { error } = await supabase.from("gym_plans").upsert(
      {
        user_id: user.id,
        week_start: weekStart,
        title: `Padel gym · week of ${weekStart}`,
        context,
        plan,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,week_start" },
    );

    if (error) {
      return {
        ok: false,
        error: `${error.message}. Run supabase/migrations/005_body_gym.sql in Supabase.`,
      };
    }

    revalidatePath("/gym");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to generate gym plan.",
    };
  }
}

export async function toggleGymPlanSession(
  planId: string,
  date: string,
  done: boolean,
) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("gym_plans")
    .select("plan")
    .eq("id", planId)
    .eq("user_id", user.id)
    .single();

  if (!data?.plan) return;
  const plan = data.plan as GymWeekPlan;
  plan.sessions = plan.sessions.map((s) =>
    s.date === date ? { ...s, done } : s,
  );

  await supabase
    .from("gym_plans")
    .update({ plan, updated_at: new Date().toISOString() })
    .eq("id", planId)
    .eq("user_id", user.id);
}

export async function logGymFromPlan(formData: FormData) {
  const { supabase, user } = await requireUser();
  const focus = String(formData.get("focus") || "full") as GymFocus | string;
  const allowed: GymFocus[] = [
    "legs",
    "core",
    "shoulders",
    "cardio",
    "full",
    "mobility",
  ];
  const focusSafe = allowed.includes(focus as GymFocus)
    ? (focus as GymFocus)
    : "full";

  const { error } = await supabase.from("gym_sessions").insert({
    user_id: user.id,
    session_date: String(formData.get("session_date")),
    duration_mins: Number(formData.get("duration_mins") || 45),
    focus: focusSafe,
    session_type: String(formData.get("session_type") || "") || null,
    notes: String(formData.get("notes") || "") || null,
  });
  if (error) throw new Error(error.message);

  const planId = String(formData.get("plan_id") || "");
  const date = String(formData.get("session_date") || "");
  if (planId && date) {
    await toggleGymPlanSession(planId, date, true);
  }

  revalidatePath("/gym");
}
