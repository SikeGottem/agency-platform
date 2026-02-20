"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Send } from "lucide-react";
import { PROJECT_TYPE_LABELS } from "@/types";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

const STEP_LABELS: Record<string, string> = {
  business_info: "About Your Business",
  project_scope: "Project Scope",
  style_direction: "Style Direction",
  color_preferences: "Color Preferences",
  typography_feel: "Typography Feel",
  pages_functionality: "Pages & Functionality",
  platforms_content: "Platforms & Content",
  inspiration_upload: "Inspiration",
  timeline_budget: "Timeline & Budget",
  final_thoughts: "Final Thoughts",
};

const FIELD_LABELS: Record<string, string> = {
  companyName: "Company Name",
  industry: "Industry",
  description: "Business Description",
  targetAudience: "Target Audience",
  competitors: "Competitors",
  deliverables: "Deliverables",
  usageContexts: "Usage Contexts",
  hasExistingAssets: "Has Existing Assets",
  selectedStyles: "Selected Styles",
  brandInspiration: "Brand Inspiration",
  antiInspiration: "Anti-Inspiration",
  selectedPalettes: "Selected Palettes",
  avoidColors: "Colors to Avoid",
  preferSerif: "Serif Preference",
  fontStyles: "Font Styles",
  pages: "Pages Needed",
  functionality: "Functionality",
  referenceUrls: "Reference URLs",
  platforms: "Platforms",
  contentTypes: "Content Types",
  postFrequency: "Post Frequency",
  urls: "Inspiration URLs",
  notes: "Notes",
  timeline: "Timeline",
  budgetRange: "Budget Range",
  priorities: "Priorities",
  additionalNotes: "Additional Notes",
};

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    if (value.length === 0) return "None";
    return value.join(", ");
  }
  
  if (key === "timeline") {
    const labels: Record<string, string> = {
      asap: "ASAP (1-2 weeks)",
      month: "Within a month",
      quarter: "Within 3 months",
      flexible: "Flexible / No rush",
    };
    return labels[String(value)] || String(value);
  }

  if (key === "budgetRange") {
    const labels: Record<string, string> = {
      under_1k: "Under $1,000",
      "1k_3k": "$1,000 - $3,000",
      "3k_5k": "$3,000 - $5,000",
      "5k_10k": "$5,000 - $10,000",
      "10k_plus": "$10,000+",
      discuss: "Let's discuss",
    };
    return labels[String(value)] || String(value);
  }

  return String(value);
}

export function BriefReviewStep({
  projectType,
  onPrev,
  allResponses,
  onSubmit,
  isSaving,
}: StepProps) {
  const stepOrder = [
    "business_info",
    "project_scope",
    "style_direction",
    "color_preferences",
    "typography_feel",
    "pages_functionality",
    "platforms_content",
    "inspiration_upload",
    "timeline_budget",
    "final_thoughts",
  ];

  const filledSteps = stepOrder.filter(
    (key) => allResponses?.[key] && typeof allResponses[key] === "object"
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Brief</CardTitle>
        <CardDescription>
          Review your answers below before submitting. You can go back to edit
          any section.
        </CardDescription>
        <Badge variant="secondary" className="w-fit">
          {PROJECT_TYPE_LABELS[projectType]} Project
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {filledSteps.length === 0 ? (
          <p className="text-muted-foreground">
            No responses recorded yet. Please go back and fill in the
            questionnaire steps.
          </p>
        ) : (
          filledSteps.map((stepKey, index) => {
            const answers = allResponses![stepKey] as Record<string, unknown>;
            const entries = Object.entries(answers).filter(
              ([, value]) =>
                value !== null &&
                value !== undefined &&
                value !== "" &&
                !(Array.isArray(value) && value.length === 0)
            );

            if (entries.length === 0) return null;

            return (
              <div key={stepKey}>
                {index > 0 && <Separator className="mb-4" />}
                <h3 className="mb-3 text-base font-semibold">
                  {STEP_LABELS[stepKey] || stepKey}
                </h3>
                <div className="space-y-2">
                  {entries.map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-2 text-sm">
                      <span className="font-medium text-muted-foreground">
                        {FIELD_LABELS[key] || key}
                      </span>
                      <span className="col-span-2">
                        {Array.isArray(value) ? (
                          <div className="flex flex-wrap gap-1">
                            {(value as string[]).map((item, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                              >
                                {item}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          formatValue(key, value)
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}

        <Separator />

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSaving}
            size="lg"
          >
            {isSaving ? (
              "Submitting..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Submit Brief
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
