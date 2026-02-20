"use client";

import { Check, Circle, Clock } from "lucide-react";

export interface TimelineEvent {
  label: string;
  date: string | null;
  status: "completed" | "current" | "upcoming";
}

interface ProjectTimelineProps {
  events: TimelineEvent[];
}

export function ProjectTimeline({ events }: ProjectTimelineProps) {
  return (
    <div className="rounded-2xl border border-stone-200/60 bg-white p-6">
      <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold text-stone-900 mb-5 uppercase tracking-wider">
        Project Timeline
      </h3>
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-[15px] top-3 bottom-3 w-px bg-stone-200" />

        <div className="space-y-6">
          {events.map((event, i) => (
            <div key={i} className="relative flex items-start gap-4">
              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                {event.status === "completed" ? (
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-emerald-500">
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  </div>
                ) : event.status === "current" ? (
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-[#E05252] bg-white">
                    <Clock className="h-3.5 w-3.5 text-[#E05252]" />
                  </div>
                ) : (
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-stone-200 bg-white">
                    <Circle className="h-3 w-3 text-stone-300" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="pt-1">
                <p
                  className={`text-sm font-medium ${
                    event.status === "upcoming"
                      ? "text-stone-400"
                      : event.status === "current"
                        ? "text-[#E05252]"
                        : "text-stone-900"
                  }`}
                >
                  {event.label}
                </p>
                {event.date && (
                  <p className="text-xs text-stone-400 mt-0.5">
                    {new Date(event.date).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
