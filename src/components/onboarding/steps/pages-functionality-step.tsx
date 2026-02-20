"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

const COMMON_PAGES = [
  { value: "home", label: "Home / Landing Page" },
  { value: "about", label: "About Us" },
  { value: "services", label: "Services / Products" },
  { value: "contact", label: "Contact" },
  { value: "blog", label: "Blog" },
  { value: "portfolio", label: "Portfolio / Gallery" },
  { value: "testimonials", label: "Testimonials / Reviews" },
  { value: "pricing", label: "Pricing" },
  { value: "faq", label: "FAQ" },
  { value: "team", label: "Team" },
];

const FUNCTIONALITY_OPTIONS = [
  { value: "contact_form", label: "Contact Form" },
  { value: "newsletter", label: "Newsletter Signup" },
  { value: "search", label: "Search Functionality" },
  { value: "e-commerce", label: "E-commerce / Shopping Cart" },
  { value: "user_accounts", label: "User Accounts / Login" },
  { value: "booking", label: "Booking / Scheduling" },
  { value: "payment", label: "Payment Processing" },
  { value: "cms", label: "Content Management System" },
  { value: "social_share", label: "Social Media Sharing" },
  { value: "multilingual", label: "Multi-language Support" },
  { value: "live_chat", label: "Live Chat" },
  { value: "analytics", label: "Analytics Integration" },
];

interface PagesData {
  selectedPages: string[];
  customPages: string[];
  functionality: string[];
  referenceUrls: string;
}

export function PagesFunctionalityStep({ data, onSave, onNext, onPrev }: StepProps) {
  const existingData = data as PagesData | undefined;
  const [selectedPages, setSelectedPages] = useState<string[]>(existingData?.selectedPages ?? []);
  const [customPages, setCustomPages] = useState<string[]>(existingData?.customPages ?? []);
  const [customPageInput, setCustomPageInput] = useState("");
  const [functionality, setFunctionality] = useState<string[]>(existingData?.functionality ?? []);
  const [referenceUrls, setReferenceUrls] = useState(existingData?.referenceUrls ?? "");
  const [error, setError] = useState<string | null>(null);

  function togglePage(page: string) {
    setError(null);
    setSelectedPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
    );
  }

  function addCustomPage() {
    if (!customPageInput.trim()) return;
    if (customPages.includes(customPageInput.trim())) {
      setError("This page is already added");
      return;
    }
    setCustomPages((prev) => [...prev, customPageInput.trim()]);
    setCustomPageInput("");
    setError(null);
  }

  function removeCustomPage(page: string) {
    setCustomPages((prev) => prev.filter((p) => p !== page));
  }

  function toggleFunctionality(func: string) {
    setFunctionality((prev) =>
      prev.includes(func) ? prev.filter((f) => f !== func) : [...prev, func]
    );
  }

  async function handleNext() {
    const totalPages = selectedPages.length + customPages.length;
    if (totalPages === 0) {
      setError("Please select or add at least one page");
      return;
    }
    await onSave("pages_functionality", {
      selectedPages,
      customPages,
      functionality,
      referenceUrls,
    });
    onNext();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pages & Functionality</CardTitle>
        <CardDescription>
          What pages and features do you need on your website?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Common Pages */}
        <div>
          <h3 className="mb-3 text-sm font-medium">
            Select Pages You Need
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {COMMON_PAGES.map((page) => (
              <label
                key={page.value}
                className="flex cursor-pointer items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted"
              >
                <Checkbox
                  checked={selectedPages.includes(page.value)}
                  onCheckedChange={() => togglePage(page.value)}
                />
                <span className="text-sm">{page.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Pages */}
        <div>
          <h3 className="mb-3 text-sm font-medium">
            Add Custom Pages (optional)
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Investor Relations, Press Kit"
              value={customPageInput}
              onChange={(e) => setCustomPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomPage();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addCustomPage}
              disabled={!customPageInput.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {customPages.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {customPages.map((page) => (
                <span
                  key={page}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
                >
                  {page}
                  <button
                    type="button"
                    onClick={() => removeCustomPage(page)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Functionality */}
        <div>
          <h3 className="mb-3 text-sm font-medium">
            Required Functionality (optional)
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FUNCTIONALITY_OPTIONS.map((func) => (
              <label
                key={func.value}
                className="flex cursor-pointer items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted"
              >
                <Checkbox
                  checked={functionality.includes(func.value)}
                  onCheckedChange={() => toggleFunctionality(func.value)}
                />
                <span className="text-sm">{func.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Reference URLs */}
        <div>
          <label htmlFor="reference-urls" className="mb-2 block text-sm font-medium">
            Reference Websites (optional)
          </label>
          <textarea
            id="reference-urls"
            value={referenceUrls}
            onChange={(e) => setReferenceUrls(e.target.value)}
            placeholder="Add URLs of websites you like (one per line)&#10;https://example.com&#10;https://another-example.com"
            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Share any websites whose structure or functionality you admire
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={handleNext}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
