import {
  addDaysISO,
  weekdayName,
  type MealPlanContent,
  type MealPlanPreferences,
} from "@/lib/meal-prep/types";
import type { BodyGoal, BodyMetric } from "@/lib/body/types";
import type { GymWeekPlan } from "@/lib/body/types";

export function suggestCalories(args: {
  weightKg: number | null;
  bodyFatPct: number | null;
  heightCm: number | null;
  sex: string | null;
  goal: BodyGoal;
}): { calories: number; protein_g: number; note: string } {
  const weight = args.weightKg ?? 80;
  const bf = args.bodyFatPct;
  const lean =
    bf != null && bf > 0 && bf < 60
      ? weight * (1 - bf / 100)
      : weight * 0.8;

  // Rough maintenance heuristic for active amateur athlete
  let calories = Math.round(lean * 33 + 400);
  if (args.goal === "lose_fat") calories = Math.round(calories * 0.88);
  if (args.goal === "gain") calories = Math.round(calories * 1.08);
  if (args.goal === "recomp") calories = Math.round(calories * 0.97);

  const protein_g = Math.round(Math.max(1.8, args.goal === "lose_fat" ? 2.2 : 2.0) * lean);

  return {
    calories,
    protein_g,
    note:
      bf != null
        ? `Based on ${weight}kg @ ${bf}% BF (~${lean.toFixed(1)}kg lean) · ${args.goal}`
        : `Based on ${weight}kg (est. lean) · ${args.goal}`,
  };
}

export function mealPrepSystemPrompt(): string {
  return `You are a performance nutrition coach for an adult padel player in Northampton, UK training toward UK top 100 and FIP points.

Return ONLY valid JSON matching this schema (no markdown fences):
{
  "summary": "string",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "weekday": "Monday",
      "training_note": "string or null",
      "meals": [
        { "slot": "breakfast|lunch|dinner|snack_pre|snack_post", "name": "string", "eat_time": "HH:MM", "notes": "string", "prep_batch": "string or null" }
      ]
    }
  ],
  "shopping": [
    { "id": "s1", "name": "string", "qty": "string", "aisle": "Produce|Meat|Dairy|Bakery|Frozen|Storecupboard|Other", "checked": false }
  ],
  "prep": [
    { "id": "p1", "title": "string", "detail": "string", "done": false }
  ],
  "order_tips": ["string"],
  "supplements": [
    { "name": "string", "dose": "string", "timing": "string — e.g. with breakfast / post-court", "why": "string" }
  ]
}

Rules:
- Exactly 7 days starting from the given week_start (Mon–Sun).
- Keep meal notes short (1 line). Keep shopping to essentials (~25–40 items).
- Every meal MUST include eat_time as 24h HH:MM (UK). Typical anchors: breakfast ~07:30, lunch ~12:30, dinner ~19:00; on court evenings shift dinner later and put snack_pre 60–90 min before session, snack_post within 30 min after.
- Use body metrics + body_goal to set portions (lose_fat = higher protein, controlled carbs; gain = surplus with quality carbs around court).
- Batch-cook friendly; UK supermarket names/pack sizes.
- Hit protein and calorie targets in preferences.
- snack_pre / snack_post on training days only.
- Include a supplements array. Always cover the athlete’s current stack from context (creatine, multivitamin, omega-3 if listed) with dose + timing aligned to meals. Optionally suggest at most 1–2 extras only if clearly useful for padel training (e.g. vitamin D in UK winter) — no medical claims, no megadoses.
- No medical claims. No emojis.`;
}

export function gymPlanSystemPrompt(): string {
  return `You are an S&C coach for padel (UK amateur → national → FIP pathway). Design a 7-day gym week that improves on-court performance.

Return ONLY valid JSON:
{
  "summary": "string",
  "priority": "string — the #1 physical quality this week",
  "deload_note": "string or null",
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "weekday": "Monday",
      "title": "string",
      "padel_why": "string — how this transfers to bandeja, wall defence, change of direction, etc.",
      "focus": "legs|core|shoulders|cardio|full|mobility|power|prehab",
      "duration_mins": 45,
      "rpe_target": 7,
      "done": false,
      "blocks": [
        {
          "name": "Warm-up|Strength|Power|Prehab|Conditioning|Finisher",
          "exercises": [
            { "name": "string", "sets": "3x8", "notes": "string" }
          ]
        }
      ]
    }
  ]
}

Rules:
- Exactly the gym days needed (usually 2–4). Rest/court-only days omitted or marked mobility only if recovery is low.
- Prioritise: lateral COD, hip hinge, rotator cuff/scapula, rotational power, ankle stiffness, aerobic base.
- Respect recent readiness, upcoming competitions, body goal, and current roadmap phase.
- Avoid heavy lower-body the day before/after hard matches when possible.
- UK gym equipment assumptions (barbell, DB, cables, bands, bike).
- No medical claims. No emojis.`;
}

export function buildTemplateGymPlan(
  weekStart: string,
  priority: string,
): GymWeekPlan {
  const days = [0, 2, 4].map((offset, i) => {
    const date = addDaysISO(weekStart, offset);
    const titles = [
      "Lower + COD power",
      "Upper + shoulder armour",
      "Engine + prehab",
    ];
    const focuses = ["power", "shoulders", "cardio"] as const;
    const whys = [
      "Faster first step and smash recovery from wide balls.",
      "Protect bandeja/víbora volume and net presence.",
      "Repeat points late in sets without technique drop.",
    ];
    return {
      date,
      weekday: weekdayName(date),
      title: titles[i],
      padel_why: whys[i],
      focus: focuses[i],
      duration_mins: 50,
      rpe_target: 7,
      done: false,
      blocks: [
        {
          name: "Warm-up",
          exercises: [
            {
              name: "Band dislocates + lateral skips",
              sets: "2x8 / 2x20m",
              notes: "Prime shoulders and hips",
            },
          ],
        },
        {
          name: "Main",
          exercises:
            i === 0
              ? [
                  { name: "Trap-bar or goblet squat", sets: "3x6", notes: "Explosive up" },
                  { name: "Lateral bound stick", sets: "3x4/side", notes: "Soft landing" },
                  { name: "Single-leg RDL", sets: "3x8/side", notes: "Control" },
                ]
              : i === 1
                ? [
                    { name: "Landmine / cable press", sets: "3x8", notes: "Scap stable" },
                    { name: "Face pulls", sets: "3x15", notes: "External rotation bias" },
                    { name: "Pallof press", sets: "3x10/side", notes: "Anti-rotation" },
                  ]
                : [
                    { name: "Bike intervals", sets: "6x40s hard / 80s easy", notes: "Zone 4 bursts" },
                    { name: "Copenhagen adductor", sets: "2x8/side", notes: "Groin resilience" },
                    { name: "Ankle rocks + calf raises", sets: "2x12", notes: "Wall defence legs" },
                  ],
        },
      ],
    };
  });

  return {
    summary: `Template padel S&C week. Priority: ${priority}. Adjust loads to RPE targets; skip heavy legs day-before matches.`,
    priority,
    sessions: days,
    deload_note: null,
  };
}

export function buildTemplatePlan(
  weekStart: string,
  prefs: MealPlanPreferences,
): MealPlanContent {
  const people = Math.max(1, prefs.people);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDaysISO(weekStart, i);
    const weekday = weekdayName(date);
    const isCourt =
      weekday === "Tuesday" ||
      weekday === "Thursday" ||
      weekday === "Saturday";
    const meals = [
      {
        slot: "breakfast",
        name: "Greek yoghurt bowl + oats + berries",
        eat_time: "07:30",
        notes: `${Math.round(200 * people)}g yoghurt, 60g oats`,
        prep_batch: "Berry portion packs",
      },
      {
        slot: "lunch",
        name: "Chicken rice boxes",
        eat_time: "12:30",
        notes: "Reheat from Sunday batch",
        prep_batch: "Chicken + rice batch",
      },
      {
        slot: "dinner",
        name: isCourt ? "Salmon, potatoes, greens" : "Beef chilli + rice",
        eat_time: isCourt ? "20:15" : "19:00",
        notes: isCourt ? "Carbs for evening session" : "Batch portion",
        prep_batch: isCourt ? null : "Chilli batch",
      },
    ];
    if (isCourt) {
      meals.push(
        {
          slot: "snack_pre",
          name: "Banana + PB rice cake",
          eat_time: "17:30",
          notes: "60–90 min pre-court",
          prep_batch: null,
        },
        {
          slot: "snack_post",
          name: "Chocolate milk + whey",
          eat_time: "21:00",
          notes: "Within 30 min of finishing",
          prep_batch: null,
        },
      );
    }
    return {
      date,
      weekday,
      training_note: isCourt ? "Court / higher fuel day" : "Recovery day",
      meals,
    };
  });

  return {
    summary: `Template week · ~${prefs.calories_target} kcal · ${prefs.protein_g}g protein · goal ${prefs.body_goal || "recomp"}.`,
    days,
    shopping: [
      { id: "s1", name: "Chicken breast", qty: `${500 * people}g`, aisle: "Meat", checked: false },
      { id: "s2", name: "Salmon fillets", qty: `${2 * people} pack`, aisle: "Meat", checked: false },
      { id: "s3", name: "Greek yoghurt 0%", qty: "1kg", aisle: "Dairy", checked: false },
      { id: "s4", name: "Basmati rice", qty: "1kg", aisle: "Storecupboard", checked: false },
      { id: "s5", name: "Mixed berries", qty: "500g", aisle: "Frozen", checked: false },
      { id: "s6", name: "Broccoli / greens", qty: "2 packs", aisle: "Produce", checked: false },
      { id: "s7", name: "Bananas", qty: "7", aisle: "Produce", checked: false },
      { id: "s8", name: "Whey protein", qty: "as needed", aisle: "Other", checked: false },
    ],
    prep: [
      {
        id: "p1",
        title: "Cook proteins",
        detail: "Chicken tray + chilli; portion.",
        done: false,
      },
      {
        id: "p2",
        title: "Carb batch",
        detail: "Rice + potatoes into boxes.",
        done: false,
      },
    ],
    order_tips: [`Order for ${prefs.store} before Sunday prep.`],
    supplements: [
      {
        name: "Creatine monohydrate",
        dose: "5g",
        timing: "Daily — any consistent time",
        why: "Supports repeated high-intensity efforts on court.",
      },
      {
        name: "Multivitamin",
        dose: "1 serving",
        timing: "With breakfast (~07:30)",
        why: "Covers basics on heavy training weeks.",
      },
      {
        name: "Omega-3 (fish oil)",
        dose: "1–2g EPA+DHA",
        timing: "With lunch or dinner (with fat)",
        why: "General recovery / inflammation support.",
      },
    ],
  };
}

export function metricTrend(logs: BodyMetric[]): {
  weightDelta: number | null;
  fatDelta: number | null;
} {
  if (logs.length < 2) return { weightDelta: null, fatDelta: null };
  const newest = logs[0];
  const oldest = logs[Math.min(logs.length - 1, 3)];
  return {
    weightDelta: Number(newest.weight_kg) - Number(oldest.weight_kg),
    fatDelta:
      newest.body_fat_pct != null && oldest.body_fat_pct != null
        ? Number(newest.body_fat_pct) - Number(oldest.body_fat_pct)
        : null,
  };
}
