"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Clock, Zap, Scale, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

const TIMELINE_OPTIONS = [
  { value: "asap", label: "ASAP", sublabel: "1-2 weeks", icon: Zap },
  { value: "month", label: "~1 Month", sublabel: "Within 4 weeks", icon: Clock },
  { value: "quarter", label: "3 Months", sublabel: "No rush", icon: Clock },
  { value: "flexible", label: "Flexible", sublabel: "Open timeline", icon: Scale },
];

const BUDGET_RANGES = [
  { value: "under_1k", label: "Under $1K" },
  { value: "1k_3k", label: "$1K – $3K" },
  { value: "3k_5k", label: "$3K – $5K" },
  { value: "5k_10k", label: "$5K – $10K" },
  { value: "10k_plus", label: "$10K+" },
  { value: "discuss", label: "Let's discuss" },
];

interface QuickTimelineData {
  timeline: string;
  budget: string;
  notes: string;
}

export function QuickTimelineStep({ data, onSave, onNext, onPrev, onSubmit, isSaving }: StepProps) {
  const existing = data as QuickTimelineData | undefined;
  const [timeline, setTimeline] = useState(existing?.timeline ?? "");
  const [budget, setBudget] = useState(existing?.budget ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildData = useCallback((): QuickTimelineData => ({
    timeline, budget, notes,
  }), [timeline, budget, notes]);

  const autoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onSave("quick_timeline", buildData());
    }, 800);
  }, [buildData, onSave]);

  useEffect(() => {
    if (timeline || budget) autoSave();
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [timeline, budget, notes, autoSave]);

  const handleSubmit = async () => {
    await onSave("quick_timeline", buildData());
    if (onSubmit) {
      await onSubmit();
    } else {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Timeline & Budget</h2>
        <p className="text-sm text-muted-foreground">Last step! When do you need it and what's the budget?</p>
      </div>

      {/* Timeline */}
      <div>
        <label className="text-sm font-medium mb-2 block">Timeline</label>
        <div className="grid grid-cols-2 gap-2">
          {TIMELINE_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTimeline(opt.value)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-all",
                  timeline === opt.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{opt.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{opt.sublabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
          <DollarSign className="h-4 w-4" />
          Budget Range
        </label>
        <div className="flex flex-wrap gap-2">
          {BUDGET_RANGES.map(b => (
            <button
              key={b.value}
              type="button"
              onClick={() => setBudget(b.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border transition-all",
                budget === b.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted border-border"
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Anything else? (Optional)</label>
        <Textarea
          placeholder="Any other details, links, preferences, or notes for the designer..."
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="h-11 sm:h-10">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving} className="h-11 sm:h-10">
          {isSaving ? "Submitting..." : (
            <>Submit Brief <Check className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
