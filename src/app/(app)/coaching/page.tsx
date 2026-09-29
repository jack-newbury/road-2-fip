import {
  addCoachingSession,
  deleteCoachingSession,
} from "@/lib/actions";
import {
  DangerButton,
  Field,
  PageHeader,
  PrimaryButton,
  SectionCard,
  TextInput,
  TextTextarea,
} from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { formatDate, todayISO } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function CoachingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sessions } = await supabase
    .from("coaching_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("session_date", { ascending: false })
    .limit(40);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Coaching"
        description="Lessons, takeaways, and homework — close the loop in practice."
      />

      <SectionCard title="Log lesson">
        <form action={addCoachingSession} className="grid gap-4 sm:grid-cols-2">
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
              min={30}
              required
              defaultValue={60}
            />
          </Field>
          <Field label="Coach">
            <TextInput name="coach_name" />
          </Field>
          <Field label="Focus">
            <TextInput name="focus" placeholder="e.g. vibora timing" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Takeaways">
              <TextTextarea name="takeaways" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Homework">
              <TextTextarea name="homework" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <TextTextarea name="notes" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <PrimaryButton type="submit">Save lesson</PrimaryButton>
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
                  {formatDate(s.session_date)} · {s.duration_mins}m
                  {s.coach_name ? ` · ${s.coach_name}` : ""}
                </p>
                {s.focus ? <p className="text-muted">{s.focus}</p> : null}
                {s.takeaways ? (
                  <p className="mt-1 text-xs text-muted">{s.takeaways}</p>
                ) : null}
                {s.homework ? (
                  <p className="mt-1 text-xs text-court-deep">
                    Homework: {s.homework}
                  </p>
                ) : null}
              </div>
              <form action={deleteCoachingSession.bind(null, s.id)}>
                <DangerButton type="submit">Delete</DangerButton>
              </form>
            </li>
          ))}
          {!sessions?.length ? (
            <li className="py-3 text-sm text-muted">No coaching logged yet.</li>
          ) : null}
        </ul>
      </SectionCard>
    </div>
  );
}
