"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { computeStyleProfile, AXIS_KEYS, AXIS_LABELS } from "@/lib/style-intelligence";
import type { StyleProfile, StyleAxes } from "@/lib/style-intelligence";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

// ============================================
// Radar Chart (enhanced)
// ============================================

function ProfileRadarChart({ axes, className }: { axes: StyleAxes; className?: string }) {
  const dimensions = AXIS_KEYS.map(key => {
    const [neg, pos] = AXIS_LABELS[key];
    return { key, label: axes[key] >= 0 ? pos : neg, value: axes[key] };
  });

  const size = 200;
  const center = size / 2;
  const maxRadius = 70;

  const points = dimensions
    .map((dim, i) => {
      const angle = (i * Math.PI * 2) / dimensions.length - Math.PI / 2;
      const normalized = (dim.value + 1) / 2; // 0-1
      const radius = normalized * maxRadius;
      return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`;
    })
    .join(" ");

  return (
    <div className={cn("relative", className)}>
      <svg width={size} height={size} className="transition-all duration-700">
        {/* Background rings */}
        {[0.25, 0.5, 0.75, 1.0].map((scale, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={maxRadius * scale}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-muted-foreground/15"
          />
        ))}
        {/* Center line (neutral) */}
        <circle
          cx={center}
          cy={center}
          r={maxRadius * 0.5}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 3"
          className="text-muted-foreground/30"
        />
        {/* Axis lines */}
        {dimensions.map((_, i) => {
          const angle = (i * Math.PI * 2) / dimensions.length - Math.PI / 2;
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + Math.cos(angle) * maxRadius}
              y2={center + Math.sin(angle) * maxRadius}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted-foreground/20"
            />
          );
        })}
        {/* Data polygon */}
        <polygon
          points={points}
          fill="hsl(var(--primary))"
          fillOpacity="0.15"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="animate-in fade-in duration-1000"
        />
        {/* Data points */}
        {dimensions.map((dim, i) => {
          const angle = (i * Math.PI * 2) / dimensions.length - Math.PI / 2;
          const normalized = (dim.value + 1) / 2;
          const radius = normalized * maxRadius;
          return (
            <circle
              key={i}
              cx={center + Math.cos(angle) * radius}
              cy={center + Math.sin(angle) * radius}
              r="4"
              fill="hsl(var(--primary))"
              className="animate-in zoom-in duration-500"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          );
        })}
      </svg>
      {/* Labels */}
      {dimensions.map((dim, i) => {
        const angle = (i * Math.PI * 2) / dimensions.length - Math.PI / 2;
        const labelR = maxRadius + 22;
        const x = center + Math.cos(angle) * labelR;
        const y = center + Math.sin(angle) * labelR;
        return (
          <div
            key={i}
            className="absolute text-[11px] font-semibold text-muted-foreground transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
          >
            {dim.label}
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function StyleProfileStep({
  data,
  onSave,
  onNext,
  onPrev,
  allResponses,
}: StepProps) {
  const profile = useMemo(
    () => computeStyleProfile(allResponses || {}),
    [allResponses]
  );

  const [confirmed, setConfirmed] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustments, setAdjustments] = useState<Partial<StyleAxes>>({});

  // Apply manual adjustments
  const effectiveAxes: StyleAxes = useMemo(() => {
    const base = { ...profile.axes };
    for (const [key, val] of Object.entries(adjustments)) {
      base[key as keyof StyleAxes] = val as number;
    }
    return base;
  }, [profile.axes, adjustments]);

  const topArchetypes = profile.archetypes.slice(0, 3);
  const personality = profile.recommendations.brandPersonality;

  async function handleNext() {
    const profileData = {
      axes: effectiveAxes,
      confidence: profile.confidence,
      archetypes: topArchetypes.map(a => ({ name: a.name, matchScore: a.matchScore })),
      personality,
      confirmed,
      adjustments: Object.keys(adjustments).length > 0 ? adjustments : undefined,
    };
    await onSave("style_profile", profileData);
    onNext();
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto" data-testid="style-profile-step">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white mb-2 animate-in zoom-in duration-500">
          <Sparkles className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Your Style DNA</h2>
        <p className="text-muted-foreground">
          Here's what we've learned about your design taste so far
        </p>
      </div>

      {/* Radar Chart */}
      <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <ProfileRadarChart axes={effectiveAxes} className="w-[200px] h-[200px]" />
      </div>

      {/* Brand Archetypes */}
      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
        <h3 className="text-sm font-semibold text-center text-muted-foreground">
          Your style is closest to
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {topArchetypes.map((arch, i) => (
            <div
              key={arch.name}
              className={cn(
                "rounded-xl border p-3 text-center transition-all",
                i === 0
                  ? "border-primary/40 bg-primary/5 shadow-sm"
                  : "border-border/40"
              )}
            >
              <div className="text-lg font-bold text-primary">{arch.matchScore}%</div>
              <div className="text-sm font-semibold mt-0.5">{arch.name}</div>
              {arch.website && (
                <a
                  href={arch.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-primary hover:underline mt-1 block"
                >
                  View →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Personality Words */}
      <div className="text-center space-y-3 animate-in fade-in duration-700" style={{ animationDelay: '400ms' }}>
        <h3 className="text-sm font-semibold text-muted-foreground">
          Your brand feels
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          {personality.map((word) => (
            <span
              key={word}
              className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full animate-in zoom-in duration-300"
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Confirmation */}
      <div className="rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-5 text-center space-y-3">
        <p className="font-medium">Does this feel right?</p>
        <div className="flex justify-center gap-3">
          <Button
            variant={confirmed ? "default" : "outline"}
            size="sm"
            onClick={() => { setConfirmed(true); setShowAdjust(false); }}
            className="min-w-[120px]"
          >
            {confirmed && <Check className="mr-1.5 h-3.5 w-3.5" />}
            Yes, spot on!
          </Button>
          <Button
            variant={showAdjust ? "default" : "outline"}
            size="sm"
            onClick={() => { setShowAdjust(!showAdjust); setConfirmed(false); }}
            className="min-w-[120px]"
          >
            {showAdjust ? <ChevronUp className="mr-1.5 h-3.5 w-3.5" /> : <ChevronDown className="mr-1.5 h-3.5 w-3.5" />}
            Adjust
          </Button>
        </div>

        {/* Manual Adjustment Sliders */}
        {showAdjust && (
          <div className="mt-4 space-y-4 text-left animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs text-muted-foreground text-center">
              Drag to adjust any axis that doesn't feel right
            </p>
            {AXIS_KEYS.map((key) => {
              const [neg, pos] = AXIS_LABELS[key];
              const value = adjustments[key] ?? effectiveAxes[key];
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{neg}</span>
                    <span>{pos}</span>
                  </div>
                  <Slider
                    value={[Math.round((value + 1) * 50)]}
                    onValueChange={([v]) => {
                      setAdjustments(prev => ({ ...prev, [key]: (v / 50) - 1 }));
                    }}
                    max={100}
                    min={0}
                    step={5}
                    className="touch-manipulation"
                  />
                </div>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setAdjustments({}); }}
              className="w-full text-xs"
            >
              Reset adjustments
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrev}
          className="h-11 px-6 active:scale-95 transition-transform min-h-[44px]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={handleNext}
          className="h-11 px-8 active:scale-95 transition-transform min-h-[44px]"
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
