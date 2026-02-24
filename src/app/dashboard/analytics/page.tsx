import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BarChart3, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  getOverviewStats, 
  getFunnelData, 
  getResponseTimeData, 
  getStyleInsights 
} from "@/lib/analytics";
import { OverviewStats } from "@/components/dashboard/analytics/overview-stats";
import { ProjectFunnel } from "@/components/dashboard/analytics/project-funnel";
import { ResponseTimeChart } from "@/components/dashboard/analytics/response-time-chart";
import { StyleInsights } from "@/components/dashboard/analytics/style-insights";
import { QuestionnaireStepAnalytics } from "@/components/dashboard/analytics/questionnaire-step-analytics";

export const metadata = {
  title: "Analytics — Briefed",
  description: "Comprehensive analytics dashboard for design project insights",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect("/auth/signin");
  }
  
  // Ensure user is a designer
  const role = user.user_metadata?.role;
  if (role !== "designer") {
    redirect("/dashboard");
  }

  // Fetch all analytics data in parallel
  const [overviewStats, funnelData, responseTimeData, styleInsights, questionnaireAnalytics] = await Promise.all([
    getOverviewStats(supabase, user.id),
    getFunnelData(supabase, user.id),
    getResponseTimeData(supabase, user.id),
    getStyleInsights(supabase, user.id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("questionnaire_analytics").select("*").then((r: any) => r.data || []),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Analytics Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive insights into your design projects
                  </p>
                </div>
              </div>
            </div>
            
            {/* Pro tier indicator */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              Pro Feature
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Overview Stats */}
          <section>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-1">Overview</h2>
              <p className="text-sm text-muted-foreground">
                Key metrics for your design business
              </p>
            </div>
            <OverviewStats stats={overviewStats} />
          </section>

          {/* Project Flow & Insights */}
          <section>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-1">Project Flow</h2>
              <p className="text-sm text-muted-foreground">
                How clients progress through your brief process
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ProjectFunnel data={funnelData} />
              <ResponseTimeChart data={responseTimeData} />
            </div>
          </section>

          {/* Style Insights - Data Moat Feature */}
          <section>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-1">Style Intelligence</h2>
              <p className="text-sm text-muted-foreground">
                Your unique data advantage — understand what your clients really want
              </p>
            </div>
            <StyleInsights data={styleInsights} />
          </section>

          {/* Questionnaire Step Analytics */}
          <section>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-1">Questionnaire Step Analytics</h2>
              <p className="text-sm text-muted-foreground">
                How long clients spend on each step, where they drop off, and completion rates
              </p>
            </div>
            <QuestionnaireStepAnalytics data={questionnaireAnalytics} />
          </section>

          {/* Upgrade prompt for free users */}
          <section className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-8 rounded-xl border border-purple-200/50">
            <div className="text-center max-w-2xl mx-auto">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">More Analytics Coming Soon</h3>
              <p className="text-muted-foreground mb-6">
                Get ready for advanced client behavior analytics, revenue tracking, 
                project profitability insights, and custom reports.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Upgrade to Pro
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}