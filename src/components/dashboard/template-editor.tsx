"use client";

import { useState, useCallback } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { TemplateShareDialog } from "./template-share-dialog";
import type { Json } from "@/types/supabase";

interface TemplateEditorProps {
  templateId: string;
  initialName: string;
  initialProjectType: string;
  initialSteps: TemplateStep[];
  isDefault: boolean;
}

const QUESTION_TYPE_LABELS: Record<string, string> = {
  text: "Short Text",
  textarea: "Long Text",
  multiple_choice: "Multiple Choice",
  checkbox: "Checkboxes",
  select: "Dropdown",
  image_upload: "Image Upload",
};

export function TemplateEditor({
  templateId,
  initialName,
  initialProjectType,
  initialSteps,
  isDefault,
}: TemplateEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [steps, setSteps] = useState<TemplateStep[]>(initialSteps);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");

  // Add question dialog
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [addToStepKey, setAddToStepKey] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<TemplateQuestion>>({
    type: "text",
    label: "",
    options: [],
  });
  const [optionsText, setOptionsText] = useState("");

  // Add step dialog
  const [addStepOpen, setAddStepOpen] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepDescription, setNewStepDescription] = useState("");

  const moveStep = useCallback((index: number, direction: "up" | "down") => {
    setSteps((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
    setSaved(false);
  }, []);

  const toggleStep = useCallback((index: number) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s))
    );
    setSaved(false);
  }, []);

  const removeStep = useCallback((index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  }, []);

  const removeQuestion = useCallback((stepIndex: number, questionIndex: number) => {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === stepIndex
          ? { ...s, questions: s.questions.filter((_, qi) => qi !== questionIndex) }
          : s
      )
    );
    setSaved(false);
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
    setSaved(false);
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
    setSaved(false);
  }

  async function handleSave() {
    setIsSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("templates")
      .update({
        name: name.trim(),
        questions: steps as unknown as Json,
      })
      .eq("id", templateId);

    setIsSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  const enabledSteps = steps.filter((s) => s.enabled);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard/templates")}>
            ← Back
          </Button>
          <div>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              className="font-display text-xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0"
              placeholder="Template name"
            />
            <div className="flex items-center gap-2 mt-1">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700"
              >
                {PROJECT_TYPE_LABELS[initialProjectType as ProjectType] ?? initialProjectType}
              </span>
              {isDefault && <Badge variant="secondary">Default</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-sm text-green-600">✓ Saved</span>}
          <TemplateShareDialog
            templateId={templateId}
            templateName={name}
            projectType={initialProjectType}
          >
            <Button variant="outline">Share</Button>
          </TemplateShareDialog>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Client Preview</TabsTrigger>
        </TabsList>

        {/* ——— EDITOR TAB ——— */}
        <TabsContent value="editor">
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
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {step.builtIn && (
                      <span className="text-xs text-muted-foreground">Built-in</span>
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
                    <Switch checked={step.enabled} onCheckedChange={() => toggleStep(index)} />
                  </div>
                </CardHeader>

                {step.enabled && step.questions.length > 0 && (
                  <CardContent className="pt-0 px-4 pb-3">
                    <Separator className="mb-3" />
                    <div className="space-y-2">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs"
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

            {/* Add Step button */}
            <Dialog open={addStepOpen} onOpenChange={setAddStepOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-dashed">
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
          </div>
        </TabsContent>

        {/* ——— PREVIEW TAB ——— */}
        <TabsContent value="preview">
          <div className="mx-auto max-w-2xl space-y-8">
            <div className="rounded-lg border bg-white p-6 text-center">
              <h2 className="font-display text-2xl font-bold mb-2">
                Welcome to your project questionnaire
              </h2>
              <p className="text-muted-foreground">
                This will take about 15-20 minutes. Your progress is saved automatically.
              </p>
              <div className="mt-4 flex justify-center">
                <div className="flex gap-1">
                  {enabledSteps.map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 w-8 rounded-full"
                      style={{ backgroundColor: i === 0 ? "#E05252" : "#e5e7eb" }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {enabledSteps.map((step, stepIndex) => (
              <div key={step.key} className="rounded-lg border bg-white p-6">
                <div className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Step {stepIndex + 1} of {enabledSteps.length}
                </div>
                <h3 className="font-display text-xl font-bold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{step.description}</p>

                {step.questions.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No questions in this step.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {step.questions.map((q) => (
                      <div key={q.id}>
                        <label className="mb-1.5 block text-sm font-medium">
                          {q.label}
                          {q.required && <span className="ml-1 text-red-500">*</span>}
                        </label>
                        {q.type === "text" && (
                          <div className="h-10 rounded-md border bg-muted/30 px-3" />
                        )}
                        {q.type === "textarea" && (
                          <div className="h-24 rounded-md border bg-muted/30 px-3" />
                        )}
                        {q.type === "select" && (
                          <div className="h-10 rounded-md border bg-muted/30 px-3 flex items-center text-sm text-muted-foreground">
                            Select an option...
                          </div>
                        )}
                        {q.type === "multiple_choice" && q.options && (
                          <div className="space-y-2">
                            {q.options.map((opt) => (
                              <label key={opt} className="flex items-center gap-2 text-sm">
                                <div className="h-4 w-4 rounded-full border" />
                                {opt}
                              </label>
                            ))}
                          </div>
                        )}
                        {q.type === "checkbox" && q.options && (
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt) => (
                              <label key={opt} className="flex items-center gap-2 text-sm">
                                <div className="h-4 w-4 rounded border" />
                                {opt}
                              </label>
                            ))}
                          </div>
                        )}
                        {q.type === "image_upload" && (
                          <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed bg-muted/20 text-sm text-muted-foreground">
                            Drag & drop images here
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
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
