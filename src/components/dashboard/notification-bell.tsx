"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, FileText, CheckCircle2, Clock, Eye, Upload, MessageSquare, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { 
  getNotifications, 
  getUnreadCount, 
  markAllNotificationsRead, 
  markNotificationRead,
  subscribeToNotifications,
  type NotificationWithProject,
  NOTIFICATION_CONFIG 
} from "@/lib/notifications";

const ICON_MAP = {
  Eye,
  CheckCircle2,
  MessageSquare,
  Upload,
  CheckCircle,
  FileText,
  Clock,
} as const;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<NotificationWithProject[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications on mount
  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      const [notifications, count] = await Promise.all([
        getNotifications(userId, 15),
        getUnreadCount(userId)
      ]);
      setNotifications(notifications);
      setUnreadCount(count);
      setLoading(false);
    }

    fetchNotifications();
  }, [userId]);

  // Subscribe to real-time notification updates
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(
      userId,
      // On new notification
      async (newNotification) => {
        // Fetch the notification with project details
        const notifications = await getNotifications(userId, 1);
        const notificationWithProject = notifications.find(n => n.id === newNotification.id);
        
        if (notificationWithProject) {
          setNotifications(prev => [notificationWithProject, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      },
      // On notification update (mark as read)
      (updatedNotification) => {
        setNotifications(prev =>
          prev.map(n => 
            n.id === updatedNotification.id ? { ...n, is_read: updatedNotification.is_read } : n
          )
        );
        if (updatedNotification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    );

    return unsubscribe;
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleMarkAllRead() {
    const success = await markAllNotificationsRead(userId);
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  }

  async function handleNotificationClick(notificationId: string) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.is_read) {
      const success = await markNotificationRead(notificationId);
      if (success) {
        setNotifications(prev =>
          prev.map(n => 
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-background shadow-xl z-50">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <div className="h-4 w-4 mx-auto mb-2 animate-pulse bg-muted-foreground/30 rounded" />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => {
                const config = NOTIFICATION_CONFIG[notification.type as keyof typeof NOTIFICATION_CONFIG];
                const IconComponent = ICON_MAP[config?.icon as keyof typeof ICON_MAP] || Bell;
                const clientName = notification.project?.client_name || notification.project?.client_email?.split("@")[0] || "Client";
                
                return (
                  <Link
                    key={notification.id}
                    href={`/dashboard/projects/${notification.project_id || '#'}`}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={cn(
                      "flex items-start gap-3 p-3 transition-colors hover:bg-muted/50 border-b border-border/30 last:border-0",
                      !notification.is_read && "bg-primary/[0.03]"
                    )}
                  >
                    <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", config?.bgColor || "bg-muted")}>
                      <IconComponent className={cn("h-4 w-4", config?.color || "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">
                        <span className="font-medium">{notification.title}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {timeAgo(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
