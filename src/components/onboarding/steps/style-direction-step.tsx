"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Palette,
  Ban,
  Globe,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STYLE_OPTIONS } from "@/types";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

/* ── Style card config with Unsplash images ── */

const STYLE_CARDS: Record<string, {
  description: string;
  image: string;
  brandExample: string;
  gradient: string;
}> = {
  minimalist: {
    description: "Clean, simple, lots of white space",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&h=300&fit=crop&q=80",
    brandExample: "https://apple.com",
    gradient: "from-slate-200 to-gray-300",
  },
  bold: {
    description: "Strong, impactful, high contrast",
    image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop&q=80",
    brandExample: "https://nike.com",
    gradient: "from-red-500 to-orange-600",
  },
  playful: {
    description: "Fun, colorful, energetic",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop&q=80",
    brandExample: "https://mailchimp.com",
    gradient: "from-pink-400 to-amber-400",
  },
  elegant: {
    description: "Refined, sophisticated, luxurious",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop&q=80",
    brandExample: "https://chanel.com",
    gradient: "from-stone-400 to-amber-300",
  },
  vintage: {
    description: "Retro, nostalgic, classic",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop&q=80",
    brandExample: "https://levistrauss.com",
    gradient: "from-amber-500 to-yellow-600",
  },
  modern: {
    description: "Contemporary, sleek, innovative",
    image: "https://images.unsplash.com/photo-1545239351-ef35f43d514b?w=400&h=300&fit=crop&q=80",
    brandExample: "https://stripe.com",
    gradient: "from-blue-500 to-indigo-600",
  },
  organic: {
    description: "Natural, earthy, flowing",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=300&fit=crop&q=80",
    brandExample: "https://aesop.com",
    gradient: "from-emerald-400 to-teal-500",
  },
  geometric: {
    description: "Structured, precise, mathematical",
    image: "https://images.unsplash.com/photo-1509537257950-20f875b03669?w=400&h=300&fit=crop&q=80",
    brandExample: "https://uber.com",
    gradient: "from-indigo-500 to-violet-600",
  },
};

interface StyleData {
  selectedStyles: string[];
  antiInspiration: string[];
  brandExamples: string[];
}

export function StyleDirectionStep({ data, onSave, onNext, onPrev }: StepProps) {
  const existingData = data as StyleData | undefined;
  const [selected, setSelected] = useState<string[]>(existingData?.selectedStyles ?? []);
  const [antiInspiration, setAntiInspiration] = useState<string[]>(existingData?.antiInspiration ?? []);
  const [brandExamples, setBrandExamples] = useState<string[]>(existingData?.brandExamples ?? [""]);
  const [error, setError] = useState<string | null>(null);

  // Auto-save (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buildFormData = useCallback((): StyleData => ({
    selectedStyles: selected,
    antiInspiration,
    brandExamples: brandExamples.filter((u) => u.trim() !== ""),
  }), [selected, antiInspiration, brandExamples]);

  const autoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onSave("style_direction", buildFormData());
    }, 800);
  }, [buildFormData, onSave]);

  useEffect(() => {
    if (selected.length > 0 || antiInspiration.length > 0) {
      autoSave();
    }
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [selected, antiInspiration, brandExamples, autoSave]);

  function toggleStyle(style: string) {
    setError(null);
    setSelected((prev) => {
      if (prev.includes(style)) return prev.filter((s) => s !== style);
      if (prev.length >= 5) {
        setError("You can select up to 5 styles");
        return prev;
      }
      return [...prev, style];
    });
  }

  function toggleAntiInspiration(style: string) {
    if (selected.includes(style)) return;
    setAntiInspiration((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  }

  function addBrandExample() {
    if (brandExamples.length < 5) {
      setBrandExamples((prev) => [...prev, ""]);
    }
  }

  function removeBrandExample(index: number) {
    setBrandExamples((prev) => prev.filter((_, i) => i !== index));
  }

  function updateBrandExample(index: number, value: string) {
    setBrandExamples((prev) => prev.map((u, i) => (i === index ? value : u)));
  }

  async function handleNext() {
    if (selected.length < 1) {
      setError("Please select at least 1 style that resonates with you");
      return;
    }
    await onSave("style_direction", buildFormData());
    onNext();
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto" data-testid="style-direction-step">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-white mb-2">
          <Palette className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Style Direction</h2>
        <p className="text-muted-foreground">
          Pick styles that resonate with your brand vision. Select up to 5.
        </p>
      </div>

      {/* Style Cards Grid */}
      <div>
        <h3 className="text-sm font-medium mb-3">✨ Styles that feel RIGHT</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3" data-testid="style-cards-grid">
          {STYLE_OPTIONS.map((style) => {
            const card = STYLE_CARDS[style];
            if (!card) return null;
            const isSelected = selected.includes(style);
            const isAnti = antiInspiration.includes(style);
            return (
              <button
                key={style}
                type="button"
                onClick={() => toggleStyle(style)}
                className={cn(
                  "group relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col btn-press",
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 shadow-lg animate-selection-pop"
                    : isAnti
                      ? "opacity-40 ring-1 ring-destructive/30"
                      : "ring-1 ring-border/40 hover:ring-border hover:shadow-md hover:-translate-y-0.5 opacity-70 hover:opacity-100"
                )}
                data-testid={`style-card-${style}`}
              >
                {/* Gradient overlay bar at top */}
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r transition-opacity duration-300",
                  card.gradient,
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                )} />
                <div className="aspect-[4/3] w-full overflow-hidden relative bg-muted">
                  <img
                    src={card.image}
                    alt={`${style} design style`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className={cn(
                  "px-2 py-2 text-center transition-colors duration-300 relative",
                  isSelected
                    ? "bg-gradient-to-b from-primary/10 to-primary/5"
                    : "bg-muted/30 group-hover:bg-muted/50"
                )}>
                  <p className="text-xs font-semibold capitalize">{style}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                    {card.description}
                  </p>
                  <a
                    href={card.brandExample}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-0.5 text-[9px] text-primary hover:underline mt-1"
                    data-testid={`style-example-link-${style}`}
                  >
                    <Globe className="h-2.5 w-2.5" /> Example
                  </a>
                </div>
                {/* Animated checkmark */}
                <div
                  className={cn(
                    "absolute top-2 right-2 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-lg",
                    isSelected ? "animate-check-in" : "scale-0 opacity-0 transition-all duration-200"
                  )}
                  data-testid={`style-checkmark-${style}`}
                >
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
                {/* Gradient border glow when selected */}
                {isSelected && (
                  <div className={cn(
                    "absolute inset-0 rounded-xl pointer-events-none",
                    "bg-gradient-to-br opacity-10",
                    card.gradient
                  )} />
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-muted-foreground" data-testid="style-count">
          {selected.length}/5 selected
        </p>
      </div>

      {/* Anti-Inspiration */}
      <div data-testid="anti-inspiration-section">
        <div className="flex items-center gap-2 mb-3">
          <Ban className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-medium">Styles to AVOID (optional)</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Knowing what you don&apos;t like is just as helpful!
        </p>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((style) => {
            const isAnti = antiInspiration.includes(style);
            const isSelected = selected.includes(style);
            return (
              <button
                key={style}
                type="button"
                onClick={() => toggleAntiInspiration(style)}
                disabled={isSelected}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  isAnti
                    ? "bg-destructive/10 text-destructive border-destructive"
                    : isSelected
                      ? "opacity-30 cursor-not-allowed border-muted"
                      : "bg-background hover:border-destructive/50 hover:bg-destructive/5"
                )}
                data-testid={`anti-style-${style}`}
              >
                {isAnti && <Ban className="inline h-3 w-3 mr-1" />}
                <span className="capitalize">{style}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Examples */}
      <div data-testid="brand-examples-section">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Brand Examples (optional)</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Links to brands or websites whose style you admire.
        </p>
        <div className="space-y-2">
          {brandExamples.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => updateBrandExample(index, e.target.value)}
                placeholder="https://example.com"
                className="h-10"
                data-testid={`brand-example-input-${index}`}
              />
              {brandExamples.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBrandExample(index)}
                  className="h-10 w-10"
                  data-testid={`remove-brand-example-${index}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {brandExamples.length < 5 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBrandExample}
              className="border-dashed"
              data-testid="add-brand-example-button"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Link
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive" data-testid="style-error">{error}</p>}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev} className="h-12 px-6 active:scale-95 transition-transform" data-testid="back-button">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="button" onClick={handleNext} className="h-12 px-8 active:scale-95 transition-transform" data-testid="next-button">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
