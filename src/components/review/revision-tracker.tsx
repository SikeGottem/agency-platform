"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Check, MessageSquare, Send } from "lucide-react";
import type { Deliverable } from "./design-review-card";

interface RoundSummary {
  round: number;
  date: string;
  deliverableCount: number;
  status: "submitted" | "feedback_received" | "approved";
  changes?: string[];
}

interface RevisionTrackerProps {
  rounds: RoundSummary[];
  maxRounds?: number;
}

const STEP_CONFIG = {
  submitted: { icon: Send, color: "bg-blue-500", label: "Submitted" },
  feedback_received: { icon: MessageSquare, color: "bg-yellow-500", label: "Feedback Received" },
  approved: { icon: Check, color: "bg-green-500", label: "Approved" },
};

export function RevisionTracker({ rounds, maxRounds = 3 }: RevisionTrackerProps) {
  const totalRounds = rounds.length;
  const scopeCreep = totalRounds > maxRounds;
  const latestRound = rounds[rounds.length - 1];
  const isApproved = latestRound?.status === "approved";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Revision History</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {totalRounds} {totalRounds === 1 ? "round" : "rounds"}
            </Badge>
            {scopeCreep && (
              <Badge className="bg-red-100 text-red-800">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Scope Creep
              </Badge>
            )}
            {isApproved && (
              <Badge className="bg-green-100 text-green-800">
                <Check className="mr-1 h-3 w-3" />
                Complete
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-border" />

          <div className="space-y-6">
            {rounds.map((round, i) => {
              const config = STEP_CONFIG[round.status];
              const Icon = config.icon;
              const isLast = i === rounds.length - 1;

              return (
                <div key={round.round} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                      config.color,
                      isLast && "ring-2 ring-offset-2 ring-offset-background",
                      isLast && round.status === "approved" && "ring-green-300",
                      isLast && round.status === "feedback_received" && "ring-yellow-300",
                      isLast && round.status === "submitted" && "ring-blue-300"
                    )}
                  >
                    <Icon className="h-3 w-3 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Round {round.round}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(round.date).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                    </div>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {round.deliverableCount} {round.deliverableCount === 1 ? "deliverable" : "deliverables"}
                    </p>

                    {/* Changes from previous round */}
                    {round.changes && round.changes.length > 0 && (
                      <div className="mt-2 rounded-md bg-muted/50 p-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Changes from Round {round.round - 1}:</p>
                        <ul className="space-y-0.5">
                          {round.changes.map((change, ci) => (
                            <li key={ci} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scope creep warning */}
        {scopeCreep && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  This project has exceeded {maxRounds} revision rounds
                </p>
                <p className="mt-0.5 text-xs text-red-600">
                  Consider discussing scope with the client or adjusting the project agreement.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Helper to build RoundSummary[] from deliverables */
export function buildRoundSummaries(deliverables: Deliverable[]): RoundSummary[] {
  const byRound = new Map<number, Deliverable[]>();
  for (const d of deliverables) {
    const existing = byRound.get(d.round) || [];
    existing.push(d);
    byRound.set(d.round, existing);
  }

  return Array.from(byRound.entries())
    .sort(([a], [b]) => a - b)
    .map(([round, items]) => {
      const allApproved = items.every((d) => d.status === "approved");
      const hasFeedback = items.some((d) => d.status === "feedback_given" || d.status === "changes_addressed");

      return {
        round,
        date: items[0].created_at,
        deliverableCount: items.length,
        status: allApproved ? "approved" : hasFeedback ? "feedback_received" : "submitted",
      };
    });
}
