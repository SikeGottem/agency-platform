"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  DollarSign,
  Zap,
  Trophy,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

const TIMELINE_OPTIONS = [
  { value: "asap", label: "ASAP", sublabel: "1-2 weeks", icon: Zap, gradient: "from-red-500 to-orange-500" },
  { value: "month", label: "1 Month", sublabel: "Within 4 weeks", icon: Clock, gradient: "from-amber-500 to-yellow-500" },
  { value: "quarter", label: "3 Months", sublabel: "No rush", icon: Clock, gradient: "from-emerald-500 to-teal-500" },
  { value: "flexible", label: "Flexible", sublabel: "Open timeline", icon: Scale, gradient: "from-blue-500 to-indigo-500" },
];

const BUDGET_RANGES = [
  { value: "under_1k", label: "Under $1K", min: 0, max: 1000 },
  { value: "1k_3k", label: "$1K - $3K", min: 1000, max: 3000 },
  { value: "3k_5k", label: "$3K - $5K", min: 3000, max: 5000 },
  { value: "5k_10k", label: "$5K - $10K", min: 5000, max: 10000 },
  { value: "10k_plus", label: "$10K+", min: 10000, max: 50000 },
  { value: "discuss", label: "Let's discuss", min: 0, max: 0 },
];

const PRIORITIES = [
  { key: "Quality", icon: Trophy, description: "Best possible result", color: "text-amber-500" },
  { key: "Speed", icon: Zap, description: "Fastest delivery", color: "text-blue-500" },
  { key: "Cost", icon: DollarSign, description: "Most affordable", color: "text-emerald-500" },
];

interface TimelineBudgetData {
  timeline: string;
  budgetRange: string;
  budgetSlider: number[];
  priorities: string[];
}

export function TimelineBudgetStep({ data, onSave, onNext, onPrev }: StepProps) {
  const existingData = data as TimelineBudgetData | undefined;
  const [timeline, setTimeline] = useState(existingData?.timeline ?? "");
  const [budgetRange, setBudgetRange] = useState(existingData?.budgetRange ?? "");
  const [budgetSlider, setBudgetSlider] = useState<number[]>(existingData?.budgetSlider ?? [3000]);
  const [priorities, setPriorities] = useState<string[]>(
    existingData?.priorities ?? ["Quality", "Speed", "Cost"]
  );
  const [error, setError] = useState<string | null>(null);

  // Auto-save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buildFormData = useCallback((): TimelineBudgetData => ({
    timeline,
    budgetRange,
    budgetSlider,
    priorities,
  }), [timeline, budgetRange, budgetSlider, priorities]);

  const autoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onSave("timeline_budget", buildFormData());
    }, 800);
  }, [buildFormData, onSave]);

  useEffect(() => {
    if (timeline || budgetRange) {
      autoSave();
    }
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [timeline, budgetRange, budgetSlider, priorities, autoSave]);

  // Sync slider to budget range
  useEffect(() => {
    const range = BUDGET_RANGES.find((b) => b.value === budgetRange);
    if (range && range.max > 0) {
      setBudgetSlider([Math.round((range.min + range.max) / 2)]);
    }
  }, [budgetRange]);

  function movePriority(index: number, direction: "up" | "down") {
    const newPriorities = [...priorities];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newPriorities.length) return;
    [newPriorities[index], newPriorities[swapIndex]] = [
      newPriorities[swapIndex],
      newPriorities[index],
    ];
    setPriorities(newPriorities);
  }

  async function handleNext() {
    setError(null);
    if (!timeline) {
      setError("Please select a timeline");
      return;
    }
    if (!budgetRange) {
      setError("Please select a budget range");
      return;
    }
    await onSave("timeline_budget", buildFormData());
    onNext();
  }

  function formatBudget(val: number) {
    if (val >= 10000) return `$${(val / 1000).toFixed(0)}K`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val}`;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto" data-testid="timeline-budget-step">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white mb-2">
          <Clock className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Timeline & Budget</h2>
        <p className="text-muted-foreground">
          Help us understand your timeline and budget expectations
        </p>
      </div>

      {/* Timeline Cards */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Ideal Timeline</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TIMELINE_OPTIONS.map((opt) => {
            const isSelected = timeline === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setError(null); setTimeline(opt.value); }}
                className={cn(
                  "group relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col",
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 scale-[1.02] shadow-lg"
                    : "ring-1 ring-border/40 hover:ring-border hover:shadow-md hover:scale-[1.01] opacity-70 hover:opacity-100"
                )}
              >
                <div className={cn(
                  "w-full py-5 px-3 flex flex-col items-center justify-center bg-gradient-to-br text-white",
                  opt.gradient
                )}>
                  <Icon className="h-6 w-6 mb-1" />
                </div>
                <div className={cn(
                  "px-2 py-2.5 text-center transition-colors",
                  isSelected ? "bg-primary/5" : "bg-muted/30"
                )}>
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground">{opt.sublabel}</p>
                </div>
                <div
                  className={cn(
                    "absolute top-2 right-2 h-5 w-5 rounded-full bg-white/90 flex items-center justify-center transition-all duration-300",
                    isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  )}
                >
                  <Check className="h-3 w-3 text-primary" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget Range Cards + Slider */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Budget Range</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {BUDGET_RANGES.map((opt) => {
            const isSelected = budgetRange === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setError(null); setBudgetRange(opt.value); }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background hover:border-primary/50 hover:bg-accent"
                )}
              >
                {isSelected && <Check className="inline h-3 w-3 mr-1" />}
                {opt.label}
              </button>
            );
          })}
        </div>

        {budgetRange && budgetRange !== "discuss" && (
          <div className="rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Fine-tune your budget</span>
              <span className="text-lg font-bold text-primary">{formatBudget(budgetSlider[0])}</span>
            </div>
            <Slider
              value={budgetSlider}
              onValueChange={setBudgetSlider}
              min={100}
              max={50000}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>$100</span>
              <span>$50K+</span>
            </div>
          </div>
        )}
      </div>

      {/* Priority Ranking */}
      <div>
        <h3 className="mb-3 text-sm font-medium">
          Priority Ranking (top = most important)
        </h3>
        <div className="space-y-2">
          {priorities.map((priority, index) => {
            const config = PRIORITIES.find((p) => p.key === priority);
            if (!config) return null;
            const Icon = config.icon;
            return (
              <div
                key={priority}
                className={cn(
                  "flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-all",
                  index === 0 ? "border-primary bg-primary/5 shadow-sm" : "border-border/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold",
                    index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </span>
                  <Icon className={cn("h-4 w-4", config.color)} />
                  <div>
                    <span className="font-medium">{priority}</span>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => movePriority(index, "up")}
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => movePriority(index, "down")}
                    disabled={index === priorities.length - 1}
                    className="h-8 w-8 p-0"
                  >
                    ↓
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev} className="h-12 px-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="button" onClick={handleNext} className="h-12 px-8">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
