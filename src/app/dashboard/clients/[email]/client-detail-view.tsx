"use client";

import Link from "next/link";
import { ArrowLeft, Mail, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Project {
  id: string;
  client_email: string;
  client_name: string | null;
  project_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  currentPhase: string | null;
  healthScore: number | null;
}

interface TimelineEvent {
  type: "project" | "invoice" | "message";
  date: string;
  title: string;
  description: string;
  projectId?: string;
}

interface HealthTrendPoint {
  projectType: string;
  date: string;
  score: number;
}

interface Props {
  clientName: string;
  clientEmail: string;
  projects: Project[];
  lifetimeValueCents: number;
  timeline: TimelineEvent[];
  healthTrend: HealthTrendPoint[];
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(cents / 100);
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-blue-100 text-blue-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export function ClientDetailView({
  clientName,
  clientEmail,
  projects,
  lifetimeValueCents,
  timeline,
  healthTrend,
}: Props) {
  const avgHealth =
    healthTrend.length > 0
      ? Math.round(healthTrend.reduce((s, h) => s + h.score, 0) / healthTrend.length)
      : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">{clientName || clientEmail}</h1>
            {clientName && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" /> {clientEmail}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lifetime Value</p>
                <p className="text-2xl font-bold">{formatCurrency(lifetimeValueCents)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Health</p>
                <p className="text-2xl font-bold">{avgHealth ?? "—"}{avgHealth ? "/100" : ""}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Projects</h2>
          <div className="space-y-3">
            {projects.map((p) => (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
                <Card className="hover:bg-gray-50 transition cursor-pointer">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.project_type.replace(/_/g, " ")}</p>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(p.created_at).toLocaleDateString("en-AU")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {p.healthScore != null && (
                        <span className="text-sm text-muted-foreground">
                          Health: {p.healthScore}/100
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {p.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Activity Timeline</h2>
          {timeline.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="w-20 shrink-0 text-muted-foreground">
                    {new Date(event.date).toLocaleDateString("en-AU", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div
                    className={`h-2 w-2 mt-1.5 rounded-full shrink-0 ${
                      event.type === "project"
                        ? "bg-blue-500"
                        : event.type === "invoice"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />
                  <div>
                    <p className="font-medium">{event.title}</p>
                    {event.description && (
                      <p className="text-muted-foreground">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
