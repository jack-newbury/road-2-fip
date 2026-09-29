"use client";

import { syncKourtos } from "@/lib/actions";
import { PrimaryButton } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function KourtosSyncButton({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  return (
    <div className="space-y-2">
      <PrimaryButton
        type="button"
        disabled={!configured || pending}
        onClick={() => {
          setError(null);
          setOk(false);
          start(async () => {
            const result = await syncKourtos();
            if (!result.ok) {
              setError(result.error ?? "Sync failed");
              return;
            }
            setOk(true);
            router.refresh();
          });
        }}
      >
        {pending ? "Syncing from Kourtos…" : "Sync from Kourtos"}
      </PrimaryButton>
      {!configured ? (
        <p className="text-sm text-muted">
          Add <code className="text-xs text-clay">KOURTOS_PARTNER_API_TOKEN</code>{" "}
          (<code className="text-xs text-clay">kos_live_…</code>) and{" "}
          <code className="text-xs text-clay">KOURTOS_PLAYER_NAME</code> to{" "}
          <code className="text-xs text-clay">.env.local</code>, then restart.
        </p>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {ok ? (
        <p className="text-sm text-success">
          Synced your matches from the Kourtos partner feed.
        </p>
      ) : null}
    </div>
  );
}
