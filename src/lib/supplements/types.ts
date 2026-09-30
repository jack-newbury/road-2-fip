export type Supplement = {
  id: string;
  user_id: string;
  name: string;
  dose: string | null;
  timing: string | null;
  notes: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
};

export type SupplementLog = {
  id: string;
  user_id: string;
  supplement_id: string;
  log_date: string;
  taken: boolean;
  created_at: string;
};

export type RecommendedSupplement = {
  name: string;
  dose: string;
  timing: string;
  why: string;
};

export const DEFAULT_SUPPLEMENTS: Array<{
  name: string;
  dose: string;
  timing: string;
  notes: string;
  sort_order: number;
}> = [
  {
    name: "Creatine monohydrate",
    dose: "5g",
    timing: "Daily (any time, consistent)",
    notes: "Supports power / repeated efforts on court",
    sort_order: 1,
  },
  {
    name: "Multivitamin",
    dose: "1 serving",
    timing: "With breakfast",
    notes: "General micronutrient cover on training weeks",
    sort_order: 2,
  },
  {
    name: "Omega-3 (fish oil)",
    dose: "1–2g EPA+DHA",
    timing: "With a meal containing fat",
    notes: "Recovery and general health support",
    sort_order: 3,
  },
];
