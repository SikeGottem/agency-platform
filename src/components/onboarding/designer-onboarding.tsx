"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  User,
  FolderPlus,
  Rocket,
  ArrowRight,
  ArrowLeft,
  SkipForward,
} from "lucide-react";
import Link from "next/link";

interface DesignerOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const STEPS = [
  { icon: Sparkles, title: "Welcome to Briefed" },
  { icon: User, title: "Set up your profile" },
  { icon: FolderPlus, title: "Create your first project" },
  { icon: Rocket, title: "You're ready!" },
] as const;

export function DesignerOnboarding({ onComplete, onSkip }: DesignerOnboardingProps) {
  const [step, setStep] = useState(0);
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-8 pb-6 px-8">
          <Progress value={progress} className="mb-8 h-1.5" />

          {step === 0 && <StepWelcome />}
          {step === 1 && <StepProfile />}
          {step === 2 && <StepFirstProject />}
          {step === 3 && <StepReady />}

          <div className="mt-8 flex items-center justify-between">
            {step > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={onSkip}>
                <SkipForward className="mr-1 h-4 w-4" />
                I&apos;ll figure it out myself
              </Button>
            )}

            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>
                Next
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={onComplete}>
                Go to Dashboard
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---- Step content ---- */

function StepWelcome() {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Welcome to Briefed 👋</h2>
      <p className="text-muted-foreground leading-relaxed">
        Briefed helps you collect structured project briefs from your clients — no
        more back-and-forth emails. Create a project, send your client a magic link,
        and get a clean brief back in minutes.
      </p>
      <p className="text-sm text-muted-foreground">
        Let&apos;s get you set up. This takes about 30 seconds.
      </p>
    </div>
  );
}

function StepProfile() {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <User className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Set up your profile</h2>
      <p className="text-muted-foreground leading-relaxed">
        Add your business name, upload a logo, and pick your brand color. This
        personalises the experience your clients see when filling out briefs.
      </p>
      <Button variant="outline" asChild>
        <Link href="/dashboard/settings">
          Open Settings →
        </Link>
      </Button>
      <p className="text-xs text-muted-foreground">
        You can always do this later from the settings page.
      </p>
    </div>
  );
}

function StepFirstProject() {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <FolderPlus className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Create your first project</h2>
      <p className="text-muted-foreground leading-relaxed">
        A project is how you collect a brief from a client. Add a client name, pick a
        project type (logo, website, branding, etc.), and Briefed generates a tailored
        questionnaire for them.
      </p>
      <Button variant="outline" asChild>
        <Link href="/dashboard/projects/new">
          Create a Project →
        </Link>
      </Button>
      <p className="text-xs text-muted-foreground">
        Don&apos;t worry — you can create as many as you need.
      </p>
    </div>
  );
}

function StepReady() {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Rocket className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">You&apos;re all set! 🎉</h2>
      <p className="text-muted-foreground leading-relaxed">
        Here&apos;s what happens next:
      </p>
      <ul className="text-left text-sm text-muted-foreground space-y-2 mx-auto max-w-xs">
        <li className="flex gap-2">
          <span className="font-semibold text-foreground">1.</span>
          Create a project and send the magic link to your client.
        </li>
        <li className="flex gap-2">
          <span className="font-semibold text-foreground">2.</span>
          Your client fills in the brief at their own pace.
        </li>
        <li className="flex gap-2">
          <span className="font-semibold text-foreground">3.</span>
          You get notified when it&apos;s ready — review, export, and start designing.
        </li>
      </ul>
    </div>
  );
}
