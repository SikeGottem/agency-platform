"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from "@/types";
import type { ProjectType, ProjectStatus } from "@/types";

interface Project {
  id: string;
  client_name: string | null;
  client_email: string;
  project_type: string;
  status: string;
  created_at: string;
  designer_id: string;
}

interface RealtimeProjectListProps {
  initialProjects: Project[];
  designerId: string;
}

export function RealtimeProjectList({ initialProjects, designerId }: RealtimeProjectListProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel("projects-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
          filter: `designer_id=eq.${designerId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setProjects((prev) => [payload.new as Project, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setProjects((prev) =>
              prev.map((p) =>
                p.id === (payload.new as Project).id
                  ? (payload.new as Project)
                  : p
              )
            );
          } else if (payload.eventType === "DELETE") {
            setProjects((prev) =>
              prev.filter((p) => p.id !== (payload.old as { id: string }).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [designerId]);

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="mb-2 text-lg font-semibold">No projects yet</h3>
          <p className="mb-4 text-muted-foreground">
            Create your first project to send a client onboarding link.
          </p>
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/dashboard/projects/${project.id}`}
        >
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {PROJECT_TYPE_LABELS[project.project_type as ProjectType]}
                </Badge>
                <Badge variant="outline">
                  {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
                </Badge>
              </div>
              <CardTitle className="text-lg">
                {project.client_name || project.client_email}
              </CardTitle>
              <CardDescription>{project.client_email}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Created {new Date(project.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
