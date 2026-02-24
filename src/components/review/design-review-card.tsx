"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  ChevronDown,
  ChevronUp,
  Check,
  MessageSquare,
  Clock,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

export interface Deliverable {
  id: string;
  project_id: string;
  designer_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: "image" | "pdf";
  round: number;
  version: number;
  status: "awaiting_feedback" | "feedback_given" | "changes_addressed" | "approved";
  created_at: string;
  updated_at: string;
}

export interface FeedbackData {
  overall_rating: "approve" | "changes" | "neutral";
  category_ratings: Record<string, number>;
  comments: string;
}

const FEEDBACK_CATEGORIES = [
  { key: "visual_design", label: "Visual Design" },
  { key: "brand_alignment", label: "Brand Alignment" },
  { key: "layout_composition", label: "Layout & Composition" },
  { key: "typography", label: "Typography" },
  { key: "color_usage", label: "Color Usage" },
];

const STATUS_CONFIG = {
  awaiting_feedback: { label: "Awaiting Feedback", color: "bg-gray-100 text-gray-700", icon: Clock },
  feedback_given: { label: "Feedback Given", color: "bg-yellow-100 text-yellow-800", icon: MessageSquare },
  changes_addressed: { label: "Changes Addressed", color: "bg-blue-100 text-blue-800", icon: MessageSquare },
  approved: { label: "Approved", color: "bg-green-100 text-green-800", icon: Check },
};

interface DesignReviewCardProps {
  deliverable: Deliverable;
  onSubmitFeedback?: (deliverableId: string, feedback: FeedbackData) => Promise<void>;
  isClient?: boolean;
}

export function DesignReviewCard({ deliverable, onSubmitFeedback, isClient = false }: DesignReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [overallRating, setOverallRating] = useState<FeedbackData["overall_rating"]>("neutral");
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>(
    Object.fromEntries(FEEDBACK_CATEGORIES.map((c) => [c.key, 3]))
  );
  const [comments, setComments] = useState("");

  const status = STATUS_CONFIG[deliverable.status];
  const StatusIcon = status.icon;

  const handleSubmit = async () => {
    if (!onSubmitFeedback) return;
    setSubmitting(true);
    try {
      await onSubmitFeedback(deliverable.id, {
        overall_rating: overallRating,
        category_ratings: categoryRatings,
        comments,
      });
      setExpanded(false);
      setComments("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{deliverable.title}</CardTitle>
            {deliverable.description && (
              <p className="text-sm text-muted-foreground">{deliverable.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Round {deliverable.round}</span>
              <span>·</span>
              <span>v{deliverable.version}</span>
            </div>
          </div>
          <Badge className={status.color} variant="secondary">
            <StatusIcon className="mr-1 h-3 w-3" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* File Preview */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="group relative w-full overflow-hidden rounded-lg border bg-muted/50 transition-colors hover:bg-muted">
              {deliverable.file_type === "image" ? (
                <div className="relative aspect-video">
                  <img
                    src={deliverable.file_url}
                    alt={deliverable.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                    <ImageIcon className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-70" />
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Click to preview PDF</p>
                  </div>
                </div>
              )}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            {deliverable.file_type === "image" ? (
              <img
                src={deliverable.file_url}
                alt={deliverable.title}
                className="h-auto w-full rounded-lg"
              />
            ) : (
              <iframe
                src={deliverable.file_url}
                className="h-[80vh] w-full rounded-lg"
                title={deliverable.title}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Feedback Form (client only, collapsible) */}
        {isClient && deliverable.status !== "approved" && (
          <div className="border-t pt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-between text-sm font-medium"
            >
              Give Feedback
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {expanded && (
              <div className="mt-4 space-y-5">
                {/* Overall Rating */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Overall</Label>
                  <RadioGroup
                    value={overallRating}
                    onValueChange={(v) => setOverallRating(v as FeedbackData["overall_rating"])}
                    className="flex gap-3"
                  >
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="approve" id="approve" />
                      <Label htmlFor="approve" className="text-sm text-green-700">Approve</Label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="changes" id="changes" />
                      <Label htmlFor="changes" className="text-sm text-yellow-700">Request Changes</Label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="neutral" id="neutral" />
                      <Label htmlFor="neutral" className="text-sm text-gray-600">Neutral</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Category Ratings */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Category Ratings</Label>
                  {FEEDBACK_CATEGORIES.map((cat) => (
                    <div key={cat.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{cat.label}</span>
                        <span className="text-xs font-medium">{categoryRatings[cat.key]}/5</span>
                      </div>
                      <Slider
                        value={[categoryRatings[cat.key]]}
                        onValueChange={([v]) =>
                          setCategoryRatings((prev) => ({ ...prev, [cat.key]: v }))
                        }
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Comments</Label>
                  <Textarea
                    value={comments}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComments(e.target.value)}
                    placeholder="What would you like changed? Be specific..."
                    className="min-h-[80px] resize-y"
                  />
                </div>

                <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                  {submitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
