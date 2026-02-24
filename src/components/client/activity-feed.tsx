"use client";

import { useState, useEffect } from "react";
import { Activity, MessageSquare, CheckCircle, AlertCircle, Upload, Clock } from "lucide-react";

interface ActivityEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface ActivityFeedProps {
  projectId: string;
}

const ICON_MAP: Record<string, typeof Activity> = {
  approval: CheckCircle,
  revision: AlertCircle,
  feedback: MessageSquare,
  upload: Upload,
  message: MessageSquare,
  default: Clock,
};

const COLOR_MAP: Record<string, string> = {
  approval: "text-emerald-500 bg-emerald-50",
  revision: "text-amber-500 bg-amber-50",
  feedback: "text-blue-500 bg-blue-50",
  upload: "text-purple-500 bg-purple-50",
  message: "text-stone-500 bg-stone-50",
  default: "text-stone-400 bg-stone-50",
};

export function ActivityFeed({ projectId }: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch(`/api/client/projects/${projectId}/activity`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events ?? []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, [projectId]);

  return (
    <div className="rounded-2xl border border-stone-200/60 bg-white p-6">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-stone-400" />
        Activity
      </h2>

      {loading ? (
        <p className="text-sm text-stone-400">Loading activity...</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-stone-400">No activity yet.</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const Icon = ICON_MAP[event.type] || ICON_MAP.default;
            const colors = COLOR_MAP[event.type] || COLOR_MAP.default;

            return (
              <div key={event.id} className="flex items-start gap-3">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0 ${colors}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-700">{event.description}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {new Date(event.timestamp).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
