"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Download,
  FileText,
  Star,
  PackageCheck,
  ArrowDownToLine,
} from "lucide-react";

interface Deliverable {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
  file_type?: string;
}

interface DeliveryReceiptProps {
  projectId: string;
  projectType: string;
  designerName: string;
  clientName: string;
  deliverables: Deliverable[];
  deliveryNotes?: string;
  deliveredAt?: string;
  existingReview?: { rating: number; comment?: string } | null;
  clientId?: string;
}

export function DeliveryReceipt({
  projectId,
  projectType,
  designerName,
  clientName,
  deliverables,
  deliveryNotes,
  deliveredAt,
  existingReview,
  clientId,
}: DeliveryReceiptProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(!!existingReview);

  const handleDownloadAll = () => {
    window.open(`/api/projects/${projectId}/files/download`, "_blank");
  };

  const handleDownloadFile = (url: string) => {
    window.open(url, "_blank");
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, clientId }),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      toast.success("Thank you for your review!");
      setReviewSubmitted(true);
    } catch {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <PackageCheck className="h-12 w-12 mx-auto text-green-500" />
        <h1 className="text-2xl font-bold">Your Project is Ready!</h1>
        <p className="text-muted-foreground">
          {designerName} has delivered your {projectType} project
        </p>
        {deliveredAt && (
          <p className="text-xs text-muted-foreground">
            Delivered {new Date(deliveredAt).toLocaleDateString("en-AU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Project summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Client</span>
            <span className="font-medium">{clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Project Type</span>
            <span className="font-medium capitalize">{projectType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Files</span>
            <span className="font-medium">{deliverables.length} deliverables</span>
          </div>
        </CardContent>
      </Card>

      {/* Delivery notes */}
      {deliveryNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Designer Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{deliveryNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Files */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Final Files</CardTitle>
          <Button variant="outline" size="sm" onClick={handleDownloadAll}>
            <ArrowDownToLine className="h-4 w-4 mr-1" />
            Download All (ZIP)
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {deliverables.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{d.title}</p>
                  {d.file_type && (
                    <p className="text-xs text-muted-foreground uppercase">
                      {d.file_type}
                    </p>
                  )}
                </div>
              </div>
              {d.file_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadFile(d.file_url!)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Review section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {reviewSubmitted ? "Your Review" : "Leave a Review"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Star rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={reviewSubmitted}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 disabled:cursor-default"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-muted-foreground ml-2">
                {rating}/5
              </span>
            )}
          </div>

          {/* Comment */}
          {!reviewSubmitted ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="review-comment">Comment (optional)</Label>
                <Textarea
                  id="review-comment"
                  placeholder="How was your experience?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleSubmitReview}
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </>
          ) : (
            comment && (
              <p className="text-sm text-muted-foreground italic">
                &ldquo;{comment}&rdquo;
              </p>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
