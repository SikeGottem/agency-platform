"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Calendar, Clock, User, Eye } from "lucide-react";
import Link from "next/link";
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS, type ProjectType, type ProjectStatus } from "@/types";
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

interface ProjectListFilteredProps {
  projects: Project[];
  showSearch?: boolean;
  showFilters?: boolean;
  defaultFilter?: "all" | ProjectStatus;
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

export function ProjectListFiltered({ 
  projects,
  showSearch = true,
  showFilters = true,
  defaultFilter = "all"
}: ProjectListFilteredProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>(defaultFilter);
  const [typeFilter, setTypeFilter] = useState<"all" | ProjectType>("all");
  const [sortBy, setSortBy] = useState<"created" | "updated" | "status">("created");

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((project) =>
        (project.client_name?.toLowerCase().includes(searchLower) ?? false) ||
        project.client_email.toLowerCase().includes(searchLower) ||
        PROJECT_TYPE_LABELS[project.project_type as ProjectType]
          .toLowerCase()
          .includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(project => project.project_type === typeFilter);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "created":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "updated":
          const aDate = a.completed_at || a.created_at;
          const bDate = b.completed_at || b.created_at;
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        case "status":
          const statusOrder: Record<string, number> = {
            draft: 0,
            sent: 1,
            in_progress: 2,
            completed: 3,
            reviewed: 4
          };
          return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchTerm, statusFilter, typeFilter, sortBy]);

  const statusCounts = useMemo(() => {
    return projects.reduce((acc, project) => {
      acc[project.status as ProjectStatus] = (acc[project.status as ProjectStatus] || 0) + 1;
      return acc;
    }, {} as Record<ProjectStatus, number>);
  }, [projects]);

  function getClientUrl(project: Project): string {
    if (project.magic_link_token && typeof window !== 'undefined') {
      return `${window.location.origin}/brief/t/${project.magic_link_token}`;
    }
    return typeof window !== 'undefined' ? `${window.location.origin}/brief/${project.id}` : `/brief/${project.id}`;
  }

  const EmptyState = ({ title, description }: { title: string; description: string }) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      {(showSearch || showFilters) && (
        <div className="space-y-4">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client name, email, or project type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label} {statusCounts[value as ProjectStatus] ? `(${statusCounts[value as ProjectStatus]})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Sort by Created</SelectItem>
                  <SelectItem value="updated">Sort by Updated</SelectItem>
                  <SelectItem value="status">Sort by Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({statusCounts.draft || 0})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({statusCounts.sent || 0})</TabsTrigger>
          <TabsTrigger value="in_progress">Active ({statusCounts.in_progress || 0})</TabsTrigger>
          <TabsTrigger value="completed">Done ({statusCounts.completed || 0})</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed ({statusCounts.reviewed || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {filteredAndSortedProjects.length === 0 ? (
            searchTerm || statusFilter !== "all" || typeFilter !== "all" ? (
              <EmptyState
                title="No projects found"
                description="Try adjusting your search terms or filters."
              />
            ) : (
              <EmptyState
                title="No projects yet"
                description="Create your first project to get started with client onboarding."
              />
            )
          ) : (
            <div className="space-y-4">
              {filteredAndSortedProjects.map((project) => (
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
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Created {new Date(project.created_at).toLocaleDateString()}
                          </div>
                          {project.completed_at && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              Completed {new Date(project.completed_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/projects/${project.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
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
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}