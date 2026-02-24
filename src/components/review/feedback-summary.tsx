"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface FeedbackItem {
  id: string;
  deliverable_id: string;
  deliverable_title: string;
  client_id: string;
  category_ratings: Record<string, number>;
  comments: string | null;
  overall_rating: "approve" | "changes" | "neutral";
  addressed: boolean;
  created_at: string;
}

const RATING_CONFIG = {
  approve: { label: "Approved", bg: "bg-green-50", border: "border-green-200", text: "text-green-800", dot: "bg-green-500" },
  changes: { label: "Changes Requested", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", dot: "bg-yellow-500" },
  neutral: { label: "Awaiting", bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600", dot: "bg-gray-400" },
};

const CATEGORY_LABELS: Record<string, string> = {
  visual_design: "Visual Design",
  brand_alignment: "Brand Alignment",
  layout_composition: "Layout & Composition",
  typography: "Typography",
  color_usage: "Color Usage",
};

interface FeedbackSummaryProps {
  feedback: FeedbackItem[];
  onToggleAddressed?: (feedbackId: string, addressed: boolean) => Promise<void>;
}

export function FeedbackSummary({ feedback, onToggleAddressed }: FeedbackSummaryProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggle = async (item: FeedbackItem) => {
    if (!onToggleAddressed) return;
    setUpdating(item.id);
    try {
      await onToggleAddressed(item.id, !item.addressed);
    } finally {
      setUpdating(null);
    }
  };

  if (feedback.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No feedback received yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => {
        const config = RATING_CONFIG[item.overall_rating];
        return (
          <Card key={item.id} className={cn("border", config.border, config.bg)}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full", config.dot)} />
                  <CardTitle className="text-sm font-medium">{item.deliverable_title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={cn("text-xs", config.text)}>
                    {config.label}
                  </Badge>
                  {onToggleAddressed && (
                    <div className="flex items-center gap-1.5">
                      <Checkbox
                        checked={item.addressed}
                        onCheckedChange={() => handleToggle(item)}
                        disabled={updating === item.id}
                        id={`addressed-${item.id}`}
                      />
                      <label htmlFor={`addressed-${item.id}`} className="text-xs text-muted-foreground">
                        Addressed
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Category Ratings */}
              {Object.keys(item.category_ratings).length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                  {Object.entries(item.category_ratings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {CATEGORY_LABELS[key] || key}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div
                            key={n}
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              n <= (value as number) ? "bg-foreground/70" : "bg-foreground/15"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comments */}
              {item.comments && (
                <div className="rounded-md bg-background/50 p-3">
                  <p className="text-sm leading-relaxed">{item.comments}</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {new Date(item.created_at).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
