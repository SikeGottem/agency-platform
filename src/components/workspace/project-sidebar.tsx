"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  MessageSquare,
  CheckCircle2,
  User,
  Mail,
  Calendar,
  Activity,
  ExternalLink,
} from "lucide-react";
import type { LifecyclePhase } from "@/types";

const HEALTH_COLORS: Record<string, string> = {
  excellent: "text-emerald-600",
  good: "text-emerald-500",
  fair: "text-amber-500",
  poor: "text-red-500",
};

interface ProjectSidebarProps {
  project: {
    id: string;
    client_name: string | null;
    client_email: string;
    project_type: string;
    status: string;
    created_at: string;
    magic_link_token: string | null;
  };
  lifecycle: {
    current_phase: string;
    client_health_score: number;
    blockers: { id: string; description: string; severity: string }[];
  } | null;
  deliverableStats: {
    total: number;
    draft: number;
    shared: number;
    approved: number;
  };
}

export function ProjectSidebar({ project, lifecycle, deliverableStats }: ProjectSidebarProps) {
  const healthScore = lifecycle?.client_health_score ?? 100;
  const healthLevel =
    healthScore >= 80 ? "excellent" : healthScore >= 60 ? "good" : healthScore >= 40 ? "fair" : "poor";

  return (
    <div className="space-y-5">
      {/* Client info */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">Client</h4>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center">
            <User className="h-5 w-5 text-stone-400" />
          </div>
          <div>
            <p className="font-medium text-sm text-stone-900">
              {project.client_name || "Unknown"}
            </p>
            <p className="text-xs text-stone-500">{project.client_email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Calendar className="h-3 w-3" />
          Created {new Date(project.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Project health */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Project Health
        </h4>
        <div className="flex items-center gap-2">
          <Activity className={`h-4 w-4 ${HEALTH_COLORS[healthLevel]}`} />
          <span className={`text-2xl font-bold ${HEALTH_COLORS[healthLevel]}`}>
            {healthScore}
          </span>
          <span className="text-xs text-stone-400">/ 100</span>
        </div>

        {/* Deliverable stats */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="rounded-lg bg-stone-50 px-3 py-2 text-center">
            <p className="text-lg font-bold text-stone-900">{deliverableStats.total}</p>
            <p className="text-xs text-stone-500">Total</p>
          </div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center">
            <p className="text-lg font-bold text-emerald-700">{deliverableStats.approved}</p>
            <p className="text-xs text-emerald-600">Approved</p>
          </div>
        </div>

        {/* Blockers */}
        {lifecycle?.blockers && lifecycle.blockers.length > 0 && (
          <div className="pt-1">
            <p className="text-xs font-medium text-red-500 mb-1">
              {lifecycle.blockers.length} Blocker{lifecycle.blockers.length > 1 ? "s" : ""}
            </p>
            {lifecycle.blockers.map((b) => (
              <p key={b.id} className="text-xs text-stone-600 truncate">
                • {b.description}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
          Quick Actions
        </h4>
        {project.magic_link_token && (
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <a
              href={`/q/${project.magic_link_token}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              View Client Page
            </a>
          </Button>
        )}
        <Button variant="outline" size="sm" className="w-full justify-start">
          <Send className="h-3 w-3 mr-2" />
          Send to Client
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start">
          <MessageSquare className="h-3 w-3 mr-2" />
          Request Feedback
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start text-emerald-700 hover:text-emerald-800">
          <CheckCircle2 className="h-3 w-3 mr-2" />
          Mark Complete
        </Button>
      </div>
    </div>
  );
}
