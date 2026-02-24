import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { MessageThread } from "@/components/shared/message-thread";
import { BriefViewer } from "@/components/dashboard/brief-viewer";
import { WorkTab } from "@/components/workspace/work-tab";
import { TimelineTab } from "@/components/workspace/timeline-tab";
import { ProjectSidebar } from "@/components/workspace/project-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Paintbrush, MessageSquare, Clock } from "lucide-react";
import Link from "next/link";
import { PROJECT_TYPE_LABELS, type ProjectType, LIFECYCLE_PHASES, type LifecyclePhase } from "@/types";
import type { Database } from "@/types/supabase";
import { getLifecycleState, initLifecycleState } from "@/lib/project-lifecycle";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Project — Briefed`, description: `View project ${id}` };
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-stone-100 text-stone-600" },
  sent: { label: "Sent", color: "bg-blue-50 text-blue-700" },
  in_progress: { label: "In Progress", color: "bg-amber-50 text-amber-700" },
  completed: { label: "Submitted", color: "bg-emerald-50 text-emerald-700" },
  reviewed: { label: "Approved", color: "bg-emerald-100 text-emerald-800" },
};

const PHASE_LABELS: Record<string, string> = {
  discovery: "Discovery",
  proposal: "Proposal",
  design: "Design",
  feedback: "Feedback",
  revision: "Revision",
  delivery: "Delivery",
  completed: "Completed",
};

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

  // Fetch deliverables
  const { data: deliverables } = await supabase
    .from("deliverables")
    .select("*")
    .eq("project_id", projectId)
    .order("round", { ascending: true })
    .order("created_at", { ascending: true });

  // Fetch or init lifecycle
  let lifecycle = await getLifecycleState(projectId).catch(() => null);
  if (!lifecycle) {
    try {
      lifecycle = await initLifecycleState(projectId);
    } catch {
      lifecycle = null;
    }
  }

  const statusConf = STATUS_MAP[project.status] || STATUS_MAP.draft;
  const currentPhase = lifecycle?.current_phase || "discovery";
  const allDeliverables = deliverables || [];

  const deliverableStats = {
    total: allDeliverables.length,
    draft: allDeliverables.filter((d: { status: string }) => d.status === "draft").length,
    shared: allDeliverables.filter((d: { status: string }) => ["shared", "awaiting_feedback", "feedback_given", "changes_addressed"].includes(d.status)).length,
    approved: allDeliverables.filter((d: { status: string }) => d.status === "approved").length,
  };

  return (
    <div className="flex gap-8">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-stone-500 hover:text-stone-900">
          <Link href="/dashboard">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Dashboard
          </Link>
        </Button>

        {/* Project header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-stone-900">
              {clientName}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-stone-500">
                {PROJECT_TYPE_LABELS[project.project_type as ProjectType]}
              </p>
              <span className="text-stone-300">•</span>
              <p className="text-sm text-stone-500">
                {new Date(project.created_at).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${statusConf.color} text-xs`}>{statusConf.label}</Badge>
            <Badge variant="outline" className="text-xs">
              {PHASE_LABELS[currentPhase] || currentPhase}
            </Badge>
          </div>
        </div>

        {/* Phase progress bar */}
        <div className="flex gap-1">
          {LIFECYCLE_PHASES.map((phase, i) => {
            const currentIdx = LIFECYCLE_PHASES.indexOf(currentPhase as LifecyclePhase);
            const isComplete = i < currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <div
                key={phase}
                className={`h-1.5 flex-1 rounded-full ${
                  isComplete
                    ? "bg-emerald-400"
                    : isCurrent
                    ? "bg-stone-900"
                    : "bg-stone-200"
                }`}
                title={PHASE_LABELS[phase]}
              />
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="work" className="space-y-6">
          <TabsList className="bg-stone-100">
            <TabsTrigger value="brief" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Brief
            </TabsTrigger>
            <TabsTrigger value="work" className="gap-1.5">
              <Paintbrush className="h-3.5 w-3.5" />
              Work
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Brief tab */}
          <TabsContent value="brief">
            {(brief?.content || (responses && responses.length > 0)) ? (
              <BriefViewer
                content={brief?.content ?? null}
                projectId={projectId}
                responses={responses ?? []}
              />
            ) : (
              <div className="rounded-xl border-2 border-dashed border-stone-200 p-12 text-center">
                <FileText className="h-8 w-8 mx-auto text-stone-300 mb-3" />
                <p className="text-sm text-stone-500">No brief generated yet</p>
                <p className="text-xs text-stone-400 mt-1">
                  The brief will appear here once the client completes the questionnaire.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Work tab */}
          <TabsContent value="work">
            <WorkTab projectId={projectId} initialDeliverables={allDeliverables} />
          </TabsContent>

          {/* Messages tab */}
          <TabsContent value="messages">
            <MessageThread
              projectId={projectId}
              currentUserId={user.id}
              senderType="designer"
            />
          </TabsContent>

          {/* Timeline tab */}
          <TabsContent value="timeline">
            <TimelineTab projectId={projectId} lifecycle={lifecycle} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-6">
          <ProjectSidebar
            project={{
              id: project.id,
              client_name: project.client_name,
              client_email: project.client_email,
              project_type: project.project_type,
              status: project.status,
              created_at: project.created_at,
              magic_link_token: (project as Record<string, unknown>).magic_link_token as string | null,
            }}
            lifecycle={lifecycle as { current_phase: string; client_health_score: number; blockers: { id: string; description: string; severity: string }[] } | null}
            deliverableStats={deliverableStats}
          />
        </div>
      </div>
    </div>
  );
}
