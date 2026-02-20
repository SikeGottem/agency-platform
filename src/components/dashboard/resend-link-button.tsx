"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Check, Loader2 } from "lucide-react";

interface ResendLinkButtonProps {
  projectId: string;
}

export function ResendLinkButton({ projectId }: ResendLinkButtonProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleResend() {
    setStatus("sending");
    try {
      const res = await fetch(`/api/projects/${projectId}/resend`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to resend");
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleResend}
      disabled={status === "sending" || status === "sent"}
    >
      {status === "sending" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {status === "sent" && <Check className="mr-2 h-4 w-4" />}
      {status === "idle" && <Send className="mr-2 h-4 w-4" />}
      {status === "error" && <Send className="mr-2 h-4 w-4" />}
      {status === "sending"
        ? "Sending..."
        : status === "sent"
          ? "Link Sent!"
          : status === "error"
            ? "Failed — retry"
            : "Resend Link"}
    </Button>
  );
}
