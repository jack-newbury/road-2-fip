import {
  ensureDefaultSupplements,
  upsertNutrition,
} from "@/lib/actions";
import { SupplementTracker } from "@/components/SupplementTracker";
import {
  Field,
  PageHeader,
  SectionCard,
  TextInput,
  TextTextarea,
} from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import type { Supplement } from "@/lib/supplements/types";
import { createClient } from "@/lib/supabase/server";
import { formatDate, todayISO } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NutritionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = todayISO();

  // Seed creatine / multi / omega-3 if this account has an empty stack
  await ensureDefaultSupplements();

  const [
    { data: todayLog },
    { data: logs },
    { data: supplements },
    { data: todaySuppLogs },
  ] = await Promise.all([
    supabase
      .from("nutrition_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle(),
    supabase
      .from("nutrition_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(14),
    supabase
      .from("supplements")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("supplement_logs")
      .select("supplement_id, taken")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .eq("taken", true),
  ]);

  const takenIds = (todaySuppLogs || []).map((l) => l.supplement_id as string);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Nutrition"
        description="Fuel for court days — protein, hydration, supplements, and energy around sessions."
      />

      <p className="text-sm text-muted">
        Need the full week sorted?{" "}
        <Link href="/meal-prep" className="font-semibold text-court underline">
          Open meal prep
        </Link>{" "}
        to generate meals, order list, Sunday cook steps, and supplement timing.
      </p>

      <SupplementTracker
        logDate={today}
        supplements={(supplements as Supplement[]) || []}
        takenIds={takenIds}
      />

      <SectionCard title="Today">
        <form action={upsertNutrition} className="grid gap-4 sm:grid-cols-2">
          <Field label="Date">
            <TextInput
              name="log_date"
              type="date"
              required
              defaultValue={todayLog?.log_date ?? today}
            />
          </Field>
          <Field label="Hydration (litres)">
            <TextInput
              name="hydration_litres"
              type="number"
              step="0.1"
              min={0}
              defaultValue={todayLog?.hydration_litres ?? ""}
            />
          </Field>
          <Field label="Energy 1–10">
            <TextInput
              name="energy"
              type="number"
              min={1}
              max={10}
              defaultValue={todayLog?.energy ?? ""}
            />
          </Field>
          <label className="flex items-end gap-2 pb-2 text-sm text-ink">
            <input
              type="checkbox"
              name="protein_focus"
              defaultChecked={todayLog?.protein_focus ?? false}
              className="size-4 rounded border-line accent-court"
            />
            Protein focus hit today
          </label>
          <div className="sm:col-span-2">
            <Field label="Pre-court">
              <TextInput
                name="pre_court"
                defaultValue={todayLog?.pre_court ?? ""}
                placeholder="Meal / snack before playing"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Post-court">
              <TextInput
                name="post_court"
                defaultValue={todayLog?.post_court ?? ""}
                placeholder="Recovery meal"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <TextTextarea
                name="notes"
                defaultValue={todayLog?.notes ?? ""}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>Save nutrition</SubmitButton>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Last 14 days">
        <ul className="divide-y divide-line text-sm">
          {(logs || []).map((l) => (
            <li key={l.id} className="py-3">
              <p className="font-medium text-ink">{formatDate(l.log_date)}</p>
              <p className="text-muted">
                {l.protein_focus ? "Protein ✓" : "Protein —"} ·{" "}
                {l.hydration_litres ?? "—"}L · Energy {l.energy ?? "—"}
              </p>
            </li>
          ))}
          {!logs?.length ? (
            <li className="py-3 text-muted">No nutrition logs yet.</li>
          ) : null}
        </ul>
      </SectionCard>
    </div>
  );
}
