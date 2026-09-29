import { RoadmapBoard } from "@/components/RoadmapBoard";
import { PageHeader } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import type { Profile, RoadmapSkill, SkillProgress } from "@/lib/types";
import { currentPhase } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function RoadmapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: skills }, { data: progress }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("roadmap_skills")
        .select("*")
        .order("phase", { ascending: true })
        .order("sort_order", { ascending: true }),
      supabase.from("skill_progress").select("*").eq("user_id", user.id),
    ]);

  const p = profile as Profile;
  const allSkills = (skills as RoadmapSkill[]) || [];
  const allProgress = (progress as SkillProgress[]) || [];
  const active = currentPhase(p);

  return (
    <div className="lg:-mx-4 lg:max-w-none">
      <PageHeader
        title="Roadmap"
        description="Tiered path — Foundations → UK ladder → Top 100 + FIP. Click a node to open details and update status."
      />
      <RoadmapBoard
        skills={allSkills}
        progress={allProgress}
        activePhase={active}
      />
    </div>
  );
}
