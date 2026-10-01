export type BodyGoal = "lose_fat" | "recomp" | "maintain" | "gain";

export type BodyMetric = {
  id: string;
  user_id: string;
  log_date: string;
  weight_kg: number;
  body_fat_pct: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  hips_cm: number | null;
  notes: string | null;
  created_at: string;
};

export type GymExercise = {
  name: string;
  sets: string;
  notes: string;
};

export type GymBlock = {
  name: string;
  exercises: GymExercise[];
};

export type GymDaySession = {
  date: string;
  weekday: string;
  title: string;
  padel_why: string;
  focus: string;
  duration_mins: number;
  rpe_target: number;
  blocks: GymBlock[];
  done?: boolean;
};

export type GymWeekPlan = {
  summary: string;
  priority: string;
  sessions: GymDaySession[];
  deload_note?: string | null;
};

export type GymPlanRow = {
  id: string;
  user_id: string;
  week_start: string;
  title: string;
  context: Record<string, unknown>;
  plan: GymWeekPlan;
  created_at: string;
  updated_at: string;
};

export const BODY_GOAL_LABELS: Record<BodyGoal, string> = {
  lose_fat: "Lose fat (keep power)",
  recomp: "Recomp",
  maintain: "Maintain",
  gain: "Gain (lean mass)",
};

/** Short explanations for body UI tooltips */
export const BODY_FIELD_HELP = {
  weight:
    "Total body mass in kg. Weigh at a consistent time (ideally morning, fasted, same scales) so trends are meaningful for meal prep and gym loading.",
  body_fat:
    "Estimated fat mass as a % of body weight (smart scales, DEXA, or callipers). Used with weight to estimate lean mass and set protein targets.",
  waist:
    "Circumference at the navel (or narrowest point). A useful proxy for abdominal fat — track the trend, not day-to-day noise.",
  chest:
    "Circumference around the fullest part of the chest (nipple line). Helps track upper-body size alongside weight.",
  hips:
    "Circumference at the widest point of the hips/glutes. Often paired with waist to watch shape change over time.",
  height:
    "Standing height without shoes. Used for calorie estimates and context with weight when body fat isn’t logged.",
  sex: "Only used for rough calorie / lean-mass estimates when body fat % isn’t available. Optional.",
  body_goal:
    "How meal prep and gym bias calories and protein: lose fat (slight deficit, high protein), recomp (near maintenance), maintain, or gain lean mass (surplus).",
  date: "The day this check-in applies to. Use the morning you weighed for consistency.",
  notes:
    "Anything that affects the reading — fasted vs fed, travel, illness, different scales, or DEXA day.",
  goal_card:
    "Your composition target. Meal prep calories/protein and gym plans lean on this setting.",
  targets_card:
    "Suggested weight and body-fat aims for padel performance based on your latest check-in, height/sex, and composition goal. Estimates — not medical advice.",
} as const;
