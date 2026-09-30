import type { MealPlanPreferences } from "./types";

export {
  buildTemplatePlan,
  mealPrepSystemPrompt,
} from "@/lib/body/coaching";

export { mondayOfWeek, toWeekStartMonday } from "./types";

export function defaultPreferences(
  overrides?: Partial<MealPlanPreferences>,
): MealPlanPreferences {
  return {
    people: 1,
    calories_target: 2600,
    protein_g: 160,
    diet: "omnivore",
    dislikes: "",
    store: "Tesco / Ocado (UK)",
    cook_time_mins: 90,
    court_days_hint: "Tue, Thu evening + weekend match possible",
    body_goal: "recomp",
    ...overrides,
  };
}
