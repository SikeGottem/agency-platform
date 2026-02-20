import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
  Send,
  RotateCcw,
} from "lucide-react";
import type { Database } from "@/types/supabase";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface AnalyticsWidgetProps {
  projects: ProjectRow[];
}

function getAvgCompletionTime(projects: ProjectRow[]): string {
  const completed = projects.filter((p) => p.completed_at && p.created_at);
  if (completed.length === 0) return "—";
  const totalMs = completed.reduce((sum, p) => {
    return sum + (new Date(p.completed_at!).getTime() - new Date(p.created_at).getTime());
  }, 0);
  const avgHours = totalMs / completed.length / 3600000;
  if (avgHours < 1) return `${Math.round(avgHours * 60)}m`;
  if (avgHours < 24) return `${Math.round(avgHours)}h`;
  return `${Math.round(avgHours / 24)}d`;
}

function getMonthlyData(projects: ProjectRow[]) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const thisMonthCount = projects.filter((p) => {
    const d = new Date(p.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
  const lastMonthCount = projects.filter((p) => {
    const d = new Date(p.created_at);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  }).length;

  return { thisMonthCount, lastMonthCount };
}

function getRecentEvents(projects: ProjectRow[]) {
  const events: { icon: typeof FileText; color: string; label: string; time: string; sortTime: number }[] = [];

  for (const p of projects) {
    const name = p.client_name || p.client_email.split("@")[0];

    if (p.status === "in_progress" || p.status === "completed" || p.status === "reviewed") {
      events.push({
        icon: Activity,
        color: "text-amber-500",
        label: `${name} started brief`,
        time: p.updated_at,
        sortTime: new Date(p.updated_at).getTime() - 1000,
      });
    }

    if (p.status === "completed" || p.status === "reviewed") {
      events.push({
        icon: CheckCircle2,
        color: "text-emerald-500",
        label: `${name} completed brief`,
        time: p.completed_at || p.updated_at,
        sortTime: new Date(p.completed_at || p.updated_at).getTime(),
      });
    }

    // Revision requested if status went back to in_progress after completion
    if (p.status === "in_progress" && p.completed_at) {
      events.push({
        icon: RotateCcw,
        color: "text-violet-500",
        label: `Revision requested — ${name}`,
        time: p.updated_at,
        sortTime: new Date(p.updated_at).getTime(),
      });
    }
  }

  return events
    .sort((a, b) => b.sortTime - a.sortTime)
    .slice(0, 5);
}

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

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function AnalyticsWidget({ projects }: AnalyticsWidgetProps) {
  const totalBriefs = projects.filter(
    (p) => p.status === "completed" || p.status === "reviewed"
  ).length;
  const avgTime = getAvgCompletionTime(projects);

  const startedCount = projects.filter(
    (p) => p.status !== "draft"
  ).length;
  const finishedCount = projects.filter(
    (p) => p.status === "completed" || p.status === "reviewed"
  ).length;
  const completionRate = startedCount > 0 ? Math.round((finishedCount / startedCount) * 100) : 0;

  const { thisMonthCount, lastMonthCount } = getMonthlyData(projects);
  const maxBar = Math.max(thisMonthCount, lastMonthCount, 1);

  const now = new Date();
  const thisMonthName = MONTH_NAMES[now.getMonth()];
  const lastMonthIdx = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const lastMonthName = MONTH_NAMES[lastMonthIdx];

  const recentEvents = getRecentEvents(projects);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Analytics</h2>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Briefs Received</p>
                <p className="text-2xl font-bold">{totalBriefs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. Completion</p>
                <p className="text-2xl font-bold">{avgTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Bar Chart */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Briefs by Month
          </h3>
          <div className="flex items-end gap-6 h-32">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full flex justify-center">
                <div
                  className="w-12 bg-muted-foreground/20 rounded-t-md transition-all"
                  style={{ height: `${Math.max((lastMonthCount / maxBar) * 96, 4)}px` }}
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{lastMonthCount}</p>
                <p className="text-xs text-muted-foreground">{lastMonthName}</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full flex justify-center">
                <div
                  className="w-12 bg-primary rounded-t-md transition-all"
                  style={{ height: `${Math.max((thisMonthCount / maxBar) * 96, 4)}px` }}
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{thisMonthCount}</p>
                <p className="text-xs text-muted-foreground">{thisMonthName}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      {recentEvents.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentEvents.map((event, i) => {
                const Icon = event.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      <Icon className={`h-4 w-4 ${event.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{event.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getRelativeTime(event.time)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
