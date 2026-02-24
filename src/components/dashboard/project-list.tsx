"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Calendar, User, FolderOpen } from "lucide-react";
import Link from "next/link";
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from "@/types";
import type { ProjectType, ProjectStatus } from "@/types";
import { ProjectQuickActions } from "@/components/dashboard/project-quick-actions";

interface Project {
  id: string;
  client_name: string | null;
  client_email: string;
  project_type: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  updated_at: string | null;
  designer_id: string;
  magic_link_token: string | null;
}

interface ProjectListProps {
  projects: Project[];
  designerId?: string;
}

type FilterTab = "all" | "active" | "completed";

const STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  sent: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  reviewed: "bg-violet-50 text-violet-700 border-violet-200",
};

const TYPE_COLORS: Record<ProjectType, string> = {
  branding: "bg-purple-50 text-purple-700",
  web_design: "bg-sky-50 text-sky-700",
  social_media: "bg-pink-50 text-pink-700",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}

function getLastActivity(project: Project): string {
  return project.completed_at || project.updated_at || project.created_at;
}

function getClientUrl(project: Project): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  if (project.magic_link_token) return `${origin}/brief/t/${project.magic_link_token}`;
  return `${origin}/brief/${project.id}`;
}

export function ProjectList({ projects }: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const counts = useMemo(() => {
    const active = projects.filter(
      (p) => p.status !== "completed" && p.status !== "reviewed"
    ).length;
    return { all: projects.length, active, completed: projects.length - active };
  }, [projects]);

  const filtered = useMemo(() => {
    let list = projects;

    // Tab filter
    if (activeTab === "active") {
      list = list.filter((p) => p.status !== "completed" && p.status !== "reviewed");
    } else if (activeTab === "completed") {
      list = list.filter((p) => p.status === "completed" || p.status === "reviewed");
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          (p.client_name?.toLowerCase().includes(q) ?? false) ||
          p.client_email.toLowerCase().includes(q)
      );
    }

    // Sort by last activity
    return [...list].sort(
      (a, b) =>
        new Date(getLastActivity(b)).getTime() - new Date(getLastActivity(a)).getTime()
    );
  }, [projects, activeTab, searchTerm]);

  // Empty state — no projects at all
  if (projects.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <FolderOpen className="h-10 w-10 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No projects yet</h3>
          <p className="mb-6 max-w-sm text-muted-foreground">
            Create your first project to start collecting client briefs and managing your design workflow.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Project
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "active", label: "Active", count: counts.active },
    { key: "completed", label: "Completed", count: counts.completed },
  ];

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="inline-flex rounded-lg border bg-muted/40 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 text-xs ${
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Project cards */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="mb-4 h-10 w-10 text-muted-foreground/50" />
            <h3 className="mb-1 text-lg font-semibold">No projects found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm
                ? "Try a different search term."
                : "No projects match this filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <Card
              key={project.id}
              className="group flex flex-col transition-all hover:shadow-md hover:border-primary/20"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${TYPE_COLORS[project.project_type as ProjectType] || ""}`}
                    >
                      {PROJECT_TYPE_LABELS[project.project_type as ProjectType] ||
                        project.project_type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${STATUS_COLORS[project.status as ProjectStatus] || ""}`}
                    >
                      {PROJECT_STATUS_LABELS[project.status as ProjectStatus] ||
                        project.status}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    asChild
                  >
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View project</span>
                    </Link>
                  </Button>
                </div>

                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">
                    {project.client_name || project.client_email}
                  </span>
                </CardTitle>

                {project.client_name && (
                  <CardDescription className="truncate text-xs">
                    {project.client_email}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="flex flex-col gap-3 pt-0 mt-auto">
                {/* Last activity */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Last activity {timeAgo(getLastActivity(project))}</span>
                </div>

                {/* Quick actions */}
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
        </div>
      )}
    </div>
  );
}
