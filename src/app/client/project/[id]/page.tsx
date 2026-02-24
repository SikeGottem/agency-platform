import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ClientRevisionBanner } from "@/components/brief/client-revision-banner";
import { ProgressTracker, getPhaseFromStatus } from "@/components/client/progress-tracker";
import { BriefSection } from "@/components/client/brief-section";
import { DeliverablesSection } from "@/components/client/deliverables-section";
import { DownloadSection } from "@/components/client/download-section";
import { ActivityFeed } from "@/components/client/activity-feed";
import { MessageThread } from "@/components/shared/message-thread";
import { ClientFeedbackSection } from "@/components/portal/client-feedback-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  PROJECT_TYPE_LABELS,
  type ProjectType,
} from "@/types";
import type { Database } from "@/types/supabase";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Project — Briefed`, description: `View project ${id}` };
}

export default async function ClientProjectPage({ params }: PageProps) {
  const { id: projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch project — ensure client has access
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single<ProjectRow>();

  if (
    !project ||
    (project.client_email !== user.email && project.client_id !== user.id)
  ) {
    notFound();
  }

  // Fetch designer info
  const { data: designer } = await supabase
    .from("profiles")
    .select("full_name, business_name")
    .eq("id", project.designer_id)
    .single();

  const designerName =
    designer?.business_name || designer?.full_name || "Your designer";

  // Fetch brief content
  const { data: brief } = await supabase
    .from("briefs")
    .select("content")
    .eq("project_id", projectId)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  // Fetch responses for the brief viewer
  const { data: responses } = await supabase
    .from("responses")
    .select("step_key, answers")
    .eq("project_id", projectId);

  // Fetch revision requests
  const { data: revisions } = await supabase
    .from("revision_requests")
    .select("id, status, created_at, responded_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  const hasPendingRevision = (revisions ?? []).some(
    (r) => r.status === "pending"
  );

  // Determine current phase
  const currentPhase = getPhaseFromStatus(
    project.status,
    hasPendingRevision,
    false // TODO: check if any shared deliverables exist
  );

  // Status display config
  const statusConfig = hasPendingRevision
    ? { label: "Needs Revision", color: "bg-red-50 text-red-700" }
    : project.status === "reviewed"
      ? { label: "Complete", color: "bg-emerald-50 text-emerald-700" }
      : project.status === "completed"
        ? { label: "Ready for Review", color: "bg-purple-50 text-purple-700" }
        : project.status === "in_progress"
          ? { label: "In Design", color: "bg-amber-50 text-amber-700" }
          : { label: "Brief Submitted", color: "bg-blue-50 text-blue-700" };

  return (
    <div className="space-y-6 pb-12">
      {/* Back nav */}
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-stone-500 hover:text-stone-900">
          <Link href="/client">
            <ArrowLeft className="mr-1 h-4 w-4" />
            All Projects
          </Link>
        </Button>
      </div>

      {/* Project header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-stone-900">
            {project.client_name ||
              PROJECT_TYPE_LABELS[project.project_type as ProjectType] +
                " Brief"}
          </h1>
          <p className="text-sm text-stone-500">
            with {designerName} ·{" "}
            {PROJECT_TYPE_LABELS[project.project_type as ProjectType]}
          </p>
        </div>
        <Badge variant="secondary" className={statusConfig.color}>
          {statusConfig.label}
        </Badge>
      </div>

      {/* 1. Progress Tracker */}
      <ProgressTracker currentPhase={currentPhase} />

      {/* Revision banner */}
      {hasPendingRevision && (
        <ClientRevisionBanner
          projectId={projectId}
          token={project.magic_link_token ?? ""}
        />
      )}

      {/* 2. Brief section (collapsible) */}
      <BriefSection
        briefContent={(brief?.content as Record<string, unknown>) ?? null}
        responses={
          (responses ?? []).map((r) => ({
            step_key: r.step_key,
            answers: r.answers as Record<string, unknown>,
          }))
        }
      />

      {/* 3. Concepts & Deliverables */}
      <DeliverablesSection
        projectId={projectId}
        designerName={designerName}
      />

      {/* 4. Feedback & Approval */}
      <ClientFeedbackSection
        projectId={projectId}
        projectStatus={project.status}
        userId={user.id}
        hasPendingRevision={hasPendingRevision}
      />

      {/* 5. Download section (when project complete) */}
      {project.status === "reviewed" && (
        <DownloadSection deliverables={[]} projectStatus={project.status} />
      )}

      {/* 6. Messages */}
      <MessageThread
        projectId={projectId}
        currentUserId={user.id}
        senderType="client"
      />

      {/* 7. Activity Feed */}
      <ActivityFeed projectId={projectId} />

      {/* CTA for actionable projects */}
      {(project.status === "sent" || project.status === "in_progress") &&
        !hasPendingRevision && (
          <div className="rounded-2xl border border-stone-200/60 bg-white p-6 text-center">
            <p className="text-sm text-stone-500 mb-3">
              {project.status === "sent"
                ? "Ready to get started?"
                : "Pick up where you left off"}
            </p>
            <Button asChild className="bg-[#E05252] hover:bg-[#c94545] text-white">
              <Link
                href={`/brief/${project.id}${project.magic_link_token ? `?token=${project.magic_link_token}` : ""}`}
              >
                {project.status === "sent"
                  ? "Start Questionnaire"
                  : "Continue Questionnaire"}
              </Link>
            </Button>
          </div>
        )}
    </div>
  );
}
