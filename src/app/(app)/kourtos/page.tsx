import { KourtosSyncButton } from "@/components/KourtosSyncButton";
import { PageHeader, SectionCard } from "@/components/ui";
import { getKourtosConfig, type KourtosMatch, type KourtosOverview } from "@/lib/kourtos/client";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";

function playerLabel(p: {
  name?: string;
  player_name?: string | null;
  guest_name?: string | null;
  is_me?: boolean;
}) {
  const n = p.name || p.player_name || p.guest_name || "Player";
  return p.is_me ? `${n} (you)` : n;
}

function resultLabel(won: boolean | null) {
  if (won === true) return "Win";
  if (won === false) return "Loss";
  return "—";
}

export default async function KourtosPage() {
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
  const overview = (p.kourtos_overview || null) as KourtosOverview | null;
  const matches = (p.kourtos_recent_matches || []) as Array<
    KourtosMatch & {
      players?: Array<{
        name?: string;
        player_name?: string | null;
        guest_name?: string | null;
        team: number;
        is_me?: boolean;
      }>;
    }
  >;
  const configured = Boolean(getKourtosConfig());

  const winPct =
    overview?.win_rate != null
      ? `${Math.round(overview.win_rate * 100)}%`
      : "—";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Kourtos"
        description="Pulls your played doubles from the Kourtos partner results feed (kos_live_… token). Optionally enrich with Playtomic level via user login."
      />

      <SectionCard title="Sync">
        <KourtosSyncButton configured={configured} />
        {p.kourtos_synced_at ? (
          <p className="mt-3 text-xs text-muted">
            Last synced{" "}
            {new Date(p.kourtos_synced_at).toLocaleString("en-GB")}
          </p>
        ) : null}
      </SectionCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Playtomic level"
          value={
            p.playtomic_level != null
              ? p.playtomic_level.toFixed(2)
              : overview?.playtomic_level_value ?? "—"
          }
          hint={
            p.playtomic_level_confidence != null
              ? `Confidence ${p.playtomic_level_confidence.toFixed(0)}%`
              : undefined
          }
        />
        <Stat label="Win rate" value={winPct} hint={overview ? `${overview.wins}W · ${overview.losses}L` : undefined} />
        <Stat
          label="Games"
          value={overview ? String(overview.games_count) : "—"}
          hint={overview ? `${overview.total_sessions} total sessions` : undefined}
        />
        <Stat
          label="Lessons"
          value={overview ? String(overview.lesson_count) : "—"}
          hint={
            overview
              ? `${overview.tournament_count} tournaments · ${overview.league_count} leagues`
              : undefined
          }
        />
      </div>

      <SectionCard title="Recent games">
        <ul className="divide-y divide-line">
          {matches.map((m) => {
            const team1 = (m.players || []).filter((x) => x.team === 1);
            const team2 = (m.players || []).filter((x) => x.team === 2);
            const score = (m.sets || [])
              .map((s) => `${s.team1_games}-${s.team2_games}`)
              .join(" · ");
            return (
              <li key={m.id} className="py-3 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="break-words font-medium text-charcoal">
                    {formatDate(m.started_at.slice(0, 10))} ·{" "}
                    {m.activity_type}
                    {m.venue_name ? ` · ${m.venue_name}` : ""}
                  </p>
                  <span
                    className={
                      m.won === true
                        ? "text-success"
                        : m.won === false
                          ? "text-danger"
                          : "text-muted"
                    }
                  >
                    {resultLabel(m.won)}
                  </span>
                </div>
                <p className="mt-1 break-words text-muted">
                  {team1.map(playerLabel).join(" / ") || "Team 1"}
                  {" vs "}
                  {team2.map(playerLabel).join(" / ") || "Team 2"}
                </p>
                {score ? <p className="mt-0.5 text-xs text-clay">{score}</p> : null}
              </li>
            );
          })}
          {!matches.length ? (
            <li className="py-3 text-sm text-muted">
              No cached games yet — sync from Kourtos to pull your Playtomic
              history.
            </li>
          ) : null}
        </ul>
      </SectionCard>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-charcoal">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
