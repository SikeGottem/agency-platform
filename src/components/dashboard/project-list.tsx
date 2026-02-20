"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from "@/types";
import type { ProjectType, ProjectStatus } from "@/types";
import { ProjectQuickActions } from "@/components/dashboard/project-quick-actions";
// Using native Date formatting instead of date-fns

interface Project {
  id: string;
  client_name: string | null;
  client_email: string;
  project_type: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  designer_id: string;
  magic_link_token: string | null;
}

interface ProjectListProps {
  designerId: string;
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800", 
  reviewed: "bg-purple-100 text-purple-800",
};

const TYPE_COLORS: Record<ProjectType, string> = {
  branding: "bg-purple-100 text-purple-800",
  web_design: "bg-blue-100 text-blue-800",
  social_media: "bg-pink-100 text-pink-800",
};

export function ProjectList({ designerId }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchProjects() {
      const supabase = createClient();
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("designer_id", designerId)
        .order("created_at", { ascending: false });

      setProjects(data || []);
      setLoading(false);
    }

    fetchProjects();
  }, [designerId]);

  const filteredProjects = projects.filter((project) =>
    (project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    project.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    PROJECT_TYPE_LABELS[project.project_type as ProjectType]
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  function getClientUrl(project: Project): string {
    if (project.magic_link_token) {
      return `${window.location.origin}/brief/t/${project.magic_link_token}`;
    }
    return `${window.location.origin}/brief/${project.id}`;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Plus className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No projects yet</h3>
          <p className="mb-4 max-w-sm text-muted-foreground">
            Create your first project to start the client onboarding process.
          </p>
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Project
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={TYPE_COLORS[project.project_type as ProjectType]}
                    >
                      {PROJECT_TYPE_LABELS[project.project_type as ProjectType]}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={STATUS_COLORS[project.status as ProjectStatus]}
                    >
                      {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
                    </Badge>
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {project.client_name || project.client_email}
                  </CardTitle>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3" />
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </div>
                    {project.completed_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3" />
                        Completed {new Date(project.completed_at).toLocaleDateString()}
                      </div>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ProjectQuickActions
                projectId={project.id}
                clientUrl={getClientUrl(project)}
                clientEmail={project.client_email}
                status={project.status}
                magicLinkToken={project.magic_link_token}
              />
            </CardContent>
          </Card>
        ))}

        {filteredProjects.length === 0 && searchTerm && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No projects found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or create a new project.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}