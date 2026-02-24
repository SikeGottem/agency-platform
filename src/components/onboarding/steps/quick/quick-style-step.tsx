"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

const STYLE_PAIRS = [
  {
    id: "modern_classic",
    labelA: "Modern & Minimal",
    labelB: "Classic & Timeless",
    emojiA: "🔲",
    emojiB: "🏛️",
  },
  {
    id: "bold_subtle",
    labelA: "Bold & Loud",
    labelB: "Subtle & Refined",
    emojiA: "⚡",
    emojiB: "🪶",
  },
  {
    id: "warm_cool",
    labelA: "Warm & Friendly",
    labelB: "Cool & Professional",
    emojiA: "☀️",
    emojiB: "❄️",
  },
  {
    id: "playful_serious",
    labelA: "Playful & Fun",
    labelB: "Serious & Corporate",
    emojiA: "🎨",
    emojiB: "💼",
  },
];

interface QuickStyleData {
  choices: Record<string, "A" | "B">;
}

export function QuickStyleStep({ data, onSave, onNext, onPrev }: StepProps) {
  const existing = data as QuickStyleData | undefined;
  const [choices, setChoices] = useState<Record<string, "A" | "B">>(existing?.choices ?? {});

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const autoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onSave("quick_style", { choices });
    }, 800);
  }, [choices, onSave]);

  useEffect(() => {
    if (Object.keys(choices).length > 0) autoSave();
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [choices, autoSave]);

  const pick = (pairId: string, side: "A" | "B") => {
    setChoices(prev => ({ ...prev, [pairId]: side }));
  };

  const handleNext = async () => {
    await onSave("quick_style", { choices });
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Palette className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Style Direction</h2>
        <p className="text-sm text-muted-foreground">Pick the side that feels more "you" — or skip any you're unsure about.</p>
      </div>

      <div className="space-y-4">
        {STYLE_PAIRS.map(pair => (
          <div key={pair.id} className="rounded-lg border p-1 flex gap-1">
            <button
              type="button"
              onClick={() => pick(pair.id, "A")}
              className={cn(
                "flex-1 rounded-md px-4 py-4 text-center transition-all",
                choices[pair.id] === "A"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted"
              )}
            >
              <div className="text-2xl mb-1">{pair.emojiA}</div>
              <div className="text-sm font-medium">{pair.labelA}</div>
            </button>
            <button
              type="button"
              onClick={() => pick(pair.id, "B")}
              className={cn(
                "flex-1 rounded-md px-4 py-4 text-center transition-all",
                choices[pair.id] === "B"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted"
              )}
            >
              <div className="text-2xl mb-1">{pair.emojiB}</div>
              <div className="text-sm font-medium">{pair.labelB}</div>
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="h-11 sm:h-10">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNext} className="h-11 sm:h-10">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
