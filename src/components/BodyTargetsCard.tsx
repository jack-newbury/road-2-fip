import type { BodyTargets } from "@/lib/body/coaching";
import { BODY_FIELD_HELP } from "@/lib/body/types";
import { InfoTooltip } from "@/components/ui";
import Link from "next/link";

function fmtDelta(n: number, unit: string) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}${unit}`;
}

export function BodyTargetsCard({ targets }: { targets: BodyTargets }) {
  return (
    <section className="rounded-xl border border-court/25 bg-surface/90 p-4 shadow-[0_1px_0_rgba(28,28,28,0.04)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <h2 className="inline-flex items-center gap-1.5 font-display text-base font-semibold text-charcoal sm:text-lg">
          Targets
          <InfoTooltip text={BODY_FIELD_HELP.targets_card} />
        </h2>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-clay">
          {targets.bandLabel}
        </p>
      </div>

      {!targets.ready ? (
        <p className="text-sm text-muted">{targets.rationale}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label="Target weight"
              value={
                targets.targetWeightKg != null
                  ? `${targets.targetWeightKg.toFixed(1)} kg`
                  : "—"
              }
              hint={
                targets.weightDeltaKg != null &&
                Math.abs(targets.weightDeltaKg) >= 0.2
                  ? fmtDelta(targets.weightDeltaKg, " kg")
                  : "On track"
              }
            />
            <Stat
              label="Target body fat"
              value={
                targets.targetBfPct != null
                  ? `${targets.targetBfPct.toFixed(1)}%`
                  : "—"
              }
              hint={
                targets.bfDeltaPts != null
                  ? fmtDelta(targets.bfDeltaPts, " pts")
                  : targets.currentBfPct == null
                    ? "Log BF% to refine"
                    : "Hold"
              }
            />
            <Stat
              label="Lean mass"
              value={
                targets.leanMassKg != null
                  ? `${targets.leanMassKg.toFixed(1)} kg`
                  : "—"
              }
              hint={
                targets.targetLeanKg != null &&
                targets.leanMassKg != null &&
                Math.abs(targets.targetLeanKg - targets.leanMassKg) >= 0.2
                  ? `Aim ${targets.targetLeanKg.toFixed(1)} kg`
                  : "Preserve"
              }
            />
            <Stat
              label="Daily fuel"
              value={`${targets.calories} kcal`}
              hint={`${targets.protein_g}g protein`}
            />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink">
            {targets.rationale}
          </p>

          {targets.estimatedWeeks != null ? (
            <p className="mt-2 text-xs text-court">
              Rough timeline at a sustainable pace: ~{targets.estimatedWeeks}{" "}
              weeks. Adjust with{" "}
              <Link href="/meal-prep" className="underline">
                meal prep
              </Link>{" "}
              and training load — not a crash cut.
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted">
              Scale weight is close to target — focus on BF trend, waist, and
              on-court energy.
            </p>
          )}
        </>
      )}

      {targets.missing.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs text-muted">
          {targets.missing.map((m) => (
            <li key={m}>· {m}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-line bg-background/40 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="font-display text-lg font-semibold text-charcoal sm:text-xl">
        {value}
      </p>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
