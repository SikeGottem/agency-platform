/**
 * Application-level types for Briefed
 */

// ===========================
// Lifecycle Phases
// ===========================
export const LIFECYCLE_PHASES = [
  "discovery",
  "proposal",
  "design",
  "feedback",
  "revision",
  "delivery",
  "completed",
] as const;
export type LifecyclePhase = (typeof LIFECYCLE_PHASES)[number];

// ===========================
// Lifecycle State (DB row)
// ===========================
export interface LifecycleState {
  id: string;
  project_id: string;
  current_phase: LifecyclePhase;
  phase_started_at: string;
  phases_completed: CompletedPhase[];
  blockers: Blocker[];
  client_health_score: number;
  updated_at: string;
}

export interface CompletedPhase {
  phase: LifecyclePhase;
  started_at: string;
  completed_at: string;
}

export interface Blocker {
  id: string;
  description: string;
  severity: "low" | "medium" | "high";
  created_at: string;
  resolved_at?: string;
}

// ===========================
// Scope Document (DB row)
// ===========================
export interface ScopeDocument {
  id: string;
  project_id: string;
  version: number;
  deliverables: ScopeDeliverable[];
  constraints: ScopeConstraints;
  change_orders: unknown[];
  created_at: string;
}

export interface ScopeDeliverable {
  name: string;
  description: string;
  completed: boolean;
}

export interface ScopeConstraints {
  budget_cents?: number;
  deadline?: string;
  max_revisions?: number;
}

// ===========================
// Invoice (DB row)
// ===========================
export const INVOICE_STATUSES = ["draft", "sent", "paid", "overdue"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export interface Invoice {
  id: string;
  project_id: string;
  designer_id: string;
  client_email: string;
  amount_cents: number;
  currency: string;
  status: InvoiceStatus;
  stripe_invoice_id?: string;
  due_date?: string;
  paid_at?: string;
  line_items: InvoiceLineItem[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  description: string;
  amount_cents: number;
  quantity: number;
}

// ===========================
// Change Order (DB row)
// ===========================
export const CHANGE_ORDER_IMPACTS = ["timeline", "budget", "both"] as const;
export type ChangeOrderImpact = (typeof CHANGE_ORDER_IMPACTS)[number];

export const CHANGE_ORDER_STATUSES = ["proposed", "approved", "rejected"] as const;
export type ChangeOrderStatus = (typeof CHANGE_ORDER_STATUSES)[number];

export interface ChangeOrder {
  id: string;
  scope_document_id: string;
  description: string;
  impact: ChangeOrderImpact;
  status: ChangeOrderStatus;
  requested_by: string;
  created_at: string;
}

// ===========================
// Project Types
// ===========================
export const PROJECT_TYPES = [
  "branding",
  "web_design",
  "social_media",
  "packaging",
  "illustration",
  "ui_ux",
  "print",
  "motion",
  "app_design",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  branding: "Branding",
  web_design: "Web Design",
  social_media: "Social Media",
  packaging: "Packaging",
  illustration: "Illustration",
  ui_ux: "UI/UX Design",
  print: "Print Design",
  motion: "Motion Design",
  app_design: "App Design",
};

export const PROJECT_TYPE_ICONS: Record<ProjectType, string> = {
  branding: "Palette",
  web_design: "Globe",
  social_media: "Share2",
  packaging: "Package",
  illustration: "PenTool",
  ui_ux: "Layout",
  print: "Printer",
  motion: "Play",
  app_design: "Smartphone",
};

export interface ProjectTypeRecord {
  id: string;
  designer_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  questionnaire_config: Record<string, unknown>;
  created_at: string;
}

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
