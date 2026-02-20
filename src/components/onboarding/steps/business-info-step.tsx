"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Users,
  Trophy,
  X,
  Plus,
  Globe,
  Check,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

/* ── Constants ── */

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Fashion & Apparel",
  "Food & Beverage",
  "Finance & Banking",
  "Education",
  "Real Estate",
  "Entertainment & Media",
  "Fitness & Wellness",
  "Travel & Hospitality",
  "Retail & E-commerce",
  "Professional Services",
  "Non-Profit",
  "Art & Design",
  "Construction",
  "Automotive",
];

const TARGET_AUDIENCES = [
  "Teens & Young Adults (13-25)",
  "Young Professionals (25-35)",
  "Mid-Career Professionals (35-50)",
  "Executives & Leaders (50+)",
  "Parents & Families",
  "Small Business Owners",
  "Enterprise / Corporate",
  "Creative Professionals",
  "Tech Enthusiasts",
  "Health & Wellness Seekers",
  "Students",
  "Luxury Consumers",
];

interface CompetitorEntry {
  name: string;
  url: string;
}

interface BusinessInfoData {
  companyName: string;
  industry: string;
  customIndustry?: string;
  description: string;
  targetAudience: string[];
  customAudiences?: string[];
  competitors?: CompetitorEntry[];
}

export function BusinessInfoStep({ data, onSave, onNext, onPrev, isFirst }: StepProps) {
  const existingData = data as BusinessInfoData | undefined;

  const [companyName, setCompanyName] = useState(existingData?.companyName ?? "");
  const [industry, setIndustry] = useState(existingData?.industry ?? "");
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [customIndustry, setCustomIndustry] = useState(existingData?.customIndustry ?? "");
  const [description, setDescription] = useState(existingData?.description ?? "");
  const [targetAudience, setTargetAudience] = useState<string[]>(existingData?.targetAudience ?? []);
  const [customAudienceInput, setCustomAudienceInput] = useState("");
  const [customAudiences, setCustomAudiences] = useState<string[]>(existingData?.customAudiences ?? []);
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>(
    existingData?.competitors?.length
      ? existingData.competitors
      : [{ name: "", url: "" }]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowIndustryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const allAudiences = [...targetAudience];

  const buildFormData = useCallback((): BusinessInfoData => ({
    companyName,
    industry: industry === "Other" ? customIndustry : industry,
    customIndustry: industry === "Other" ? customIndustry : undefined,
    description,
    targetAudience: [...targetAudience, ...customAudiences],
    customAudiences,
    competitors: competitors.filter((c) => c.name.trim() !== ""),
  }), [companyName, industry, customIndustry, description, targetAudience, customAudiences, competitors]);

  // Auto-save on changes (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onSave("business_info", buildFormData());
    }, 800);
  }, [buildFormData, onSave]);

  // Trigger auto-save when data changes
  useEffect(() => {
    // Only auto-save if user has interacted (companyName exists or other fields filled)
    if (companyName || industry || description || targetAudience.length > 0) {
      autoSave();
    }
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [companyName, industry, customIndustry, description, targetAudience, customAudiences, competitors, autoSave]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!companyName.trim()) newErrors.companyName = "Company name is required";
    const effectiveIndustry = industry === "Other" ? customIndustry : industry;
    if (!effectiveIndustry.trim()) newErrors.industry = "Please select or enter an industry";
    if (description.trim().length < 10) newErrors.description = "Please provide at least 10 characters";
    if (targetAudience.length === 0 && customAudiences.length === 0)
      newErrors.targetAudience = "Select at least one target audience";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleNext() {
    if (!validate()) return;
    await onSave("business_info", buildFormData());
    onNext();
  }

  function toggleAudience(audience: string) {
    setTargetAudience((prev) =>
      prev.includes(audience) ? prev.filter((a) => a !== audience) : [...prev, audience]
    );
  }

  function addCustomAudience() {
    const trimmed = customAudienceInput.trim();
    if (trimmed && !customAudiences.includes(trimmed) && !targetAudience.includes(trimmed)) {
      setCustomAudiences((prev) => [...prev, trimmed]);
      setCustomAudienceInput("");
    }
  }

  function removeCustomAudience(audience: string) {
    setCustomAudiences((prev) => prev.filter((a) => a !== audience));
  }

  function updateCompetitor(index: number, field: "name" | "url", value: string) {
    setCompetitors((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addCompetitor() {
    if (competitors.length < 3) {
      setCompetitors((prev) => [...prev, { name: "", url: "" }]);
    }
  }

  function removeCompetitor(index: number) {
    setCompetitors((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto" data-testid="business-info-step">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white mb-2">
          <Building2 className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">About Your Business</h2>
        <p className="text-muted-foreground">
          Help us understand your brand so we can create something perfect for you.
        </p>
      </div>

      {/* Company Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="companyName">
          Company / Brand Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="companyName"
          placeholder="e.g. Acme Inc."
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className={cn(
            "h-12 text-base",
            errors.companyName && "border-red-500 focus-visible:ring-red-500"
          )}
          data-testid="company-name-input"
        />
        {errors.companyName && (
          <p className="text-sm text-red-500">{errors.companyName}</p>
        )}
      </div>

      {/* Industry Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Industry <span className="text-red-500">*</span>
        </label>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
            className={cn(
              "w-full h-12 px-4 text-left text-base border rounded-md bg-background flex items-center justify-between",
              "hover:border-primary/50 transition-colors",
              errors.industry && "border-red-500",
              !industry && "text-muted-foreground"
            )}
            data-testid="industry-selector"
          >
            <span>{industry || "Select your industry..."}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", showIndustryDropdown && "rotate-180")} />
          </button>
          {showIndustryDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-60 overflow-y-auto" data-testid="industry-dropdown">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => {
                    setIndustry(ind);
                    setShowIndustryDropdown(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2",
                    industry === ind && "bg-accent font-medium"
                  )}
                >
                  {industry === ind && <Check className="h-3.5 w-3.5 text-primary" />}
                  <span className={industry === ind ? "" : "ml-5.5"}>{ind}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIndustry("Other");
                  setShowIndustryDropdown(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 border-t",
                  industry === "Other" && "bg-accent font-medium"
                )}
              >
                {industry === "Other" && <Check className="h-3.5 w-3.5 text-primary" />}
                <span className={industry === "Other" ? "" : "ml-5.5"}>Other (specify)</span>
              </button>
            </div>
          )}
        </div>
        {industry === "Other" && (
          <Input
            placeholder="Enter your industry..."
            value={customIndustry}
            onChange={(e) => setCustomIndustry(e.target.value)}
            className="h-12 text-base mt-2"
            data-testid="custom-industry-input"
          />
        )}
        {errors.industry && (
          <p className="text-sm text-red-500">{errors.industry}</p>
        )}
      </div>

      {/* Business Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="description">
          What does your business do? <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Textarea
            id="description"
            placeholder="Briefly describe what your company does and what makes it unique..."
            value={description}
            onChange={(e) => {
              if (e.target.value.length <= 300) setDescription(e.target.value);
            }}
            rows={4}
            className={cn(
              "text-base resize-none",
              errors.description && "border-red-500 focus-visible:ring-red-500"
            )}
            data-testid="description-textarea"
          />
          <span className={cn(
            "absolute bottom-2 right-3 text-xs",
            description.length > 280 ? "text-amber-500" : "text-muted-foreground",
            description.length >= 300 && "text-red-500"
          )}>
            {description.length}/300
          </span>
        </div>
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Target Audience Multi-select */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">
            Target Audience <span className="text-red-500">*</span>
          </label>
        </div>
        <p className="text-sm text-muted-foreground -mt-1">
          Select all that apply, or add your own.
        </p>
        <div className="flex flex-wrap gap-2" data-testid="audience-chips">
          {TARGET_AUDIENCES.map((audience) => {
            const selected = targetAudience.includes(audience);
            return (
              <button
                key={audience}
                type="button"
                onClick={() => toggleAudience(audience)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  selected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background hover:border-primary/50 hover:bg-accent"
                )}
              >
                {selected && <Check className="inline h-3 w-3 mr-1" />}
                {audience}
              </button>
            );
          })}
          {/* Custom audience chips */}
          {customAudiences.map((audience) => (
            <span
              key={audience}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-300 dark:border-violet-700"
            >
              {audience}
              <button
                type="button"
                onClick={() => removeCustomAudience(audience)}
                className="hover:bg-violet-200 dark:hover:bg-violet-800 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        {/* Custom audience input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom audience..."
            value={customAudienceInput}
            onChange={(e) => setCustomAudienceInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomAudience();
              }
            }}
            className="h-10"
            data-testid="custom-audience-input"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCustomAudience}
            className="h-10 px-3"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {errors.targetAudience && (
          <p className="text-sm text-red-500">{errors.targetAudience}</p>
        )}
      </div>

      {/* Competitors / Admired Brands */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">Competitors or Brands You Admire</label>
        </div>
        <p className="text-sm text-muted-foreground -mt-1">
          Up to 3 brands — these help us understand your market positioning.
        </p>
        <div className="space-y-3" data-testid="competitors-section">
          {competitors.map((comp, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder={`Brand name ${index + 1}`}
                      value={comp.name}
                      onChange={(e) => updateCompetitor(index, "name", e.target.value)}
                      className="h-10"
                      data-testid={`competitor-name-${index}`}
                    />
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        placeholder="Website URL (optional)"
                        value={comp.url}
                        onChange={(e) => updateCompetitor(index, "url", e.target.value)}
                        className="h-9 text-sm"
                        data-testid={`competitor-url-${index}`}
                      />
                    </div>
                  </div>
                  {competitors.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCompetitor(index)}
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {competitors.length < 3 && (
            <Button
              type="button"
              variant="outline"
              onClick={addCompetitor}
              className="w-full border-dashed"
              data-testid="add-competitor-button"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Another Brand
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        {!isFirst && (
          <Button type="button" variant="outline" onClick={onPrev} className="h-12 px-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        )}
        <Button
          type="button"
          onClick={handleNext}
          className={cn("h-12 px-8", isFirst && "ml-auto")}
          data-testid="next-button"
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
