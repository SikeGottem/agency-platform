import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { QuestionnaireWizard } from "@/components/onboarding/questionnaire-wizard";
import { ClientRevisionBanner } from "@/components/brief/client-revision-banner";
import { timingSafeTokenCompare } from "@/lib/utils";
import type { TemplateQuestion } from "@/components/onboarding/steps/custom-questions-step";
import type { ProjectType } from "@/types";
import type { Database } from "@/types/supabase";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectWithDesigner = ProjectRow & {
  profiles: { full_name: string | null; business_name: string | null; brand_color: string | null } | null;
};

interface BriefPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export async function generateMetadata({ params }: BriefPageProps) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: project } = await supabase
    .from("projects")
    .select("client_name")
    .eq("id", id)
    .single();

  return {
    title: project
      ? `Complete Your Brief — Briefed`
      : "Brief Not Found — Briefed",
  };
}

export default async function BriefPage({ params, searchParams }: BriefPageProps) {
  const { id } = await params;
  const { token } = await searchParams;
  const supabase = createAdminClient();

  // Fetch project with designer info
  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      *,
      profiles:designer_id (full_name, business_name, brand_color)
    `)
    .eq("id", id)
    .returns<ProjectWithDesigner[]>()
    .single();

  if (error || !project) {
    notFound();
  }

  // Validate access: require valid magic_link_token as query param
  if (!token || !project.magic_link_token || !timingSafeTokenCompare(token, project.magic_link_token)) {
    notFound();
  }

  // Fetch existing responses for resume functionality
  const { data: responses } = await supabase
    .from("responses")
    .select("step_key, answers")
    .eq("project_id", id);

  const existingResponses: Record<string, unknown> = {};
  if (responses) {
    for (const response of responses) {
      existingResponses[response.step_key] = response.answers;
    }
  }

  const designerProfile = project.profiles as unknown as {
    full_name: string | null;
    business_name: string | null;
    brand_color: string | null;
  } | null;

  // Fetch template custom questions if project has a template
  let templateQuestions: TemplateQuestion[] | undefined;
  if (project.template_id) {
    const { data: template } = await supabase
      .from("templates")
      .select("questions")
      .eq("id", project.template_id)
      .single();

    if (template && Array.isArray(template.questions) && template.questions.length > 0) {
      templateQuestions = template.questions as unknown as TemplateQuestion[];
    }
  }

  const brandColor = designerProfile?.brand_color ?? "#18181B";

  return (
    <div
      className="min-h-screen bg-muted/30"
      style={{ "--brand-color": brandColor } as React.CSSProperties}
    >
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <ClientRevisionBanner projectId={project.id} token={token} />
      </div>
      <QuestionnaireWizard
        projectId={project.id}
        projectType={project.project_type as ProjectType}
        clientName={project.client_name ?? "there"}
        clientEmail={project.client_email}
        designerName={designerProfile?.full_name ?? designerProfile?.business_name ?? "Your Designer"}
        existingResponses={existingResponses}
        isCompleted={project.status === "completed"}
        token={token}
        templateQuestions={templateQuestions}
        brandColor={brandColor}
      />
    </div>
  );
}
