"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";

interface BriefSectionProps {
  briefContent: Record<string, unknown> | null;
  responses: { step_key: string; answers: Record<string, unknown> }[];
}

export function BriefSection({ briefContent, responses }: BriefSectionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!briefContent && responses.length === 0) return null;

  return (
    <div className="rounded-2xl border border-stone-200/60 bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-6 text-left hover:bg-stone-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100">
            <FileText className="h-4 w-4 text-stone-500" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-stone-900">
              Your Submitted Brief
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {responses.length} section{responses.length !== 1 ? "s" : ""} completed
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="h-5 w-5 text-stone-400" />
        ) : (
          <ChevronRight className="h-5 w-5 text-stone-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-stone-100 p-6 space-y-4">
          {responses.map((r) => (
            <div key={r.step_key} className="space-y-2">
              <h3 className="text-sm font-medium text-stone-700 capitalize">
                {r.step_key.replace(/_/g, " ")}
              </h3>
              <div className="rounded-lg bg-stone-50 p-4 text-sm text-stone-600">
                {Object.entries(r.answers).map(([key, value]) => (
                  <div key={key} className="flex gap-2 py-1">
                    <span className="font-medium text-stone-500 min-w-[120px] capitalize">
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {briefContent && (
            <div className="rounded-lg bg-stone-50 p-4 text-sm text-stone-600">
              <pre className="whitespace-pre-wrap font-sans">
                {JSON.stringify(briefContent, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
