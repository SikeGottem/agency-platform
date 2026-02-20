import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];

export type NotificationType = 
  | "brief_viewed" 
  | "brief_submitted" 
  | "revision_requested" 
  | "asset_uploaded" 
  | "project_completed";

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  projectId?: string;
}

export interface NotificationWithProject extends NotificationRow {
  project?: {
    id: string;
    client_name: string | null;
    client_email: string;
    project_type: string;
  } | null;
}

// Notification type configurations for consistent UI display
export const NOTIFICATION_CONFIG: Record<NotificationType, {
  title: (clientName: string, projectType?: string) => string;
  message: (clientName: string, projectType?: string) => string;
  icon: string;
  color: string;
  bgColor: string;
}> = {
  brief_viewed: {
    title: (clientName) => "Brief Viewed",
    message: (clientName) => `${clientName} has viewed their project brief`,
    icon: "Eye",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  brief_submitted: {
    title: (clientName) => "Brief Submitted", 
    message: (clientName) => `${clientName} has submitted their completed brief`,
    icon: "CheckCircle2",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  revision_requested: {
    title: (clientName) => "Revision Requested",
    message: (clientName) => `${clientName} has requested revisions to their brief`,
    icon: "MessageSquare",
    color: "text-amber-500", 
    bgColor: "bg-amber-500/10",
  },
  asset_uploaded: {
    title: (clientName) => "Asset Uploaded",
    message: (clientName) => `${clientName} has uploaded new project assets`,
    icon: "Upload",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  project_completed: {
    title: (clientName) => "Project Completed",
    message: (clientName, projectType) => `${clientName}'s ${projectType || "project"} has been marked as completed`,
    icon: "CheckCircle", 
    color: "text-emerald-600",
    bgColor: "bg-emerald-600/10",
  },
};

/**
 * Create a new notification
 */
export async function createNotification(data: CreateNotificationData): Promise<NotificationRow | null> {
  const supabase = createClient();
  
  const config = NOTIFICATION_CONFIG[data.type];
  const clientName = data.message ? extractClientName(data.message) : "Client";
  
  const notificationData: NotificationInsert = {
    user_id: data.userId,
    type: data.type,
    title: data.title || config.title(clientName),
    message: data.message || config.message(clientName),
    project_id: data.projectId || null,
    is_read: false,
  };

  const { data: notification, error } = await supabase
    .from("notifications")
    .insert(notificationData)
    .select()
    .single();

  if (error) {
    console.error("Error creating notification:", error);
    return null;
  }

  return notification;
}

/**
 * Get notifications for a user with optional project details
 */
export async function getNotifications(
  userId: string,
  limit = 20,
  includeRead = true
): Promise<NotificationWithProject[]> {
  const supabase = createClient();

  let query = supabase
    .from("notifications")
    .select(`
      *,
      project:projects(
        id,
        client_name,
        client_email,
        project_type
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!includeRead) {
    query = query.eq("is_read", false);
  }

  const { data: notifications, error } = await query;

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return notifications as NotificationWithProject[];
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }

  return true;
}

/**
 * Mark multiple notifications as read
 */
export async function markNotificationsRead(notificationIds: string[]): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .in("id", notificationIds);

  if (error) {
    console.error("Error marking notifications as read:", error);
    return false;
  }

  return true;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }

  return true;
}

/**
 * Delete old notifications (cleanup function)
 */
export async function cleanupOldNotifications(userId: string, daysOld = 30): Promise<boolean> {
  const supabase = createClient();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", userId)
    .eq("is_read", true)
    .lt("created_at", cutoffDate.toISOString());

  if (error) {
    console.error("Error cleaning up old notifications:", error);
    return false;
  }

  return true;
}

/**
 * Subscribe to real-time notification updates for a user
 */
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: NotificationRow) => void,
  onUpdate: (notification: NotificationRow) => void
) {
  const supabase = createClient();

  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new as NotificationRow);
      }
    )
    .on(
      "postgres_changes", 
      {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload.new as NotificationRow);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Helper function to extract client name from notification message
 */
function extractClientName(message: string): string {
  const match = message.match(/^([^(\s]+)/);
  return match ? match[1] : "Client";
}

/**
 * Create activity-specific notifications
 */
export const NotificationHelpers = {
  /**
   * Create notification when client views their brief
   */
  async briefViewed(designerId: string, projectId: string, clientName: string) {
    return createNotification({
      userId: designerId,
      type: "brief_viewed",
      title: "Brief Viewed",
      message: `${clientName} has viewed their project brief`,
      projectId,
    });
  },

  /**
   * Create notification when client submits their brief
   */
  async briefSubmitted(designerId: string, projectId: string, clientName: string) {
    return createNotification({
      userId: designerId,
      type: "brief_submitted", 
      title: "Brief Submitted",
      message: `${clientName} has submitted their completed brief`,
      projectId,
    });
  },

  /**
   * Create notification when client requests revisions
   */
  async revisionRequested(designerId: string, projectId: string, clientName: string) {
    return createNotification({
      userId: designerId,
      type: "revision_requested",
      title: "Revision Requested",
      message: `${clientName} has requested revisions to their brief`,
      projectId,
    });
  },

  /**
   * Create notification when client uploads assets
   */
  async assetUploaded(designerId: string, projectId: string, clientName: string, fileName: string) {
    return createNotification({
      userId: designerId,
      type: "asset_uploaded", 
      title: "Asset Uploaded",
      message: `${clientName} uploaded "${fileName}"`,
      projectId,
    });
  },

  /**
   * Create notification when project is completed
   */
  async projectCompleted(designerId: string, projectId: string, clientName: string, projectType: string) {
    return createNotification({
      userId: designerId,
      type: "project_completed",
      title: "Project Completed", 
      message: `${clientName}'s ${projectType} project has been completed`,
      projectId,
    });
  },
};