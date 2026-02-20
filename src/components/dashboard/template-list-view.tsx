"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_TYPE_LABELS, type ProjectType } from "@/types";
import { DEFAULT_TEMPLATES } from "@/lib/templates/defaults";
import { createClient } from "@/lib/supabase/client";
import { TemplateShareDialog } from "./template-share-dialog";
import type { Json } from "@/types/supabase";

interface TemplateCard {
  id: string;
  name: string;
  projectType: string;
  isDefault: boolean;
  stepsCount: number;
  projectsUsing: number;
  updatedAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  branding: "bg-purple-100 text-purple-800",
  web_design: "bg-blue-100 text-blue-800",
  social_media: "bg-pink-100 text-pink-800",
};

export function TemplateListView({ templates: initial }: { templates: TemplateCard[] }) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("branding");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setIsSubmitting(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Use default template steps for the selected project type
    const defaultTemplate = DEFAULT_TEMPLATES.find(
      (t) => t.projectType === projectType
    );
    const steps = defaultTemplate?.steps ?? [];

    const { data, error } = await supabase
      .from("templates")
      .insert({
        designer_id: user.id,
        name: name.trim(),
        project_type: projectType,
        questions: steps as unknown as Json,
        is_default: false,
      })
      .select()
      .single();

    if (!error && data) {
      router.push(`/dashboard/templates/${(data as Record<string, unknown>).id}`);
    }

    setIsSubmitting(false);
    setDialogOpen(false);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            Manage questionnaire templates for different project types.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/templates/new")}
          >
            + Build Template
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: "#E05252" }} className="text-white hover:opacity-90">
                + Quick Start
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Startup Branding"
                />
              </div>
              <div className="space-y-2">
                <Label>Project Type</Label>
                <Select value={projectType} onValueChange={(v) => setProjectType(v as ProjectType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isSubmitting || !name.trim()}>
                  {isSubmitting ? "Creating..." : "Create & Edit"}
                </Button>
              </div>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="mb-2 text-lg font-medium">No templates yet</p>
          <p className="mb-6 text-sm text-muted-foreground">
            Create your first template to customize questionnaires for your clients.
          </p>
          <Button
            style={{ backgroundColor: "#E05252" }}
            className="text-white hover:opacity-90"
            onClick={() => setDialogOpen(true)}
          >
            + Create Template
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/dashboard/templates/${template.id}`)}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="font-display text-base">{template.name}</CardTitle>
                <div className="flex gap-1.5">
                  {template.isDefault && <Badge variant="secondary">Default</Badge>}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      TYPE_COLORS[template.projectType] ?? "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {PROJECT_TYPE_LABELS[template.projectType as ProjectType] ?? template.projectType}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{template.stepsCount} steps</p>
                  <p>
                    {template.projectsUsing} project{template.projectsUsing !== 1 ? "s" : ""} using
                    this
                  </p>
                  <p className="text-xs">Last edited {formatDate(template.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

