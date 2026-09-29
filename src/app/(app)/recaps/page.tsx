import { RecapBody, RecapGenerator } from "@/components/RecapGenerator";
import { PageHeader, SectionCard } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function RecapsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: recaps } = await supabase
    .from("recaps")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI coach"
        description="Weekly and monthly recaps from your logs — progress, gaps, and concrete tips toward UK top 100 and first FIP points."
      />

      <SectionCard title="Generate">
        <RecapGenerator hasApiKey={hasApiKey} />
      </SectionCard>

      <SectionCard title="History">
        <ul className="space-y-6">
          {(recaps || []).map((r) => (
            <li
              key={r.id}
              className="border-b border-line pb-6 last:border-0 last:pb-0"
            >
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-base font-semibold text-charcoal">
                  {r.period === "week" ? "Weekly" : "Monthly"} recap
                </p>
                <p className="text-xs text-muted">
                  {formatDate(r.period_start)} – {formatDate(r.period_end)} ·
                  saved {formatDate(r.created_at.slice(0, 10))}
                </p>
              </div>
              <RecapBody content={r.content} />
            </li>
          ))}
          {!recaps?.length ? (
            <li className="text-sm text-muted">
              No recaps yet. Log a few sessions, then generate your first weekly
              review.
            </li>
          ) : null}
        </ul>
      </SectionCard>
    </div>
  );
}
