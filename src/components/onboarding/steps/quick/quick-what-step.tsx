"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Briefcase, FileText, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

const DELIVERABLE_OPTIONS: Record<string, string[]> = {
  branding: ["Logo", "Brand Guidelines", "Business Cards", "Social Media Kit", "Letterhead", "Brand Strategy"],
  web_design: ["Landing Page", "Full Website", "E-commerce Store", "Blog", "Dashboard/App", "Wireframes"],
  social_media: ["Post Templates", "Story Templates", "Content Calendar", "Ad Creatives", "Profile Assets", "Reels/Video"],
};

interface QuickWhatData {
  businessName: string;
  description: string;
  deliverables: string[];
}

export function QuickWhatStep({ data, onSave, onNext, projectType }: StepProps) {
  const existing = data as QuickWhatData | undefined;
  const [businessName, setBusinessName] = useState(existing?.businessName ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [deliverables, setDeliverables] = useState<string[]>(existing?.deliverables ?? []);
  const [error, setError] = useState<string | null>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildData = useCallback((): QuickWhatData => ({
    businessName,
    description,
    deliverables,
  }), [businessName, description, deliverables]);

  const autoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onSave("quick_what", buildData());
    }, 800);
  }, [buildData, onSave]);

  useEffect(() => {
    if (businessName || description) autoSave();
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [businessName, description, deliverables, autoSave]);

  const toggleDeliverable = (d: string) => {
    setDeliverables(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  const handleNext = async () => {
    if (!businessName.trim()) {
      setError("Please enter your business or project name.");
      return;
    }
    if (!description.trim()) {
      setError("Please add a brief description.");
      return;
    }
    await onSave("quick_what", buildData());
    onNext();
  };

  const options = DELIVERABLE_OPTIONS[projectType] ?? DELIVERABLE_OPTIONS.branding;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Briefcase className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">What are we building?</h2>
        <p className="text-sm text-muted-foreground">Tell us about the project in a nutshell.</p>
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Business / Project Name</label>
          <Input
            placeholder="e.g. Sunrise Cafe"
            value={businessName}
            onChange={e => { setBusinessName(e.target.value); setError(null); }}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">What do you need and why?</label>
          <Textarea
            placeholder="e.g. We're launching a new coffee brand and need a complete visual identity that feels warm and modern..."
            rows={4}
            value={description}
            onChange={e => { setDescription(e.target.value); setError(null); }}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
            <Package className="h-4 w-4" />
            Deliverables
          </label>
          <div className="flex flex-wrap gap-2">
            {options.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDeliverable(d)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-all",
                  deliverables.includes(d)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted border-border"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} className="h-11 sm:h-10">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
