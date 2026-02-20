"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

const PROMPTS = [
  "Any specific deadlines or launch dates?",
  "Things you absolutely love in design?",
  "Things you absolutely hate?",
  "Special requirements or constraints?",
  "Anything else your designer should know?",
];

interface FinalThoughtsData {
  additionalNotes: string;
}

export function FinalThoughtsStep({ data, onSave, onNext, onPrev }: StepProps) {
  const existingData = data as FinalThoughtsData | undefined;
  const [notes, setNotes] = useState(existingData?.additionalNotes ?? "");

  // Auto-save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onSave("final_thoughts", { additionalNotes: notes });
    }, 800);
  }, [notes, onSave]);

  useEffect(() => {
    if (notes) autoSave();
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [notes, autoSave]);

  async function handleNext() {
    await onSave("final_thoughts", { additionalNotes: notes });
    onNext();
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto" data-testid="final-thoughts-step">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white mb-2">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Final Thoughts</h2>
        <p className="text-muted-foreground">
          Anything else your designer should know? Almost done!
        </p>
      </div>

      {/* Prompt hints */}
      <div className="rounded-xl border bg-muted/30 p-4">
        <p className="text-sm font-medium mb-2">Some things to consider:</p>
        <ul className="space-y-1.5">
          {PROMPTS.map((prompt) => (
            <li key={prompt} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-primary mt-0.5">•</span>
              {prompt}
            </li>
          ))}
        </ul>
      </div>

      {/* Free text */}
      <div className="relative">
        <Textarea
          value={notes}
          onChange={(e) => {
            if (e.target.value.length <= 1000) setNotes(e.target.value);
          }}
          placeholder="Share any additional context, preferences, requirements, or thoughts..."
          rows={8}
          className="resize-none text-base"
        />
        <span className={cn(
          "absolute bottom-2 right-3 text-xs",
          notes.length > 900 ? "text-amber-500" : "text-muted-foreground",
          notes.length >= 1000 && "text-red-500"
        )}>
          {notes.length}/1000
        </span>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        When you&apos;re ready, click &quot;Next&quot; to review and submit your brief.
      </p>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev} className="h-12 px-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="button" onClick={handleNext} className="h-12 px-8">
          Review Brief <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
