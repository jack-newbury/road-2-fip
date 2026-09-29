import { isSupabaseConfigured } from "@/lib/utils";
import { redirect } from "next/navigation";

export default function SetupPage() {
  if (isSupabaseConfigured()) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-atmosphere px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <p className="font-display text-4xl font-extrabold text-court-deep">
          Road to FIP
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold text-charcoal">
          Connect Supabase
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          This app syncs across devices via Supabase Auth + Postgres. Create a
          free project, run the SQL in the repo, then add env vars.
        </p>
        <ol className="mt-8 list-decimal space-y-4 pl-5 text-sm text-ink">
          <li>
            Create a project at{" "}
            <a
              className="text-court underline"
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
            >
              supabase.com
            </a>
          </li>
          <li>
            In the SQL Editor, run{" "}
            <code className="rounded bg-line/60 px-1">
              supabase/migrations/001_initial.sql
            </code>{" "}
            then{" "}
            <code className="rounded bg-line/60 px-1">supabase/seed.sql</code>
          </li>
          <li>
            Enable Email auth (magic link) under Authentication → Providers
          </li>
          <li>
            Copy Project URL and anon key into{" "}
            <code className="rounded bg-line/60 px-1">.env.local</code>:
            <pre className="mt-2 overflow-x-auto rounded-lg bg-charcoal p-4 text-xs text-clay-light">
              {`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}
            </pre>
          </li>
          <li>
            Restart{" "}
            <code className="rounded bg-line/60 px-1">npm run dev</code> and
            open the app again
          </li>
        </ol>
      </div>
    </div>
  );
}
