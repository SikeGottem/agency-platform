"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Package, Upload, Send, FileText } from "lucide-react";

interface Deliverable {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
  file_type?: string;
  status: string;
  round_number: number;
}

interface FinalDeliveryProps {
  projectId: string;
  deliverables: Deliverable[];
  onDelivered?: () => void;
}

export function FinalDelivery({ projectId, deliverables, onDelivered }: FinalDeliveryProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(deliverables.filter((d) => d.status === "approved").map((d) => d.id))
  );
  const [notes, setNotes] = useState("");
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [isDelivering, setIsDelivering] = useState(false);

  const approvedDeliverables = deliverables.filter(
    (d) => d.status === "approved" || d.status === "final"
  );

  const toggleDeliverable = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAdditionalFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleDeliver = async () => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one deliverable to include");
      return;
    }

    setIsDelivering(true);
    try {
      // Upload additional files first if any
      if (additionalFiles.length > 0) {
        for (const file of additionalFiles) {
          const formData = new FormData();
          formData.append("file", file);
          await fetch(`/api/projects/${projectId}/upload`, {
            method: "POST",
            body: formData,
          });
        }
      }

      const res = await fetch(`/api/projects/${projectId}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliverableIds: Array.from(selectedIds),
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to deliver");
      }

      toast.success("Project delivered! Your client has been notified.");
      onDelivered?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deliver project");
    } finally {
      setIsDelivering(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Final Delivery
        </CardTitle>
        <CardDescription>
          Select which deliverables to include and add any final files or notes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Deliverable selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Final Deliverables</Label>
          {approvedDeliverables.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No approved deliverables yet. Approve items before delivering.
            </p>
          ) : (
            approvedDeliverables.map((d) => (
              <div
                key={d.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <Checkbox
                  checked={selectedIds.has(d.id)}
                  onCheckedChange={() => toggleDeliverable(d.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{d.title}</p>
                  {d.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {d.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Round {d.round_number} · {d.file_type?.toUpperCase() || "File"}
                  </p>
                </div>
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Additional files */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Additional Files</Label>
          <p className="text-xs text-muted-foreground">
            Source files, brand guidelines, or other extras.
          </p>
          <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed p-4 hover:bg-muted/50 transition-colors">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {additionalFiles.length > 0
                ? `${additionalFiles.length} file(s) selected`
                : "Click to upload files"}
            </span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          {additionalFiles.length > 0 && (
            <ul className="text-xs text-muted-foreground space-y-1">
              {additionalFiles.map((f, i) => (
                <li key={i}>📎 {f.name}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Delivery notes */}
        <div className="space-y-2">
          <Label htmlFor="delivery-notes" className="text-sm font-medium">
            Delivery Notes
          </Label>
          <Textarea
            id="delivery-notes"
            placeholder="Here are your final files! The brand guidelines PDF includes colour codes, typography specs, and logo usage rules..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>

        {/* Deliver button */}
        <Button
          onClick={handleDeliver}
          disabled={isDelivering || selectedIds.size === 0}
          className="w-full"
          size="lg"
        >
          <Send className="h-4 w-4 mr-2" />
          {isDelivering ? "Delivering..." : "Deliver to Client"}
        </Button>
      </CardContent>
    </Card>
  );
}
