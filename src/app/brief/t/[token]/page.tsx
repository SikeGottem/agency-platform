import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { QuestionnaireWizard } from "@/components/onboarding/questionnaire-wizard";
import type { ProjectType } from "@/types";
import type { Database } from "@/types/supabase";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectWithDesigner = ProjectRow & {
  profiles: { full_name: string | null; business_name: string | null } | null;
};

interface MagicLinkBriefPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: MagicLinkBriefPageProps) {
  const { token } = await params;
  const supabase = createAdminClient();
  const { data: project } = await supabase
    .from("projects")
    .select("client_name")
    .eq("magic_link_token", token)
    .single();

  return {
    title: project
      ? "Complete Your Brief — Briefed"
      : "Brief Not Found — Briefed",
  };
}

export default async function MagicLinkBriefPage({
  params,
}: MagicLinkBriefPageProps) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      *,
      profiles:designer_id (full_name, business_name)
    `)
    .eq("magic_link_token", token)
    .returns<ProjectWithDesigner[]>()
    .single();

  if (error || !project) {
    notFound();
  }

  // Fetch existing responses for resume functionality
  const { data: responses } = await supabase
    .from("responses")
    .select("step_key, answers")
    .eq("project_id", project.id);

  const existingResponses: Record<string, unknown> = {};
  if (responses) {
    for (const response of responses) {
      existingResponses[response.step_key] = response.answers;
    }
  }

  const designerProfile = project.profiles as unknown as {
    full_name: string | null;
    business_name: string | null;
  } | null;

  return (
    <div className="min-h-screen bg-muted/30">
      <QuestionnaireWizard
        projectId={project.id}
        projectType={project.project_type as ProjectType}
        clientName={project.client_name ?? "there"}
        clientEmail={project.client_email}
        designerName={
          designerProfile?.full_name ??
          designerProfile?.business_name ??
          "Your Designer"
        }
        existingResponses={existingResponses}
        isCompleted={project.status === "completed"}
        magicToken={token}
      />
    </div>
  );
}
