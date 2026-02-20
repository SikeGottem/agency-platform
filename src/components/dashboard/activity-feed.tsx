"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Send,
  CheckCircle2,
  Eye,
  Clock,
  Upload,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getNotifications, subscribeToNotifications, NOTIFICATION_CONFIG } from "@/lib/notifications";
import type { Database } from "@/types/supabase";
import Link from "next/link";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface ActivityFeedProps {
  userId: string;
  initialProjects?: ProjectRow[];
}

interface ActivityItem {
  id: string;
  type: 'notification' | 'project_status';
  icon: React.ComponentType<any>;
  color: string;
  message: string;
  time: string;
  projectId?: string;
  sortTime: number;
}

const STATUS_EVENTS: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  draft: { label: "Project created", icon: FileText, color: "text-muted-foreground" },
  sent: { label: "Brief sent to client", icon: Send, color: "text-blue-500" },
  in_progress: { label: "Client started brief", icon: Clock, color: "text-amber-500" },
  completed: { label: "Brief submitted", icon: CheckCircle2, color: "text-emerald-500" },
  reviewed: { label: "Brief reviewed", icon: Eye, color: "text-violet-500" },
};

const ICON_MAP = {
  Eye,
  CheckCircle2, 
  MessageSquare,
  Upload,
  CheckCircle,
  FileText,
  Clock,
  Send,
} as const;

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function ActivityFeed({ userId, initialProjects = [] }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>(initialProjects);

  // Load initial activities
  useEffect(() => {
    async function loadActivities() {
      // Get recent notifications
      const notifications = await getNotifications(userId, 10);
      
      // Get recent projects
      const supabase = createClient();
      const { data: recentProjects } = await supabase
        .from("projects")
        .select("*")
        .eq("designer_id", userId)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (recentProjects) {
        setProjects(recentProjects);
      }

      // Combine notifications and project status changes into activity items
      const notificationActivities: ActivityItem[] = notifications.map((notif) => {
        const config = NOTIFICATION_CONFIG[notif.type as keyof typeof NOTIFICATION_CONFIG];
        const IconComponent = ICON_MAP[config?.icon as keyof typeof ICON_MAP] || Eye;
        const clientName = notif.project?.client_name || notif.project?.client_email?.split("@")[0] || "Client";

        return {
          id: `notification-${notif.id}`,
          type: 'notification',
          icon: IconComponent,
          color: config?.color || "text-muted-foreground",
          message: notif.message || notif.title,
          time: getRelativeTime(notif.created_at),
          projectId: notif.project_id || undefined,
          sortTime: new Date(notif.created_at).getTime(),
        };
      });

      const projectActivities: ActivityItem[] = (recentProjects || [])
        .filter(p => p.status !== 'draft') // Don't show draft projects
        .map((project) => {
          const statusEvent = STATUS_EVENTS[project.status] ?? STATUS_EVENTS.draft;
          const clientName = project.client_name || project.client_email.split("@")[0];
          return {
            id: `project-${project.id}`,
            type: 'project_status' as const,
            icon: statusEvent.icon,
            color: statusEvent.color,
            message: `${clientName} — ${statusEvent.label}`,
            time: getRelativeTime(project.updated_at),
            projectId: project.id,
            sortTime: new Date(project.updated_at).getTime(),
          };
        });

      // Combine and sort all activities by time
      const allActivities = [...notificationActivities, ...projectActivities]
        .sort((a, b) => b.sortTime - a.sortTime)
        .slice(0, 8); // Show latest 8 activities

      setActivities(allActivities);
    }

    loadActivities();
  }, [userId, initialProjects]);

  // Subscribe to real-time updates
  useEffect(() => {
    const supabase = createClient();

    // Subscribe to project changes
    const projectsChannel = supabase
      .channel("activity-projects")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public", 
          table: "projects",
          filter: `designer_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updatedProject = payload.new as ProjectRow;
            setProjects(prev => 
              prev.map(p => p.id === updatedProject.id ? updatedProject : p)
            );
            
            // Add new activity for status changes
            if (updatedProject.status !== 'draft') {
              const statusEvent = STATUS_EVENTS[updatedProject.status] ?? STATUS_EVENTS.draft;
              const clientName = updatedProject.client_name || updatedProject.client_email.split("@")[0];
              const newActivity: ActivityItem = {
                id: `project-${updatedProject.id}-${Date.now()}`,
                type: 'project_status',
                icon: statusEvent.icon,
                color: statusEvent.color,
                message: `${clientName} — ${statusEvent.label}`,
                time: "Just now",
                projectId: updatedProject.id,
                sortTime: Date.now(),
              };

              setActivities(prev => [newActivity, ...prev].slice(0, 8));
            }
          } else if (payload.eventType === "INSERT") {
            const newProject = payload.new as ProjectRow;
            setProjects(prev => [newProject, ...prev]);
          }
        }
      )
      .subscribe();

    // Subscribe to notification changes for real-time activity updates
    const notificationsUnsubscribe = subscribeToNotifications(
      userId,
      async (newNotification) => {
        const config = NOTIFICATION_CONFIG[newNotification.type as keyof typeof NOTIFICATION_CONFIG];
        const IconComponent = ICON_MAP[config?.icon as keyof typeof ICON_MAP] || Eye;

        const newActivity: ActivityItem = {
          id: `notification-${newNotification.id}`,
          type: 'notification',
          icon: IconComponent,
          color: config?.color || "text-muted-foreground", 
          message: newNotification.message || newNotification.title,
          time: "Just now",
          projectId: newNotification.project_id || undefined,
          sortTime: Date.now(),
        };

        setActivities(prev => [newActivity, ...prev].slice(0, 8));
      },
      () => {} // Don't need to handle updates here
    );

    return () => {
      supabase.removeChannel(projectsChannel);
      notificationsUnsubscribe();
    };
  }, [userId]);

  if (activities.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            const content = (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  <Icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.time}
                  </p>
                </div>
              </div>
            );

            // Wrap in Link if there's a projectId
            if (activity.projectId) {
              return (
                <Link
                  key={activity.id}
                  href={`/dashboard/projects/${activity.projectId}`}
                  className="block transition-colors hover:bg-muted/50 rounded p-1 -m-1"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div key={activity.id}>
                {content}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
