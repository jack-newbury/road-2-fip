import type { WeeklyTargets } from "@/lib/types";

export function WeekChecklist({
  targets,
  courtCount,
  gymCount,
  coachingCount,
  hasRecovery,
  hasNutrition,
}: {
  targets: WeeklyTargets;
  courtCount: number;
  gymCount: number;
  coachingCount: number;
  hasRecovery: boolean;
  hasNutrition: boolean;
}) {
  const items = [
    {
      label: "Court sessions",
      done: courtCount,
      target: targets.court,
    },
    {
      label: "Gym sessions",
      done: gymCount,
      target: targets.gym,
    },
    {
      label: "Coaching",
      done: coachingCount,
      target: targets.coaching,
    },
    {
      label: "Recovery logged",
      done: hasRecovery ? 1 : 0,
      target: 1,
    },
    {
      label: "Nutrition logged",
      done: hasNutrition ? 1 : 0,
      target: 1,
    },
  ];

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const pct = Math.min(100, Math.round((item.done / item.target) * 100));
        const complete = item.done >= item.target;
        return (
          <li key={item.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className={complete ? "text-success font-medium" : "text-ink"}>
                {item.label}
              </span>
              <span className="text-muted">
                {item.done}/{item.target}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-line">
              <div
                className={`h-full rounded-full ${complete ? "bg-success" : "bg-court"} animate-fill-bar`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
