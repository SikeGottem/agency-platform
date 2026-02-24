import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  PROJECT_TYPE_LABELS,
  type ProjectType,
} from "@/types";
import { Inbox, ArrowRight } from "lucide-react";

export const metadata = {
  title: "My Projects — Briefed",
};

// Client-friendly status labels (not internal designer statuses)
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  draft: {
    label: "Brief Submitted",
    color: "bg-stone-100 text-stone-600",
    dot: "bg-stone-400",
  },
  sent: {
    label: "Brief Submitted",
    color: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  in_progress: {
    label: "In Design",
    color: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  completed: {
    label: "Ready for Review",
    color: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  reviewed: {
    label: "Done",
    color: "bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
  },
  revision_requested: {
    label: "Needs Revision",
    color: "bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
};

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch projects where this client is linked by email or client_id
  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, client_name, project_type, status, magic_link_token, created_at, completed_at, designer_id"
    )
    .or(`client_email.eq.${user!.email!},client_id.eq.${user!.id}`)
    .order("created_at", { ascending: false });

  // Fetch designer names for display
  const designerIds = [
    ...new Set((projects ?? []).map((p) => p.designer_id)),
  ];
  const { data: designers } = designerIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, business_name")
        .in("id", designerIds)
    : { data: [] };

  const designerMap = new Map(
    (designers ?? []).map((d) => [
      d.id,
      d.business_name || d.full_name || "Designer",
    ])
  );

  // Check for pending revisions per project
  const projectIds = (projects ?? []).map((p) => p.id);
  const { data: revisionCounts } = projectIds.length
    ? await supabase
        .from("revision_requests")
        .select("project_id")
        .in("project_id", projectIds)
        .eq("status", "pending")
    : { data: [] };

  const projectsWithRevisions = new Set(
    (revisionCounts ?? []).map((r) => r.project_id)
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-stone-900">
          My Projects
        </h1>
        <p className="mt-1 text-stone-500">
          All your design projects in one place.
        </p>
      </div>

      {!projects || projects.length === 0 ? (
        <Card className="border-stone-200/60 bg-white">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-stone-100">
              <Inbox className="h-10 w-10 text-stone-400" />
            </div>
            <h3 className="mb-2 font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">
              No projects yet
            </h3>
            <p className="max-w-sm text-sm text-stone-500">
              When a designer sends you a brief, it will appear here. Check your
              email for an invitation link.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => {
            const hasRevision = projectsWithRevisions.has(project.id);
            const effectiveStatus = hasRevision
              ? "revision_requested"
              : project.status;
            const status = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.draft;
            const designerName = designerMap.get(project.designer_id) ?? "Designer";
            const isActionable =
              project.status === "sent" ||
              project.status === "in_progress" ||
              hasRevision;

            return (
              <Link key={project.id} href={`/client/project/${project.id}`}>
                <Card className="group h-full border-stone-200/60 bg-white transition-all hover:shadow-md hover:border-stone-300/80 active:scale-[0.99]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium bg-stone-100 text-stone-600"
                      >
                        {PROJECT_TYPE_LABELS[project.project_type as ProjectType]}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-xs font-medium ${status.color}`}
                      >
                        <span
                          className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${status.dot}`}
                        />
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-stone-900 mb-1">
                      {project.client_name || PROJECT_TYPE_LABELS[project.project_type as ProjectType] + " Brief"}
                    </h3>
                    <p className="text-sm text-stone-500 mb-4">
                      with {designerName}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-400">
                        {new Date(project.created_at).toLocaleDateString(
                          "en-AU",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </span>
                      {isActionable && (
                        <span className="flex items-center gap-1 text-xs font-medium text-[#E05252] group-hover:gap-2 transition-all">
                          {hasRevision ? "Review revision" : "Continue"}
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      )}
                      {project.status === "completed" && !hasRevision && (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          Ready for review
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      )}
                      {project.status === "reviewed" && (
                        <span className="text-xs text-purple-600 font-medium">
                          ✓ Done
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
