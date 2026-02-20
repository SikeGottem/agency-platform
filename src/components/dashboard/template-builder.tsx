"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PROJECT_TYPE_LABELS, type ProjectType } from "@/types";
import type { TemplateStep, TemplateQuestion } from "@/lib/templates/defaults";
import { DEFAULT_TEMPLATES } from "@/lib/templates/defaults";
import { createClient } from "@/lib/supabase/client";
import { TemplatePreview } from "./template-preview";
import type { Json } from "@/types/supabase";
// Drag and drop functionality commented out for now
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   type DropResult,
// } from "react-beautiful-dnd";

const QUESTION_TYPE_LABELS: Record<string, string> = {
  text: "Short Text",
  textarea: "Long Text",
  multiple_choice: "Multiple Choice",
  checkbox: "Checkboxes",
  select: "Dropdown",
  image_upload: "Image Upload",
};

export function TemplateBuilder() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("branding");
  const [steps, setSteps] = useState<TemplateStep[]>([]);
  const [activeTab, setActiveTab] = useState("builder");
  const [isSaving, setIsSaving] = useState(false);

  // Dialog states
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [addToStepKey, setAddToStepKey] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<TemplateQuestion>>({
    type: "text",
    label: "",
    options: [],
  });
  const [optionsText, setOptionsText] = useState("");
  const [addStepOpen, setAddStepOpen] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepDescription, setNewStepDescription] = useState("");

  // Initialize with default template for selected project type
  const defaultTemplate = useMemo(() => {
    return DEFAULT_TEMPLATES.find((t) => t.projectType === projectType);
  }, [projectType]);

  // Update steps when project type changes
  const handleProjectTypeChange = useCallback((newProjectType: ProjectType) => {
    setProjectType(newProjectType);
    const template = DEFAULT_TEMPLATES.find((t) => t.projectType === newProjectType);
    if (template) {
      setSteps([...template.steps]);
    }
  }, []);

  // Initialize with default template on first load
  useMemo(() => {
    if (defaultTemplate && steps.length === 0) {
      setSteps([...defaultTemplate.steps]);
    }
  }, [defaultTemplate, steps.length]);

  const moveStep = useCallback((index: number, direction: "up" | "down") => {
    setSteps((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }, []);

  const toggleStep = useCallback((index: number) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s))
    );
  }, []);

  const removeStep = useCallback((index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeQuestion = useCallback((stepIndex: number, questionIndex: number) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === stepIndex
          ? { ...s, questions: s.questions.filter((_, qi) => qi !== questionIndex) }
          : s
      )
    );
  }, []);

  function handleAddQuestion() {
    if (!addToStepKey || !newQuestion.label?.trim()) return;

    const question: TemplateQuestion = {
      id: `custom_${Date.now()}`,
      label: newQuestion.label!.trim(),
      type: (newQuestion.type as TemplateQuestion["type"]) ?? "text",
      required: false,
    };

    if (["multiple_choice", "checkbox", "select"].includes(question.type) && optionsText.trim()) {
      question.options = optionsText
        .split("\n")
        .map((o) => o.trim())
        .filter(Boolean);
    }

    setSteps((prev) =>
      prev.map((s) =>
        s.key === addToStepKey ? { ...s, questions: [...s.questions, question] } : s
      )
    );

    setNewQuestion({ type: "text", label: "", options: [] });
    setOptionsText("");
    setAddQuestionOpen(false);
    setAddToStepKey(null);
  }

  function handleAddStep() {
    if (!newStepTitle.trim()) return;

    const step: TemplateStep = {
      key: `custom_${Date.now()}`,
      title: newStepTitle.trim(),
      description: newStepDescription.trim(),
      enabled: true,
      builtIn: false,
      questions: [],
    };

    setSteps((prev) => [...prev, step]);
    setNewStepTitle("");
    setNewStepDescription("");
    setAddStepOpen(false);
  }

  async function handleSave() {
    if (!name.trim()) {
      alert("Please enter a template name");
      return;
    }

    setIsSaving(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

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

    setIsSaving(false);
    if (!error && data) {
      router.push(`/dashboard/templates/${(data as Record<string, unknown>).id}`);
    } else {
      console.error("Error creating template:", error);
      alert("Failed to create template. Please try again.");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard/templates")}>
            ← Back
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold">Create Template</h1>
            <p className="text-sm text-muted-foreground">
              Build a custom questionnaire template for your clients
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !name.trim()}
          style={{ backgroundColor: "#E05252" }}
          className="text-white hover:opacity-90"
        >
          {isSaving ? "Creating..." : "Create Template"}
        </Button>
      </div>

      {/* Template Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Template Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Startup Branding Premium"
              />
            </div>
            <div className="space-y-2">
              <Label>Project Type</Label>
              <Select value={projectType} onValueChange={handleProjectTypeChange}>
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
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* ——— BUILDER TAB ——— */}
        <TabsContent value="builder">
          <div className="space-y-3">
            {steps.map((step, index) => (
              <Card
                key={step.key}
                className={`transition-opacity ${!step.enabled ? "opacity-50" : ""}`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4">
                  <div className="flex items-center gap-3">
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveStep(index, "up")}
                        disabled={index === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs leading-none"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveStep(index, "down")}
                        disabled={index === steps.length - 1}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs leading-none"
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>

                                <div>
                                  <CardTitle className="text-sm font-semibold">
                                    {index + 1}. {step.title}
                                  </CardTitle>
                                  <p className="text-xs text-muted-foreground">
                                    {step.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {step.builtIn && (
                                  <Badge variant="outline" className="text-xs">
                                    Built-in
                                  </Badge>
                                )}
                                {!step.builtIn && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive text-xs h-7"
                                    onClick={() => removeStep(index)}
                                  >
                                    Remove
                                  </Button>
                                )}
                                <Switch
                                  checked={step.enabled}
                                  onCheckedChange={() => toggleStep(index)}
                                />
                              </div>
                            </CardHeader>

                            {step.enabled && (
                              <CardContent className="pt-0 px-4 pb-3">
                                <Separator className="mb-3" />
                                {step.questions.length === 0 ? (
                                  <p className="text-sm text-muted-foreground italic mb-2">
                                    No questions in this step.
                                  </p>
                                ) : (
                                  <div className="space-y-2 mb-2">
                                    {step.questions.map((q, qi) => (
                                      <div
                                        key={q.id}
                                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-muted-foreground">
                                            {QUESTION_TYPE_LABELS[q.type] ?? q.type}
                                          </span>
                                          <span>{q.label}</span>
                                          {q.required && (
                                            <span className="text-xs text-red-500">*</span>
                                          )}
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 text-xs text-muted-foreground hover:text-destructive"
                                          onClick={() => removeQuestion(index, qi)}
                                        >
                                          ×
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => {
                                    setAddToStepKey(step.key);
                                    setAddQuestionOpen(true);
                                  }}
                                >
                                  + Add Question
                                </Button>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>

          {/* Add Step button */}
          <Dialog open={addStepOpen} onOpenChange={setAddStepOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full border-dashed mt-3">
                + Add Custom Step
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Custom Step</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Step Title</Label>
                  <Input
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    placeholder="e.g. Brand Voice & Tone"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newStepDescription}
                    onChange={(e) => setNewStepDescription(e.target.value)}
                    placeholder="Brief description of this step"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAddStepOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddStep} disabled={!newStepTitle.trim()}>
                    Add Step
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ——— PREVIEW TAB ——— */}
        <TabsContent value="preview">
          <TemplatePreview steps={steps.filter((s) => s.enabled)} />
        </TabsContent>
      </Tabs>

      {/* Add Question Dialog */}
      <Dialog open={addQuestionOpen} onOpenChange={setAddQuestionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Question Label</Label>
              <Input
                value={newQuestion.label ?? ""}
                onChange={(e) => setNewQuestion((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="e.g. What tone of voice suits your brand?"
              />
            </div>
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select
                value={newQuestion.type ?? "text"}
                onValueChange={(v) =>
                  setNewQuestion((prev) => ({ ...prev, type: v as TemplateQuestion["type"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {["multiple_choice", "checkbox", "select"].includes(newQuestion.type ?? "") && (
              <div className="space-y-2">
                <Label>Options (one per line)</Label>
                <Textarea
                  value={optionsText}
                  onChange={(e) => setOptionsText(e.target.value)}
                  rows={4}
                  placeholder={"Option 1\nOption 2\nOption 3"}
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddQuestionOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddQuestion} disabled={!newQuestion.label?.trim()}>
                Add Question
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}