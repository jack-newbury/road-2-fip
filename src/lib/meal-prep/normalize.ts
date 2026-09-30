import type { MealPlanContent } from "./types";

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/**
 * Accept Claude JSON even when keys vary slightly, and normalise to MealPlanContent.
 */
export function normalizeMealPlanContent(raw: unknown): MealPlanContent | null {
  const root = asRecord(raw);
  const daysRaw = asArray(root.days ?? root.week ?? root.daily_meals);
  const shoppingRaw = asArray(
    root.shopping ?? root.shopping_list ?? root.grocery_list ?? root.groceries,
  );
  const prepRaw = asArray(
    root.prep ?? root.prep_steps ?? root.prep_checklist ?? root.checklist,
  );
  const tipsRaw = asArray(root.order_tips ?? root.tips ?? root.notes);

  if (!daysRaw.length || !shoppingRaw.length) return null;

  const days = daysRaw.map((day, di) => {
    const d = asRecord(day);
    const meals = asArray(d.meals ?? d.meal_plan).map((meal) => {
      const m = asRecord(meal);
      return {
        slot: asString(m.slot, "meal"),
        name: asString(m.name || m.title, "Meal"),
        notes: asString(m.notes || m.detail),
        prep_batch:
          m.prep_batch == null || m.prep_batch === ""
            ? null
            : asString(m.prep_batch),
      };
    });
    return {
      date: asString(d.date, `day-${di + 1}`),
      weekday: asString(d.weekday, ""),
      training_note:
        d.training_note == null || d.training_note === ""
          ? null
          : asString(d.training_note),
      meals,
    };
  });

  const shopping = shoppingRaw.map((item, i) => {
    const s = asRecord(item);
    return {
      id: asString(s.id, `s${i + 1}`),
      name: asString(s.name || s.item, "Item"),
      qty: asString(s.qty || s.quantity || s.amount, "1"),
      aisle: asString(s.aisle || s.category, "Other"),
      checked: Boolean(s.checked),
    };
  });

  const prep = prepRaw.map((step, i) => {
    const p = asRecord(step);
    return {
      id: asString(p.id, `p${i + 1}`),
      title: asString(p.title || p.name, `Step ${i + 1}`),
      detail: asString(p.detail || p.notes || p.description),
      done: Boolean(p.done || p.checked),
    };
  });

  return {
    summary: asString(root.summary, "Weekly meal prep plan."),
    days,
    shopping,
    prep,
    order_tips: tipsRaw.map((t) => asString(t)).filter(Boolean),
  };
}

export function parseMealPlanJson(raw: string): MealPlanContent {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      "Claude returned invalid JSON for the meal plan. Nothing was saved — try Generate again.",
    );
  }
  const normalized = normalizeMealPlanContent(parsed);
  if (!normalized) {
    throw new Error(
      "Claude’s plan was missing days or a shopping list. Nothing was saved — try Generate again.",
    );
  }
  return normalized;
}
