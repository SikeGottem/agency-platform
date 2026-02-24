"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { LIFECYCLE_PHASES, type LifecyclePhase, type LifecycleState } from "@/types";

const PHASE_LABELS: Record<LifecyclePhase, string> = {
  discovery: "Discovery",
  proposal: "Proposal",
  design: "Design",
  feedback: "Feedback",
  revision: "Revision",
  delivery: "Delivery",
  completed: "Completed",
};

const PHASE_DESCRIPTIONS: Record<LifecyclePhase, string> = {
  discovery: "Understanding client needs and project scope",
  proposal: "Preparing quote and project timeline",
  design: "Creating design concepts and deliverables",
  feedback: "Client reviewing and providing feedback",
  revision: "Implementing client feedback and changes",
  delivery: "Finalizing and handing off deliverables",
  completed: "Project complete — all deliverables approved",
};

interface TimelineTabProps {
  projectId: string;
  lifecycle: LifecycleState | null;
}

export function TimelineTab({ projectId, lifecycle }: TimelineTabProps) {
  const [advancing, setAdvancing] = useState(false);
  const currentPhase = lifecycle?.current_phase || "discovery";
  const currentIndex = LIFECYCLE_PHASES.indexOf(currentPhase as LifecyclePhase);
  const completedPhases = lifecycle?.phases_completed || [];

  const advancePhase = async () => {
    if (currentIndex >= LIFECYCLE_PHASES.length - 1) return;
    setAdvancing(true);
    try {
      const nextPhase = LIFECYCLE_PHASES[currentIndex + 1];
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lifecycle_phase: nextPhase }),
      });
      window.location.reload();
    } catch (err) {
      console.error("Failed to advance phase:", err);
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-900">Project Timeline</h3>
        {currentPhase !== "completed" && (
          <Button size="sm" onClick={advancePhase} disabled={advancing}>
            {advancing ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-1" />
            )}
            Advance to {PHASE_LABELS[LIFECYCLE_PHASES[currentIndex + 1]] || "Next"}
          </Button>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {LIFECYCLE_PHASES.map((phase, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isFuture = i > currentIndex;
          const completedInfo = completedPhases.find((p: { phase: string }) => p.phase === phase);

          return (
            <div key={phase} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Vertical line */}
              {i < LIFECYCLE_PHASES.length - 1 && (
                <div
                  className={`absolute left-[15px] top-[32px] w-0.5 h-[calc(100%-16px)] ${
                    isCompleted ? "bg-emerald-300" : "bg-stone-200"
                  }`}
                />
              )}

              {/* Icon */}
              <div className="shrink-0 relative z-10">
                {isCompleted ? (
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                ) : isCurrent ? (
                  <div className="h-8 w-8 rounded-full bg-stone-900 flex items-center justify-center ring-4 ring-stone-100">
                    <Circle className="h-4 w-4 text-white fill-white" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center">
                    <Circle className="h-4 w-4 text-stone-300" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={`pt-1 ${isFuture ? "opacity-40" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className={`font-medium text-sm ${isCurrent ? "text-stone-900" : "text-stone-600"}`}>
                    {PHASE_LABELS[phase]}
                  </span>
                  {isCurrent && (
                    <Badge className="bg-stone-900 text-white text-xs">Current</Badge>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  {PHASE_DESCRIPTIONS[phase]}
                </p>
                {completedInfo && (
                  <p className="text-xs text-stone-400 mt-1">
                    Completed {new Date(completedInfo.completed_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
