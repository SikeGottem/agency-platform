"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, AlertCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ApprovalFlowProps {
  projectId: string;
  /** Authenticated user ID — uses auth context */
  userId?: string;
  /** Magic link token — for unauthenticated portal access */
  token?: string;
  onApproved?: () => void;
  onRevisionRequested?: () => void;
}

type ApprovalStep = "review" | "approve-confirm" | "revision-form" | "done";

export function ApprovalFlow({ projectId, userId, token, onApproved, onRevisionRequested }: ApprovalFlowProps) {
  const [step, setStep] = useState<ApprovalStep>("review");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"approved" | "revision" | null>(null);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const supabase = createClient();

      // Update project status to reviewed
      await supabase
        .from("projects")
        .update({ status: "reviewed" as never })
        .eq("id", projectId);

      // Log approval as a message
      const messageData: Record<string, unknown> = {
        project_id: projectId,
        content: "✅ Project approved by client",
        sender_type: "client",
        metadata: {
          type: "approval",
          action: "approved",
          submitted_at: new Date().toISOString(),
          ...(userId ? { submitted_by: userId } : { token }),
        },
      };
      if (userId) messageData.sender_id = userId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("messages") as any).insert(messageData);

      setResult("approved");
      setStep("done");
      onApproved?.();
    } catch (err) {
      console.error("Failed to approve:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) return;
    setSubmitting(true);
    try {
      const supabase = createClient();

      // Create revision request
      await supabase.from("revision_requests").insert({
        project_id: projectId,
        status: "pending" as never,
      } as never);

      // Log as message
      const messageData: Record<string, unknown> = {
        project_id: projectId,
        content: `🔄 Revision requested:\n${revisionNotes.trim()}`,
        sender_type: "client",
        metadata: {
          type: "approval",
          action: "revision_requested",
          notes: revisionNotes.trim(),
          submitted_at: new Date().toISOString(),
          ...(userId ? { submitted_by: userId } : { token }),
        },
      };
      if (userId) messageData.sender_id = userId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("messages") as any).insert(messageData);

      setResult("revision");
      setStep("done");
      onRevisionRequested?.();
    } catch (err) {
      console.error("Failed to request revision:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "done") {
    return (
      <div className={`rounded-2xl border p-8 text-center ${
        result === "approved"
          ? "border-emerald-200/60 bg-emerald-50/50"
          : "border-amber-200/60 bg-amber-50/50"
      }`}>
        {result === "approved" ? (
          <>
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-stone-900 mb-1">
              Project Approved!
            </h3>
            <p className="text-sm text-stone-500">
              Your designer has been notified. Final deliverables will be prepared.
            </p>
          </>
        ) : (
          <>
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-stone-900 mb-1">
              Revision Requested
            </h3>
            <p className="text-sm text-stone-500">
              Your designer will review your notes and make adjustments.
            </p>
          </>
        )}
      </div>
    );
  }

  if (step === "approve-confirm") {
    return (
      <div className="rounded-2xl border border-stone-200/60 bg-white p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">
            Confirm Approval
          </h2>
        </div>
        <p className="text-sm text-stone-500">
          By approving, you confirm you&apos;re happy with the work and it&apos;s ready for final delivery. This action can&apos;t be undone.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={handleApprove}
            disabled={submitting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {submitting ? "Approving..." : "Yes, Approve"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("review")}
            disabled={submitting}
            className="flex-1"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (step === "revision-form") {
    return (
      <div className="rounded-2xl border border-stone-200/60 bg-white p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">
            Request Changes
          </h2>
        </div>
        <p className="text-sm text-stone-500">
          Describe what you&apos;d like changed. Be as specific as possible to help your designer.
        </p>
        <Textarea
          placeholder="E.g., 'The logo color should be darker blue, and the tagline font feels too casual for our brand...'"
          value={revisionNotes}
          onChange={e => setRevisionNotes(e.target.value)}
          className="text-sm resize-none"
          rows={4}
        />
        <div className="flex gap-3">
          <Button
            onClick={handleRequestRevision}
            disabled={!revisionNotes.trim() || submitting}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
          >
            {submitting ? "Submitting..." : "Submit Revision Request"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep("review")}
            disabled={submitting}
            className="flex-1"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Default: review step
  return (
    <div className="rounded-2xl border border-stone-200/60 bg-white p-6 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-[#E05252]" />
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-900">
          Review & Approve
        </h2>
      </div>
      <p className="text-sm text-stone-500">
        Your designer has marked this project as ready for review. Take a look and let them know what you think.
      </p>
      <div className="flex gap-3">
        <Button
          onClick={() => setStep("approve-confirm")}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Approve
        </Button>
        <Button
          variant="outline"
          onClick={() => setStep("revision-form")}
          className="flex-1 text-amber-700 border-amber-200 hover:bg-amber-50"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Request Changes
        </Button>
      </div>
    </div>
  );
}
