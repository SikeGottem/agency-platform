"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Send, Loader2, Check } from "lucide-react";

interface RevisionRequest {
  id: string;
  step_key: string;
  field_key: string | null;
  message: string;
  status: string;
  response: string | null;
  responded_at: string | null;
  created_at: string;
}

interface ClientRevisionBannerProps {
  projectId: string;
  token: string;
}

const STEP_LABELS: Record<string, string> = {
  business_info: "Business Info",
  project_scope: "Project Scope",
  style_direction: "Style Direction",
  color_preferences: "Colors",
  typography_feel: "Typography",
  pages_functionality: "Pages & Functionality",
  platforms_content: "Platforms & Content",
  inspiration_upload: "Inspiration",
  timeline_budget: "Timeline & Budget",
  final_thoughts: "Final Thoughts",
  custom_questions: "Additional Questions",
};

export function ClientRevisionBanner({
  projectId,
  token,
}: ClientRevisionBannerProps) {
  const [revisions, setRevisions] = useState<RevisionRequest[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRevisions() {
      try {
        const res = await fetch(
          `/api/projects/${projectId}/revisions?token=${token}`
        );
        if (res.ok) {
          const data = await res.json();
          setRevisions(data.revisions);
        }
      } catch (err) {
        console.error("Failed to fetch revisions", err);
      }
    }
    fetchRevisions();
  }, [projectId, token]);

  const pending = revisions.filter((r) => r.status === "pending");

  async function handleRespond(revisionId: string) {
    const text = responses[revisionId]?.trim();
    if (!text) return;
    setSendingId(revisionId);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/revisions?token=${token}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ revisionId, response: text }),
        }
      );

      if (res.ok) {
        setRevisions((prev) =>
          prev.map((r) =>
            r.id === revisionId
              ? { ...r, status: "responded", response: text, responded_at: new Date().toISOString() }
              : r
          )
        );
        setResponses((prev) => {
          const next = { ...prev };
          delete next[revisionId];
          return next;
        });
      }
    } finally {
      setSendingId(null);
    }
  }

  if (pending.length === 0) return null;

  return (
    <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          Your designer has {pending.length} question{pending.length > 1 ? "s" : ""} for you
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pending.map((rev) => (
          <div
            key={rev.id}
            className="space-y-2 rounded-lg border border-amber-200 bg-white p-4 dark:border-amber-800 dark:bg-background"
          >
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {STEP_LABELS[rev.step_key] ?? rev.step_key}
                {rev.field_key ? ` → ${rev.field_key}` : ""}
              </Badge>
            </div>
            <p className="text-sm font-medium">{rev.message}</p>
            <div className="flex gap-2">
              <Textarea
                value={responses[rev.id] || ""}
                onChange={(e) =>
                  setResponses((prev) => ({
                    ...prev,
                    [rev.id]: e.target.value,
                  }))
                }
                placeholder="Type your response..."
                rows={2}
                className="text-sm"
              />
              <Button
                size="sm"
                className="mt-auto"
                disabled={
                  sendingId === rev.id || !responses[rev.id]?.trim()
                }
                onClick={() => handleRespond(rev.id)}
              >
                {sendingId === rev.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
