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
  Plus,
  X,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

const PRESET_PALETTES = [
  {
    name: "Ocean",
    colors: [
      { hex: "#0077B6", name: "Deep Sea" },
      { hex: "#00B4D8", name: "Cyan" },
      { hex: "#90E0EF", name: "Sky" },
      { hex: "#CAF0F8", name: "Foam" },
    ],
  },
  {
    name: "Sunset",
    colors: [
      { hex: "#FF6B35", name: "Tangerine" },
      { hex: "#F7C59F", name: "Peach" },
      { hex: "#EFEFD0", name: "Cream" },
      { hex: "#004E89", name: "Navy" },
    ],
  },
  {
    name: "Forest",
    colors: [
      { hex: "#2D6A4F", name: "Pine" },
      { hex: "#40916C", name: "Sage" },
      { hex: "#52B788", name: "Fern" },
      { hex: "#D8F3DC", name: "Mint" },
    ],
  },
  {
    name: "Midnight",
    colors: [
      { hex: "#1B1B2F", name: "Abyss" },
      { hex: "#162447", name: "Ink" },
      { hex: "#1F4068", name: "Steel" },
      { hex: "#E43F5A", name: "Ruby" },
    ],
  },
  {
    name: "Coral",
    colors: [
      { hex: "#FF6F61", name: "Coral" },
      { hex: "#FFB5A7", name: "Blush" },
      { hex: "#FCD5CE", name: "Rose" },
      { hex: "#F8EDEB", name: "Shell" },
    ],
  },
  {
    name: "Monochrome",
    colors: [
      { hex: "#18181B", name: "Carbon" },
      { hex: "#3F3F46", name: "Ash" },
      { hex: "#71717A", name: "Stone" },
      { hex: "#D4D4D8", name: "Silver" },
    ],
  },
  {
    name: "Lavender",
    colors: [
      { hex: "#7C3AED", name: "Violet" },
      { hex: "#A78BFA", name: "Iris" },
      { hex: "#C4B5FD", name: "Lilac" },
      { hex: "#EDE9FE", name: "Mist" },
    ],
  },
  {
    name: "Earth",
    colors: [
      { hex: "#92400E", name: "Umber" },
      { hex: "#B45309", name: "Amber" },
      { hex: "#D97706", name: "Honey" },
      { hex: "#FDE68A", name: "Sand" },
    ],
  },
];

const AVOID_COLORS = [
  { name: "Red", color: "#EF4444" },
  { name: "Orange", color: "#F97316" },
  { name: "Yellow", color: "#EAB308" },
  { name: "Green", color: "#22C55E" },
  { name: "Blue", color: "#3B82F6" },
  { name: "Purple", color: "#A855F7" },
  { name: "Pink", color: "#EC4899" },
  { name: "Brown", color: "#92400E" },
  { name: "Black", color: "#18181B" },
  { name: "White", color: "#F8FAFC" },
];

const INDUSTRY_HINTS: Record<string, string> = {
  Technology: "💡 Tech brands often use blues, purples, and clean monochromes",
  Healthcare: "💡 Healthcare typically favours blues, greens, and whites for trust",
  "Fashion & Apparel": "💡 Fashion brands often use bold contrasts or sophisticated neutrals",
  "Food & Beverage": "💡 Warm colors (reds, oranges, yellows) stimulate appetite",
  "Finance & Banking": "💡 Blues and greens convey trust and stability in finance",
  "Fitness & Wellness": "💡 Energetic oranges, greens, and bold blacks work well for fitness",
  "Real Estate": "💡 Navy, gold, and earth tones convey luxury and reliability",
};

interface ColorData {
  selectedPalettes: string[];
  customColors: string[];
  avoidColors: string[];
}

export function ColorPreferencesStep({ data, onSave, onNext, onPrev, allResponses }: StepProps) {
  const existingData = data as ColorData | undefined;
  const [selectedPalettes, setSelectedPalettes] = useState<string[]>(
    existingData?.selectedPalettes ?? []
  );
  const [customColors, setCustomColors] = useState<string[]>(
    existingData?.customColors ?? []
  );
  const [avoidColors, setAvoidColors] = useState<string[]>(
    existingData?.avoidColors ?? []
  );
  const [newColor, setNewColor] = useState("#C4704B");

  // Get industry from business info for hints
  const businessInfo = allResponses?.business_info as { industry?: string } | undefined;
  const industryHint = businessInfo?.industry ? INDUSTRY_HINTS[businessInfo.industry] : null;

  // Auto-save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buildFormData = useCallback((): ColorData => ({
    selectedPalettes,
    customColors,
    avoidColors,
  }), [selectedPalettes, customColors, avoidColors]);

  const autoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onSave("color_preferences", buildFormData());
    }, 800);
  }, [buildFormData, onSave]);

  useEffect(() => {
    if (selectedPalettes.length > 0 || customColors.length > 0 || avoidColors.length > 0) {
      autoSave();
    }
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [selectedPalettes, customColors, avoidColors, autoSave]);

  function togglePalette(name: string) {
    setSelectedPalettes((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  }

  function toggleAvoidColor(name: string) {
    setAvoidColors((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  function addCustomColor() {
    if (newColor && !customColors.includes(newColor)) {
      setCustomColors((prev) => [...prev, newColor]);
    }
  }

  function removeCustomColor(color: string) {
    setCustomColors((prev) => prev.filter((c) => c !== color));
  }

  async function handleNext() {
    await onSave("color_preferences", buildFormData());
    onNext();
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto" data-testid="color-preferences-step">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 text-white mb-2">
          <Palette className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Color Preferences</h2>
        <p className="text-muted-foreground">
          Select palettes that feel right for your brand
        </p>
      </div>

      {/* Industry Hint */}
      {industryHint && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary">{industryHint}</p>
        </div>
      )}

      {/* Palette Selection */}
      <div>
        <h3 className="mb-3 text-sm font-medium">
          Pick palettes you like (select any that appeal to you)
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PRESET_PALETTES.map((palette) => {
            const isSelected = selectedPalettes.includes(palette.name);
            return (
              <button
                key={palette.name}
                type="button"
                onClick={() => togglePalette(palette.name)}
                className={cn(
                  "group relative rounded-xl border-2 p-3 transition-all duration-300 cursor-pointer btn-press",
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 shadow-lg animate-selection-pop"
                    : "border-border/30 opacity-60 hover:opacity-90 hover:shadow-md hover:border-muted-foreground/30 hover:-translate-y-0.5"
                )}
              >
                {/* Checkmark */}
                <div
                  className={cn(
                    "absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-md z-10",
                    isSelected ? "animate-check-in" : "scale-0 opacity-0 transition-all duration-200"
                  )}
                >
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </div>

                {/* Larger swatch row */}
                <div className="mb-2 flex gap-1 overflow-hidden rounded-lg">
                  {palette.colors.map((swatch) => (
                    <div
                      key={swatch.hex}
                      className="h-14 sm:h-12 flex-1 transition-transform duration-300 group-hover:scale-y-110 first:rounded-l-lg last:rounded-r-lg swatch-hover"
                      style={{ backgroundColor: swatch.hex }}
                    />
                  ))}
                </div>

                {/* Color names — visible */}
                <div className="flex gap-1 mb-2">
                  {palette.colors.map((swatch) => (
                    <div key={swatch.hex} className="flex-1 text-center">
                      <span className="text-[8px] sm:text-[7px] text-muted-foreground leading-none block truncate">
                        {swatch.name}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-sm sm:text-xs font-semibold">{palette.name}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Builder */}
      <div className="rounded-xl border bg-muted/20 p-4 sm:p-5">
        <h3 className="mb-1 text-sm font-medium">🎨 Build Your Own</h3>
        <p className="text-xs text-muted-foreground mb-4">Pick specific brand colors you have in mind</p>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="h-12 w-14 cursor-pointer rounded-lg border-2 border-border bg-transparent p-1 transition-shadow hover:shadow-md"
            />
          </div>
          <Input
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            placeholder="#HEX"
            className="h-12 w-32 font-mono text-sm"
          />
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={addCustomColor}
            className="h-12 px-4 active:scale-95 transition-transform"
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        {/* Live preview of new color */}
        <div
          className="mt-3 h-8 w-full rounded-md transition-colors duration-300"
          style={{ backgroundColor: newColor }}
        />

        {customColors.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {customColors.map((color) => (
              <span
                key={color}
                className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm shadow-sm transition-all hover:shadow-md"
              >
                <div
                  className="h-6 w-6 rounded-md shadow-sm border"
                  style={{ backgroundColor: color }}
                />
                <span className="font-mono text-xs">{color}</span>
                <button
                  type="button"
                  onClick={() => removeCustomColor(color)}
                  className="hover:bg-destructive/10 rounded-full p-1 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Avoid Colors */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Ban className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-medium">Any colors to absolutely avoid?</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {AVOID_COLORS.map((item) => {
            const isAvoided = avoidColors.includes(item.name);
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => toggleAvoidColor(item.name)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2.5 sm:px-3 sm:py-1.5 text-sm transition-all active:scale-95",
                  isAvoided
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-muted hover:border-muted-foreground/30"
                )}
              >
                <div
                  className="h-4 w-4 sm:h-3 sm:w-3 rounded-full shadow-sm border"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev} className="h-12 px-6 active:scale-95 transition-transform">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="button" onClick={handleNext} className="h-12 px-8 active:scale-95 transition-transform">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
