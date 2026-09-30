import {
  addGymSession,
  deleteGymSession,
} from "@/lib/actions";
import { GymPlanClient } from "@/components/GymPlanClient";
import {
  DangerButton,
  Field,
  PageHeader,
  PrimaryButton,
  SectionCard,
  TextInput,
  TextSelect,
  TextTextarea,
} from "@/components/ui";
import type { GymPlanRow } from "@/lib/body/types";
import { mondayOfWeek } from "@/lib/meal-prep/types";
import { createClient } from "@/lib/supabase/server";
import { formatDate, todayISO } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function GymPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const weekStart = params.week || mondayOfWeek();

  const [{ data: sessions }, { data: plan }, { data: metric }] =
    await Promise.all([
      supabase
        .from("gym_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("session_date", { ascending: false })
        .limit(40),
      supabase
        .from("gym_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start", weekStart)
        .maybeSingle(),
      supabase
        .from("body_metrics")
        .select("weight_kg, body_fat_pct, log_date")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const bodyHint = metric
    ? `${Number(metric.weight_kg).toFixed(1)}kg${
        metric.body_fat_pct != null
          ? ` · ${Number(metric.body_fat_pct).toFixed(1)}% BF`
          : ""
      }`
    : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gym"
        description="Padel-performance S&C — generate a week from your readiness and goals, then log what you complete."
      />

      <GymPlanClient
        weekStart={weekStart}
        plan={(plan as GymPlanRow | null) ?? null}
        hasClaude={Boolean(process.env.ANTHROPIC_API_KEY)}
        bodyHint={bodyHint}
      />

      {!metric ? (
        <p className="text-sm text-muted">
          Tip:{" "}
          <Link href="/body" className="text-court underline">
            log body metrics
          </Link>{" "}
          so loading and meal prep stay aligned.
        </p>
      ) : null}

      <SectionCard title="Quick log">
        <form action={addGymSession} className="grid gap-4 sm:grid-cols-2">
          <Field label="Date">
            <TextInput
              name="session_date"
              type="date"
              required
              defaultValue={todayISO()}
            />
          </Field>
          <Field label="Duration (mins)">
            <TextInput
              name="duration_mins"
              type="number"
              min={15}
              required
              defaultValue={45}
            />
          </Field>
          <Field label="Focus">
            <TextSelect name="focus" defaultValue="full">
              <option value="full">Full</option>
              <option value="legs">Legs</option>
              <option value="core">Core</option>
              <option value="shoulders">Shoulders</option>
              <option value="cardio">Cardio</option>
              <option value="mobility">Mobility</option>
            </TextSelect>
          </Field>
          <Field label="Session type">
            <TextInput
              name="session_type"
              placeholder="e.g. COD power, shoulder prehab"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <TextTextarea name="notes" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <PrimaryButton type="submit">Save gym</PrimaryButton>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="History">
        <ul className="divide-y divide-line">
          {(sessions || []).map((s) => (
            <li
              key={s.id}
              className="flex items-start justify-between gap-3 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-ink">
                  {formatDate(s.session_date)} · {s.duration_mins}m · {s.focus}
                </p>
                <p className="text-muted">
                  {s.session_type || s.notes || "—"}
                </p>
              </div>
              <form action={deleteGymSession.bind(null, s.id)}>
                <DangerButton type="submit">Delete</DangerButton>
              </form>
            </li>
          ))}
          {!sessions?.length ? (
            <li className="py-3 text-sm text-muted">No gym sessions yet.</li>
          ) : null}
        </ul>
      </SectionCard>
    </div>
  );
}
