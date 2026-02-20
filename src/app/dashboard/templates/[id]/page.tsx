import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TemplateEditor } from "@/components/dashboard/template-editor";
import type { TemplateStep } from "@/lib/templates/defaults";
import type { Database } from "@/types/supabase";

type TemplateRow = Database["public"]["Tables"]["templates"]["Row"];

export const metadata = {
  title: "Edit Template — Briefed",
};

export default async function TemplateEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.user_metadata?.role === "client") redirect("/dashboard");

  const { data: template } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .eq("designer_id", user.id)
    .single<TemplateRow>();

  if (!template) notFound();

  return (
    <TemplateEditor
      templateId={template.id}
      initialName={template.name}
      initialProjectType={template.project_type}
      initialSteps={(template.questions as unknown as TemplateStep[]) ?? []}
      isDefault={template.is_default ?? false}
    />
  );
}
