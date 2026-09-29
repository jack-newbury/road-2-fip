export type MealSlot =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack_pre"
  | "snack_post";

export type PlannedMeal = {
  slot: MealSlot | string;
  name: string;
  notes: string;
  prep_batch?: string | null;
};

export type DayPlan = {
  date: string;
  weekday: string;
  training_note?: string | null;
  meals: PlannedMeal[];
};

export type ShoppingItem = {
  id: string;
  name: string;
  qty: string;
  aisle: string;
  checked: boolean;
};

export type PrepStep = {
  id: string;
  title: string;
  detail: string;
  done: boolean;
};

export type MealPlanContent = {
  summary: string;
  days: DayPlan[];
  shopping: ShoppingItem[];
  prep: PrepStep[];
  order_tips: string[];
};

export type MealPlanPreferences = {
  people: number;
  calories_target: number;
  protein_g: number;
  diet: string;
  dislikes: string;
  store: string;
  cook_time_mins: number;
  court_days_hint: string;
  body_goal?: string;
};

export type MealPlanRow = {
  id: string;
  user_id: string;
  week_start: string;
  title: string;
  preferences: MealPlanPreferences;
  plan: MealPlanContent;
  created_at: string;
  updated_at: string;
};

export const SLOT_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack_pre: "Pre-court",
  snack_post: "Post-court",
};

export function mondayOfWeek(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekdayName(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
  });
}
