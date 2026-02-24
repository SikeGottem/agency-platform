"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil, CheckCircle2, FileText } from "lucide-react";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

const TIMELINE_LABELS: Record<string, string> = {
  asap: "ASAP (1-2 weeks)",
  month: "Within a month",
  quarter: "Within 3 months",
  flexible: "Flexible / No rush",
};

const BUDGET_LABELS: Record<string, string> = {
  under_1k: "Under $1,000",
  "1k_3k": "$1,000 - $3,000",
  "3k_5k": "$3,000 - $5,000",
  "5k_10k": "$5,000 - $10,000",
  "10k_plus": "$10,000+",
  discuss: "Let's discuss",
};

interface SectionProps {
  title: string;
  stepKey: string;
  goToStep?: (key: string) => void;
  children: React.ReactNode;
}

function Section({ title, stepKey, goToStep, children }: SectionProps) {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          {title}
        </h3>
        {goToStep && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToStep(stepKey)}
            className="text-xs h-11 px-3"
          >
            <Pencil className="mr-1 h-3 w-3" /> Edit
          </Button>
        )}
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

export function ReviewStep({ allResponses, goToStep }: StepProps) {
  const r = allResponses ?? {};

  const businessInfo = r.business_info as {
    companyName?: string;
    industry?: string;
    description?: string;
    targetAudience?: string[];
    competitors?: { name: string; url?: string }[] | string[];
  } | undefined;

  const projectScope = r.project_scope as {
    deliverables?: string[];
    usageContexts?: string[];
    hasExistingAssets?: boolean;
  } | undefined;

  const pagesFunctionality = r.pages_functionality as {
    selectedPages?: string[];
    customPages?: string[];
    functionality?: string[];
    referenceUrls?: string;
  } | undefined;

  const platformsContent = r.platforms_content as {
    platforms?: string[];
    contentTypes?: string[];
    postingFrequency?: string;
    campaignGoal?: string;
  } | undefined;

  const styleDirection = r.style_direction as {
    selectedStyles?: string[];
    antiInspiration?: string[];
    brandExamples?: string[];
  } | undefined;

  const colorPreferences = r.color_preferences as {
    selectedPalettes?: string[];
    customColors?: string[];
    avoidColors?: string[];
  } | undefined;

  const typographyFeel = r.typography_feel as {
    fontStyles?: string[];
    fontWeight?: string;
    comparisons?: Record<string, string>;
    additionalNotes?: string;
  } | undefined;

  const inspiration = r.inspiration_upload as {
    urls?: string[];
    notes?: string;
    images?: { id: string; url: string; fileName: string; note?: string }[];
  } | undefined;

  const timelineBudget = r.timeline_budget as {
    timeline?: string;
    budgetRange?: string;
    priorities?: string[];
  } | undefined;

  const finalThoughts = r.final_thoughts as {
    additionalNotes?: string;
  } | undefined;

  return (
    <div className="space-y-6 max-w-2xl mx-auto" data-testid="review-step">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white mb-2">
          <FileText className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Review Your Brief</h2>
        <p className="text-muted-foreground">
          Please review all your answers before submitting. Click &quot;Edit&quot; to make changes.
        </p>
      </div>

      {/* Business Info */}
      {businessInfo && (
        <Section title="About Your Business" stepKey="business_info" goToStep={goToStep}>
          {businessInfo.companyName && (
            <Field label="Company Name"><p>{businessInfo.companyName}</p></Field>
          )}
          {businessInfo.industry && (
            <Field label="Industry"><p>{businessInfo.industry}</p></Field>
          )}
          {businessInfo.description && (
            <Field label="Description"><p>{businessInfo.description}</p></Field>
          )}
          {businessInfo.targetAudience && businessInfo.targetAudience.length > 0 && (
            <Field label="Target Audience">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {businessInfo.targetAudience.map((a) => (
                  <Badge key={a} variant="secondary">{a}</Badge>
                ))}
              </div>
            </Field>
          )}
          {businessInfo.competitors && businessInfo.competitors.length > 0 && (
            <Field label="Competitors / Brand Inspiration">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {businessInfo.competitors.map((c, i) => (
                  <Badge key={i} variant="outline">
                    {typeof c === "string" ? c : c.name}
                  </Badge>
                ))}
              </div>
            </Field>
          )}
        </Section>
      )}

      {/* Project Scope */}
      {projectScope && (
        <Section title="Project Scope" stepKey="project_scope" goToStep={goToStep}>
          {projectScope.deliverables && projectScope.deliverables.length > 0 && (
            <Field label="Deliverables">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {projectScope.deliverables.map((d) => (
                  <Badge key={d} variant="secondary">{d}</Badge>
                ))}
              </div>
            </Field>
          )}
          {projectScope.usageContexts && projectScope.usageContexts.length > 0 && (
            <Field label="Usage Contexts">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {projectScope.usageContexts.map((u) => (
                  <Badge key={u} variant="outline">{u}</Badge>
                ))}
              </div>
            </Field>
          )}
          <Field label="Existing Assets">
            <p>{projectScope.hasExistingAssets ? "Yes" : "No"}</p>
          </Field>
        </Section>
      )}

      {/* Pages & Functionality */}
      {pagesFunctionality && (
        <Section title="Pages & Functionality" stepKey="pages_functionality" goToStep={goToStep}>
          {pagesFunctionality.selectedPages && pagesFunctionality.selectedPages.length > 0 && (
            <Field label="Required Pages">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {pagesFunctionality.selectedPages.map((page) => (
                  <Badge key={page} variant="secondary">{page.replace(/_/g, " ")}</Badge>
                ))}
              </div>
            </Field>
          )}
          {pagesFunctionality.functionality && pagesFunctionality.functionality.length > 0 && (
            <Field label="Required Functionality">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {pagesFunctionality.functionality.map((func) => (
                  <Badge key={func} variant="secondary">{func.replace(/_/g, " ")}</Badge>
                ))}
              </div>
            </Field>
          )}
        </Section>
      )}

      {/* Platforms & Content */}
      {platformsContent && (
        <Section title="Platforms & Content" stepKey="platforms_content" goToStep={goToStep}>
          {platformsContent.platforms && platformsContent.platforms.length > 0 && (
            <Field label="Social Platforms">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {platformsContent.platforms.map((p) => (
                  <Badge key={p} variant="secondary" className="capitalize">{p.replace(/_/g, " ")}</Badge>
                ))}
              </div>
            </Field>
          )}
          {platformsContent.campaignGoal && (
            <Field label="Campaign Goal"><p>{platformsContent.campaignGoal}</p></Field>
          )}
        </Section>
      )}

      {/* Style Direction */}
      {styleDirection && (styleDirection.selectedStyles?.length || styleDirection.antiInspiration?.length) && (
        <Section title="Style Direction" stepKey="style_direction" goToStep={goToStep}>
          {styleDirection.selectedStyles && styleDirection.selectedStyles.length > 0 && (
            <Field label="Styles">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {styleDirection.selectedStyles.map((s) => (
                  <Badge key={s} variant="secondary" className="capitalize">{s}</Badge>
                ))}
              </div>
            </Field>
          )}
          {styleDirection.antiInspiration && styleDirection.antiInspiration.length > 0 && (
            <Field label="Styles to Avoid">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {styleDirection.antiInspiration.map((s) => (
                  <Badge key={s} variant="destructive" className="capitalize">{s}</Badge>
                ))}
              </div>
            </Field>
          )}
          {styleDirection.brandExamples && styleDirection.brandExamples.length > 0 && (
            <Field label="Brand Examples">
              <ul className="list-disc pl-4 space-y-0.5">
                {styleDirection.brandExamples.map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all text-xs">{url}</a>
                  </li>
                ))}
              </ul>
            </Field>
          )}
        </Section>
      )}

      {/* Color Preferences */}
      {colorPreferences && (
        <Section title="Color Preferences" stepKey="color_preferences" goToStep={goToStep}>
          {colorPreferences.selectedPalettes && colorPreferences.selectedPalettes.length > 0 && (
            <Field label="Selected Palettes">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {colorPreferences.selectedPalettes.map((p) => (
                  <Badge key={p} variant="secondary">{p}</Badge>
                ))}
              </div>
            </Field>
          )}
          {colorPreferences.customColors && colorPreferences.customColors.length > 0 && (
            <Field label="Custom Colors">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {colorPreferences.customColors.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 text-xs font-mono">
                    <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: c }} />
                    {c}
                  </span>
                ))}
              </div>
            </Field>
          )}
          {colorPreferences.avoidColors && colorPreferences.avoidColors.length > 0 && (
            <Field label="Colors to Avoid">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {colorPreferences.avoidColors.map((c) => (
                  <Badge key={c} variant="destructive">{c}</Badge>
                ))}
              </div>
            </Field>
          )}
        </Section>
      )}

      {/* Typography */}
      {typographyFeel && (
        <Section title="Typography Feel" stepKey="typography_feel" goToStep={goToStep}>
          {typographyFeel.fontStyles && typographyFeel.fontStyles.length > 0 && (
            <Field label="Font Styles">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {typographyFeel.fontStyles.map((style) => (
                  <Badge key={style} variant="secondary" className="capitalize">{style.replace(/-/g, " ")}</Badge>
                ))}
              </div>
            </Field>
          )}
          {typographyFeel.fontWeight && (
            <Field label="Font Weight"><p className="capitalize">{typographyFeel.fontWeight}</p></Field>
          )}
          {typographyFeel.additionalNotes && (
            <Field label="Notes"><p>{typographyFeel.additionalNotes}</p></Field>
          )}
        </Section>
      )}

      {/* Inspiration */}
      {inspiration && (inspiration.urls?.length || inspiration.notes || inspiration.images?.length) && (
        <Section title="Inspiration" stepKey="inspiration_upload" goToStep={goToStep}>
          {inspiration.images && inspiration.images.length > 0 && (
            <Field label="Uploaded Images">
              <div className="grid grid-cols-3 gap-2 mt-1">
                {inspiration.images.map((img) => (
                  <div key={img.id} className="space-y-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.fileName} className="h-20 w-full rounded-lg object-cover" />
                    {img.note && <p className="text-xs text-muted-foreground truncate">{img.note}</p>}
                  </div>
                ))}
              </div>
            </Field>
          )}
          {inspiration.urls && inspiration.urls.length > 0 && (
            <Field label="URLs">
              <ul className="list-disc pl-4 space-y-0.5">
                {inspiration.urls.map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all text-xs">{url}</a>
                  </li>
                ))}
              </ul>
            </Field>
          )}
          {inspiration.notes && (
            <Field label="Notes"><p>{inspiration.notes}</p></Field>
          )}
        </Section>
      )}

      {/* Timeline & Budget */}
      {timelineBudget && (
        <Section title="Timeline & Budget" stepKey="timeline_budget" goToStep={goToStep}>
          {timelineBudget.timeline && (
            <Field label="Timeline">
              <p>{TIMELINE_LABELS[timelineBudget.timeline] ?? timelineBudget.timeline}</p>
            </Field>
          )}
          {timelineBudget.budgetRange && (
            <Field label="Budget Range">
              <p>{BUDGET_LABELS[timelineBudget.budgetRange] ?? timelineBudget.budgetRange}</p>
            </Field>
          )}
          {timelineBudget.priorities && timelineBudget.priorities.length > 0 && (
            <Field label="Priorities (highest first)">
              <ol className="list-decimal pl-4">
                {timelineBudget.priorities.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ol>
            </Field>
          )}
        </Section>
      )}

      {/* Final Thoughts */}
      {finalThoughts?.additionalNotes && (
        <Section title="Final Thoughts" stepKey="final_thoughts" goToStep={goToStep}>
          <p className="whitespace-pre-wrap">{finalThoughts.additionalNotes}</p>
        </Section>
      )}

      <Separator />

      <p className="text-center text-sm text-muted-foreground">
        Everything look good? Click &quot;Submit Brief&quot; below to send your brief to your designer.
      </p>
    </div>
  );
}
