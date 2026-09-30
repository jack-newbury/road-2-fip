import { MealPrepClient } from "@/components/MealPrepClient";
import { PageHeader } from "@/components/ui";
import { suggestCalories } from "@/lib/body/coaching";
import type { BodyGoal } from "@/lib/body/types";
import { defaultPreferences, mondayOfWeek } from "@/lib/meal-prep/plan";
import { toWeekStartMonday } from "@/lib/meal-prep/types";
import type { MealPlanContent, MealPlanRow } from "@/lib/meal-prep/types";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MealPrepPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const weekStart = toWeekStartMonday(params.week || mondayOfWeek());

  const [{ data }, { data: profile }, { data: metric }, { data: historyRows }] =
    await Promise.all([
      supabase
        .from("meal_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start", weekStart)
        .maybeSingle(),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("body_metrics")
        .select("*")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("meal_plans")
        .select("id, week_start, title, updated_at, plan")
        .eq("user_id", user.id)
        .order("week_start", { ascending: false })
        .limit(16),
    ]);

  const p = profile as Profile;
  const suggested = suggestCalories({
    weightKg: metric ? Number(metric.weight_kg) : null,
    bodyFatPct: metric?.body_fat_pct ? Number(metric.body_fat_pct) : null,
    heightCm: p.height_cm ? Number(p.height_cm) : null,
    sex: p.sex ?? null,
    goal: (p.body_goal || "recomp") as BodyGoal,
  });

  const defaults = defaultPreferences({
    body_goal: p.body_goal || "recomp",
    calories_target: suggested.calories,
    protein_g: suggested.protein_g,
  });

  const history = (historyRows || []).map((row) => {
    const plan = row.plan as MealPlanContent | null;
    return {
      id: row.id as string,
      week_start: row.week_start as string,
      title: row.title as string,
      updated_at: row.updated_at as string,
      summary: plan?.summary ?? null,
    };
  });

  return (
    <div>
      <PageHeader
        title="Meal prep"
        description="Tailored to your body metrics and composition goal — order list + Sunday prep for court weeks. Saved plans stay available by week."
      />
      <p className="mb-6 text-sm text-muted">
        {metric ? (
          <>
            Using {Number(metric.weight_kg).toFixed(1)}kg
            {metric.body_fat_pct != null
              ? ` @ ${Number(metric.body_fat_pct).toFixed(1)}% BF`
              : ""}
            . Suggested ~{suggested.calories} kcal / {suggested.protein_g}g
            protein.{" "}
            <Link href="/body" className="text-court underline">
              Update body
            </Link>
          </>
        ) : (
          <>
            No body check-in yet —{" "}
            <Link href="/body" className="text-court underline">
              log weight / BF%
            </Link>{" "}
            for better calorie targeting ({suggested.note}).
          </>
        )}
      </p>
      <MealPrepClient
        weekStart={weekStart}
        plan={(data as MealPlanRow | null) ?? null}
        hasClaude={Boolean(process.env.ANTHROPIC_API_KEY)}
        defaultPrefs={defaults}
        history={history}
      />
    </div>
  );
}
