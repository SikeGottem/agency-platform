"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PROJECT_TYPE_LABELS } from "@/types";
import type { ProjectType } from "@/types";
import type { Json } from "@/types/supabase";

interface BriefViewerProps {
  content: Json;
}

interface BriefData {
  projectType?: string;
  clientName?: string;
  clientEmail?: string;
  submittedAt?: string;
  responses?: Record<string, Record<string, unknown>>;
}

const STEP_LABELS: Record<string, string> = {
  business_info: "About the Business",
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
  customColors: "Custom Colors",
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
    if (value.length === 0) return "None selected";
    // Handle nested arrays (color palettes)
    if (Array.isArray(value[0])) {
      return value.map((arr) => (arr as string[]).join(", ")).join(" | ");
    }
    return value.join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  
  // Format timeline values
  if (key === "timeline") {
    const labels: Record<string, string> = {
      asap: "ASAP (1-2 weeks)",
      month: "Within a month",
      quarter: "Within 3 months",
      flexible: "Flexible / No rush",
    };
    return labels[String(value)] || String(value);
  }

  // Format budget values
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

function renderStepSection(stepKey: string, answers: Record<string, unknown>) {
  const entries = Object.entries(answers).filter(
    ([, value]) => value !== null && value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0)
  );

  if (entries.length === 0) return null;

  return (
    <div key={stepKey} className="space-y-3">
      <h3 className="text-lg font-semibold">
        {STEP_LABELS[stepKey] || stepKey}
      </h3>
      <div className="space-y-2">
        {entries.map(([key, value]) => (
          <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {FIELD_LABELS[key] || key}
            </span>
            <span className="sm:col-span-2 text-sm">
              {Array.isArray(value) && !Array.isArray(value[0]) ? (
                <div className="flex flex-wrap gap-1">
                  {(value as string[]).map((item, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
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
}

export function BriefViewer({ content }: BriefViewerProps) {
  const data = content as unknown as BriefData;

  if (!data || !data.responses) {
    return <p className="text-muted-foreground">No brief data available.</p>;
  }

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

  const orderedSteps = stepOrder.filter((key) => data.responses![key]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {data.clientName || "Client"}&apos;s Creative Brief
            </CardTitle>
            {data.projectType && (
              <Badge>
                {PROJECT_TYPE_LABELS[data.projectType as ProjectType] || data.projectType}
              </Badge>
            )}
          </div>
          {data.submittedAt && (
            <p className="text-sm text-muted-foreground">
              Submitted on {new Date(data.submittedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Step sections */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {orderedSteps.map((stepKey, index) => (
              <div key={stepKey}>
                {index > 0 && <Separator className="mb-6" />}
                {renderStepSection(
                  stepKey,
                  data.responses![stepKey] as Record<string, unknown>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
