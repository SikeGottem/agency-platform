"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import {
  Upload,
  Plus,
  Share2,
  CheckCircle2,
  MessageSquare,
  FileImage,
  FileText,
  Link2,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export interface Deliverable {
  id: string;
  project_id: string;
  designer_id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  version: number;
  round: number;
  status: "draft" | "shared" | "awaiting_feedback" | "feedback_given" | "changes_addressed" | "approved";
  shared_at: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkTabProps {
  projectId: string;
  initialDeliverables: Deliverable[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-stone-100 text-stone-600" },
  shared: { label: "Shared", color: "bg-blue-50 text-blue-700" },
  awaiting_feedback: { label: "Awaiting Feedback", color: "bg-purple-50 text-purple-700" },
  feedback_given: { label: "Feedback", color: "bg-amber-50 text-amber-700" },
  changes_addressed: { label: "Changes Done", color: "bg-blue-50 text-blue-700" },
  approved: { label: "Approved", color: "bg-emerald-50 text-emerald-700" },
};

const FILE_ICONS: Record<string, typeof FileImage> = {
  image: FileImage,
  pdf: FileText,
  figma: Link2,
  other: FileText,
};

export function WorkTab({ projectId, initialDeliverables }: WorkTabProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>(initialDeliverables);
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set([1]));
  const [uploading, setUploading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addRound, setAddRound] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formFigmaUrl, setFormFigmaUrl] = useState("");
  const [formType, setFormType] = useState<"file" | "figma">("file");

  // Group by round
  const rounds = new Map<number, Deliverable[]>();
  deliverables.forEach((d) => {
    const list = rounds.get(d.round) || [];
    list.push(d);
    rounds.set(d.round, list);
  });
  const sortedRounds = Array.from(rounds.keys()).sort((a, b) => a - b);
  const maxRound = sortedRounds.length > 0 ? Math.max(...sortedRounds) : 0;

  const toggleRound = (r: number) => {
    setExpandedRounds((prev) => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next;
    });
  };

  const uploadFile = async (file: File): Promise<{ url: string; type: string }> => {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${projectId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("deliverables").upload(path, file);
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("deliverables").getPublicUrl(path);
    const fileType = file.type.startsWith("image/") ? "image" : file.type === "application/pdf" ? "pdf" : "other";
    return { url: data.publicUrl, type: fileType };
  };

  const handleAdd = async () => {
    if (!formTitle.trim()) return;
    setUploading(true);

    try {
      let file_url: string | null = null;
      let file_type: string | null = null;

      if (formType === "file" && formFile) {
        const result = await uploadFile(formFile);
        file_url = result.url;
        file_type = result.type;
      } else if (formType === "figma" && formFigmaUrl) {
        file_url = formFigmaUrl;
        file_type = "figma";
      }

      // Calculate next version for this round
      const roundItems = deliverables.filter((d) => d.round === addRound);
      const nextVersion = roundItems.length > 0 ? Math.max(...roundItems.map((d) => d.version)) + 1 : 1;

      const res = await fetch(`/api/projects/${projectId}/deliverables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc || null,
          file_url,
          file_type,
          version: nextVersion,
          round: addRound,
        }),
      });

      if (res.ok) {
        const newDel = await res.json();
        setDeliverables((prev) => [...prev, newDel]);
        setExpandedRounds((prev) => new Set(prev).add(addRound));
        resetForm();
      }
    } catch (err) {
      console.error("Failed to add deliverable:", err);
    } finally {
      setUploading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/projects/${projectId}/deliverables`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDeliverables((prev) => prev.map((d) => (d.id === id ? updated : d)));
    }
  };

  const shareRound = async (roundNumber: number) => {
    const roundItems = deliverables.filter(
      (d) => d.round === roundNumber && d.status === "draft"
    );
    for (const item of roundItems) {
      await updateStatus(item.id, "shared");
    }
  };

  const deleteDeliverable = async (id: string) => {
    const res = await fetch(`/api/projects/${projectId}/deliverables?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setDeliverables((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormDesc("");
    setFormFile(null);
    setFormFigmaUrl("");
    setFormType("file");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-900">Deliverables</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setAddRound(maxRound + 1);
              setShowAddForm(true);
              setExpandedRounds((prev) => new Set(prev).add(maxRound + 1));
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Round
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setAddRound(maxRound || 1);
              setShowAddForm(true);
            }}
          >
            <Upload className="h-4 w-4 mr-1" />
            Add Deliverable
          </Button>
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-stone-900">
              Add to Round {addRound}
            </h4>
            <Button size="sm" variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          </div>

          <input
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            placeholder="Title (e.g. Homepage V1, Logo Concept A)"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <textarea
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
            rows={2}
            placeholder="Description (optional)"
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={formType === "file" ? "default" : "outline"}
              onClick={() => setFormType("file")}
            >
              <Upload className="h-3 w-3 mr-1" />
              File
            </Button>
            <Button
              size="sm"
              variant={formType === "figma" ? "default" : "outline"}
              onClick={() => setFormType("figma")}
            >
              <Link2 className="h-3 w-3 mr-1" />
              Figma Link
            </Button>
          </div>

          {formType === "file" ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.ai,.psd,.sketch,.fig"
                onChange={(e) => setFormFile(e.target.files?.[0] || null)}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-lg border-2 border-dashed border-stone-300 p-6 text-center hover:border-stone-400 transition-colors"
              >
                {formFile ? (
                  <span className="text-sm text-stone-700">{formFile.name}</span>
                ) : (
                  <span className="text-sm text-stone-400">
                    Click to upload image, PDF, or design file
                  </span>
                )}
              </button>
            </div>
          ) : (
            <input
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
              placeholder="https://www.figma.com/file/..."
              value={formFigmaUrl}
              onChange={(e) => setFormFigmaUrl(e.target.value)}
            />
          )}

          <div className="flex justify-end">
            <Button onClick={handleAdd} disabled={uploading || !formTitle.trim()}>
              {uploading ? "Uploading…" : "Add Deliverable"}
            </Button>
          </div>
        </div>
      )}

      {/* Rounds */}
      {sortedRounds.length === 0 && !showAddForm && (
        <div className="rounded-xl border-2 border-dashed border-stone-200 p-12 text-center">
          <Upload className="h-8 w-8 mx-auto text-stone-300 mb-3" />
          <p className="text-sm text-stone-500 mb-1">No deliverables yet</p>
          <p className="text-xs text-stone-400">
            Upload design concepts, share with your client, and track feedback.
          </p>
        </div>
      )}

      {sortedRounds.map((roundNum) => {
        const items = rounds.get(roundNum)!;
        const expanded = expandedRounds.has(roundNum);
        const draftCount = items.filter((d) => d.status === "draft").length;
        const approvedCount = items.filter((d) => d.status === "approved").length;

        return (
          <div key={roundNum} className="rounded-xl border border-stone-200 bg-white overflow-hidden">
            {/* Round header */}
            <button
              onClick={() => toggleRound(roundNum)}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expanded ? (
                  <ChevronDown className="h-4 w-4 text-stone-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-stone-400" />
                )}
                <span className="font-medium text-stone-900">Round {roundNum}</span>
                <span className="text-xs text-stone-400">{items.length} items</span>
                {approvedCount === items.length && items.length > 0 && (
                  <Badge className="bg-emerald-50 text-emerald-700 text-xs">All Approved</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {draftCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      shareRound(roundNum);
                    }}
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Share All ({draftCount})
                  </Button>
                )}
              </div>
            </button>

            {/* Deliverable items */}
            {expanded && (
              <div className="border-t border-stone-100 divide-y divide-stone-100">
                {items.map((d) => {
                  const Icon = FILE_ICONS[d.file_type || "other"] || FileText;
                  const statusConf = STATUS_CONFIG[d.status];

                  return (
                    <div key={d.id} className="px-5 py-3 flex items-center gap-4 group">
                      {/* File icon */}
                      <div className="h-10 w-10 rounded-lg bg-stone-50 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-stone-400" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-stone-900 truncate">
                            {d.title}
                          </span>
                          <span className="text-xs text-stone-400">v{d.version}</span>
                        </div>
                        {d.description && (
                          <p className="text-xs text-stone-500 truncate">{d.description}</p>
                        )}
                      </div>

                      {/* Status badge */}
                      <Badge className={`${statusConf.color} text-xs shrink-0`}>
                        {statusConf.label}
                      </Badge>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.file_url && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={d.file_url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                        )}
                        {d.status === "draft" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatus(d.id, "shared")}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                        )}
                        {d.status === "shared" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatus(d.id, "approved")}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-600"
                          onClick={() => deleteDeliverable(d.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
