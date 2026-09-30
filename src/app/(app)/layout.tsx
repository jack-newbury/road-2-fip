import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/AppNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/setup");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_complete) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-dvh min-h-screen">
      <AppNav />
      <main className="min-w-0 flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-10">
        <div className="mx-auto w-full max-w-5xl px-3 pt-5 sm:px-4 sm:pt-6 lg:px-8 lg:pt-10">
          {children}
        </div>
      </main>
    </div>
  );
}
