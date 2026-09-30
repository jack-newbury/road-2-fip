import { addCompetition, deleteCompetition } from "@/lib/actions";
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
import { LEVEL_LABELS } from "@/lib/types";
import { formatDate, todayISO } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function CompetitionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: events } = await supabase
    .from("competitions")
    .select("*")
    .eq("user_id", user.id)
    .order("event_date", { ascending: false })
    .limit(40);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Competitions"
        description="Club → Midlands → national → FIP. Log results and ranking notes after every event."
      />

      <SectionCard title="Log event">
        <form action={addCompetition} className="grid gap-4 sm:grid-cols-2">
          <Field label="Date">
            <TextInput
              name="event_date"
              type="date"
              required
              defaultValue={todayISO()}
            />
          </Field>
          <Field label="Level">
            <TextSelect name="level" defaultValue="club">
              <option value="club">Club</option>
              <option value="midlands">Midlands</option>
              <option value="national">National</option>
              <option value="fip">FIP</option>
            </TextSelect>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Event name">
              <TextInput
                name="name"
                required
                placeholder="e.g. Northampton club open"
              />
            </Field>
          </div>
          <Field label="Result">
            <TextInput name="result" placeholder="e.g. QF, R16, Winner" />
          </Field>
          <Field label="Partner">
            <TextInput name="partner" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Ranking notes">
              <TextInput
                name="ranking_notes"
                placeholder="Points earned, new UK rank estimate"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <TextTextarea name="notes" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <PrimaryButton type="submit">Save competition</PrimaryButton>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="History">
        <ul className="divide-y divide-line">
          {(events || []).map((e) => (
            <li
              key={e.id}
              className="flex items-start justify-between gap-3 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="break-words font-medium text-ink">
                  {formatDate(e.event_date)} · {e.name}
                </p>
                <p className="break-words text-muted">
                  {LEVEL_LABELS[e.level as keyof typeof LEVEL_LABELS] ?? e.level}
                  {e.result ? ` · ${e.result}` : ""}
                  {e.partner ? ` · with ${e.partner}` : ""}
                </p>
                {e.ranking_notes ? (
                  <p className="mt-1 break-words text-xs text-court-deep">
                    {e.ranking_notes}
                  </p>
                ) : null}
              </div>
              <form action={deleteCompetition.bind(null, e.id)}>
                <DangerButton type="submit">Delete</DangerButton>
              </form>
            </li>
          ))}
          {!events?.length ? (
            <li className="py-3 text-sm text-muted">No competitions yet.</li>
          ) : null}
        </ul>
      </SectionCard>
    </div>
  );
}
