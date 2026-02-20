"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ShareBriefButtonProps {
  projectId: string;
  hasShareToken: boolean;
}

export function ShareBriefButton({ projectId, hasShareToken }: ShareBriefButtonProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/share`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create share link");
      }

      await navigator.clipboard.writeText(data.shareUrl);
      setCopied(true);
      toast.success("Share link copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : copied ? (
        <Check className="mr-2 h-4 w-4 text-green-600" />
      ) : (
        <Share2 className="mr-2 h-4 w-4" />
      )}
      {copied ? "Copied!" : "Share Brief"}
    </Button>
  );
}
