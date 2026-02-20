/**
 * Application-level types for Briefed
 */

// ===========================
// Project Types
// ===========================
export const PROJECT_TYPES = ["branding", "web_design", "social_media"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  branding: "Branding",
  web_design: "Web Design",
  social_media: "Social Media",
};

// ===========================
// Project Status
// ===========================
export const PROJECT_STATUSES = ["draft", "sent", "in_progress", "completed", "reviewed"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Draft",
  sent: "Sent to Client",
  in_progress: "In Progress",
  completed: "Completed",
  reviewed: "Reviewed",
};

// ===========================
// User Roles
// ===========================
export const USER_ROLES = ["designer", "client"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  designer: "Designer",
  client: "Client",
};

// ===========================
// Plan Tiers
// ===========================
export const PLAN_TIERS = ["free", "pro", "team"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

// ===========================
// Asset Categories
// ===========================
export const ASSET_CATEGORIES = ["inspiration", "reference", "existing_brand"] as const;
export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

// ===========================
// Questionnaire Step Keys
// ===========================

/** Common steps shared across all project types */
export const COMMON_STEPS = [
  "welcome",
  "business_info",
  "project_scope",
  "style_direction",
  "color_preferences",
  "inspiration_upload",
  "timeline_budget",
  "final_thoughts",
] as const;

/** Branding-specific steps */
export const BRANDING_STEPS = [
  ...COMMON_STEPS.slice(0, 5),
  "typography_feel",
  ...COMMON_STEPS.slice(5),
] as const;

/** Web design-specific steps */
export const WEB_DESIGN_STEPS = [
  ...COMMON_STEPS.slice(0, 3),
  "pages_functionality",
  ...COMMON_STEPS.slice(3),
] as const;

/** Social media-specific steps */
export const SOCIAL_MEDIA_STEPS = [
  ...COMMON_STEPS.slice(0, 3),
  "platforms_content",
  ...COMMON_STEPS.slice(3),
] as const;

export type StepKey = (typeof COMMON_STEPS)[number] | "typography_feel" | "pages_functionality" | "platforms_content";

// ===========================
// Style Cards
// ===========================
export const STYLE_OPTIONS = [
  "minimalist",
  "bold",
  "playful",
  "elegant",
  "vintage",
  "modern",
  "organic",
  "geometric",
] as const;

export type StyleOption = (typeof STYLE_OPTIONS)[number];

// ===========================
// Inspiration Images
// ===========================
export interface InspirationImage {
  assetId: string;
  url: string;
  fileName: string;
  note?: string;
}

// ===========================
// Questionnaire State
// ===========================
export interface QuestionnaireState {
  currentStep: number;
  totalSteps: number;
  projectType: ProjectType;
  responses: Record<string, unknown>;
  isComplete: boolean;
}

// ===========================
// Brief Content Structure
// ===========================
export interface BriefContent {
  projectType: ProjectType;
  businessInfo: {
    companyName: string;
    industry: string;
    description: string;
    targetAudience: string[];
    competitors: string[];
  };
  projectScope: {
    deliverables: string[];
    usageContexts: string[];
    existingAssets: boolean;
  };
  styleDirection: {
    selectedStyles: StyleOption[];
    brandInspiration: string[];
    antiInspiration: string[];
  };
  colorPreferences: {
    selectedPalettes: string[][];
    avoidColors: string[];
  };
  typography?: {
    preferSerif: boolean;
    fontStyles: string[];
  };
  inspirationImages: {
    assetId: string;
    note: string;
  }[];
  timelineBudget: {
    timeline: string;
    budgetRange: string;
    priorities: string[];
  };
  additionalNotes: string;
}
