import type { Profile } from "@/lib/types";
import { daysUntil } from "@/lib/utils";

export function DualGoalStrip({ profile }: { profile: Profile }) {
  const fipDays = daysUntil(profile.goal_fip_at);
  const ukDays = daysUntil(profile.goal_uk_top100_at);
  const rank = profile.uk_ranking;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-clay-light">
          Primary · FIP points
        </p>
        <p className="mt-1 font-display text-2xl font-bold text-white">
          {fipDays > 0 ? `${fipDays} days` : fipDays === 0 ? "Today" : "Past due"}
        </p>
        <p className="text-xs text-white/70">to first FIP points target</p>
      </div>
      <div className="rounded-lg border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-clay-light">
          Secondary · UK top 100
        </p>
        <p className="mt-1 font-display text-2xl font-bold text-white">
          {rank ? `#${rank}` : "Unranked"}
        </p>
        <p className="text-xs text-white/70">
          {rank
            ? ukDays > 0
              ? `${ukDays} days to top-100 goal`
              : "Synced from LTA · keep climbing"
            : "Sync LTA ranking in Profile"}
        </p>
      </div>
    </div>
  );
}
