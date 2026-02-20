"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, UserPlus, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { WelcomeStep } from "@/components/onboarding/steps/welcome-step";
import { BusinessInfoStep } from "@/components/onboarding/steps/business-info-step";
import { ProjectScopeStep } from "@/components/onboarding/steps/project-scope-step";
import { AdaptiveStyleSelector as StyleDirectionStep } from "@/components/onboarding/steps/adaptive-style-selector";
import { ColorPreferencesStep } from "@/components/onboarding/steps/color-preferences-step";
import { TypographyFeelStep } from "@/components/onboarding/steps/typography-feel-step";
import { PagesFunctionalityStep } from "@/components/onboarding/steps/pages-functionality-step";
import { PlatformsContentStep } from "@/components/onboarding/steps/platforms-content-step";
import { InspirationUploadStep } from "@/components/onboarding/steps/inspiration-upload-step";
import { TimelineBudgetStep } from "@/components/onboarding/steps/timeline-budget-step";
import { FinalThoughtsStep } from "@/components/onboarding/steps/final-thoughts-step";
import { ReviewStep } from "@/components/onboarding/steps/review-step";
import type { ProjectType } from "@/types";

interface QuestionnaireWizardProps {
  projectId: string;
  projectType: ProjectType;
  clientName: string;
  clientEmail: string;
  designerName: string;
  existingResponses: Record<string, unknown>;
  isCompleted: boolean;
  magicToken?: string;
  /** Legacy token prop from /brief/[id] route */
  token?: string;
  templateQuestions?: unknown[];
  brandColor?: string;
}

interface StepConfig {
  key: string;
  label: string;
  component: React.ComponentType<StepProps>;
}

export interface StepProps {
  projectId: string;
  projectType: ProjectType;
  data: unknown;
  onSave: (stepKey: string, answers: unknown) => Promise<void>;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  allResponses?: Record<string, unknown>;
  goToStep?: (stepKey: string) => void;
  magicToken?: string;
  /** Legacy token prop used by some step components */
  token?: string;
  /** Submit handler used by review step */
  onSubmit?: () => Promise<void>;
  /** Whether the form is currently submitting */
  isSaving?: boolean;
  /** Designer's display name */
  designerName?: string;
  /** Client's display name */
  clientName?: string;
}

function getStepsForProjectType(projectType: ProjectType): StepConfig[] {
  const baseSteps: StepConfig[] = [
    { key: "welcome", label: "Welcome", component: WelcomeStep },
    { key: "business_info", label: "About Your Business", component: BusinessInfoStep },
    { key: "project_scope", label: "Project Scope", component: ProjectScopeStep },
  ];

  // Project-type specific steps inserted after project_scope
  const projectSpecificSteps: StepConfig[] = [];

  if (projectType === "web_design") {
    projectSpecificSteps.push({
      key: "pages_functionality",
      label: "Pages & Features",
      component: PagesFunctionalityStep,
    });
  } else if (projectType === "social_media") {
    projectSpecificSteps.push({
      key: "platforms_content",
      label: "Platforms & Content",
      component: PlatformsContentStep,
    });
  }

  // Common design steps
  const designSteps: StepConfig[] = [
    { key: "style_direction", label: "Style Direction", component: StyleDirectionStep },
    { key: "color_preferences", label: "Colors", component: ColorPreferencesStep },
  ];

  // Typography step only for branding projects
  if (projectType === "branding") {
    designSteps.push({
      key: "typography_feel",
      label: "Typography",
      component: TypographyFeelStep,
    });
  }

  // Closing steps
  const closingSteps: StepConfig[] = [
    { key: "inspiration_upload", label: "Inspiration", component: InspirationUploadStep },
    { key: "timeline_budget", label: "Timeline & Budget", component: TimelineBudgetStep },
    { key: "final_thoughts", label: "Final Thoughts", component: FinalThoughtsStep },
    { key: "review", label: "Review", component: ReviewStep },
  ];

  return [...baseSteps, ...projectSpecificSteps, ...designSteps, ...closingSteps];
}

function ConfettiBurst() {
  const particles = useMemo(() => {
    const colors = ["#E05252", "#7C8B6F", "#F7C59F", "#A78BFA", "#22C55E", "#3B82F6", "#F59E0B"];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      duration: `${1.5 + Math.random() * 1.5}s`,
      size: `${4 + Math.random() * 6}px`,
      drift: `${-30 + Math.random() * 60}px`,
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 rounded-sm animate-[confetti-fall_var(--dur)_ease-out_var(--delay)_forwards] opacity-0"
          style={{
            left: p.left,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            "--delay": p.delay,
            "--dur": p.duration,
            "--drift": p.drift,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function MilestoneCelebration({ message, step }: { message: string; step: number }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="animate-in zoom-in fade-in duration-500 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg">
        <div className="flex items-center gap-2">
          <div className="animate-bounce">🎉</div>
          <span className="font-semibold">{message}</span>
        </div>
      </div>
    </div>
  );
}

function EnhancedProgress({ 
  currentStep, 
  totalSteps, 
  completedSteps, 
  estimatedTimeRemaining 
}: { 
  currentStep: number; 
  totalSteps: number; 
  completedSteps: Set<number>;
  estimatedTimeRemaining: number;
}) {
  return (
    <div className="mb-8 sm:mb-10">
      {/* Step count + time estimate */}
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          ~{estimatedTimeRemaining} min remaining
        </span>
      </div>

      {/* Enhanced segmented bar with completion animation */}
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full transition-all duration-700 ease-out relative overflow-hidden",
              completedSteps.has(i)
                ? "bg-primary"
                : i === currentStep
                  ? "bg-primary/70"
                  : "bg-muted"
            )}
          >
            {/* Completion sparkle effect */}
            {completedSteps.has(i) && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Step name with enhanced transitions */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
            completedSteps.has(currentStep) 
              ? "bg-primary text-primary-foreground" 
              : "bg-primary/10 text-primary"
          )}>
            {completedSteps.has(currentStep) ? (
              <Check className="h-3 w-3" />
            ) : (
              currentStep + 1
            )}
          </div>
          <p className="text-sm font-medium transition-all duration-300">
            {/* Current step name would be passed as prop */}
          </p>
        </div>
        
        {/* Completion percentage */}
        <div className="text-xs text-muted-foreground">
          {Math.round(((completedSteps.size + (currentStep === totalSteps - 1 ? 1 : 0)) / totalSteps) * 100)}% complete
        </div>
      </div>
    </div>
  );
}

export function QuestionnaireWizard({
  projectId,
  projectType,
  clientName,
  clientEmail,
  designerName,
  existingResponses,
  isCompleted,
  magicToken,
}: QuestionnaireWizardProps) {
  const steps = getStepsForProjectType(projectType);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, unknown>>(existingResponses);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(isCompleted);
  
  // Enhanced progress tracking
  const [startTime] = useState(Date.now());
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [celebrationStep, setCelebrationStep] = useState<number | null>(null);

  const progress = ((currentStep + 1) / steps.length) * 100;
  
  // Time estimation
  const estimatedTimePerStep = 90; // seconds
  const remainingSteps = steps.length - currentStep - 1;
  const estimatedTimeRemaining = Math.max(1, Math.round((remainingSteps * estimatedTimePerStep) / 60));
  
  // Track milestone celebrations
  const milestones = [
    { step: Math.floor(steps.length * 0.25), message: "Great start! 🎉" },
    { step: Math.floor(steps.length * 0.5), message: "Halfway there! 💪" },
    { step: Math.floor(steps.length * 0.75), message: "Almost done! ⭐" },
  ];

  const handleSave = useCallback(
    async (stepKey: string, answers: unknown) => {
      setIsSaving(true);
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (magicToken) {
          headers["x-magic-token"] = magicToken;
        }

        const res = await fetch(`/api/projects/${projectId}/responses`, {
          method: "POST",
          headers,
          body: JSON.stringify({ stepKey, answers }),
        });

        if (!res.ok) {
          throw new Error("Failed to save");
        }

        setResponses((prev) => ({ ...prev, [stepKey]: answers }));
      } finally {
        setIsSaving(false);
      }
    },
    [projectId, magicToken]
  );

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      // Mark current step as completed
      setCompletedSteps(prev => new Set(prev).add(currentStep));
      
      // Check for milestone celebrations
      const milestone = milestones.find(m => m.step === currentStep + 1);
      if (milestone) {
        setCelebrationStep(currentStep + 1);
        setTimeout(() => setCelebrationStep(null), 2000);
      }
      
      setCurrentStep((prev) => prev + 1);
      setStepStartTime(Date.now());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep, steps.length, milestones]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const goToStepByKey = useCallback(
    (stepKey: string) => {
      const index = steps.findIndex((s) => s.key === stepKey);
      if (index >= 0) {
        setCurrentStep(index);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [steps]
  );

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const headers: Record<string, string> = {};

      if (magicToken) {
        headers["x-magic-token"] = magicToken;
      }

      const res = await fetch(`/api/projects/${projectId}/submit`, {
        method: "POST",
        headers,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // If already submitted (409), treat as success
        if (res.status === 409) {
          setIsSubmitted(true);
          return;
        }
        throw new Error(body.error || "Failed to submit");
      }

      setIsSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(`Brief submission error: ${message}. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isSubmitted) {
    // Show account creation CTA only for unauthenticated magic link users
    const showAccountCTA = !!magicToken;

    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Confetti burst */}
        <ConfettiBurst />
        <Card className="w-full max-w-md relative z-10">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 animate-[selection-pop_0.5s_ease-out]">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Brief Submitted!</h2>
            <p className="mb-8 text-muted-foreground">
              Thanks, {clientName}! Your creative brief has been sent to{" "}
              {designerName}. They&apos;ll be in touch soon.
            </p>

            {showAccountCTA && (
              <>
                <div className="mb-6 rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-6 text-left">
                  <div className="mb-4 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Create a free account</h3>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Keep track of all your projects in one place:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span>View all your briefs from different designers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span>Resume incomplete projects anytime</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span>Get notified when briefs are completed</span>
                    </li>
                  </ul>
                </div>
                <Button asChild className="w-full h-11 sm:h-10 mb-3">
                  <Link href={`/signup?email=${encodeURIComponent(clientEmail)}&project_id=${projectId}`}>
                    Create Free Account
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <Link href={`/signin?redirect=/brief/${projectId}`} className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepConfig = steps[currentStep];
  const StepComponent = currentStepConfig.component;

  // Transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");
  const contentRef = useRef<HTMLDivElement>(null);

  // Wrap navigation with transitions
  const originalHandleNext = handleNext;
  const originalHandlePrev = handlePrev;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleNextWithTransition = useCallback(() => {
    setSlideDirection("left");
    setIsTransitioning(true);
    setTimeout(() => {
      originalHandleNext();
      setIsTransitioning(false);
    }, 200);
  }, [originalHandleNext]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handlePrevWithTransition = useCallback(() => {
    setSlideDirection("right");
    setIsTransitioning(true);
    setTimeout(() => {
      originalHandlePrev();
      setIsTransitioning(false);
    }, 200);
  }, [originalHandlePrev]);

  const goToStepByKeyWithTransition = useCallback(
    (stepKey: string) => {
      const index = steps.findIndex((s) => s.key === stepKey);
      if (index >= 0) {
        setSlideDirection(index > currentStep ? "left" : "right");
        setIsTransitioning(true);
        setTimeout(() => {
          goToStepByKey(stepKey);
          setIsTransitioning(false);
        }, 200);
      }
    },
    [steps, currentStep, goToStepByKey]
  );

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8 relative">
      {/* Milestone celebration */}
      {celebrationStep !== null && (
        <MilestoneCelebration 
          message={milestones.find(m => m.step === celebrationStep)?.message || "Great progress!"} 
          step={celebrationStep}
        />
      )}

      {/* Enhanced progress display */}
      <EnhancedProgress
        currentStep={currentStep}
        totalSteps={steps.length}
        completedSteps={completedSteps}
        estimatedTimeRemaining={estimatedTimeRemaining}
      />
      
      {/* Current step label */}
      <div className="mb-6">
        <p
          className={cn(
            "text-lg font-semibold transition-all duration-300",
            isTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
          )}
        >
          {currentStepConfig.label}
        </p>
      </div>

      {/* Step Content with slide/fade transition */}
      <div
        ref={contentRef}
        className={cn(
          "transition-all duration-200 ease-out",
          isTransitioning
            ? cn(
                "opacity-0",
                slideDirection === "left" ? "-translate-x-4" : "translate-x-4"
              )
            : "opacity-100 translate-x-0"
        )}
      >
        <StepComponent
          projectId={projectId}
          projectType={projectType}
          data={responses[currentStepConfig.key]}
          onSave={handleSave}
          onNext={handleNextWithTransition}
          onPrev={handlePrevWithTransition}
          isFirst={currentStep === 0}
          isLast={currentStep === steps.length - 1}
          allResponses={responses}
          goToStep={goToStepByKeyWithTransition}
          magicToken={magicToken}
          designerName={designerName}
          clientName={clientName}
        />
      </div>

      {/* Navigation (for last step: submit button) */}
      {currentStep === steps.length - 1 && (
        <div className="mt-6 flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrevWithTransition}
            className="h-11 sm:h-10 active:scale-95 transition-transform"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="h-11 sm:h-10 active:scale-95 transition-transform"
          >
            {isSaving ? "Submitting..." : "Submit Brief"}
          </Button>
        </div>
      )}

      {/* Saving indicator */}
      {isSaving && (
        <p className="mt-4 text-center text-sm text-muted-foreground animate-pulse">
          Saving...
        </p>
      )}
    </div>
  );
}
