"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Clock,
  MessageSquare,
  FileCheck,
  Send,
  Sparkles,
} from "lucide-react";
import { PROJECT_TYPE_LABELS } from "@/types";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

const processSteps = [
  {
    icon: MessageSquare,
    title: "Answer Questions",
    description: "Share your vision, style preferences, and project details",
  },
  {
    icon: FileCheck,
    title: "Review Your Brief",
    description: "Check your answers and make any final changes",
  },
  {
    icon: Send,
    title: "Designer Receives Brief",
    description: "Your designer gets a polished brief to start creating",
  },
];

export function WelcomeStep({
  projectType,
  onNext,
  designerName,
  clientName,
}: StepProps) {
  const greeting = clientName ? `Hi ${clientName}!` : "Welcome!";
  const designerDisplay = designerName || "your designer";

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className="p-0">
        {/* Hero section */}
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 pb-8 pt-10 text-center sm:px-10 sm:pt-14">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 sm:h-20 sm:w-20">
            <Sparkles className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
          </div>

          <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting}
          </h2>
          <p className="text-base text-muted-foreground sm:text-lg">
            <strong>{designerDisplay}</strong> has invited you to share your
            creative vision for your{" "}
            <strong>{PROJECT_TYPE_LABELS[projectType]}</strong> project.
          </p>
        </div>

        {/* Time estimate */}
        <div className="flex items-center justify-center gap-2 border-y bg-muted/30 px-6 py-3 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Estimated time: <strong>~15 minutes</strong>
          </span>
        </div>

        {/* Process steps */}
        <div className="px-6 py-8 sm:px-10">
          <h3 className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            How it works
          </h3>
          <div className="mx-auto max-w-sm space-y-5">
            {processSteps.map((step, i) => (
              <div key={step.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="pt-0.5">
                  <p className="font-medium leading-tight">
                    <span className="mr-1.5 text-xs font-bold text-primary">
                      {i + 1}.
                    </span>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border-t px-6 py-6 text-center sm:px-10">
          <Button size="lg" onClick={onNext} className="w-full sm:w-auto">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Your answers are saved automatically — come back anytime.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
