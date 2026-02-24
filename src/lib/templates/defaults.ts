/**
 * Default template definitions for Briefed.
 * Each template defines the questionnaire steps for a project type.
 */

export interface TemplateQuestion {
  id: string;
  label: string;
  description?: string;
  type: "text" | "textarea" | "multiple_choice" | "image_upload" | "checkbox" | "select";
  options?: string[];
  required?: boolean;
}

export interface TemplateStep {
  key: string;
  title: string;
  description: string;
  enabled: boolean;
  builtIn: boolean; // true = part of core flow, false = custom added
  questions: TemplateQuestion[];
}

export interface TemplateData {
  name: string;
  projectType: string;
  steps: TemplateStep[];
}

// ——— Shared steps ———

const welcomeStep: TemplateStep = {
  key: "welcome",
  title: "Welcome",
  description: "Introduction and overview of the questionnaire process.",
  enabled: true,
  builtIn: true,
  questions: [],
};

const businessInfoStep: TemplateStep = {
  key: "business_info",
  title: "About Your Business",
  description: "Company details, industry, target audience, and competitors.",
  enabled: true,
  builtIn: true,
  questions: [
    { id: "companyName", label: "Company Name", type: "text", required: true },
    { id: "industry", label: "Industry", type: "select", options: ["Technology", "Healthcare", "Finance", "Education", "Retail", "Food & Beverage", "Real Estate", "Creative Services", "Other"], required: true },
    { id: "description", label: "What does your business do?", type: "textarea", required: true },
    { id: "targetAudience", label: "Who are your customers?", type: "checkbox", options: ["Young Adults (18-25)", "Professionals (25-40)", "Families", "Seniors (60+)", "B2B / Businesses", "Other"], required: true },
  ],
};

const styleDirectionStep: TemplateStep = {
  key: "style_direction",
  title: "Style Direction",
  description: "Visual style preferences and brand inspiration.",
  enabled: true,
  builtIn: true,
  questions: [
    { id: "selectedStyles", label: "Pick 3-5 styles that resonate", type: "checkbox", options: ["Minimalist", "Bold", "Playful", "Elegant", "Vintage", "Modern", "Organic", "Geometric"], required: true },
    { id: "brandInspiration", label: "Brands you admire (URLs or names)", type: "textarea" },
    { id: "antiInspiration", label: "Styles that do NOT feel like you", type: "textarea" },
  ],
};

const colorPreferencesStep: TemplateStep = {
  key: "color_preferences",
  title: "Color Preferences",
  description: "Color palette selection and color avoidance.",
  enabled: true,
  builtIn: true,
  questions: [
    { id: "colorDirection", label: "Describe the color feeling you want", type: "textarea" },
    { id: "avoidColors", label: "Any colors to absolutely avoid?", type: "text" },
  ],
};

const inspirationUploadStep: TemplateStep = {
  key: "inspiration_upload",
  title: "Inspiration Upload",
  description: "Upload images, screenshots, or references that inspire you.",
  enabled: true,
  builtIn: true,
  questions: [
    { id: "inspirationImages", label: "Upload inspiration images", type: "image_upload" },
    { id: "inspirationNotes", label: "What do you like about these?", type: "textarea" },
  ],
};

const timelineBudgetStep: TemplateStep = {
  key: "timeline_budget",
  title: "Timeline & Budget",
  description: "Project timeline, budget range, and priorities.",
  enabled: true,
  builtIn: true,
  questions: [
    { id: "timeline", label: "Ideal timeline", type: "select", options: ["1-2 weeks", "2-4 weeks", "1-2 months", "2-3 months", "Flexible"], required: true },
    { id: "budgetRange", label: "Budget range", type: "select", options: ["Under $1,000", "$1,000 - $3,000", "$3,000 - $5,000", "$5,000 - $10,000", "$10,000+", "Not sure yet"], required: true },
  ],
};

const finalThoughtsStep: TemplateStep = {
  key: "final_thoughts",
  title: "Final Thoughts",
  description: "Anything else the designer should know.",
  enabled: true,
  builtIn: true,
  questions: [
    { id: "additionalNotes", label: "Anything else you'd like to share?", type: "textarea" },
  ],
};

// ——— Project-type-specific steps ———

const projectScopeBrandingStep: TemplateStep = {
  key: "project_scope",
  title: "Project Scope",
  description: "What branding deliverables do you need?",
  enabled: true,
  builtIn: true,
  questions: [
    { id: "deliverables", label: "What do you need?", type: "checkbox", options: ["Logo Design", "Full Brand Identity", "Brand Guidelines", "Business Cards", "Social Media Templates", "Letterhead & Stationery"], required: true },
    { id: "usageContexts", label: "Where will this be used?", type: "checkbox", options: ["Website", "Print", "Signage", "Merchandise", "Social Media", "Packaging"], required: true },
  ],
};

const typographyFeelStep: TemplateStep = {
  key: "typography_feel",
  title: "Typography Feel",
  description: "Font style and typography preferences.",
  enabled: true,
  builtIn: true,
  questions: [
    { id: "serifPreference", label: "Does your brand feel more serif or sans-serif?", type: "multiple_choice", options: ["Serif (traditional, trustworthy)", "Sans-serif (modern, clean)", "No preference"] },
    { id: "fontStyles", label: "Font characteristics", type: "checkbox", options: ["Bold & Strong", "Light & Airy", "Handwritten / Script", "Geometric", "Classic / Timeless"] },
  ],
};

const projectScopeWebStep: TemplateStep = {
  key: "project_scope",
  title: "Project Scope",
  description: "What web design deliverables do you need?",
  enabled: true,
  builtIn: true,
  questions: [
    { id: "deliverables", label: "What do you need?", type: "checkbox", options: ["Landing Page", "Full Website Redesign", "New Website", "E-commerce Store", "Web Application UI"], required: true },
    { id: "usageContexts", label: "Primary platforms", type: "checkbox", options: ["Desktop", "Mobile", "Tablet"], required: true },
  ],
};

const pagesFunctionalityStep: TemplateStep = {
  key: "pages_functionality",
  title: "Pages & Functionality",
  description: "What pages and features does your site need?",
  enabled: true,
  builtIn: true,
  questions: [
    { id: "pages", label: "What pages do you need?", type: "checkbox", options: ["Home", "About", "Services", "Portfolio", "Blog", "Contact", "Pricing", "FAQ", "Login / Sign Up"], required: true },
    { id: "functionality", label: "Special functionality", type: "checkbox", options: ["Contact Form", "Newsletter Signup", "E-commerce / Cart", "Booking / Scheduling", "Search", "User Accounts", "CMS / Blog"] },
    { id: "referenceUrls", label: "Websites you admire (URLs)", type: "textarea" },
  ],
};

const projectScopeSocialStep: TemplateStep = {
  key: "project_scope",
  title: "Project Scope",
  description: "What social media deliverables do you need?",
  enabled: true,
  builtIn: true,
  questions: [
    { id: "deliverables", label: "What do you need?", type: "checkbox", options: ["Post Templates", "Story Templates", "Ad Creative", "Profile / Cover Images", "Content Calendar", "Campaign Assets"], required: true },
    { id: "usageContexts", label: "Usage", type: "checkbox", options: ["Organic Posts", "Paid Ads", "Stories / Reels", "Email Headers"], required: true },
  ],
};

const platformsContentStep: TemplateStep = {
  key: "platforms_content",
  title: "Platforms & Content",
  description: "Which social platforms and content types?",
  enabled: true,
  builtIn: true,
  questions: [
    { id: "platforms", label: "Which platforms?", type: "checkbox", options: ["Instagram", "Facebook", "Twitter / X", "LinkedIn", "TikTok", "Pinterest", "YouTube"], required: true },
    { id: "contentTypes", label: "Content types", type: "checkbox", options: ["Static Posts", "Carousel / Slides", "Short-form Video", "Stories", "Infographics", "Ads"], required: true },
    { id: "postFrequency", label: "How often do you post?", type: "select", options: ["Daily", "A few times a week", "Weekly", "A few times a month", "Not sure yet"] },
  ],
};

// ——— Default Templates ———

export const DEFAULT_TEMPLATES: TemplateData[] = [
  {
    name: "Branding",
    projectType: "branding",
    steps: [
      welcomeStep,
      businessInfoStep,
      projectScopeBrandingStep,
      styleDirectionStep,
      colorPreferencesStep,
      typographyFeelStep,
      inspirationUploadStep,
      timelineBudgetStep,
      finalThoughtsStep,
    ],
  },
  {
    name: "Web Design",
    projectType: "web_design",
    steps: [
      welcomeStep,
      businessInfoStep,
      projectScopeWebStep,
      pagesFunctionalityStep,
      styleDirectionStep,
      colorPreferencesStep,
      inspirationUploadStep,
      timelineBudgetStep,
      finalThoughtsStep,
    ],
  },
  {
    name: "Social Media",
    projectType: "social_media",
    steps: [
      welcomeStep,
      businessInfoStep,
      projectScopeSocialStep,
      platformsContentStep,
      styleDirectionStep,
      colorPreferencesStep,
      inspirationUploadStep,
      timelineBudgetStep,
      finalThoughtsStep,
    ],
  },
  {
    name: "Packaging",
    projectType: "packaging",
    steps: [
      welcomeStep,
      businessInfoStep,
      { ...projectScopeBrandingStep, key: "project_scope", title: "Project Scope", description: "What packaging deliverables do you need?", questions: [
        { id: "deliverables", label: "What do you need?", type: "checkbox", options: ["Product Box", "Label Design", "Bag / Pouch", "Bottle / Can Wrap", "Shipping Box", "Insert / Tissue Paper", "Unboxing Experience"], required: true },
        { id: "usageContexts", label: "Where will this be sold?", type: "checkbox", options: ["Retail Shelf", "E-commerce", "Subscription Box", "Wholesale", "Direct to Consumer"], required: true },
        { id: "productDetails", label: "Describe your product and its dimensions", type: "textarea", required: true },
      ]},
      styleDirectionStep,
      colorPreferencesStep,
      inspirationUploadStep,
      timelineBudgetStep,
      finalThoughtsStep,
    ],
  },
  {
    name: "Illustration",
    projectType: "illustration",
    steps: [
      welcomeStep,
      businessInfoStep,
      { key: "project_scope", title: "Project Scope", description: "What illustration work do you need?", enabled: true, builtIn: true, questions: [
        { id: "deliverables", label: "What do you need?", type: "checkbox", options: ["Custom Illustrations", "Icon Set", "Character Design", "Infographics", "Editorial Illustration", "Pattern Design", "Spot Illustrations"], required: true },
        { id: "usageContexts", label: "Where will these be used?", type: "checkbox", options: ["Website", "Print", "Social Media", "Merchandise", "Editorial", "Packaging", "App / UI"], required: true },
        { id: "illustrationStyle", label: "Describe the illustration style you're looking for", type: "textarea" },
      ]},
      styleDirectionStep,
      colorPreferencesStep,
      inspirationUploadStep,
      timelineBudgetStep,
      finalThoughtsStep,
    ],
  },
  {
    name: "UI/UX Design",
    projectType: "ui_ux",
    steps: [
      welcomeStep,
      businessInfoStep,
      { key: "project_scope", title: "Project Scope", description: "What UI/UX deliverables do you need?", enabled: true, builtIn: true, questions: [
        { id: "deliverables", label: "What do you need?", type: "checkbox", options: ["Wireframes", "High-fidelity Mockups", "Interactive Prototype", "Design System", "User Research", "Usability Testing", "Information Architecture"], required: true },
        { id: "usageContexts", label: "Target platforms", type: "checkbox", options: ["Web App", "iOS App", "Android App", "Desktop App", "Responsive Web"], required: true },
      ]},
      pagesFunctionalityStep,
      styleDirectionStep,
      colorPreferencesStep,
      inspirationUploadStep,
      timelineBudgetStep,
      finalThoughtsStep,
    ],
  },
  {
    name: "Print Design",
    projectType: "print",
    steps: [
      welcomeStep,
      businessInfoStep,
      { key: "project_scope", title: "Project Scope", description: "What print deliverables do you need?", enabled: true, builtIn: true, questions: [
        { id: "deliverables", label: "What do you need?", type: "checkbox", options: ["Business Cards", "Brochure", "Flyer / Poster", "Booklet / Catalog", "Letterhead & Stationery", "Banner / Signage", "Menu", "Invitation"], required: true },
        { id: "usageContexts", label: "Print specifications", type: "checkbox", options: ["Standard Paper", "Premium Paper", "Large Format", "Die-cut", "Foil / Emboss", "Digital Print", "Offset Print"], required: true },
        { id: "dimensions", label: "Required sizes / dimensions", type: "textarea" },
      ]},
      styleDirectionStep,
      colorPreferencesStep,
      typographyFeelStep,
      inspirationUploadStep,
      timelineBudgetStep,
      finalThoughtsStep,
    ],
  },
  {
    name: "Motion Design",
    projectType: "motion",
    steps: [
      welcomeStep,
      businessInfoStep,
      { key: "project_scope", title: "Project Scope", description: "What motion design deliverables do you need?", enabled: true, builtIn: true, questions: [
        { id: "deliverables", label: "What do you need?", type: "checkbox", options: ["Logo Animation", "Explainer Video", "Social Media Animations", "UI Animations / Micro-interactions", "Title Sequence", "Motion Graphics Package", "GIF / Stickers"], required: true },
        { id: "usageContexts", label: "Where will this be used?", type: "checkbox", options: ["Website", "Social Media", "Presentation", "Broadcast / TV", "App / Product", "Trade Show / Event"], required: true },
        { id: "duration", label: "Estimated duration", type: "select", options: ["Under 15 seconds", "15-30 seconds", "30-60 seconds", "1-2 minutes", "2+ minutes", "Not sure"] },
      ]},
      styleDirectionStep,
      colorPreferencesStep,
      inspirationUploadStep,
      timelineBudgetStep,
      finalThoughtsStep,
    ],
  },
  {
    name: "App Design",
    projectType: "app_design",
    steps: [
      welcomeStep,
      businessInfoStep,
      { key: "project_scope", title: "Project Scope", description: "What app design deliverables do you need?", enabled: true, builtIn: true, questions: [
        { id: "deliverables", label: "What do you need?", type: "checkbox", options: ["Full App Design", "App Redesign", "App Icon & Store Assets", "Onboarding Flow", "Design System", "Prototype"], required: true },
        { id: "usageContexts", label: "Target platforms", type: "checkbox", options: ["iOS", "Android", "Cross-platform", "Tablet", "Wearable"], required: true },
      ]},
      pagesFunctionalityStep,
      styleDirectionStep,
      colorPreferencesStep,
      inspirationUploadStep,
      timelineBudgetStep,
      finalThoughtsStep,
    ],
  },
];
