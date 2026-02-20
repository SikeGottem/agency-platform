"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Send, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProjectQuickActionsProps {
  projectId: string;
  clientUrl: string;
  clientEmail: string;
  status: string;
  magicLinkToken?: string | null;
}

export function ProjectQuickActions({
  projectId,
  clientUrl,
  clientEmail,
  status,
  magicLinkToken,
}: ProjectQuickActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(clientUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }

  async function handleMarkReviewed() {
    setIsMarking(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "reviewed" }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setCurrentStatus("reviewed");
      toast.success("Project marked as reviewed!");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsMarking(false);
    }
  }

  async function handleResendLink() {
    setIsResending(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/resend`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to resend");
      toast.success(`Magic link resent to ${clientEmail}`);
    } catch {
      toast.error("Failed to resend magic link");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="h-9"
      >
        {copied ? (
          <><Check className="mr-1.5 h-3.5 w-3.5 text-green-600" /> Copied!</>
        ) : (
          <><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Client Link</>
        )}
      </Button>

      {magicLinkToken && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleResendLink}
          disabled={isResending}
          className="h-9"
        >
          {isResending ? (
            <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Sending...</>
          ) : (
            <><Send className="mr-1.5 h-3.5 w-3.5" /> Resend Link</>
          )}
        </Button>
      )}

      {(currentStatus === "completed") && (
        <Button
          variant="default"
          size="sm"
          onClick={handleMarkReviewed}
          disabled={isMarking}
          className="h-9"
        >
          {isMarking ? (
            <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Marking...</>
          ) : (
            <><Eye className="mr-1.5 h-3.5 w-3.5" /> Mark as Reviewed</>
          )}
        </Button>
      )}

      {currentStatus === "reviewed" && (
        <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium px-3 py-1.5">
          <Check className="h-4 w-4" /> Reviewed
        </span>
      )}
    </div>
  );
}
