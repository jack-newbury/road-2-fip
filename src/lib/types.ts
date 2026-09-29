export type SkillCategory =
  | "technique"
  | "tactics"
  | "physical"
  | "mental"
  | "competition";

export type SkillStatus = "todo" | "learning" | "practiced" | "solid";

export type CompetitionLevel = "club" | "midlands" | "national" | "fip";

export type PracticeSessionType = "drill" | "match" | "mixed";

export type GymFocus =
  | "legs"
  | "core"
  | "shoulders"
  | "cardio"
  | "full"
  | "mobility";

export type RecoveryActivity = "rest" | "mobility" | "light" | "other";

export type WeeklyTargets = {
  court: number;
  gym: number;
  coaching: number;
};

export type Profile = {
  id: string;
  display_name: string;
  home_base: string;
  started_padel_at: string;
  goal_fip_at: string;
  goal_uk_top100_at: string;
  uk_ranking: number | null;
  weekly_targets: WeeklyTargets;
  onboarding_complete: boolean;
  playtomic_level: number | null;
  playtomic_level_confidence: number | null;
  kourtos_overview: Record<string, unknown> | null;
  kourtos_recent_matches: unknown[] | null;
  kourtos_synced_at: string | null;
  height_cm?: number | null;
  sex?: "male" | "female" | "other" | null;
  body_goal?: "lose_fat" | "recomp" | "maintain" | "gain";
  created_at: string;
  updated_at: string;
};

export type RoadmapSkill = {
  id: string;
  phase: 1 | 2 | 3;
  category: SkillCategory;
  title: string;
  description: string;
  drill_hint: string | null;
  sort_order: number;
};

export type SkillProgress = {
  id: string;
  user_id: string;
  skill_id: string;
  status: SkillStatus;
  notes: string | null;
  updated_at: string;
};

export type PracticeSession = {
  id: string;
  user_id: string;
  session_date: string;
  duration_mins: number;
  focus: string | null;
  session_type: PracticeSessionType;
  intensity: number | null;
  rpe: number | null;
  notes: string | null;
  created_at: string;
};

export type CoachingSession = {
  id: string;
  user_id: string;
  session_date: string;
  duration_mins: number;
  coach_name: string | null;
  focus: string | null;
  takeaways: string | null;
  homework: string | null;
  notes: string | null;
  created_at: string;
};

export type GymSession = {
  id: string;
  user_id: string;
  session_date: string;
  duration_mins: number;
  focus: GymFocus;
  session_type: string | null;
  notes: string | null;
  created_at: string;
};

export type Competition = {
  id: string;
  user_id: string;
  event_date: string;
  name: string;
  level: CompetitionLevel;
  result: string | null;
  partner: string | null;
  ranking_notes: string | null;
  notes: string | null;
  created_at: string;
};

export type RecoveryLog = {
  id: string;
  user_id: string;
  log_date: string;
  sleep_hours: number | null;
  soreness: number | null;
  readiness: number | null;
  activity: RecoveryActivity | null;
  notes: string | null;
  created_at: string;
};

export type NutritionLog = {
  id: string;
  user_id: string;
  log_date: string;
  protein_focus: boolean;
  hydration_litres: number | null;
  energy: number | null;
  pre_court: string | null;
  post_court: string | null;
  notes: string | null;
  created_at: string;
};

export const PHASE_META = {
  1: {
    title: "Foundations",
    subtitle: "Northampton club base · technique & consistency",
    months: "Now → month 12",
  },
  2: {
    title: "UK competitive ladder",
    subtitle: "Midlands → national ranking path",
    months: "Months 12–24",
  },
  3: {
    title: "Top 100 UK + FIP",
    subtitle: "National volume · first FIP points",
    months: "Months 24–36",
  },
} as const;

export const STATUS_LABELS: Record<SkillStatus, string> = {
  todo: "To do",
  learning: "Learning",
  practiced: "Practiced",
  solid: "Solid",
};

export const LEVEL_LABELS: Record<CompetitionLevel, string> = {
  club: "Club",
  midlands: "Midlands",
  national: "National",
  fip: "FIP",
};
