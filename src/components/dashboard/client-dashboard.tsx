import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Inbox } from "lucide-react";
import Link from "next/link";
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from "@/types";
import type { ProjectType, ProjectStatus } from "@/types";
import type { Database } from "@/types/supabase";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface ClientDashboardProps {
  userId: string;
}

export async function ClientDashboard({ userId }: ClientDashboardProps) {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", userId)
    .order("created_at", { ascending: false })
    .returns<ProjectRow[]>();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Briefs</h1>
        <p className="text-muted-foreground">
          Projects you&apos;ve been invited to collaborate on
        </p>
      </div>

      {!projects || projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No briefs yet</h3>
            <p className="mb-4 max-w-sm text-muted-foreground">
              When a designer sends you a brief invitation, it will appear here. Check your email for an invitation link.
            </p>
            <p className="text-sm text-muted-foreground">
              Waiting for your first project? The designer should send you a unique link to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const isActionable =
              project.status !== "completed" && project.status !== "reviewed";
            return (
              <Card key={project.id} className="transition-shadow hover:shadow-md active:scale-[0.98] h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {PROJECT_TYPE_LABELS[project.project_type as ProjectType]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">
                    {PROJECT_TYPE_LABELS[project.project_type as ProjectType]} Brief
                  </CardTitle>
                  <CardDescription>
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 mt-auto">
                  {isActionable ? (
                    <Button asChild className="w-full h-11 sm:h-10">
                      <Link href={`/brief/${project.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Continue Brief
                      </Link>
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Completed{" "}
                      {project.completed_at
                        ? new Date(project.completed_at).toLocaleDateString()
                        : ""}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
