import { upsertRecovery } from "@/lib/actions";
import {
  Field,
  PageHeader,
  SectionCard,
  TextInput,
  TextSelect,
  TextTextarea,
} from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import { formatDate, todayISO } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function RecoveryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = todayISO();
  const [{ data: todayLog }, { data: logs }] = await Promise.all([
    supabase
      .from("recovery_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle(),
    supabase
      .from("recovery_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(14),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Recovery"
        description="Sleep, soreness, and readiness — protect the calendar that gets you ranked."
      />

      <SectionCard title="Today">
        <form action={upsertRecovery} className="grid gap-4 sm:grid-cols-2">
          <Field label="Date">
            <TextInput
              name="log_date"
              type="date"
              required
              defaultValue={todayLog?.log_date ?? today}
            />
          </Field>
          <Field label="Sleep (hours)">
            <TextInput
              name="sleep_hours"
              type="number"
              step="0.5"
              min={0}
              max={14}
              defaultValue={todayLog?.sleep_hours ?? ""}
            />
          </Field>
          <Field label="Soreness 1–10">
            <TextInput
              name="soreness"
              type="number"
              min={1}
              max={10}
              defaultValue={todayLog?.soreness ?? ""}
            />
          </Field>
          <Field label="Readiness 1–10">
            <TextInput
              name="readiness"
              type="number"
              min={1}
              max={10}
              defaultValue={todayLog?.readiness ?? ""}
            />
          </Field>
          <Field label="Activity">
            <TextSelect
              name="activity"
              defaultValue={todayLog?.activity ?? "rest"}
            >
              <option value="rest">Rest</option>
              <option value="mobility">Mobility</option>
              <option value="light">Light</option>
              <option value="other">Other</option>
            </TextSelect>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <TextTextarea
                name="notes"
                defaultValue={todayLog?.notes ?? ""}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>Save recovery</SubmitButton>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Last 14 days">
        <ul className="divide-y divide-line text-sm">
          {(logs || []).map((l) => (
            <li key={l.id} className="py-3">
              <p className="font-medium text-ink">{formatDate(l.log_date)}</p>
              <p className="text-muted">
                Sleep {l.sleep_hours ?? "—"}h · Soreness {l.soreness ?? "—"} ·
                Ready {l.readiness ?? "—"} · {l.activity ?? "—"}
              </p>
            </li>
          ))}
          {!logs?.length ? (
            <li className="py-3 text-muted">No recovery logs yet.</li>
          ) : null}
        </ul>
      </SectionCard>
    </div>
  );
}
