import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { MessageThread } from "@/components/shared/message-thread";
import { BriefViewer } from "@/components/dashboard/brief-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PROJECT_TYPE_LABELS, type ProjectType } from "@/types";
import type { Database } from "@/types/supabase";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Project — Briefed`, description: `View project ${id}` };
}

export default async function DesignerProjectPage({ params }: PageProps) {
  const { id: projectId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("designer_id", user.id)
    .single<ProjectRow>();

  if (!project) notFound();

  const clientName = project.client_name || project.client_email;

  // Fetch brief
  const { data: brief } = await supabase
    .from("briefs")
    .select("content")
    .eq("project_id", projectId)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const { data: responses } = await supabase
    .from("responses")
    .select("step_key, answers")
    .eq("project_id", projectId);

  const statusMap: Record<string, string> = {
    sent: "Sent",
    in_progress: "In Progress",
    completed: "Submitted",
    reviewed: "Approved",
  };

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-stone-500 hover:text-stone-900">
          <Link href="/dashboard">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-stone-900">
            {clientName}
          </h1>
          <p className="text-sm text-stone-500">
            {PROJECT_TYPE_LABELS[project.project_type as ProjectType]}
          </p>
        </div>
        <Badge variant="secondary" className="bg-amber-50 text-amber-700">
          {statusMap[project.status] || project.status}
        </Badge>
      </div>

      {/* Brief viewer */}
      {(brief?.content || (responses && responses.length > 0)) && (
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900 mb-4">
            Brief
          </h2>
          <BriefViewer
            content={brief?.content ?? null}
            projectId={projectId}
            responses={responses ?? []}
          />
        </div>
      )}

      {/* Message thread */}
      <MessageThread
        projectId={projectId}
        currentUserId={user.id}
        senderType="designer"
      />
    </div>
  );
}
