"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";
import { computeStyleProfile, getSurpriseFont } from "@/lib/style-intelligence";
import type { FontRecommendation } from "@/lib/style-intelligence";

const FONT_STYLE_CARDS = [
  {
    value: "serif",
    label: "Serif",
    description: "Traditional, trustworthy, elegant",
    sampleText: "The quick brown fox",
    className: "font-serif",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    value: "sans-serif",
    label: "Sans-Serif",
    description: "Modern, clean, minimal",
    sampleText: "The quick brown fox",
    className: "font-sans",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    value: "display",
    label: "Display",
    description: "Bold, unique, attention-grabbing",
    sampleText: "The quick brown fox",
    className: "font-sans font-black tracking-tight",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    value: "script",
    label: "Script",
    description: "Flowing, elegant, personal",
    sampleText: "The quick brown fox",
    className: "font-serif italic",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    value: "monospace",
    label: "Monospace",
    description: "Technical, modern, structured",
    sampleText: "The quick brown fox",
    className: "font-mono",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    value: "handwritten",
    label: "Handwritten",
    description: "Casual, friendly, approachable",
    sampleText: "The quick brown fox",
    className: "font-serif italic tracking-wide",
    gradient: "from-yellow-500 to-amber-500",
  },
];

const FONT_WEIGHTS = [
  { value: "light", label: "Light & Airy", description: "Delicate, refined, spacious", weightClass: "font-light" },
  { value: "regular", label: "Balanced", description: "Versatile, readable, neutral", weightClass: "font-normal" },
  { value: "bold", label: "Strong & Bold", description: "Confident, impactful, commanding", weightClass: "font-bold" },
];

const COMPARISONS = [
  {
    id: "serif-vs-sans",
    question: "Which feels more like your brand?",
    optionA: { label: "Serif — Classic & Refined", sample: "Your Brand", className: "font-serif text-3xl" },
    optionB: { label: "Sans-Serif — Modern & Clean", sample: "Your Brand", className: "font-sans text-3xl" },
  },
  {
    id: "tight-vs-loose",
    question: "Which spacing feels right?",
    optionA: { label: "Tight — Compact & Bold", sample: "BRAND NAME", className: "font-sans font-bold text-2xl tracking-tight" },
    optionB: { label: "Spacious — Open & Airy", sample: "BRAND NAME", className: "font-sans font-light text-2xl tracking-[0.3em]" },
  },
];

interface TypographyData {
  fontStyles: string[];
  fontWeight: string;
  comparisons: Record<string, string>;
  additionalNotes?: string;
}

export function TypographyFeelStep({ data, onSave, onNext, onPrev, allResponses, styleProfile: passedProfile, isOptional, onSkip }: StepProps) {
  const existingData = data as TypographyData | undefined;
  const [fontStyles, setFontStyles] = useState<string[]>(existingData?.fontStyles ?? []);
  const [fontWeight, setFontWeight] = useState<string>(existingData?.fontWeight ?? "");
  const [comparisons, setComparisons] = useState<Record<string, string>>(existingData?.comparisons ?? {});
  const [additionalNotes, setAdditionalNotes] = useState(existingData?.additionalNotes ?? "");
  const [error, setError] = useState<string | null>(null);

  // Style intelligence recommendations
  const styleProfile = passedProfile ?? (allResponses ? computeStyleProfile(allResponses) : null);
  const fontRecs: FontRecommendation[] = styleProfile?.recommendations?.fonts?.slice(0, 5) ?? [];
  const topRecCategories = new Set(fontRecs.slice(0, 3).map(f => f.category.replace('-', '_').replace(' ', '_')));
  
  // Build a recommendation reason for each font style card
  const getRecReason = (value: string): string | null => {
    // Map card values to font database categories
    const categoryMap: Record<string, string> = {
      'serif': 'serif', 'sans-serif': 'sans-serif', 'display': 'display',
      'script': 'script', 'monospace': 'monospace', 'handwritten': 'handwriting',
    };
    const cat = categoryMap[value];
    if (!cat) return null;
    const rec = fontRecs.find(f => f.category === cat || f.category === value);
    return rec ? rec.reason : null;
  };

  // Sort font cards: recommended first
  const sortedFontCards = [...FONT_STYLE_CARDS].sort((a, b) => {
    const aRec = topRecCategories.has(a.value) ? 0 : 1;
    const bRec = topRecCategories.has(b.value) ? 0 : 1;
    return aRec - bRec;
  });

  // Auto-save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buildFormData = useCallback((): TypographyData => ({
    fontStyles,
    fontWeight,
    comparisons,
    additionalNotes,
  }), [fontStyles, fontWeight, comparisons, additionalNotes]);

  const autoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onSave("typography_feel", buildFormData());
    }, 800);
  }, [buildFormData, onSave]);

  useEffect(() => {
    if (fontStyles.length > 0 || fontWeight) {
      autoSave();
    }
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [fontStyles, fontWeight, comparisons, additionalNotes, autoSave]);

  function toggleFontStyle(style: string) {
    setError(null);
    setFontStyles((prev) => {
      if (prev.includes(style)) return prev.filter((s) => s !== style);
      if (prev.length >= 2) {
        setError("You can select up to 2 font styles");
        return prev;
      }
      return [...prev, style];
    });
  }

  async function handleNext() {
    // Only validate if user has started filling in (not skipping)
    if (!isOptional) {
      if (fontStyles.length === 0) {
        setError("Please select at least one font style");
        return;
      }
      if (!fontWeight) {
        setError("Please select a font weight preference");
        return;
      }
    }
    await onSave("typography_feel", buildFormData());
    onNext();
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto" data-testid="typography-feel-step">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white mb-2">
          <Type className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Typography Feel</h2>
        <p className="text-muted-foreground">
          Help us understand your typography preferences for the brand
        </p>
      </div>

      {/* Visual A/B Comparisons */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Quick Comparisons</h3>
        {COMPARISONS.map((comp) => (
          <div key={comp.id} className="space-y-2">
            <p className="text-sm text-muted-foreground">{comp.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "A", opt: comp.optionA },
                { key: "B", opt: comp.optionB },
              ].map(({ key, opt }) => {
                const isSelected = comparisons[comp.id] === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setComparisons((prev) => ({ ...prev, [comp.id]: key }))}
                    className={cn(
                      "relative rounded-xl border-2 p-6 text-center transition-all duration-300",
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 shadow-lg scale-[1.02]"
                        : "border-border/30 hover:border-border hover:shadow-md opacity-70 hover:opacity-100"
                    )}
                  >
                    <div className={cn(opt.className, "mb-3")}>{opt.sample}</div>
                    <p className="text-xs text-muted-foreground">{opt.label}</p>
                    <div
                      className={cn(
                        "absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center transition-all duration-300",
                        isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"
                      )}
                    >
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </button>
                );
              })}
            </div>
            {/* No preference option */}
            <div className="col-span-2 text-center">
              <button
                type="button"
                onClick={() => setComparisons((prev) => ({ ...prev, [comp.id]: "none" }))}
                className={cn(
                  "text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-dashed",
                  comparisons[comp.id] === "none"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-border/50"
                )}
              >
                I don&apos;t have a preference
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Smart recommendation hint */}
      {fontRecs.length > 0 && fontRecs[0].reason && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 animate-in fade-in duration-500">
          <Type className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary">{fontRecs[0].reason} — we've highlighted our top picks below.</p>
        </div>
      )}

      {/* Font Style Cards */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Font Style (select 1-2)</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sortedFontCards.map((style) => {
            const isSelected = fontStyles.includes(style.value);
            const recReason = getRecReason(style.value);
            const isRecommended = topRecCategories.has(style.value);
            return (
              <button
                key={style.value}
                type="button"
                onClick={() => toggleFontStyle(style.value)}
                className={cn(
                  "group relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col",
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 scale-[1.02] shadow-lg"
                    : "ring-1 ring-border/40 hover:ring-border hover:shadow-md hover:scale-[1.01] opacity-70 hover:opacity-100"
                )}
              >
                {/* Sample text area */}
                <div className={cn(
                  "w-full py-6 px-3 flex items-center justify-center bg-gradient-to-br text-white",
                  style.gradient
                )}>
                  <span className={cn("text-xl", style.className)}>{style.sampleText}</span>
                </div>
                {/* Label */}
                <div className={cn(
                  "px-3 py-2.5 text-center transition-colors",
                  isSelected ? "bg-primary/5" : "bg-muted/30"
                )}>
                  <p className="text-sm font-semibold">{style.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{style.description}</p>
                  {isRecommended && !isSelected && (
                    <p className="text-[9px] text-primary font-medium mt-1">✨ Recommended for your style</p>
                  )}
                </div>
                {/* Checkmark */}
                <div
                  className={cn(
                    "absolute top-2 right-2 h-5 w-5 rounded-full bg-white/90 flex items-center justify-center transition-all duration-300 shadow-sm",
                    isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  )}
                >
                  <Check className="h-3 w-3 text-primary" />
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{fontStyles.length}/2 selected</p>
      </div>

      {/* Font Weight */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Font Weight Preference</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {FONT_WEIGHTS.map((weight) => {
            const isSelected = fontWeight === weight.value;
            return (
              <button
                key={weight.value}
                type="button"
                onClick={() => { setError(null); setFontWeight(weight.value); }}
                className={cn(
                  "relative rounded-xl border-2 p-4 text-center transition-all duration-300",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
                    : "border-border/30 hover:border-border hover:shadow-md opacity-70 hover:opacity-100"
                )}
              >
                <div className={cn("text-2xl mb-2", weight.weightClass)}>Aa</div>
                <p className="text-sm font-medium">{weight.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{weight.description}</p>
                <div
                  className={cn(
                    "absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center transition-all duration-300",
                    isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  )}
                >
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label htmlFor="typography-notes" className="mb-2 block text-sm font-medium">
          Additional Typography Notes (optional)
        </label>
        <Textarea
          id="typography-notes"
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="e.g., 'Prefer fonts that feel approachable but professional' or 'Avoid anything too trendy'"
          rows={3}
          className="resize-none text-base"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev} className="h-12 px-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          {isOptional && onSkip && (
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              className="h-12 px-4 text-muted-foreground"
            >
              Skip
            </Button>
          )}
          <Button type="button" onClick={handleNext} className="h-12 px-8">
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
