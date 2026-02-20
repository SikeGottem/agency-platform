/**
 * Brief Generation Utility
 *
 * Transforms raw questionnaire responses into a structured, designer-friendly
 * brief format organized into named sections with confidence weighting.
 */

export interface BriefSection {
  title: string;
  summary: string;
  data: Record<string, unknown>;
  confidence?: number;
  flags?: string[];
  highlights?: string[];
}

export interface StructuredBrief {
  version: number;
  generatedAt: string;
  summary: string;
  projectType: string;
  clientName: string;
  clientEmail: string;
  overallConfidence: number;
  confidenceScore: string; // A/B/C grade
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

function extractValue(data: unknown, key: string): unknown {
  if (data && typeof data === "object" && key in (data as Record<string, unknown>)) {
    return (data as Record<string, unknown>)[key];
  }
  return undefined;
}

function toStringOrDefault(value: unknown, fallback = "Not provided"): string {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : fallback;
  return String(value);
}

// Confidence analysis helpers
function analyzeConfidence(responseData: unknown): { confidence: number; flags: string[]; highlights: string[] } {
  const flags: string[] = [];
  const highlights: string[] = [];
  let confidence = 0.7; // Default confidence
  
  if (responseData && typeof responseData === "object") {
    const data = responseData as Record<string, unknown>;
    
    // Check for adaptive style selector confidence
    if (data.averageConfidence && typeof data.averageConfidence === "number") {
      confidence = data.averageConfidence;
      
      if (confidence >= 0.8) {
        highlights.push("✅ Client feels strongly about their preferences");
      } else if (confidence < 0.5) {
        flags.push("⚠️ Client was unsure about these choices — consider presenting 2-3 options");
      }
    }
    
    // Check for completeness
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
    
    // Adjust confidence based on completeness
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
  
  Object.entries(sections).forEach(([key, section]) => {
    const confidence = section.confidence || 0.7;
    
    if (confidence >= 0.8) {
      strongAreas.push(section.title);
    } else if (confidence < 0.5) {
      uncertainAreas.push(section.title);
    }
  });
  
  // Generate recommendations based on confidence patterns
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

function buildBusinessSection(responses: Record<string, unknown>): BriefSection {
  const data = (responses.business_info ?? {}) as Record<string, unknown>;
  const companyName = toStringOrDefault(data.company_name);
  const industry = toStringOrDefault(data.industry);
  const targetAudience = toStringOrDefault(data.target_audience);
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
  const styles = toStringOrDefault(data.selected_styles ?? data.styles);
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
  const palette = toStringOrDefault(data.selected_palette ?? data.palette);
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
  const preference = toStringOrDefault(data.preference ?? data.style);
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
  const budget = toStringOrDefault(data.budget);

  return {
    title: "Timeline & Budget",
    summary: `Timeline: ${timeline}. Budget: ${budget}.`,
    data,
  };
}

function buildAdditionalSection(responses: Record<string, unknown>): BriefSection {
  const data = (responses.final_thoughts ?? {}) as Record<string, unknown>;
  const notes = toStringOrDefault(data.notes ?? data.additional_notes);

  return {
    title: "Additional Notes",
    summary: notes === "Not provided" ? "No additional notes." : notes,
    data,
  };
}

function buildOverallSummary(sections: StructuredBrief["sections"], projectType: string, clientName: string): string {
  const parts: string[] = [
    `${clientName} has submitted a ${projectType.replace(/_/g, " ")} brief.`,
    sections.business.summary,
    sections.scope.summary,
    sections.style.summary,
    sections.colors.summary,
    sections.timeline.summary,
  ];
  return parts.filter(Boolean).join(" ");
}

/**
 * Generate a structured brief from raw questionnaire responses.
 */
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

  return {
    version: 2,
    generatedAt: new Date().toISOString(),
    summary: buildOverallSummary(sections, projectType, clientName),
    projectType,
    clientName,
    clientEmail,
    overallConfidence,
    confidenceScore,
    sections,
    rawResponses: responses,
    designerInsights,
  };
}
