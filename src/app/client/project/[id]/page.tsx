import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { BriefViewer } from "@/components/dashboard/brief-viewer";
import { ClientRevisionBanner } from "@/components/brief/client-revision-banner";
import { ProjectTimeline } from "@/components/client/project-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileIcon } from "lucide-react";
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

  // Fetch revision requests for the timeline
  const { data: revisions } = await supabase
    .from("revision_requests")
    .select("id, status, created_at, responded_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  const hasPendingRevision = (revisions ?? []).some(
    (r) => r.status === "pending"
  );

  // Build timeline events
  const timelineEvents = buildTimelineEvents(project, revisions ?? []);

  return (
    <div className="space-y-8">
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
        <Badge
          variant="secondary"
          className={
            hasPendingRevision
              ? "bg-red-50 text-red-700"
              : project.status === "reviewed"
                ? "bg-purple-50 text-purple-700"
                : project.status === "completed"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
          }
        >
          {hasPendingRevision
            ? "Needs Revision"
            : project.status === "reviewed"
              ? "Done"
              : project.status === "completed"
                ? "Ready for Review"
                : project.status === "in_progress"
                  ? "In Design"
                  : "Brief Submitted"}
        </Badge>
      </div>

      {/* Timeline */}
      <ProjectTimeline events={timelineEvents} />

      {/* Revision banner */}
      {hasPendingRevision && (
        <ClientRevisionBanner
          projectId={projectId}
          token={project.magic_link_token ?? ""}
        />
      )}

      {/* Brief viewer — read-only */}
      {(brief?.content || (responses && responses.length > 0)) && (
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900 mb-4">
            Your Brief
          </h2>
          <BriefViewer
            content={brief?.content ?? null}
            projectId={projectId}
            responses={responses ?? []}
          />
        </div>
      )}

      {/* Deliverables section — shown when project is reviewed/done */}
      {project.status === "reviewed" && (
        <div className="rounded-2xl border border-stone-200/60 bg-white p-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900 mb-4">
            Deliverables
          </h2>
          <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/50 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
              <FileIcon className="h-5 w-5 text-stone-400" />
            </div>
            <p className="text-sm text-stone-500">
              Your designer will upload deliverables here when they&apos;re ready.
            </p>
          </div>
        </div>
      )}

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

/* ── Timeline builder ── */

interface RevisionRow {
  id: string;
  status: string;
  created_at: string;
  responded_at: string | null;
}

export interface TimelineEvent {
  label: string;
  date: string | null;
  status: "completed" | "current" | "upcoming";
}

function buildTimelineEvents(
  project: { status: string; created_at: string; completed_at: string | null },
  revisions: RevisionRow[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const s = project.status;

  // 1. Brief started
  events.push({
    label: "Brief created",
    date: project.created_at,
    status: "completed",
  });

  // 2. Brief submitted
  if (["completed", "reviewed"].includes(s)) {
    events.push({
      label: "Brief submitted",
      date: project.completed_at,
      status: "completed",
    });
  } else if (s === "in_progress") {
    events.push({
      label: "Brief in progress",
      date: null,
      status: "current",
    });
  } else {
    events.push({
      label: "Brief submitted",
      date: null,
      status: "upcoming",
    });
  }

  // 3. Designer reviewing
  if (["completed", "reviewed"].includes(s)) {
    events.push({
      label: "Designer reviewing",
      date: project.completed_at,
      status: s === "completed" && revisions.length === 0 ? "current" : "completed",
    });
  } else {
    events.push({
      label: "Designer reviewing",
      date: null,
      status: "upcoming",
    });
  }

  // 4. Revision requested (only if revisions exist)
  if (revisions.length > 0) {
    const latestRevision = revisions[0];
    const pending = revisions.some((r) => r.status === "pending");
    events.push({
      label: "Revision requested",
      date: latestRevision.created_at,
      status: pending ? "current" : "completed",
    });
  }

  // 5. Approved
  if (s === "reviewed") {
    events.push({
      label: "Approved",
      date: null,
      status: "completed",
    });
  } else {
    events.push({
      label: "Approved",
      date: null,
      status: "upcoming",
    });
  }

  return events;
}
