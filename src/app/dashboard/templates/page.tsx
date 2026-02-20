import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TemplateListView } from "@/components/dashboard/template-list-view";
import type { Database } from "@/types/supabase";

type TemplateRow = Database["public"]["Tables"]["templates"]["Row"];

export const metadata = {
  title: "Templates — Briefed",
};

export default async function TemplatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.user_metadata?.role === "client") redirect("/dashboard");

  // Fetch templates
  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .eq("designer_id", user.id)
    .order("created_at", { ascending: false })
    .returns<TemplateRow[]>();

  // Count projects per template
  const { data: projectCounts } = await supabase
    .from("projects")
    .select("template_id")
    .eq("designer_id", user.id)
    .not("template_id", "is", null);

  const countMap: Record<string, number> = {};
  for (const p of projectCounts ?? []) {
    if (p.template_id) {
      countMap[p.template_id] = (countMap[p.template_id] || 0) + 1;
    }
  }

  return (
    <TemplateListView
      templates={(templates ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        projectType: t.project_type,
        isDefault: t.is_default ?? false,
        stepsCount: Array.isArray(t.questions)
          ? (t.questions as unknown[]).length
          : 0,
        projectsUsing: countMap[t.id] ?? 0,
        updatedAt: t.updated_at ?? t.created_at,
      }))}
    />
  );
}
