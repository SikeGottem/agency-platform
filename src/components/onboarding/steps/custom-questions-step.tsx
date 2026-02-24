"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

export interface TemplateQuestion {
  label: string;
  type: "text" | "textarea" | "select" | "multi_select";
  options?: string[];
  required?: boolean;
}

interface CustomQuestionsStepProps extends StepProps {
  questions: TemplateQuestion[];
}

export function CustomQuestionsStep({
  data,
  onSave,
  onNext,
  onPrev,
  questions,
}: CustomQuestionsStepProps) {
  const existingData = (data as Record<string, string | string[]>) ?? {};
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(existingData);

  function setValue(label: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [label]: value }));
  }

  function toggleMulti(label: string, option: string) {
    const current = (answers[label] as string[]) ?? [];
    const updated = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setValue(label, updated);
  }

  async function handleNext() {
    // Validate required fields
    for (const q of questions) {
      if (!q.required) continue;
      const val = answers[q.label];
      if (!val || (typeof val === "string" && !val.trim()) || (Array.isArray(val) && val.length === 0)) {
        return; // block navigation — required indicator (*) already visible
      }
    }
    await onSave("custom_questions", answers);
    onNext();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Questions</CardTitle>
        <CardDescription>
          Your designer has added some custom questions for this project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((q, i) => (
          <div key={i} className="space-y-2">
            <Label>
              {q.label}
              {q.required && <span className="text-destructive"> *</span>}
            </Label>
            {q.type === "text" && (
              <Input
                value={(answers[q.label] as string) ?? ""}
                onChange={(e) => setValue(q.label, e.target.value)}
                placeholder={`Enter your answer`}
                className="h-11 text-base"
              />
            )}
            {q.type === "textarea" && (
              <Textarea
                value={(answers[q.label] as string) ?? ""}
                onChange={(e) => setValue(q.label, e.target.value)}
                placeholder={`Enter your answer`}
                rows={3}
                className="text-base"
              />
            )}
            {q.type === "select" && q.options && (
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <Button
                    key={opt}
                    type="button"
                    variant={answers[q.label] === opt ? "default" : "outline"}
                    className="h-11 px-4 text-sm"
                    onClick={() => setValue(q.label, opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            )}
            {q.type === "multi_select" && q.options && (
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const selected = ((answers[q.label] as string[]) ?? []).includes(opt);
                  return (
                    <Button
                      key={opt}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      className="h-11 px-4 text-sm"
                      onClick={() => toggleMulti(q.label, opt)}
                    >
                      {opt}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
          <Button variant="outline" onClick={onPrev} className="h-12 w-full sm:w-auto px-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={handleNext} className="h-12 w-full sm:w-auto px-8">
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
