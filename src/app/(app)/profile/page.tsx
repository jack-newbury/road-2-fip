import { signOut, updateProfile } from "@/lib/actions";
import {
  Field,
  PageHeader,
  PrimaryButton,
  SectionCard,
  TextInput,
  TextSelect,
} from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const p = profile as Profile;
  const targets = p.weekly_targets;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        description="Goals, home base, and weekly targets. Update UK ranking when the list refreshes."
      />

      <SectionCard title="Athlete">
        <form action={updateProfile} className="grid gap-4 sm:grid-cols-2">
          <Field label="Display name">
            <TextInput
              name="display_name"
              required
              defaultValue={p.display_name}
            />
          </Field>
          <Field label="Home base">
            <TextInput name="home_base" defaultValue={p.home_base} />
          </Field>
          <Field label="Started padel">
            <TextInput
              name="started_padel_at"
              type="date"
              required
              defaultValue={p.started_padel_at}
            />
          </Field>
          <Field label="Current UK ranking" hint="Leave blank if unranked">
            <TextInput
              name="uk_ranking"
              type="number"
              min={1}
              defaultValue={p.uk_ranking ?? ""}
              placeholder="e.g. 420"
            />
          </Field>
          <Field label="FIP goal date">
            <TextInput
              name="goal_fip_at"
              type="date"
              required
              defaultValue={p.goal_fip_at}
            />
          </Field>
          <Field label="UK top 100 goal date">
            <TextInput
              name="goal_uk_top100_at"
              type="date"
              required
              defaultValue={p.goal_uk_top100_at}
            />
          </Field>
          <Field label="Court / week">
            <TextInput
              name="target_court"
              type="number"
              min={1}
              defaultValue={targets.court}
            />
          </Field>
          <Field label="Gym / week">
            <TextInput
              name="target_gym"
              type="number"
              min={0}
              defaultValue={targets.gym}
            />
          </Field>
          <Field label="Coaching / week">
            <TextInput
              name="target_coaching"
              type="number"
              min={0}
              defaultValue={targets.coaching}
            />
          </Field>
          <Field label="Height (cm)">
            <TextInput
              name="height_cm"
              type="number"
              step="0.1"
              defaultValue={p.height_cm ?? ""}
            />
          </Field>
          <Field label="Sex">
            <TextSelect name="sex" defaultValue={p.sex ?? ""}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </TextSelect>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Body composition goal">
              <TextSelect name="body_goal" defaultValue={p.body_goal ?? "recomp"}>
                <option value="lose_fat">Lose fat (keep power)</option>
                <option value="recomp">Recomp</option>
                <option value="maintain">Maintain</option>
                <option value="gain">Gain lean mass</option>
              </TextSelect>
            </Field>
          </div>
          <div className="sm:col-span-2">
            <PrimaryButton type="submit">Save profile</PrimaryButton>
          </div>
        </form>
        <p className="mt-4 text-xs text-muted">
          Track weight & BF% on{" "}
          <Link href="/body" className="text-court underline">
            Body
          </Link>
          .
        </p>
      </SectionCard>

      <SectionCard title="Account">
        <p className="mb-4 text-sm text-muted">{user.email}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm font-medium text-muted underline-offset-2 hover:text-charcoal hover:underline"
          >
            Sign out
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
