import type { Database } from "@/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { StyleOption } from "@/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export interface OverviewStats {
  totalProjects: number;
  completionRate: number;
  avgTimeToComplete: string;
  activeClients: number;
}

export interface FunnelData {
  sent: number;
  opened: number;
  started: number;
  completed: number;
}

export interface ResponseTimeData {
  period: string;
  avgHours: number;
  count: number;
}

export interface StyleInsight {
  style: StyleOption;
  percentage: number;
  count: number;
  totalResponses: number;
}

/**
 * Get overview analytics stats for a designer
 */
export async function getOverviewStats(
  supabase: SupabaseClient<Database>,
  designerId: string
): Promise<OverviewStats> {
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("designer_id", designerId);

  if (!projects) {
    return {
      totalProjects: 0,
      completionRate: 0,
      avgTimeToComplete: "—",
      activeClients: 0,
    };
  }

  const totalProjects = projects.length;
  const sentProjects = projects.filter(p => p.status !== "draft");
  const completedProjects = projects.filter(p => 
    p.status === "completed" || p.status === "reviewed"
  );
  
  const completionRate = sentProjects.length > 0 
    ? Math.round((completedProjects.length / sentProjects.length) * 100) 
    : 0;

  const avgTimeToComplete = calculateAvgCompletionTime(projects);
  
  // Count unique active clients (projects that are sent or in progress)
  const activeClientEmails = new Set(
    projects
      .filter(p => p.status === "sent" || p.status === "in_progress")
      .map(p => p.client_email)
  );
  const activeClients = activeClientEmails.size;

  return {
    totalProjects,
    completionRate,
    avgTimeToComplete,
    activeClients,
  };
}

/**
 * Get project funnel data showing the conversion at each stage
 */
export async function getFunnelData(
  supabase: SupabaseClient<Database>,
  designerId: string
): Promise<FunnelData> {
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("designer_id", designerId);

  if (!projects) {
    return { sent: 0, opened: 0, started: 0, completed: 0 };
  }

  const sent = projects.filter(p => p.status !== "draft").length;
  const opened = projects.filter(p => 
    p.status !== "draft" && p.last_accessed_at
  ).length;
  const started = projects.filter(p => 
    p.status === "in_progress" || p.status === "completed" || p.status === "reviewed"
  ).length;
  const completed = projects.filter(p => 
    p.status === "completed" || p.status === "reviewed"
  ).length;

  return { sent, opened, started, completed };
}

/**
 * Get response time trends over the last 6 months
 */
export async function getResponseTimeData(
  supabase: SupabaseClient<Database>,
  designerId: string
): Promise<ResponseTimeData[]> {
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("designer_id", designerId)
    .not("completed_at", "is", null);

  if (!projects) return [];

  // Group by month and calculate average response time
  const monthlyData: Record<string, { totalHours: number; count: number }> = {};
  
  const now = new Date();
  
  for (const project of projects) {
    if (!project.completed_at || !project.sent_at) continue;
    
    const completedDate = new Date(project.completed_at);
    const sentDate = new Date(project.sent_at);
    
    // Only include last 6 months
    const monthsAgo = (now.getFullYear() - completedDate.getFullYear()) * 12 + 
                      (now.getMonth() - completedDate.getMonth());
    if (monthsAgo > 5) continue;
    
    const responseHours = (completedDate.getTime() - sentDate.getTime()) / (1000 * 60 * 60);
    const monthKey = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { totalHours: 0, count: 0 };
    }
    
    monthlyData[monthKey].totalHours += responseHours;
    monthlyData[monthKey].count += 1;
  }

  // Convert to array and sort by date
  const result: ResponseTimeData[] = Object.entries(monthlyData)
    .map(([period, data]) => ({
      period: formatMonthYear(period),
      avgHours: Math.round(data.totalHours / data.count),
      count: data.count,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  return result;
}

/**
 * Get aggregated style insights across all completed projects
 */
export async function getStyleInsights(
  supabase: SupabaseClient<Database>,
  designerId: string
): Promise<StyleInsight[]> {
  const { data: projects } = await supabase
    .from("projects")
    .select("brief_content")
    .eq("designer_id", designerId)
    .not("brief_content", "is", null);

  if (!projects) return [];

  const styleCounts: Record<StyleOption, number> = {
    minimalist: 0,
    bold: 0,
    playful: 0,
    elegant: 0,
    vintage: 0,
    modern: 0,
    organic: 0,
    geometric: 0,
  };

  let totalResponses = 0;

  for (const project of projects) {
    if (!project.brief_content) continue;
    
    const content = project.brief_content as any;
    const selectedStyles = content?.styleDirection?.selectedStyles;
    
    if (Array.isArray(selectedStyles)) {
      totalResponses++;
      for (const style of selectedStyles) {
        if (style in styleCounts) {
          styleCounts[style as StyleOption]++;
        }
      }
    }
  }

  // Convert to insights array and sort by popularity
  const insights: StyleInsight[] = Object.entries(styleCounts)
    .map(([style, count]) => ({
      style: style as StyleOption,
      count,
      percentage: totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0,
      totalResponses,
    }))
    .sort((a, b) => b.count - a.count);

  return insights;
}

// Helper functions

function calculateAvgCompletionTime(projects: ProjectRow[]): string {
  const completed = projects.filter(p => p.completed_at && p.sent_at);
  if (completed.length === 0) return "—";
  
  const totalMs = completed.reduce((sum, p) => {
    const sentTime = new Date(p.sent_at!).getTime();
    const completedTime = new Date(p.completed_at!).getTime();
    return sum + (completedTime - sentTime);
  }, 0);
  
  const avgHours = totalMs / completed.length / (1000 * 60 * 60);
  
  if (avgHours < 1) return `${Math.round(avgHours * 60)}m`;
  if (avgHours < 24) return `${Math.round(avgHours)}h`;
  return `${Math.round(avgHours / 24)}d`;
}

function formatMonthYear(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });
}