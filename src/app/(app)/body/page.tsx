import {
  deleteBodyMetric,
  upsertBodyMetric,
  updateProfile,
} from "@/lib/actions";
import { metricTrend, suggestBodyTargets } from "@/lib/body/coaching";
import type { BodyMetric, BodyGoal } from "@/lib/body/types";
import { BODY_FIELD_HELP, BODY_GOAL_LABELS } from "@/lib/body/types";
import { BodyTargetsCard } from "@/components/BodyTargetsCard";
import {
  DangerButton,
  Field,
  InfoTooltip,
  PageHeader,
  SectionCard,
  TextInput,
  TextSelect,
  TextTextarea,
} from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { formatDate, todayISO } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function BodyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: logs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("body_metrics")
      .select("*")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(30),
  ]);

  const p = profile as Profile;
  const metrics = (logs as BodyMetric[]) || [];
  const latest = metrics[0] ?? null;
  const trend = metricTrend(metrics);
  const goal = (p.body_goal ?? "recomp") as BodyGoal;
  const targets = suggestBodyTargets({
    weightKg: latest ? Number(latest.weight_kg) : null,
    bodyFatPct: latest?.body_fat_pct != null ? Number(latest.body_fat_pct) : null,
    heightCm: p.height_cm != null ? Number(p.height_cm) : null,
    sex: p.sex ?? null,
    goal,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Body"
        description="Weight, body fat, and measurements — used to tailor meal prep calories/protein and gym loading."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface px-4 py-4">
          <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted">
            Weight
            <InfoTooltip text={BODY_FIELD_HELP.weight} />
          </p>
          <p className="font-display text-2xl font-bold text-charcoal">
            {latest ? `${Number(latest.weight_kg).toFixed(1)} kg` : "—"}
          </p>
          {trend.weightDelta != null ? (
            <p className="text-xs text-muted">
              {trend.weightDelta > 0 ? "+" : ""}
              {trend.weightDelta.toFixed(1)} kg recent
            </p>
          ) : null}
        </div>
        <div className="rounded-xl border border-line bg-surface px-4 py-4">
          <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted">
            Body fat
            <InfoTooltip text={BODY_FIELD_HELP.body_fat} />
          </p>
          <p className="font-display text-2xl font-bold text-clay">
            {latest?.body_fat_pct != null
              ? `${Number(latest.body_fat_pct).toFixed(1)}%`
              : "—"}
          </p>
          {trend.fatDelta != null ? (
            <p className="text-xs text-muted">
              {trend.fatDelta > 0 ? "+" : ""}
              {trend.fatDelta.toFixed(1)} pts recent
            </p>
          ) : null}
        </div>
        <div className="rounded-xl border border-line bg-surface px-4 py-4">
          <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted">
            Goal
            <InfoTooltip text={BODY_FIELD_HELP.goal_card} />
          </p>
          <p className="font-display text-lg font-bold text-charcoal">
            {BODY_GOAL_LABELS[goal]}
          </p>
          <p className="text-xs text-muted">
            <Link href="/meal-prep" className="text-court underline">
              Meal prep
            </Link>{" "}
            uses this
          </p>
        </div>
      </div>

      <BodyTargetsCard targets={targets} />

      <SectionCard title="Log check-in">
        <form action={upsertBodyMetric} className="grid gap-4 sm:grid-cols-2">
          <Field label="Date" tooltip={BODY_FIELD_HELP.date}>
            <TextInput
              name="log_date"
              type="date"
              required
              defaultValue={todayISO()}
            />
          </Field>
          <Field label="Weight (kg)" tooltip={BODY_FIELD_HELP.weight}>
            <TextInput
              name="weight_kg"
              type="number"
              step="0.1"
              min={40}
              max={200}
              required
              defaultValue={latest?.weight_kg ?? ""}
            />
          </Field>
          <Field label="Body fat %" tooltip={BODY_FIELD_HELP.body_fat}>
            <TextInput
              name="body_fat_pct"
              type="number"
              step="0.1"
              min={3}
              max={50}
              defaultValue={latest?.body_fat_pct ?? ""}
              placeholder="scales / DEXA / callipers"
            />
          </Field>
          <Field label="Waist (cm)" tooltip={BODY_FIELD_HELP.waist}>
            <TextInput
              name="waist_cm"
              type="number"
              step="0.1"
              defaultValue={latest?.waist_cm ?? ""}
            />
          </Field>
          <Field label="Chest (cm)" tooltip={BODY_FIELD_HELP.chest}>
            <TextInput
              name="chest_cm"
              type="number"
              step="0.1"
              defaultValue={latest?.chest_cm ?? ""}
            />
          </Field>
          <Field label="Hips (cm)" tooltip={BODY_FIELD_HELP.hips}>
            <TextInput
              name="hips_cm"
              type="number"
              step="0.1"
              defaultValue={latest?.hips_cm ?? ""}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes" tooltip={BODY_FIELD_HELP.notes}>
              <TextTextarea
                name="notes"
                placeholder="Morning fasted, same scales, etc."
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>Save metrics</SubmitButton>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Body settings">
        <form action={updateProfile} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="display_name" value={p.display_name} />
          <input type="hidden" name="home_base" value={p.home_base} />
          <input type="hidden" name="started_padel_at" value={p.started_padel_at} />
          <input type="hidden" name="goal_fip_at" value={p.goal_fip_at} />
          <input
            type="hidden"
            name="goal_uk_top100_at"
            value={p.goal_uk_top100_at}
          />
          <input
            type="hidden"
            name="uk_ranking"
            value={p.uk_ranking ?? ""}
          />
          <input
            type="hidden"
            name="target_court"
            value={p.weekly_targets.court}
          />
          <input type="hidden" name="target_gym" value={p.weekly_targets.gym} />
          <input
            type="hidden"
            name="target_coaching"
            value={p.weekly_targets.coaching}
          />
          <Field label="Height (cm)" tooltip={BODY_FIELD_HELP.height}>
            <TextInput
              name="height_cm"
              type="number"
              step="0.1"
              defaultValue={p.height_cm ?? ""}
            />
          </Field>
          <Field label="Sex (for estimates)" tooltip={BODY_FIELD_HELP.sex}>
            <TextSelect name="sex" defaultValue={p.sex ?? ""}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </TextSelect>
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="Body composition goal"
              tooltip={BODY_FIELD_HELP.body_goal}
            >
              <TextSelect name="body_goal" defaultValue={goal}>
                <option value="lose_fat">Lose fat (keep power)</option>
                <option value="recomp">Recomp</option>
                <option value="maintain">Maintain</option>
                <option value="gain">Gain lean mass</option>
              </TextSelect>
            </Field>
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>Save body settings</SubmitButton>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="History">
        <ul className="divide-y divide-line text-sm">
          {metrics.map((m) => (
            <li
              key={m.id}
              className="flex items-start justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="break-words font-medium text-ink">
                  {formatDate(m.log_date)} · {Number(m.weight_kg).toFixed(1)} kg
                  {m.body_fat_pct != null
                    ? ` · ${Number(m.body_fat_pct).toFixed(1)}% BF`
                    : ""}
                </p>
                <p className="break-words text-muted">
                  {[
                    m.waist_cm != null && `Waist ${m.waist_cm}`,
                    m.chest_cm != null && `Chest ${m.chest_cm}`,
                    m.hips_cm != null && `Hips ${m.hips_cm}`,
                  ]
                    .filter(Boolean)
                    .join(" · ") || m.notes || "—"}
                </p>
              </div>
              <form action={deleteBodyMetric.bind(null, m.id)}>
                <DangerButton type="submit">Delete</DangerButton>
              </form>
            </li>
          ))}
          {!metrics.length ? (
            <li className="py-3 text-muted">
              No check-ins yet. Log weight (and BF% if you have it) so meal prep
              can set calories properly.
            </li>
          ) : null}
        </ul>
      </SectionCard>
    </div>
  );
}
