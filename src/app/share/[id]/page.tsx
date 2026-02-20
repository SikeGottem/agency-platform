import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BriefViewer } from "@/components/dashboard/brief-viewer";
import { PROJECT_TYPE_LABELS } from "@/types";
import type { ProjectType } from "@/types";
import type { Database, Json } from "@/types/supabase";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SharePageProps) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: project } = await supabase
    .from("projects")
    .select("client_name, project_type, share_token")
    .eq("id", id)
    .single();

  if (!project?.share_token) {
    return { title: "Brief Not Found — Briefed" };
  }

  return {
    title: `${project.client_name ?? "Client"} Brief — Briefed`,
    description: `${PROJECT_TYPE_LABELS[project.project_type as ProjectType] ?? project.project_type} creative brief`,
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Only show projects that have sharing enabled (share_token is set)
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .not("share_token", "is", null)
    .returns<ProjectRow[]>()
    .single();

  if (error || !project) {
    notFound();
  }

  // Fetch brief content
  const { data: brief } = await supabase
    .from("briefs")
    .select("content")
    .eq("project_id", id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const briefContent = brief?.content ?? null;

  // Fetch responses as fallback
  const { data: responses } = await supabase
    .from("responses")
    .select("step_key, answers")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  const rawResponses = (responses ?? []) as { step_key: string; answers: Json }[];

  // Fetch asset URLs
  let assetUrls: Record<string, string> = {};
  const { data: assets } = await supabase
    .from("assets")
    .select("id, storage_path")
    .eq("project_id", id)
    .eq("category", "inspiration");

  if (assets && assets.length > 0) {
    const urlEntries = await Promise.all(
      assets.map(async (asset) => {
        const { data } = await supabase.storage
          .from("project-assets")
          .createSignedUrl(asset.storage_path, 3600);
        return [asset.id, data?.signedUrl ?? ""] as const;
      })
    );
    assetUrls = Object.fromEntries(urlEntries);
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-display text-foreground">
            {project.client_name ?? "Client"}&apos;s Brief
          </h1>
          <div className="mt-3 flex justify-center gap-2">
            <Badge variant="secondary">
              {PROJECT_TYPE_LABELS[project.project_type as ProjectType]}
            </Badge>
            <Badge variant="outline">Read Only</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Shared via <span className="font-semibold text-[#E05252]">Briefed</span>
          </p>
        </div>

        {/* Brief Content */}
        {briefContent || rawResponses.length > 0 ? (
          <BriefViewer
            content={briefContent}
            projectId={id}
            assetUrls={assetUrls}
            responses={rawResponses}
          />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">This brief has no content yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
