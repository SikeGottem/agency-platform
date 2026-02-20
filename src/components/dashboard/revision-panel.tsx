"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { MessageSquarePlus, Send, Loader2 } from "lucide-react";

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

interface RevisionPanelProps {
  projectId: string;
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

export function RevisionPanel({ projectId }: RevisionPanelProps) {
  const [revisions, setRevisions] = useState<RevisionRequest[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [stepKey, setStepKey] = useState("business_info");
  const [fieldKey, setFieldKey] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    async function fetchRevisions() {
      try {
        const res = await fetch(`/api/projects/${projectId}/revisions`);
        if (res.ok) {
          const data = await res.json();
          setRevisions(data.revisions);
        }
      } catch (err) {
        console.error("Failed to fetch revisions", err);
      }
    }
    fetchRevisions();
  }, [projectId]);

  async function handleSend() {
    if (!message.trim()) return;
    setIsSending(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepKey,
          fieldKey: fieldKey || null,
          message: message.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRevisions((prev) => [data.revision, ...prev]);
        setMessage("");
        setFieldKey("");
      }
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5" />
            Revision Requests
          </CardTitle>
          <Badge variant="secondary">
            {revisions.filter((r) => r.status === "pending").length} pending
          </Badge>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-6">
          {/* New revision form */}
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-medium">Ask client for clarification</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Section</Label>
                <select
                  value={stepKey}
                  onChange={(e) => setStepKey(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  {Object.entries(STEP_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Field (optional)</Label>
                <Input
                  value={fieldKey}
                  onChange={(e) => setFieldKey(e.target.value)}
                  placeholder="e.g. target_audience"
                  className="text-sm"
                />
              </div>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What would you like clarification on?"
              rows={2}
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={isSending || !message.trim()}
            >
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Request
            </Button>
          </div>

          {/* Existing revisions */}
          {revisions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No revision requests yet.</p>
          ) : (
            <div className="space-y-3">
              {revisions.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-lg border p-3 text-sm"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Badge
                      variant={rev.status === "responded" ? "default" : "secondary"}
                    >
                      {rev.status === "responded" ? "Answered" : "Pending"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {STEP_LABELS[rev.step_key] ?? rev.step_key}
                      {rev.field_key ? ` → ${rev.field_key}` : ""}
                    </span>
                  </div>
                  <p className="mb-2 font-medium">{rev.message}</p>
                  {rev.response && (
                    <div className="rounded bg-muted p-2 text-sm">
                      <span className="text-xs font-medium text-muted-foreground">
                        Client response:
                      </span>
                      <p className="mt-1">{rev.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
