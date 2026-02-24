import { z } from "zod";

// ===========================
// Auth Schemas
// ===========================

export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
  fullName: z.string().min(1, "Full name is required").max(100),
  role: z.enum(["designer", "client"], {
    error: "Please select your role",
  }),
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type MagicLinkFormData = z.infer<typeof magicLinkSchema>;

// ===========================
// Project Schemas
// ===========================

export const createProjectSchema = z.object({
  clientEmail: z.string().email("Please enter a valid client email"),
  clientName: z.string().min(1, "Client name is required").max(100),
  projectType: z.enum(["branding", "web_design", "social_media"]),
  templateId: z.string().uuid().optional(),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

// ===========================
// Questionnaire Step Schemas
// ===========================

export const competitorSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export const businessInfoSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  customIndustry: z.string().optional(),
  description: z.string().min(10, "Please provide a brief description (at least 10 characters)").max(300, "Maximum 300 characters"),
  targetAudience: z.array(z.string()).min(1, "Select at least one target audience"),
  customAudiences: z.array(z.string()).optional(),
  competitors: z.array(competitorSchema).optional(),
});

export type CompetitorEntry = z.infer<typeof competitorSchema>;

export const projectScopeSchema = z.object({
  deliverables: z.array(z.string()).min(1, "Select at least one deliverable"),
  usageContexts: z.array(z.string()).min(1, "Select where this will be used"),
  hasExistingAssets: z.boolean(),
  uploadedAssets: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
});

export const styleDirectionSchema = z.object({
  selectedStyles: z
    .array(z.string())
    .min(3, "Select at least 3 styles")
    .max(5, "Select up to 5 styles"),
  brandInspiration: z.array(z.string()).optional(),
  antiInspiration: z.array(z.string()).optional(),
});

export const colorPreferencesSchema = z.object({
  selectedPalettes: z.array(z.array(z.string())).optional(),
  customColors: z.array(z.string()).optional(),
  avoidColors: z.array(z.string()).optional(),
});

export const typographyFeelSchema = z.object({
  preferSerif: z.boolean().optional(),
  fontStyles: z.array(z.string()).optional(),
});

export const pagesFunctionalitySchema = z.object({
  pages: z.array(z.string()).min(1, "Select at least one page"),
  functionality: z.array(z.string()).optional(),
  referenceUrls: z.array(z.string().url()).optional(),
});

export const platformsContentSchema = z.object({
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  contentTypes: z.array(z.string()).min(1, "Select at least one content type"),
  postFrequency: z.string().optional(),
});

export const timelineBudgetSchema = z.object({
  timeline: z.string().min(1, "Select a timeline"),
  budgetRange: z.string().min(1, "Select a budget range"),
  priorities: z.array(z.string()).min(1, "Rank at least one priority"),
});

export const finalThoughtsSchema = z.object({
  additionalNotes: z.string().optional(),
});

export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;
export type ProjectScopeFormData = z.infer<typeof projectScopeSchema>;
export type StyleDirectionFormData = z.infer<typeof styleDirectionSchema>;
export type ColorPreferencesFormData = z.infer<typeof colorPreferencesSchema>;
export type TypographyFeelFormData = z.infer<typeof typographyFeelSchema>;
export type PagesFunctionalityFormData = z.infer<typeof pagesFunctionalitySchema>;
export type PlatformsContentFormData = z.infer<typeof platformsContentSchema>;
export type TimelineBudgetFormData = z.infer<typeof timelineBudgetSchema>;
export type FinalThoughtsFormData = z.infer<typeof finalThoughtsSchema>;

// ===========================
// Profile Schema
// ===========================

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  businessName: z.string().max(100).optional(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color").optional().nullable(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
