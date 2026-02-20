"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram", emoji: "📸" },
  { value: "facebook", label: "Facebook", emoji: "👥" },
  { value: "twitter", label: "Twitter / X", emoji: "🐦" },
  { value: "linkedin", label: "LinkedIn", emoji: "💼" },
  { value: "tiktok", label: "TikTok", emoji: "🎵" },
  { value: "youtube", label: "YouTube", emoji: "▶️" },
  { value: "pinterest", label: "Pinterest", emoji: "📌" },
  { value: "threads", label: "Threads", emoji: "🧵" },
];

const CONTENT_TYPES = [
  { value: "static_posts", label: "Static Posts / Images" },
  { value: "carousels", label: "Carousels / Slideshows" },
  { value: "stories", label: "Stories" },
  { value: "reels_shorts", label: "Reels / Shorts" },
  { value: "videos", label: "Long-form Videos" },
  { value: "infographics", label: "Infographics" },
  { value: "quotes", label: "Quote Graphics" },
  { value: "behind_scenes", label: "Behind-the-Scenes Content" },
  { value: "ugc", label: "User-Generated Content" },
  { value: "announcements", label: "Announcements / Updates" },
];

const POSTING_FREQUENCIES = [
  { value: "daily", label: "Daily", description: "7+ posts per week" },
  { value: "3-5_week", label: "3-5 times a week", description: "Regular presence" },
  { value: "1-2_week", label: "1-2 times a week", description: "Consistent but light" },
  { value: "few_month", label: "A few times a month", description: "Occasional updates" },
  { value: "not_sure", label: "Not sure yet", description: "Still figuring it out" },
];

interface PlatformsData {
  platforms: string[];
  contentTypes: string[];
  postingFrequency: string;
  campaignGoal?: string;
}

export function PlatformsContentStep({ data, onSave, onNext, onPrev }: StepProps) {
  const existingData = data as PlatformsData | undefined;
  const [platforms, setPlatforms] = useState<string[]>(existingData?.platforms ?? []);
  const [contentTypes, setContentTypes] = useState<string[]>(existingData?.contentTypes ?? []);
  const [postingFrequency, setPostingFrequency] = useState<string>(
    existingData?.postingFrequency ?? ""
  );
  const [campaignGoal, setCampaignGoal] = useState(existingData?.campaignGoal ?? "");
  const [error, setError] = useState<string | null>(null);

  function togglePlatform(platform: string) {
    setError(null);
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }

  function toggleContentType(type: string) {
    setContentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function handleNext() {
    if (platforms.length === 0) {
      setError("Please select at least one social media platform");
      return;
    }
    if (contentTypes.length === 0) {
      setError("Please select at least one content type");
      return;
    }
    if (!postingFrequency) {
      setError("Please select a posting frequency");
      return;
    }
    await onSave("platforms_content", {
      platforms,
      contentTypes,
      postingFrequency,
      campaignGoal,
    });
    onNext();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platforms & Content</CardTitle>
        <CardDescription>
          Tell us about your social media needs and goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Social Platforms */}
        <div>
          <h3 className="mb-3 text-sm font-medium">
            Which Platforms? (select all that apply)
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SOCIAL_PLATFORMS.map((platform) => {
              const isSelected = platforms.includes(platform.value);
              return (
                <button
                  key={platform.value}
                  type="button"
                  onClick={() => togglePlatform(platform.value)}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all hover:shadow-md ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  <span className="text-3xl">{platform.emoji}</span>
                  <span className="text-sm font-medium">{platform.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {platforms.length} selected
          </p>
        </div>

        {/* Content Types */}
        <div>
          <h3 className="mb-3 text-sm font-medium">
            Content Types (select all that apply)
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CONTENT_TYPES.map((type) => (
              <label
                key={type.value}
                className="flex cursor-pointer items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted"
              >
                <Checkbox
                  checked={contentTypes.includes(type.value)}
                  onCheckedChange={() => toggleContentType(type.value)}
                />
                <span className="text-sm">{type.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {contentTypes.length} selected
          </p>
        </div>

        {/* Posting Frequency */}
        <div>
          <h3 className="mb-3 text-sm font-medium">
            Posting Frequency
          </h3>
          <RadioGroup value={postingFrequency} onValueChange={setPostingFrequency}>
            <div className="space-y-2">
              {POSTING_FREQUENCIES.map((freq) => (
                <div
                  key={freq.value}
                  className="flex items-start space-x-3 rounded-md border p-3"
                >
                  <RadioGroupItem value={freq.value} id={freq.value} />
                  <Label htmlFor={freq.value} className="flex-1 cursor-pointer">
                    <div className="font-medium">{freq.label}</div>
                    <div className="text-xs text-muted-foreground">{freq.description}</div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Campaign Goal */}
        <div>
          <label htmlFor="campaign-goal" className="mb-2 block text-sm font-medium">
            Campaign Goal (optional)
          </label>
          <textarea
            id="campaign-goal"
            value={campaignGoal}
            onChange={(e) => setCampaignGoal(e.target.value)}
            placeholder="e.g., 'Launch new product line,' 'Increase brand awareness,' 'Drive traffic to website'"
            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            What do you hope to achieve with this social media campaign?
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
