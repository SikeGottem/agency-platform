"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Palette,
  Globe,
  Layout,
  BookOpen,
  ShoppingCart,
  PenTool,
  Megaphone,
  Camera,
  Layers,
  Monitor,
  Printer,
  MapPin,
  Shirt,
  Share2,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

/* ── Deliverable definitions per project type ── */

interface DeliverableOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const BRANDING_DELIVERABLES: DeliverableOption[] = [
  { id: "logo", label: "Logo Design", description: "Primary logo + variations", icon: <Palette className="h-5 w-5" />, gradient: "from-violet-500 to-purple-600" },
  { id: "brand_identity", label: "Brand Identity", description: "Complete visual system", icon: <Layers className="h-5 w-5" />, gradient: "from-blue-500 to-cyan-500" },
  { id: "brand_guidelines", label: "Brand Guidelines", description: "Usage rules & standards", icon: <BookOpen className="h-5 w-5" />, gradient: "from-emerald-500 to-teal-500" },
  { id: "business_cards", label: "Business Cards", description: "Print-ready card design", icon: <FileText className="h-5 w-5" />, gradient: "from-orange-500 to-amber-500" },
  { id: "social_templates", label: "Social Templates", description: "Ready-to-use social posts", icon: <Share2 className="h-5 w-5" />, gradient: "from-pink-500 to-rose-500" },
  { id: "brand_strategy", label: "Brand Strategy", description: "Positioning & messaging", icon: <PenTool className="h-5 w-5" />, gradient: "from-indigo-500 to-blue-600" },
];

const WEB_DELIVERABLES: DeliverableOption[] = [
  { id: "landing_page", label: "Landing Page", description: "Single high-impact page", icon: <Layout className="h-5 w-5" />, gradient: "from-blue-500 to-indigo-600" },
  { id: "full_website", label: "Full Website", description: "Multi-page website", icon: <Globe className="h-5 w-5" />, gradient: "from-violet-500 to-purple-600" },
  { id: "website_redesign", label: "Website Redesign", description: "Refresh existing site", icon: <Monitor className="h-5 w-5" />, gradient: "from-emerald-500 to-teal-500" },
  { id: "ecommerce", label: "E-commerce Store", description: "Online shop setup", icon: <ShoppingCart className="h-5 w-5" />, gradient: "from-orange-500 to-amber-500" },
  { id: "blog", label: "Blog", description: "Content publishing platform", icon: <BookOpen className="h-5 w-5" />, gradient: "from-pink-500 to-rose-500" },
  { id: "web_app", label: "Web Application", description: "Interactive web app", icon: <Layers className="h-5 w-5" />, gradient: "from-cyan-500 to-blue-500" },
];

const SOCIAL_DELIVERABLES: DeliverableOption[] = [
  { id: "social_templates", label: "Social Templates", description: "Reusable post designs", icon: <Share2 className="h-5 w-5" />, gradient: "from-pink-500 to-rose-500" },
  { id: "ad_creative", label: "Ad Creative", description: "Paid campaign visuals", icon: <Megaphone className="h-5 w-5" />, gradient: "from-violet-500 to-purple-600" },
  { id: "campaign_assets", label: "Campaign Assets", description: "Full campaign package", icon: <Layers className="h-5 w-5" />, gradient: "from-blue-500 to-cyan-500" },
  { id: "story_templates", label: "Story Templates", description: "Instagram/TikTok stories", icon: <Camera className="h-5 w-5" />, gradient: "from-orange-500 to-amber-500" },
  { id: "profile_images", label: "Profile & Cover Images", description: "Platform branding", icon: <ImageIcon className="h-5 w-5" />, gradient: "from-emerald-500 to-teal-500" },
  { id: "content_calendar", label: "Content Calendar", description: "Visual planning layout", icon: <BookOpen className="h-5 w-5" />, gradient: "from-indigo-500 to-blue-600" },
];

function getDeliverablesForType(projectType: string): DeliverableOption[] {
  switch (projectType) {
    case "branding": return BRANDING_DELIVERABLES;
    case "web_design": return WEB_DELIVERABLES;
    case "social_media": return SOCIAL_DELIVERABLES;
    default: return BRANDING_DELIVERABLES;
  }
}

/* ── Usage context definitions ── */

interface UsageOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  gradient: string;
}

const USAGE_CONTEXTS: UsageOption[] = [
  { id: "web", label: "Web", icon: <Globe className="h-5 w-5" />, gradient: "from-blue-500 to-indigo-500" },
  { id: "print", label: "Print", icon: <Printer className="h-5 w-5" />, gradient: "from-amber-500 to-orange-500" },
  { id: "signage", label: "Signage", icon: <MapPin className="h-5 w-5" />, gradient: "from-emerald-500 to-green-500" },
  { id: "merch", label: "Merch", icon: <Shirt className="h-5 w-5" />, gradient: "from-pink-500 to-rose-500" },
  { id: "social", label: "Social", icon: <Share2 className="h-5 w-5" />, gradient: "from-violet-500 to-purple-500" },
  { id: "packaging", label: "Packaging", icon: <Package className="h-5 w-5" />, gradient: "from-cyan-500 to-teal-500" },
];

/* ── Types ── */

interface UploadedAsset {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface ProjectScopeData {
  deliverables: string[];
  usageContexts: string[];
  hasExistingAssets: boolean;
  uploadedAssets?: UploadedAsset[];
}

/* ── Component ── */

export function ProjectScopeStep({
  projectId,
  projectType,
  data,
  onSave,
  onNext,
  onPrev,
  isFirst,
}: StepProps) {
  const existingData = data as ProjectScopeData | undefined;
  const deliverableOptions = getDeliverablesForType(projectType);

  const [deliverables, setDeliverables] = useState<string[]>(existingData?.deliverables ?? []);
  const [usageContexts, setUsageContexts] = useState<string[]>(existingData?.usageContexts ?? []);
  const [hasExistingAssets, setHasExistingAssets] = useState(existingData?.hasExistingAssets ?? false);
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>(existingData?.uploadedAssets ?? []);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const buildFormData = useCallback((): ProjectScopeData => ({
    deliverables,
    usageContexts,
    hasExistingAssets,
    uploadedAssets,
  }), [deliverables, usageContexts, hasExistingAssets, uploadedAssets]);

  // Auto-save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onSave("project_scope", buildFormData());
    }, 800);
  }, [buildFormData, onSave]);

  useEffect(() => {
    if (deliverables.length > 0 || usageContexts.length > 0) {
      autoSave();
    }
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [deliverables, usageContexts, hasExistingAssets, uploadedAssets, autoSave]);

  function toggleDeliverable(id: string) {
    setDeliverables((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  function toggleUsageContext(id: string) {
    setUsageContexts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const supabase = createClient();

    try {
      const newAssets: UploadedAsset[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${projectId}/assets/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage
          .from("brand-assets")
          .upload(path, file, { upsert: false });

        if (error) {
          console.error("Upload error:", error);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("brand-assets")
          .getPublicUrl(path);

        newAssets.push({
          name: file.name,
          url: urlData.publicUrl,
          type: file.type,
          size: file.size,
        });
      }

      setUploadedAssets((prev) => [...prev, ...newAssets]);
      if (!hasExistingAssets && newAssets.length > 0) {
        setHasExistingAssets(true);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeAsset(index: number) {
    setUploadedAssets((prev) => prev.filter((_, i) => i !== index));
  }

  function isImageFile(type: string) {
    return type.startsWith("image/");
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (deliverables.length === 0) newErrors.deliverables = "Select at least one deliverable";
    if (usageContexts.length === 0) newErrors.usageContexts = "Select at least one usage context";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleNext() {
    if (!validate()) return;
    await onSave("project_scope", buildFormData());
    onNext();
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto" data-testid="project-scope-step">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-2">
          <Layers className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Project Scope</h2>
        <p className="text-muted-foreground">
          Tell us what you need and where you&apos;ll use it.
        </p>
      </div>

      {/* Deliverables */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          What do you need? <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-muted-foreground -mt-1">Select all that apply.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="deliverables-grid">
          {deliverableOptions.map((opt) => {
            const selected = deliverables.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleDeliverable(opt.id)}
                className={cn(
                  "relative group rounded-xl border-2 p-4 text-left transition-all duration-300",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  selected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/40 hover:shadow-sm"
                )}
                data-testid={`deliverable-${opt.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br text-white transition-transform duration-300",
                    opt.gradient,
                    selected && "scale-110"
                  )}>
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{opt.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
                  </div>
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300",
                    selected
                      ? "bg-primary border-primary text-primary-foreground scale-110"
                      : "border-muted-foreground/30"
                  )}>
                    {selected && <Check className="h-3.5 w-3.5" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {errors.deliverables && (
          <p className="text-sm text-red-500">{errors.deliverables}</p>
        )}
      </div>

      {/* Usage Context */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          Where will this be used? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" data-testid="usage-context-grid">
          {USAGE_CONTEXTS.map((ctx) => {
            const selected = usageContexts.includes(ctx.id);
            return (
              <button
                key={ctx.id}
                type="button"
                onClick={() => toggleUsageContext(ctx.id)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-300",
                  "hover:scale-[1.03] active:scale-[0.97]",
                  selected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/40 hover:shadow-sm"
                )}
                data-testid={`usage-${ctx.id}`}
              >
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br text-white transition-transform duration-300",
                  ctx.gradient,
                  selected && "scale-110"
                )}>
                  {ctx.icon}
                </div>
                <span className="text-sm font-medium">{ctx.label}</span>
                {selected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {errors.usageContexts && (
          <p className="text-sm text-red-500">{errors.usageContexts}</p>
        )}
      </div>

      {/* Existing Brand Assets */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Existing Brand Assets</label>
        <p className="text-sm text-muted-foreground -mt-1">
          Upload any existing logos, fonts, or brand files you&apos;d like us to work with.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.ai,.eps,.svg,.psd,.sketch,.fig"
          onChange={handleFileUpload}
          className="hidden"
          data-testid="file-input"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "w-full border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200",
            "hover:border-primary/50 hover:bg-primary/5",
            uploading && "opacity-50 cursor-not-allowed"
          )}
          data-testid="upload-button"
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <div className="text-sm font-medium">
            {uploading ? "Uploading..." : "Click to upload files"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Images, PDFs, AI, EPS, SVG, PSD, Sketch, Figma
          </div>
        </button>

        {/* Uploaded file previews */}
        {uploadedAssets.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3" data-testid="uploaded-assets">
            {uploadedAssets.map((asset, index) => (
              <div
                key={`${asset.name}-${index}`}
                className="relative group rounded-lg border overflow-hidden bg-muted/30"
              >
                {isImageFile(asset.type) ? (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div className="w-full h-24 flex items-center justify-center bg-muted/50">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="p-2">
                  <div className="text-xs font-medium truncate">{asset.name}</div>
                  <div className="text-xs text-muted-foreground">{formatFileSize(asset.size)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAsset(index)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  data-testid={`remove-asset-${index}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
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
