import {
  addPracticeSession,
  deletePracticeSession,
} from "@/lib/actions";
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
import { createClient } from "@/lib/supabase/server";
import { formatDate, todayISO } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function PracticePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sessions } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("session_date", { ascending: false })
    .limit(40);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Practice"
        description="Court time — drills, matches, and mixed sessions from your Northampton base."
      />

      <SectionCard title="Log session">
        <form action={addPracticeSession} className="grid gap-4 sm:grid-cols-2">
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
              defaultValue={90}
            />
          </Field>
          <Field label="Type">
            <TextSelect name="session_type" defaultValue="drill">
              <option value="drill">Drill</option>
              <option value="match">Match</option>
              <option value="mixed">Mixed</option>
            </TextSelect>
          </Field>
          <Field label="Focus">
            <TextInput
              name="focus"
              placeholder="e.g. bandeja, wall defence"
            />
          </Field>
          <Field label="Intensity 1–10">
            <TextInput name="intensity" type="number" min={1} max={10} />
          </Field>
          <Field label="RPE 1–10">
            <TextInput name="rpe" type="number" min={1} max={10} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <TextTextarea name="notes" placeholder="What clicked / what to fix" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <PrimaryButton type="submit">Save practice</PrimaryButton>
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
                  {formatDate(s.session_date)} · {s.duration_mins}m ·{" "}
                  {s.session_type}
                </p>
                <p className="text-muted">
                  {[s.focus, s.intensity && `Int ${s.intensity}`, s.rpe && `RPE ${s.rpe}`]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
                {s.notes ? (
                  <p className="mt-1 text-xs text-muted">{s.notes}</p>
                ) : null}
              </div>
              <form action={deletePracticeSession.bind(null, s.id)}>
                <DangerButton type="submit">Delete</DangerButton>
              </form>
            </li>
          ))}
          {!sessions?.length ? (
            <li className="py-3 text-sm text-muted">No practice logged yet.</li>
          ) : null}
        </ul>
      </SectionCard>
    </div>
  );
}
