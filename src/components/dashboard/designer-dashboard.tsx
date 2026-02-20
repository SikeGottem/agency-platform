"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/types";
import { ProjectList } from "@/components/dashboard/project-list";
import { AnalyticsWidget } from "@/components/dashboard/analytics-widget";

interface DesignerDashboardProps {
  userId: string;
}

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

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  recentProjects: Project[];
}

export function DesignerDashboard({ userId }: DesignerDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    recentProjects: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      // Fetch all projects for this designer
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .eq("designer_id", userId)
        .order("created_at", { ascending: false });

      const fetchedProjects = projectsData || [];
      setProjects(fetchedProjects);

      // Calculate stats
      const totalProjects = fetchedProjects.length;
      const activeProjects = fetchedProjects.filter(p => 
        p.status !== "completed" && p.status !== "reviewed"
      ).length;
      const completedProjects = fetchedProjects.filter(p => 
        p.status === "completed" || p.status === "reviewed"
      ).length;
      const recentProjects = fetchedProjects.slice(0, 5);

      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        recentProjects,
      });

      setLoading(false);
    }

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-1/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your client projects and track progress
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              In progress or sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">
              Finished projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalProjects > 0 
                ? Math.round((stats.completedProjects / stats.totalProjects) * 100)
                : 0
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              Success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Projects</h2>
            <Button variant="outline" asChild>
              <Link href="/dashboard/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </Button>
          </div>
          <ProjectList designerId={userId} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Project Analytics</h2>
            <AnalyticsWidget projects={projects as any} />
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            {stats.recentProjects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No recent activity</h3>
                  <p className="text-muted-foreground">
                    Create your first project to see activity here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {stats.recentProjects.map((project) => (
                  <Card key={project.id} className="transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {project.client_name || project.client_email}
                          </CardTitle>
                          <CardDescription>
                            {project.project_type} project
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(project.created_at).toLocaleDateString()}
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/projects/${project.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}