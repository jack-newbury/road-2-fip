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
