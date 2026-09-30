import { completeOnboarding } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import {
  defaultGoalDate,
  defaultStartedPadelAt,
  isSupabaseConfigured,
} from "@/lib/utils";
import { Field, TextInput, PrimaryButton } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  if (!isSupabaseConfigured()) redirect("/setup");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_complete) redirect("/");

  const started = defaultStartedPadelAt();
  const goal = defaultGoalDate(3);

  return (
    <div className="min-h-dvh min-h-screen bg-atmosphere px-4 py-12 sm:px-4 sm:py-12">
      <div className="mx-auto max-w-lg">
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-court">
          Road to FIP
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-charcoal">
          Set your goals
        </h1>
        <p className="mt-2 text-sm text-muted">
          Dual targets: first FIP points and UK top 100, from your Northampton
          base.
        </p>

        <form action={completeOnboarding} className="mt-8 space-y-5">
          <Field label="Display name">
            <TextInput
              name="display_name"
              required
              placeholder="Your name"
              defaultValue={user.email?.split("@")[0] ?? ""}
            />
          </Field>
          <Field label="Home base">
            <TextInput
              name="home_base"
              defaultValue="Northampton, Northamptonshire"
            />
          </Field>
          <Field label="Started padel" hint="Defaults to ~4 months ago">
            <TextInput
              name="started_padel_at"
              type="date"
              required
              defaultValue={started}
            />
          </Field>
          <Field label="FIP points goal date (primary)">
            <TextInput
              name="goal_fip_at"
              type="date"
              required
              defaultValue={goal}
            />
          </Field>
          <Field label="UK top 100 goal date (secondary)">
            <TextInput
              name="goal_uk_top100_at"
              type="date"
              required
              defaultValue={goal}
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Court / wk">
              <TextInput
                name="target_court"
                type="number"
                min={1}
                defaultValue={3}
              />
            </Field>
            <Field label="Gym / wk">
              <TextInput
                name="target_gym"
                type="number"
                min={0}
                defaultValue={2}
              />
            </Field>
            <Field label="Coach / wk">
              <TextInput
                name="target_coaching"
                type="number"
                min={0}
                defaultValue={1}
              />
            </Field>
          </div>
          <PrimaryButton type="submit">Start the road</PrimaryButton>
        </form>
      </div>
    </div>
  );
}
