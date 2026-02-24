"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Send, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FeedbackCategory {
  key: string;
  label: string;
  description: string;
}

const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  { key: "overall_direction", label: "Overall Direction", description: "Does the design align with your vision?" },
  { key: "color_typography", label: "Colors & Typography", description: "How do the colors and fonts feel?" },
  { key: "layout_structure", label: "Layout & Structure", description: "Is the layout intuitive and well-organized?" },
  { key: "brand_alignment", label: "Brand Alignment", description: "Does it represent your brand accurately?" },
];

type Rating = "positive" | "neutral" | "negative" | null;

interface CategoryFeedback {
  rating: Rating;
  comment: string;
}

interface StructuredFeedbackFormProps {
  projectId: string;
  /** Authenticated user ID — if provided, uses auth context instead of magic link */
  userId?: string;
  /** Magic link token — used for unauthenticated portal access */
  token?: string;
  onSubmitted?: () => void;
}

export function StructuredFeedbackForm({ projectId, userId, token, onSubmitted }: StructuredFeedbackFormProps) {
  const [feedback, setFeedback] = useState<Record<string, CategoryFeedback>>(
    Object.fromEntries(FEEDBACK_CATEGORIES.map(c => [c.key, { rating: null, comment: "" }]))
  );
  const [generalNotes, setGeneralNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setRating = (key: string, rating: Rating) => {
    setFeedback(prev => ({ ...prev, [key]: { ...prev[key], rating } }));
  };

  const setComment = (key: string, comment: string) => {
    setFeedback(prev => ({ ...prev, [key]: { ...prev[key], comment } }));
  };

  const hasAnyFeedback = Object.values(feedback).some(f => f.rating !== null) || generalNotes.trim().length > 0;

  const handleSubmit = async () => {
    if (!hasAnyFeedback) return;
    setSubmitting(true);

    try {
      const supabase = createClient();

      // Build the feedback payload
      const feedbackPayload = {
        project_id: projectId,
        categories: Object.fromEntries(
          Object.entries(feedback).filter(([, v]) => v.rating !== null)
        ),
        general_notes: generalNotes.trim() || null,
        submitted_at: new Date().toISOString(),
        ...(userId ? { submitted_by: userId } : { token }),
      };

      // Store as a message with structured metadata
      const messageData: Record<string, unknown> = {
        project_id: projectId,
        content: formatFeedbackAsMessage(feedback, generalNotes),
        sender_type: "client",
        metadata: feedbackPayload,
      };

      if (userId) {
        messageData.sender_id = userId;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("messages") as any).insert(messageData);

      setSubmitted(true);
      onSubmitted?.();
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-stone-900 mb-1">
          Feedback Submitted
        </h3>
        <p className="text-sm text-stone-500">
          Your designer will review your feedback and follow up soon.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200/60 bg-white p-6 space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-[#E05252]" />
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">
          Share Your Feedback
        </h2>
      </div>
      <p className="text-sm text-stone-500 -mt-4">
        Rate each area and add specific comments to help your designer refine the work.
      </p>

      {/* Category ratings */}
      <div className="space-y-4">
        {FEEDBACK_CATEGORIES.map(category => (
          <div key={category.key} className="rounded-xl border border-stone-100 bg-stone-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-stone-900">{category.label}</h3>
                <p className="text-xs text-stone-400">{category.description}</p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setRating(category.key, feedback[category.key].rating === "positive" ? null : "positive")}
                  className={`rounded-lg p-2 transition-colors ${
                    feedback[category.key].rating === "positive"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-white text-stone-300 hover:text-emerald-500 hover:bg-emerald-50"
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRating(category.key, feedback[category.key].rating === "neutral" ? null : "neutral")}
                  className={`rounded-lg p-2 transition-colors ${
                    feedback[category.key].rating === "neutral"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-white text-stone-300 hover:text-amber-500 hover:bg-amber-50"
                  }`}
                >
                  <Star className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRating(category.key, feedback[category.key].rating === "negative" ? null : "negative")}
                  className={`rounded-lg p-2 transition-colors ${
                    feedback[category.key].rating === "negative"
                      ? "bg-red-100 text-red-600"
                      : "bg-white text-stone-300 hover:text-red-500 hover:bg-red-50"
                  }`}
                >
                  <ThumbsDown className="h-4 w-4" />
                </button>
              </div>
            </div>
            {feedback[category.key].rating !== null && (
              <Textarea
                placeholder={`Any specific thoughts on ${category.label.toLowerCase()}?`}
                value={feedback[category.key].comment}
                onChange={e => setComment(category.key, e.target.value)}
                className="text-sm resize-none bg-white"
                rows={2}
              />
            )}
          </div>
        ))}
      </div>

      {/* General notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700">Additional Notes</label>
        <Textarea
          placeholder="Anything else you'd like to share with your designer..."
          value={generalNotes}
          onChange={e => setGeneralNotes(e.target.value)}
          className="text-sm resize-none"
          rows={3}
        />
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!hasAnyFeedback || submitting}
        className="w-full bg-[#E05252] hover:bg-[#c94545] text-white"
      >
        <Send className="mr-2 h-4 w-4" />
        {submitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </div>
  );
}

function formatFeedbackAsMessage(
  feedback: Record<string, CategoryFeedback>,
  generalNotes: string
): string {
  const ratingEmoji = { positive: "👍", neutral: "⚖️", negative: "👎" };
  const parts: string[] = ["📋 Structured Feedback:\n"];

  for (const category of FEEDBACK_CATEGORIES) {
    const f = feedback[category.key];
    if (f.rating) {
      parts.push(`${ratingEmoji[f.rating]} ${category.label}${f.comment ? `: ${f.comment}` : ""}`);
    }
  }

  if (generalNotes.trim()) {
    parts.push(`\n💬 Notes: ${generalNotes.trim()}`);
  }

  return parts.join("\n");
}
