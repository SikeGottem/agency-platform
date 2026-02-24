/**
 * Brief Generation Utility
 *
 * Transforms raw questionnaire responses into a structured, designer-friendly
 * brief format with actionable sections: Executive Summary, Creative Direction,
 * Scope of Work, Client Profile, and Red Flags.
 */

export interface BriefSection {
  title: string;
  summary: string;
  data: Record<string, unknown>;
  confidence?: number;
  flags?: string[];
  highlights?: string[];
}

export interface ExecutiveSummary {
  overview: string;
  keyDeliverables: string[];
  timeline: string;
  budget: string;
}

export interface CreativeDirection {
  styleProfile: string;
  fontRecommendations: { category: string; suggestion: string; rationale: string }[];
  colorPalette: { role: "primary" | "secondary" | "accent" | "neutral"; hex: string; name: string }[];
  moodKeywords: string[];
  avoidKeywords: string[];
}

export interface ScopeOfWork {
  deliverables: { item: string; specification: string }[];
  inclusions: string[];
  exclusions: string[];
  revisionRounds: number;
  milestones: { phase: string; description: string; weekRange: string }[];
}

export interface ClientProfile {
  businessDescription: string;
  industry: string;
  targetAudience: string[];
  competitors: string[];
  likes: string[];
  dislikes: string[];
}

export interface RedFlag {
  type: "budget" | "timeline" | "contradiction" | "vague" | "info";
  severity: "warning" | "critical" | "info";
  message: string;
  recommendation: string;
}

export interface StructuredBrief {
  version: number;
  generatedAt: string;
  summary: string;
  projectType: string;
  clientName: string;
  clientEmail: string;
  overallConfidence: number;
  confidenceScore: string;
  executiveSummary: ExecutiveSummary;
  creativeDirection: CreativeDirection;
  scopeOfWork: ScopeOfWork;
  clientProfile: ClientProfile;
  redFlags: RedFlag[];
  sections: {
    business: BriefSection;
    scope: BriefSection;
    style: BriefSection;
    colors: BriefSection;
    typography: BriefSection;
    inspiration: BriefSection;
    timeline: BriefSection;
    additional: BriefSection;
  };
  rawResponses: Record<string, unknown>;
  designerInsights?: {
    strongAreas: string[];
    uncertainAreas: string[];
    recommendations: string[];
  };
}

/* ── Constants ── */

const TIMELINE_LABELS: Record<string, string> = {
  asap: "1–2 weeks",
  month: "~4 weeks",
  quarter: "~12 weeks",
  flexible: "Flexible",
};

const BUDGET_LABELS: Record<string, string> = {
  under_1k: "Under $1,000",
  "1k_3k": "$1,000–$3,000",
  "3k_5k": "$3,000–$5,000",
  "5k_10k": "$5,000–$10,000",
  "10k_plus": "$10,000+",
  discuss: "TBD",
};

const BUDGET_MIDPOINTS: Record<string, number> = {
  under_1k: 750,
  "1k_3k": 2000,
  "3k_5k": 4000,
  "5k_10k": 7500,
  "10k_plus": 15000,
  discuss: 0,
};

const STYLE_KEYWORDS: Record<string, { modern: boolean; bold: boolean; keywords: string[] }> = {
  minimalist: { modern: true, bold: false, keywords: ["Clean", "Restrained", "Whitespace", "Calm"] },
  bold: { modern: true, bold: true, keywords: ["High-contrast", "Impactful", "Strong", "Dramatic"] },
  playful: { modern: true, bold: true, keywords: ["Bright", "Rounded", "Friendly", "Dynamic"] },
  elegant: { modern: false, bold: false, keywords: ["Serif", "Refined", "Premium", "Luxurious"] },
  vintage: { modern: false, bold: false, keywords: ["Textured", "Warm", "Heritage", "Nostalgic"] },
  modern: { modern: true, bold: false, keywords: ["Geometric", "Sleek", "Innovative", "Progressive"] },
  organic: { modern: false, bold: false, keywords: ["Natural", "Flowing", "Earthy", "Human"] },
  geometric: { modern: true, bold: true, keywords: ["Angular", "Systematic", "Grid", "Modular"] },
};

const PALETTE_DATA: Record<string, { hex: string; name: string; role: "primary" | "secondary" | "accent" | "neutral" }[]> = {
  Ocean: [
    { hex: "#0077B6", name: "Deep Sea", role: "primary" },
    { hex: "#00B4D8", name: "Cyan", role: "secondary" },
    { hex: "#90E0EF", name: "Sky", role: "neutral" },
    { hex: "#CAF0F8", name: "Foam", role: "neutral" },
  ],
  Sunset: [
    { hex: "#FF6B35", name: "Tangerine", role: "primary" },
    { hex: "#F7C59F", name: "Peach", role: "secondary" },
    { hex: "#EFEFD0", name: "Cream", role: "neutral" },
    { hex: "#004E89", name: "Navy", role: "accent" },
  ],
  Forest: [
    { hex: "#2D6A4F", name: "Pine", role: "primary" },
    { hex: "#40916C", name: "Sage", role: "secondary" },
    { hex: "#52B788", name: "Fern", role: "accent" },
    { hex: "#D8F3DC", name: "Mint", role: "neutral" },
  ],
  Midnight: [
    { hex: "#1B1B2F", name: "Abyss", role: "primary" },
    { hex: "#162447", name: "Ink", role: "secondary" },
    { hex: "#1F4068", name: "Steel", role: "neutral" },
    { hex: "#E43F5A", name: "Ruby", role: "accent" },
  ],
  Coral: [
    { hex: "#FF6F61", name: "Coral", role: "primary" },
    { hex: "#FFB5A7", name: "Blush", role: "secondary" },
    { hex: "#FCD5CE", name: "Rose", role: "accent" },
    { hex: "#F8EDEB", name: "Shell", role: "neutral" },
  ],
  Monochrome: [
    { hex: "#18181B", name: "Carbon", role: "primary" },
    { hex: "#3F3F46", name: "Ash", role: "secondary" },
    { hex: "#71717A", name: "Stone", role: "neutral" },
    { hex: "#D4D4D8", name: "Silver", role: "neutral" },
  ],
  Lavender: [
    { hex: "#7C3AED", name: "Violet", role: "primary" },
    { hex: "#A78BFA", name: "Iris", role: "secondary" },
    { hex: "#C4B5FD", name: "Lilac", role: "accent" },
    { hex: "#EDE9FE", name: "Mist", role: "neutral" },
  ],
  Earth: [
    { hex: "#92400E", name: "Umber", role: "primary" },
    { hex: "#B45309", name: "Amber", role: "secondary" },
    { hex: "#D97706", name: "Honey", role: "accent" },
    { hex: "#FDE68A", name: "Sand", role: "neutral" },
  ],
};

const FONT_RECOMMENDATIONS: Record<string, { suggestion: string; rationale: string }> = {
  serif: { suggestion: "Playfair Display / Lora / DM Serif Display", rationale: "Classic, authoritative feel that pairs well with elegant or vintage directions" },
  "sans-serif": { suggestion: "Inter / Plus Jakarta Sans / DM Sans", rationale: "Clean, modern readability — versatile across digital and print" },
  monospace: { suggestion: "JetBrains Mono / Space Mono / IBM Plex Mono", rationale: "Technical, structured feel — great for tech or data-focused brands" },
  handwritten: { suggestion: "Caveat / Dancing Script / Kalam", rationale: "Personal, approachable warmth — use sparingly for accent text" },
  display: { suggestion: "Clash Display / Satoshi / Cabinet Grotesk", rationale: "High-impact headlines that demand attention" },
  slab: { suggestion: "Rockwell / Roboto Slab / Zilla Slab", rationale: "Strong, grounded presence — great for bold brand statements" },
};

/* ── Helpers ── */

function toStringOrDefault(value: unknown, fallback = "Not provided"): string {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : fallback;
  return String(value);
}

function analyzeConfidence(responseData: unknown): { confidence: number; flags: string[]; highlights: string[] } {
  const flags: string[] = [];
  const highlights: string[] = [];
  let confidence = 0.7;
  
  if (responseData && typeof responseData === "object") {
    const data = responseData as Record<string, unknown>;
    
    if (data.averageConfidence && typeof data.averageConfidence === "number") {
      confidence = data.averageConfidence;
      if (confidence >= 0.8) {
        highlights.push("✅ Client feels strongly about their preferences");
      } else if (confidence < 0.5) {
        flags.push("⚠️ Client was unsure about these choices — consider presenting 2-3 options");
      }
    }
    
    const completedFields = Object.values(data).filter(v => 
      v !== undefined && v !== null && v !== "" && 
      !(Array.isArray(v) && v.length === 0)
    ).length;
    
    const totalFields = Object.keys(data).length;
    const completeness = totalFields > 0 ? completedFields / totalFields : 0;
    
    if (completeness < 0.3) {
      flags.push("⚠️ Limited information provided — follow up for more details");
    } else if (completeness > 0.8) {
      highlights.push("✅ Comprehensive information provided");
    }
    
    confidence = confidence * (0.7 + completeness * 0.3);
  }
  
  return { confidence, flags, highlights };
}

function calculateOverallConfidence(sections: Record<string, BriefSection>): number {
  const confidenceValues = Object.values(sections)
    .map(section => section.confidence || 0.7)
    .filter(c => c > 0);
  
  return confidenceValues.length > 0 
    ? confidenceValues.reduce((sum, c) => sum + c, 0) / confidenceValues.length 
    : 0.7;
}

function getConfidenceGrade(confidence: number): string {
  if (confidence >= 0.8) return "A";
  if (confidence >= 0.6) return "B";
  return "C";
}

function generateDesignerInsights(sections: Record<string, BriefSection>): {
  strongAreas: string[];
  uncertainAreas: string[];
  recommendations: string[];
} {
  const strongAreas: string[] = [];
  const uncertainAreas: string[] = [];
  const recommendations: string[] = [];
  
  Object.entries(sections).forEach(([, section]) => {
    const confidence = section.confidence || 0.7;
    if (confidence >= 0.8) strongAreas.push(section.title);
    else if (confidence < 0.5) uncertainAreas.push(section.title);
  });
  
  if (uncertainAreas.includes("Creative Direction")) {
    recommendations.push("Consider creating 2-3 initial concept directions for client review");
  }
  if (uncertainAreas.includes("Color Preferences")) {
    recommendations.push("Present a diverse color palette with different moods for client feedback");
  }
  if (strongAreas.length >= 5) {
    recommendations.push("Client has clear vision — focus on precise execution of their preferences");
  }
  if (uncertainAreas.length >= 3) {
    recommendations.push("Schedule a discovery call to clarify unclear areas before starting design work");
  }
  
  return { strongAreas, uncertainAreas, recommendations };
}

/* ── Section Builders ── */

function buildBusinessSection(responses: Record<string, unknown>): BriefSection {
  const data = (responses.business_info ?? {}) as Record<string, unknown>;
  const companyName = toStringOrDefault(data.companyName ?? data.company_name);
  const industry = toStringOrDefault(data.industry);
  const targetAudience = toStringOrDefault(data.targetAudience ?? data.target_audience);
  const confidenceData = analyzeConfidence(data);

  return {
    title: "Business Context",
    summary: `${companyName} in the ${industry} industry, targeting ${targetAudience}.`,
    data,
    confidence: confidenceData.confidence,
    flags: confidenceData.flags,
    highlights: confidenceData.highlights,
  };
}

function buildScopeSection(responses: Record<string, unknown>): BriefSection {
  const data = (responses.project_scope ?? {}) as Record<string, unknown>;
  const deliverables = toStringOrDefault(data.deliverables);
  const pagesData = (responses.pages_functionality ?? {}) as Record<string, unknown>;
  const platformsData = (responses.platforms_content ?? {}) as Record<string, unknown>;

  return {
    title: "Project Scope",
    summary: `Deliverables: ${deliverables}.`,
    data: { ...data, pages_functionality: pagesData, platforms_content: platformsData },
  };
}

function buildStyleSection(responses: Record<string, unknown>): BriefSection {
  const data = (responses.style_direction ?? {}) as Record<string, unknown>;
  const styles = toStringOrDefault(data.selectedStyles ?? data.selected_styles ?? data.styles);
  const confidenceData = analyzeConfidence(data);

  return {
    title: "Creative Direction",
    summary: `Preferred styles: ${styles}.`,
    data,
    confidence: confidenceData.confidence,
    flags: confidenceData.flags,
    highlights: confidenceData.highlights,
  };
}

function buildColorsSection(responses: Record<string, unknown>): BriefSection {
  const data = (responses.color_preferences ?? {}) as Record<string, unknown>;
  const palette = toStringOrDefault(data.selectedPalettes ?? data.selected_palette ?? data.palette);
  const confidenceData = analyzeConfidence(data);

  return {
    title: "Color Preferences",
    summary: `Color direction: ${palette}.`,
    data,
    confidence: confidenceData.confidence,
    flags: confidenceData.flags,
    highlights: confidenceData.highlights,
  };
}

function buildTypographySection(responses: Record<string, unknown>): BriefSection {
  const data = (responses.typography_feel ?? {}) as Record<string, unknown>;
  const preference = toStringOrDefault(data.fontStyles ?? data.preference ?? data.style);
  const confidenceData = analyzeConfidence(data);

  return {
    title: "Typography",
    summary: `Typography preference: ${preference}.`,
    data,
    confidence: confidenceData.confidence,
    flags: confidenceData.flags,
    highlights: confidenceData.highlights,
  };
}

function buildInspirationSection(responses: Record<string, unknown>): BriefSection {
  const data = (responses.inspiration_upload ?? {}) as Record<string, unknown>;
  const urls = data.urls ?? data.images ?? [];
  const count = Array.isArray(urls) ? urls.length : 0;

  return {
    title: "Inspiration & References",
    summary: count > 0 ? `${count} inspiration reference(s) provided.` : "No inspiration references uploaded.",
    data,
  };
}

function buildTimelineSection(responses: Record<string, unknown>): BriefSection {
  const data = (responses.timeline_budget ?? {}) as Record<string, unknown>;
  const timeline = toStringOrDefault(data.timeline);
  const budget = toStringOrDefault(data.budgetRange ?? data.budget);

  return {
    title: "Timeline & Budget",
    summary: `Timeline: ${timeline}. Budget: ${budget}.`,
    data,
  };
}

function buildAdditionalSection(responses: Record<string, unknown>): BriefSection {
  const data = (responses.final_thoughts ?? {}) as Record<string, unknown>;
  const notes = toStringOrDefault(data.additionalNotes ?? data.notes ?? data.additional_notes);

  return {
    title: "Additional Notes",
    summary: notes === "Not provided" ? "No additional notes." : notes,
    data,
  };
}

/* ── New Structured Section Generators ── */

function buildExecutiveSummary(
  responses: Record<string, unknown>,
  projectType: string,
  clientName: string
): ExecutiveSummary {
  const biz = (responses.business_info ?? {}) as Record<string, unknown>;
  const scope = (responses.project_scope ?? {}) as Record<string, unknown>;
  const style = (responses.style_direction ?? {}) as Record<string, unknown>;
  const colors = (responses.color_preferences ?? {}) as Record<string, unknown>;
  const tb = (responses.timeline_budget ?? {}) as Record<string, unknown>;

  const companyName = toStringOrDefault(biz.companyName ?? biz.company_name, clientName);
  const industry = toStringOrDefault(biz.industry, "their");
  const styles = (style.selectedStyles ?? style.selected_styles ?? []) as string[];
  const palettes = (colors.selectedPalettes ?? colors.selected_palette ?? []) as string[];
  const deliverables = (scope.deliverables ?? []) as string[];
  const timelineKey = (tb.timeline ?? "") as string;
  const budgetKey = (tb.budgetRange ?? tb.budget ?? "") as string;

  const styleStr = styles.length > 0
    ? styles.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("/").toLowerCase()
    : "design-forward";
  const colorStr = palettes.length > 0 ? palettes.join(" & ") + " tones" : "an open color direction";
  const projectLabel = projectType.replace(/_/g, " ");

  const overview = `${companyName} needs a ${projectLabel} for their ${industry} business. They want a ${styleStr} aesthetic with ${colorStr}. Key deliverables: ${deliverables.length > 0 ? deliverables.slice(0, 4).join(", ") : "to be confirmed"}. Timeline: ${TIMELINE_LABELS[timelineKey] || timelineKey || "TBD"}, Budget: ${BUDGET_LABELS[budgetKey] || budgetKey || "TBD"}.`;

  return {
    overview,
    keyDeliverables: deliverables,
    timeline: TIMELINE_LABELS[timelineKey] || timelineKey || "Not specified",
    budget: BUDGET_LABELS[budgetKey] || budgetKey || "Not specified",
  };
}

function buildCreativeDirection(responses: Record<string, unknown>): CreativeDirection {
  const style = (responses.style_direction ?? {}) as Record<string, unknown>;
  const colors = (responses.color_preferences ?? {}) as Record<string, unknown>;
  const typo = (responses.typography_feel ?? {}) as Record<string, unknown>;

  const styles = (style.selectedStyles ?? style.selected_styles ?? []) as string[];
  const antiStyles = (style.antiInspiration ?? []) as string[];
  const palettes = (colors.selectedPalettes ?? colors.selected_palette ?? []) as string[];
  const fontStyles = (typo.fontStyles ?? typo.preference ?? []) as string[] | string;
  const fontList = Array.isArray(fontStyles) ? fontStyles : fontStyles ? [fontStyles] : [];

  // Synthesize style profile
  let modernCount = 0, classicCount = 0, boldCount = 0, subtleCount = 0;
  const allMoodKeywords: string[] = [];
  
  for (const s of styles) {
    const info = STYLE_KEYWORDS[s];
    if (info) {
      if (info.modern) modernCount++; else classicCount++;
      if (info.bold) boldCount++; else subtleCount++;
      allMoodKeywords.push(...info.keywords);
    }
  }

  const modernClassic = modernCount >= classicCount ? "modern" : "classic";
  const boldSubtle = boldCount >= subtleCount ? "bold" : "subtle";
  const styleProfile = styles.length > 0
    ? `The client leans ${modernClassic} with a preference for ${boldSubtle} visuals. Selected styles: ${styles.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")}.`
    : "No clear style direction provided — recommend presenting 2-3 concept directions.";

  // Font recommendations
  const fontRecommendations = fontList.map(f => {
    const rec = FONT_RECOMMENDATIONS[f];
    return {
      category: f.replace(/-/g, " "),
      suggestion: rec?.suggestion || "Explore options",
      rationale: rec?.rationale || "Based on client preference",
    };
  });

  // Color palette with roles
  const colorPalette = palettes.flatMap(name => PALETTE_DATA[name] ?? []);

  // Avoid keywords
  const avoidKeywords: string[] = [];
  for (const s of antiStyles) {
    const info = STYLE_KEYWORDS[s];
    if (info) avoidKeywords.push(...info.keywords);
    else avoidKeywords.push(s);
  }

  return {
    styleProfile,
    fontRecommendations,
    colorPalette,
    moodKeywords: [...new Set(allMoodKeywords)],
    avoidKeywords: [...new Set(avoidKeywords)],
  };
}

function buildScopeOfWork(responses: Record<string, unknown>, projectType: string): ScopeOfWork {
  const scope = (responses.project_scope ?? {}) as Record<string, unknown>;
  const pages = (responses.pages_functionality ?? {}) as Record<string, unknown>;
  const platforms = (responses.platforms_content ?? {}) as Record<string, unknown>;
  const tb = (responses.timeline_budget ?? {}) as Record<string, unknown>;

  const rawDeliverables = (scope.deliverables ?? []) as string[];
  const selectedPages = (pages.selectedPages ?? []) as string[];
  const customPages = (pages.customPages ?? []) as string[];
  const functionality = (pages.functionality ?? []) as string[];
  const platformList = (platforms.platforms ?? []) as string[];
  const timelineKey = (tb.timeline ?? "") as string;
  const budgetKey = (tb.budgetRange ?? tb.budget ?? "") as string;

  // Build deliverables with specs
  const deliverables = rawDeliverables.map(d => {
    let specification = "Standard deliverable";
    const dl = d.toLowerCase();
    if (dl.includes("logo")) specification = "Primary logo + variations (horizontal, stacked, icon)";
    else if (dl.includes("website")) specification = `${selectedPages.length || "TBD"} pages — ${selectedPages.slice(0, 5).join(", ") || "pages TBD"}`;
    else if (dl.includes("brand")) specification = "Logo, color palette, typography, brand guidelines document";
    else if (dl.includes("social")) specification = `Templates for ${platformList.length > 0 ? platformList.join(", ") : "social platforms"}`;
    else if (dl.includes("business card")) specification = "Front & back design, print-ready files";
    else if (dl.includes("stationery")) specification = "Letterhead, envelope, business card suite";
    return { item: d, specification };
  });

  // Inclusions
  const inclusions: string[] = [
    "Initial concept presentation",
    "Design files in standard formats (AI, PSD, Figma, PNG, PDF)",
  ];
  if (selectedPages.length > 0) inclusions.push(`${selectedPages.length} website pages`);
  if (customPages.length > 0) inclusions.push(`Custom pages: ${customPages.join(", ")}`);
  if (functionality.length > 0) inclusions.push(`Functionality: ${functionality.join(", ")}`);
  if (platformList.length > 0) inclusions.push(`Platform assets for ${platformList.join(", ")}`);

  // Exclusions
  const exclusions: string[] = [
    "Copywriting (unless explicitly included)",
    "Stock photography licensing",
    "Website development / coding",
    "Print production / manufacturing",
    "Ongoing maintenance or updates",
  ];

  // Revision rounds based on budget
  const budgetMid = BUDGET_MIDPOINTS[budgetKey] || 2000;
  const revisionRounds = budgetMid >= 5000 ? 3 : budgetMid >= 2000 ? 2 : 1;

  // Milestones
  const totalWeeks = timelineKey === "asap" ? 2 : timelineKey === "month" ? 4 : timelineKey === "quarter" ? 12 : 6;
  const milestones: ScopeOfWork["milestones"] = [];
  
  if (totalWeeks <= 2) {
    milestones.push(
      { phase: "Discovery & Concepts", description: "Review brief, present initial concepts", weekRange: "Day 1–3" },
      { phase: "Refinement", description: "Revisions based on feedback", weekRange: "Day 4–8" },
      { phase: "Final Delivery", description: "Final files and handoff", weekRange: "Day 9–14" },
    );
  } else if (totalWeeks <= 4) {
    milestones.push(
      { phase: "Discovery", description: "Brief review, research, moodboard", weekRange: "Week 1" },
      { phase: "Concepts", description: "2-3 initial concept directions", weekRange: "Week 2" },
      { phase: "Refinement", description: `${revisionRounds} rounds of revisions`, weekRange: "Week 3" },
      { phase: "Final Delivery", description: "Final files, assets, and handoff", weekRange: "Week 4" },
    );
  } else {
    milestones.push(
      { phase: "Discovery & Research", description: "Brief deep-dive, competitor analysis, moodboard", weekRange: `Week 1–${Math.ceil(totalWeeks * 0.15)}` },
      { phase: "Concept Development", description: "2-3 initial concept directions", weekRange: `Week ${Math.ceil(totalWeeks * 0.15) + 1}–${Math.ceil(totalWeeks * 0.4)}` },
      { phase: "Design & Refinement", description: `Detailed design with ${revisionRounds} revision rounds`, weekRange: `Week ${Math.ceil(totalWeeks * 0.4) + 1}–${Math.ceil(totalWeeks * 0.75)}` },
      { phase: "Final Delivery", description: "Final files, brand guidelines, handoff", weekRange: `Week ${Math.ceil(totalWeeks * 0.75) + 1}–${totalWeeks}` },
    );
  }

  return { deliverables, inclusions, exclusions, revisionRounds, milestones };
}

function buildClientProfile(responses: Record<string, unknown>, clientName: string): ClientProfile {
  const biz = (responses.business_info ?? {}) as Record<string, unknown>;
  const style = (responses.style_direction ?? {}) as Record<string, unknown>;
  const colors = (responses.color_preferences ?? {}) as Record<string, unknown>;

  return {
    businessDescription: toStringOrDefault(biz.description, "No description provided"),
    industry: toStringOrDefault(biz.industry, "Not specified"),
    targetAudience: (biz.targetAudience ?? biz.target_audience ?? []) as string[],
    competitors: (biz.competitors ?? []) as string[],
    likes: [
      ...((style.selectedStyles ?? []) as string[]).map(s => `${s.charAt(0).toUpperCase() + s.slice(1)} style`),
      ...((colors.selectedPalettes ?? []) as string[]).map(p => `${p} palette`),
    ],
    dislikes: [
      ...((style.antiInspiration ?? []) as string[]).map(s => `${s.charAt(0).toUpperCase() + s.slice(1)} style`),
      ...((colors.avoidColors ?? []) as string[]),
    ],
  };
}

function buildRedFlags(responses: Record<string, unknown>, projectType: string): RedFlag[] {
  const flags: RedFlag[] = [];
  const scope = (responses.project_scope ?? {}) as Record<string, unknown>;
  const tb = (responses.timeline_budget ?? {}) as Record<string, unknown>;
  const biz = (responses.business_info ?? {}) as Record<string, unknown>;
  const style = (responses.style_direction ?? {}) as Record<string, unknown>;
  const typo = (responses.typography_feel ?? {}) as Record<string, unknown>;
  const colors = (responses.color_preferences ?? {}) as Record<string, unknown>;

  const deliverables = (scope.deliverables ?? []) as string[];
  const timelineKey = (tb.timeline ?? "") as string;
  const budgetKey = (tb.budgetRange ?? tb.budget ?? "") as string;
  const budgetMid = BUDGET_MIDPOINTS[budgetKey] || 0;
  const styles = (style.selectedStyles ?? []) as string[];
  const antiStyles = (style.antiInspiration ?? []) as string[];

  // Budget vs scope
  if (budgetMid > 0 && budgetMid < 1500 && deliverables.length > 2) {
    flags.push({
      type: "budget",
      severity: "warning",
      message: `Budget (${BUDGET_LABELS[budgetKey]}) may be low for ${deliverables.length} deliverables`,
      recommendation: "Discuss scope prioritization or phased delivery with the client",
    });
  }

  if (budgetMid > 0 && budgetMid < 1000 && projectType.includes("website")) {
    flags.push({
      type: "budget",
      severity: "critical",
      message: "Budget is very low for a website project",
      recommendation: "Set clear expectations about what's achievable at this price point, or suggest a landing page instead",
    });
  }

  // Timeline
  if (timelineKey === "asap" && deliverables.length > 3) {
    flags.push({
      type: "timeline",
      severity: "critical",
      message: `ASAP timeline with ${deliverables.length} deliverables is very tight`,
      recommendation: "Prioritize deliverables and discuss phased delivery",
    });
  }

  if (timelineKey === "asap" && budgetKey === "under_1k") {
    flags.push({
      type: "timeline",
      severity: "warning",
      message: "Fast turnaround + low budget is a challenging combination",
      recommendation: "Be upfront about trade-offs: speed, scope, or budget — pick two",
    });
  }

  // Style contradictions
  const hasMinimalist = styles.includes("minimalist");
  const hasMaximalist = styles.includes("bold") || styles.includes("playful");
  if (hasMinimalist && hasMaximalist) {
    flags.push({
      type: "contradiction",
      severity: "info",
      message: `Client selected both minimalist and ${styles.filter(s => s === "bold" || s === "playful").join("/")} styles`,
      recommendation: "Clarify: do they want clean layouts with bold accents, or a fully restrained approach?",
    });
  }

  // Style selected also appears in anti-inspiration
  const overlap = styles.filter(s => antiStyles.includes(s));
  if (overlap.length > 0) {
    flags.push({
      type: "contradiction",
      severity: "warning",
      message: `"${overlap.join(", ")}" appears in both liked AND disliked styles`,
      recommendation: "Follow up to understand what specifically they like/dislike about this style",
    });
  }

  // Vague responses
  const missingAreas: string[] = [];
  if (!biz.description && !biz.companyName && !biz.company_name) missingAreas.push("business information");
  if (deliverables.length === 0) missingAreas.push("deliverables");
  if (styles.length === 0) missingAreas.push("style direction");
  if (!((colors.selectedPalettes ?? []) as string[]).length) missingAreas.push("color preferences");
  if (!((typo.fontStyles ?? []) as string[]).length && !typo.preference) missingAreas.push("typography preferences");

  if (missingAreas.length > 0) {
    flags.push({
      type: "vague",
      severity: missingAreas.length >= 3 ? "warning" : "info",
      message: `Missing or vague: ${missingAreas.join(", ")}`,
      recommendation: "Schedule a quick follow-up call to fill in the gaps before starting work",
    });
  }

  // Positive flags too
  if (deliverables.length > 0 && styles.length > 0 && budgetMid > 0 && flags.length === 0) {
    flags.push({
      type: "info",
      severity: "info",
      message: "Brief is well-defined — all key areas are covered",
      recommendation: "Good to proceed with concept development",
    });
  }

  return flags;
}

/* ── Main Generator ── */

export function generateStructuredBrief(params: {
  projectType: string;
  clientName: string;
  clientEmail: string;
  responses: Record<string, unknown>;
}): StructuredBrief {
  const { projectType, clientName, clientEmail, responses } = params;

  const sections = {
    business: buildBusinessSection(responses),
    scope: buildScopeSection(responses),
    style: buildStyleSection(responses),
    colors: buildColorsSection(responses),
    typography: buildTypographySection(responses),
    inspiration: buildInspirationSection(responses),
    timeline: buildTimelineSection(responses),
    additional: buildAdditionalSection(responses),
  };

  const overallConfidence = calculateOverallConfidence(sections);
  const confidenceScore = getConfidenceGrade(overallConfidence);
  const designerInsights = generateDesignerInsights(sections);

  const executiveSummary = buildExecutiveSummary(responses, projectType, clientName);
  const creativeDirection = buildCreativeDirection(responses);
  const scopeOfWork = buildScopeOfWork(responses, projectType);
  const clientProfile = buildClientProfile(responses, clientName);
  const redFlags = buildRedFlags(responses, projectType);

  return {
    version: 3,
    generatedAt: new Date().toISOString(),
    summary: executiveSummary.overview,
    projectType,
    clientName,
    clientEmail,
    overallConfidence,
    confidenceScore,
    executiveSummary,
    creativeDirection,
    scopeOfWork,
    clientProfile,
    redFlags,
    sections,
    rawResponses: responses,
    designerInsights,
  };
}
