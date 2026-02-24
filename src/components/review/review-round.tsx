"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, RotateCcw } from "lucide-react";
import { DesignReviewCard, type Deliverable, type FeedbackData } from "./design-review-card";

interface ReviewRoundProps {
  round: number;
  date: string;
  deliverables: Deliverable[];
  onSubmitFeedback?: (deliverableId: string, feedback: FeedbackData) => Promise<void>;
  onApproveAll?: (round: number) => Promise<void>;
  onRequestChanges?: (round: number) => Promise<void>;
  isClient?: boolean;
}

export function ReviewRound({
  round,
  date,
  deliverables,
  onSubmitFeedback,
  onApproveAll,
  onRequestChanges,
  isClient = false,
}: ReviewRoundProps) {
  const approved = deliverables.filter((d) => d.status === "approved").length;
  const feedbackGiven = deliverables.filter(
    (d) => d.status === "feedback_given" || d.status === "changes_addressed"
  ).length;
  const awaiting = deliverables.filter((d) => d.status === "awaiting_feedback").length;
  const total = deliverables.length;
  const allApproved = approved === total;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Round {round}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(date).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {allApproved ? (
              <Badge className="bg-green-100 text-green-800">All Approved</Badge>
            ) : (
              <div className="flex gap-1.5 text-xs text-muted-foreground">
                {approved > 0 && <Badge variant="secondary" className="bg-green-50 text-green-700">{approved} approved</Badge>}
                {feedbackGiven > 0 && <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">{feedbackGiven} feedback</Badge>}
                {awaiting > 0 && <Badge variant="secondary" className="bg-gray-50 text-gray-600">{awaiting} awaiting</Badge>}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Deliverables */}
        <div className="grid gap-4 sm:grid-cols-2">
          {deliverables.map((deliverable) => (
            <DesignReviewCard
              key={deliverable.id}
              deliverable={deliverable}
              onSubmitFeedback={onSubmitFeedback}
              isClient={isClient}
            />
          ))}
        </div>

        {/* Round-level actions (client only) */}
        {isClient && !allApproved && (
          <div className="flex gap-3 border-t pt-4">
            <Button
              variant="default"
              onClick={() => onApproveAll?.(round)}
              className="flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              Approve All in Round
            </Button>
            <Button
              variant="outline"
              onClick={() => onRequestChanges?.(round)}
              className="flex-1"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Request Changes on Round
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
