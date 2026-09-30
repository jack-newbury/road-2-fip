"use client";

import { syncLtaRanking } from "@/lib/actions";
import type { LtaRankingSnapshot } from "@/lib/lta/client";
import { Field, PrimaryButton, TextInput } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LtaSyncCard({
  playerNumber,
  snapshot,
  syncedAt,
}: {
  playerNumber: string | null;
  snapshot: LtaRankingSnapshot | null;
  syncedAt: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const primary = snapshot?.primary;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Pulls your public LTA Padel ranking from{" "}
        <a
          href="https://competitions.lta.org.uk/ranking/ranking.aspx?rid=305"
          target="_blank"
          rel="noreferrer"
          className="text-court underline"
        >
          competitions.lta.org.uk
        </a>{" "}
        using your LTA player number — no password needed.
      </p>

      <form
        className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setError(null);
          setOkMsg(null);
          start(async () => {
            const result = await syncLtaRanking(fd);
            if (!result.ok) {
              setError(result.error ?? "Sync failed");
              return;
            }
            setOkMsg(
              result.rank != null
                ? `Synced — UK #${result.rank}`
                : "Synced — no Open ranking row found yet",
            );
            router.refresh();
          });
        }}
      >
        <Field
          label="LTA player number"
          tooltip="Shown on your LTA competitions profile in brackets, e.g. (136873792)."
        >
          <TextInput
            name="lta_player_number"
            required
            inputMode="numeric"
            pattern="[0-9]{6,}"
            defaultValue={playerNumber ?? ""}
            placeholder="136873792"
          />
        </Field>
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Syncing…" : "Sync LTA ranking"}
        </PrimaryButton>
      </form>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {okMsg ? <p className="text-sm text-success">{okMsg}</p> : null}

      {primary ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="UK rank" value={`#${primary.rank}`} />
          <Stat label="Category" value={primary.category} />
          <Stat label="Points" value={String(primary.total_points)} />
          <Stat
            label="Week"
            value={snapshot?.week_label ?? "—"}
          />
        </div>
      ) : null}

      {syncedAt ? (
        <p className="text-xs text-muted">
          Last synced {new Date(syncedAt).toLocaleString("en-GB")}
          {snapshot?.profile_url ? (
            <>
              {" · "}
              <a
                href={snapshot.ranking_url}
                target="_blank"
                rel="noreferrer"
                className="text-court underline"
              >
                View on LTA
              </a>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-line bg-surface/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="truncate font-display text-base font-semibold text-charcoal sm:text-lg">
        {value}
      </p>
    </div>
  );
}
