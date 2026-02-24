"use client";

import { Check } from "lucide-react";

const PHASES = [
  { key: "submitted", label: "Brief Submitted" },
  { key: "in_design", label: "In Design" },
  { key: "review", label: "Review" },
  { key: "revisions", label: "Revisions" },
  { key: "approved", label: "Approved" },
  { key: "delivered", label: "Delivered" },
] as const;

type PhaseKey = (typeof PHASES)[number]["key"];

interface ProgressTrackerProps {
  currentPhase: PhaseKey;
}

function phaseIndex(key: PhaseKey): number {
  return PHASES.findIndex((p) => p.key === key);
}

export function ProgressTracker({ currentPhase }: ProgressTrackerProps) {
  const currentIdx = phaseIndex(currentPhase);

  return (
    <div className="rounded-2xl border border-stone-200/60 bg-white p-6">
      <div className="flex items-center justify-between">
        {PHASES.map((phase, i) => {
          const isCompleted = i < currentIdx;
          const isCurrent = i === currentIdx;
          const isUpcoming = i > currentIdx;

          return (
            <div key={phase.key} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                        ? "bg-[#E05252] text-white ring-4 ring-[#E05252]/20"
                        : "border-2 border-stone-200 bg-white text-stone-400"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                </div>
                <span
                  className={`text-[11px] font-medium text-center leading-tight max-w-[70px] ${
                    isCompleted
                      ? "text-emerald-600"
                      : isCurrent
                        ? "text-[#E05252]"
                        : "text-stone-400"
                  }`}
                >
                  {phase.label}
                </span>
              </div>

              {/* Connector line */}
              {i < PHASES.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mt-[-18px] ${
                    i < currentIdx ? "bg-emerald-500" : "bg-stone-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Maps project status + flags to a progress phase key.
 */
export function getPhaseFromStatus(
  status: string,
  hasPendingRevision: boolean,
  hasSharedDeliverables: boolean
): PhaseKey {
  if (status === "reviewed") return "delivered";
  if (status === "completed" && !hasPendingRevision) {
    return hasSharedDeliverables ? "review" : "review";
  }
  if (hasPendingRevision) return "revisions";
  if (status === "completed") return "review";
  if (status === "in_progress") return "in_design";
  // sent or draft
  return "submitted";
}
