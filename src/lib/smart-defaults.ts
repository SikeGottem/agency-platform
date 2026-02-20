/**
 * Smart Defaults System
 * 
 * Uses aggregated data from past projects to provide intelligent defaults
 * and suggestions for new clients based on their industry.
 */

import { createClient } from "@supabase/supabase-js";
import type { AdaptiveStyleData } from "@/components/onboarding/steps/adaptive-style-selector";

// Industry categories for smart defaults
export const INDUSTRY_CATEGORIES = [
  "restaurant",
  "tech_startup", 
  "fashion",
  "healthcare",
  "real_estate",
  "consulting",
  "education",
  "fitness",
  "beauty",
  "finance",
  "nonprofit",
  "creative_agency",
  "retail",
  "manufacturing",
  "legal",
  "other"
] as const;

export type IndustryCategory = typeof INDUSTRY_CATEGORIES[number];

// Smart defaults data structure
export interface IndustryDefaults {
  industry: IndustryCategory;
  sampleSize: number;
  styleScores: {
    modern_classic: number;
    bold_subtle: number; 
    warm_cool: number;
    minimal_ornate: number;
    playful_serious: number;
    organic_geometric: number;
    light_heavy: number;
  };
  commonStyles: string[];
  preferredColors: string[];
  commonTypography: string[];
  averageBudget: string;
  averageTimeline: string;
  confidenceLevel: number; // How reliable this data is (0-1)
  lastUpdated: string;
}

// Default fallbacks for industries without enough data
const FALLBACK_DEFAULTS: Record<IndustryCategory, Partial<IndustryDefaults>> = {
  restaurant: {
    styleScores: {
      modern_classic: -5, bold_subtle: -10, warm_cool: 15, minimal_ornate: -5,
      playful_serious: 10, organic_geometric: -8, light_heavy: 5
    },
    commonStyles: ["organic", "warm", "playful"],
    preferredColors: ["warm earth tones", "inviting oranges", "natural greens"],
    commonTypography: ["handwritten", "serif"],
    averageBudget: "$5,000-$15,000",
    averageTimeline: "4-6 weeks"
  },
  tech_startup: {
    styleScores: {
      modern_classic: 20, bold_subtle: 10, warm_cool: -5, minimal_ornate: 15,
      playful_serious: 5, organic_geometric: 10, light_heavy: 10
    },
    commonStyles: ["modern", "minimal", "bold"],
    preferredColors: ["tech blues", "clean whites", "electric accents"],
    commonTypography: ["sans-serif", "geometric"],
    averageBudget: "$10,000-$25,000", 
    averageTimeline: "6-8 weeks"
  },
  fashion: {
    styleScores: {
      modern_classic: 5, bold_subtle: 15, warm_cool: 10, minimal_ornate: -10,
      playful_serious: 8, organic_geometric: -5, light_heavy: -8
    },
    commonStyles: ["bold", "elegant", "modern"],
    preferredColors: ["black & white", "rich jewel tones", "soft pastels"],
    commonTypography: ["elegant serif", "modern sans-serif"],
    averageBudget: "$8,000-$20,000",
    averageTimeline: "5-7 weeks"
  },
  healthcare: {
    styleScores: {
      modern_classic: 10, bold_subtle: -15, warm_cool: 8, minimal_ornate: 10,
      playful_serious: -15, organic_geometric: 5, light_heavy: 8
    },
    commonStyles: ["clean", "trustworthy", "professional"],
    preferredColors: ["calming blues", "medical greens", "clean whites"],
    commonTypography: ["clean sans-serif", "readable fonts"],
    averageBudget: "$7,000-$18,000",
    averageTimeline: "5-7 weeks"
  },
  real_estate: {
    styleScores: {
      modern_classic: 8, bold_subtle: 5, warm_cool: 12, minimal_ornate: 8,
      playful_serious: -8, organic_geometric: -3, light_heavy: 5
    },
    commonStyles: ["professional", "trustworthy", "warm"],
    preferredColors: ["warm grays", "trust blues", "gold accents"],
    commonTypography: ["professional serif", "clean sans-serif"],
    averageBudget: "$6,000-$15,000",
    averageTimeline: "4-6 weeks"
  },
  consulting: {
    styleScores: {
      modern_classic: 12, bold_subtle: -8, warm_cool: -5, minimal_ornate: 15,
      playful_serious: -18, organic_geometric: 8, light_heavy: 10
    },
    commonStyles: ["professional", "minimal", "modern"],
    preferredColors: ["corporate blues", "sophisticated grays", "accent colors"],
    commonTypography: ["professional sans-serif", "clean fonts"],
    averageBudget: "$8,000-$20,000",
    averageTimeline: "6-8 weeks"
  },
  education: {
    styleScores: {
      modern_classic: 5, bold_subtle: -5, warm_cool: 15, minimal_ornate: 0,
      playful_serious: 12, organic_geometric: -5, light_heavy: 3
    },
    commonStyles: ["approachable", "warm", "friendly"],
    preferredColors: ["educational blues", "warm oranges", "friendly greens"],
    commonTypography: ["readable fonts", "friendly sans-serif"],
    averageBudget: "$4,000-$12,000",
    averageTimeline: "4-6 weeks"
  },
  fitness: {
    styleScores: {
      modern_classic: 10, bold_subtle: 18, warm_cool: 8, minimal_ornate: 5,
      playful_serious: 10, organic_geometric: -3, light_heavy: -10
    },
    commonStyles: ["energetic", "bold", "modern"],
    preferredColors: ["energetic reds", "vibrant oranges", "fitness greens"],
    commonTypography: ["strong fonts", "athletic styling"],
    averageBudget: "$5,000-$15,000",
    averageTimeline: "4-6 weeks"
  },
  beauty: {
    styleScores: {
      modern_classic: 8, bold_subtle: 5, warm_cool: 12, minimal_ornate: -8,
      playful_serious: 5, organic_geometric: -8, light_heavy: -10
    },
    commonStyles: ["elegant", "refined", "feminine"],
    preferredColors: ["soft pinks", "elegant golds", "natural tones"],
    commonTypography: ["elegant fonts", "refined styling"],
    averageBudget: "$6,000-$16,000",
    averageTimeline: "5-7 weeks"
  },
  finance: {
    styleScores: {
      modern_classic: 5, bold_subtle: -12, warm_cool: -10, minimal_ornate: 18,
      playful_serious: -20, organic_geometric: 10, light_heavy: 12
    },
    commonStyles: ["professional", "trustworthy", "minimal"],
    preferredColors: ["trust blues", "sophisticated grays", "gold accents"],
    commonTypography: ["professional fonts", "clean styling"],
    averageBudget: "$10,000-$25,000",
    averageTimeline: "6-10 weeks"
  },
  nonprofit: {
    styleScores: {
      modern_classic: 0, bold_subtle: -5, warm_cool: 18, minimal_ornate: 5,
      playful_serious: 5, organic_geometric: -5, light_heavy: 5
    },
    commonStyles: ["warm", "trustworthy", "approachable"],
    preferredColors: ["hope blues", "caring greens", "warm earth tones"],
    commonTypography: ["approachable fonts", "readable styling"],
    averageBudget: "$3,000-$10,000",
    averageTimeline: "4-6 weeks"
  },
  creative_agency: {
    styleScores: {
      modern_classic: 15, bold_subtle: 20, warm_cool: 5, minimal_ornate: -10,
      playful_serious: 15, organic_geometric: 5, light_heavy: -8
    },
    commonStyles: ["creative", "bold", "unique"],
    preferredColors: ["creative palettes", "bold accents", "artistic colors"],
    commonTypography: ["creative fonts", "unique styling"],
    averageBudget: "$8,000-$20,000",
    averageTimeline: "5-8 weeks"
  },
  retail: {
    styleScores: {
      modern_classic: 8, bold_subtle: 12, warm_cool: 10, minimal_ornate: -5,
      playful_serious: 8, organic_geometric: -3, light_heavy: -5
    },
    commonStyles: ["approachable", "modern", "inviting"],
    preferredColors: ["brand colors", "seasonal palettes", "retail-friendly"],
    commonTypography: ["readable fonts", "brand-focused"],
    averageBudget: "$6,000-$18,000",
    averageTimeline: "5-7 weeks"
  },
  manufacturing: {
    styleScores: {
      modern_classic: 5, bold_subtle: 8, warm_cool: -5, minimal_ornate: 12,
      playful_serious: -15, organic_geometric: 8, light_heavy: 10
    },
    commonStyles: ["industrial", "professional", "strong"],
    preferredColors: ["industrial blues", "steel grays", "safety colors"],
    commonTypography: ["industrial fonts", "strong styling"],
    averageBudget: "$8,000-$20,000",
    averageTimeline: "6-8 weeks"
  },
  legal: {
    styleScores: {
      modern_classic: -5, bold_subtle: -15, warm_cool: -8, minimal_ornate: 15,
      playful_serious: -25, organic_geometric: 5, light_heavy: 15
    },
    commonStyles: ["traditional", "trustworthy", "professional"],
    preferredColors: ["traditional blues", "professional grays", "gold accents"],
    commonTypography: ["traditional serif", "professional fonts"],
    averageBudget: "$8,000-$22,000",
    averageTimeline: "6-10 weeks"
  },
  other: {
    styleScores: {
      modern_classic: 0, bold_subtle: 0, warm_cool: 0, minimal_ornate: 0,
      playful_serious: 0, organic_geometric: 0, light_heavy: 0
    },
    commonStyles: ["versatile", "adaptable"],
    preferredColors: ["neutral palette", "brand colors"],
    commonTypography: ["versatile fonts"],
    averageBudget: "$5,000-$15,000",
    averageTimeline: "4-6 weeks"
  }
};

/**
 * Get smart defaults for a specific industry
 */
export async function getIndustryDefaults(industry: string): Promise<IndustryDefaults> {
  const normalizedIndustry = normalizeIndustry(industry);
  
  try {
    // Try to fetch from database first
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data, error } = await supabase
      .from('industry_defaults')
      .select('*')
      .eq('industry', normalizedIndustry)
      .single();
    
    if (data && !error) {
      return data;
    }
  } catch (error) {
    console.warn('Failed to fetch industry defaults from database:', error);
  }
  
  // Fall back to hardcoded defaults
  const fallback = FALLBACK_DEFAULTS[normalizedIndustry];
  return {
    industry: normalizedIndustry,
    sampleSize: 0,
    styleScores: fallback?.styleScores || FALLBACK_DEFAULTS.other.styleScores!,
    commonStyles: fallback?.commonStyles || [],
    preferredColors: fallback?.preferredColors || [],
    commonTypography: fallback?.commonTypography || [],
    averageBudget: fallback?.averageBudget || "$5,000-$15,000",
    averageTimeline: fallback?.averageTimeline || "4-6 weeks",
    confidenceLevel: 0.3, // Low confidence for fallback data
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Normalize industry input to match our categories
 */
export function normalizeIndustry(industry: string): IndustryCategory {
  const normalized = industry.toLowerCase().trim();
  
  // Direct matches
  if (INDUSTRY_CATEGORIES.includes(normalized as IndustryCategory)) {
    return normalized as IndustryCategory;
  }
  
  // Fuzzy matching
  const mappings: Record<string, IndustryCategory> = {
    // Restaurant/Food
    'food': 'restaurant',
    'restaurant': 'restaurant',
    'cafe': 'restaurant',
    'bakery': 'restaurant',
    'catering': 'restaurant',
    'hospitality': 'restaurant',
    
    // Tech
    'technology': 'tech_startup',
    'tech': 'tech_startup',
    'software': 'tech_startup',
    'saas': 'tech_startup',
    'startup': 'tech_startup',
    'app': 'tech_startup',
    
    // Fashion
    'clothing': 'fashion',
    'apparel': 'fashion',
    'jewelry': 'fashion',
    'accessories': 'fashion',
    
    // Healthcare
    'medical': 'healthcare',
    'dental': 'healthcare',
    'wellness': 'healthcare',
    'therapy': 'healthcare',
    'clinic': 'healthcare',
    
    // Real Estate
    'property': 'real_estate',
    'realtor': 'real_estate',
    'construction': 'real_estate',
    'architecture': 'real_estate',
    
    // Consulting
    'business': 'consulting',
    'strategy': 'consulting',
    'management': 'consulting',
    'advisory': 'consulting',
    
    // Beauty
    'cosmetics': 'beauty',
    'skincare': 'beauty',
    'salon': 'beauty',
    'spa': 'beauty',
    'wellness': 'beauty',
    
    // Finance
    'financial': 'finance',
    'banking': 'finance',
    'investment': 'finance',
    'accounting': 'finance',
    'insurance': 'finance',
    
    // Legal
    'law': 'legal',
    'attorney': 'legal',
    'lawyer': 'legal',
    'litigation': 'legal',
  };
  
  for (const [key, value] of Object.entries(mappings)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  
  return 'other';
}

/**
 * Generate smart suggestions based on industry defaults
 */
export function generateSmartSuggestions(defaults: IndustryDefaults): {
  stylePreselections: string[];
  colorSuggestions: string[];
  budgetSuggestion: string;
  timelineSuggestion: string;
  confidenceHints: Record<string, string>;
} {
  const { styleScores, commonStyles, preferredColors, averageBudget, averageTimeline } = defaults;
  
  // Pre-select styles based on strongest scores
  const sortedStyles = Object.entries(styleScores)
    .map(([axis, score]) => {
      const [positive, negative] = axis.split('_');
      return { style: score > 0 ? positive : negative, strength: Math.abs(score) };
    })
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3)
    .map(s => s.style);
  
  // Generate confidence hints
  const confidenceHints: Record<string, string> = {};
  
  if (defaults.sampleSize > 50) {
    confidenceHints.industry = `Most ${defaults.industry.replace('_', ' ')} businesses prefer ${commonStyles.slice(0, 2).join(' and ')} styles`;
  }
  
  if (preferredColors.length > 0) {
    confidenceHints.colors = `Popular color choices: ${preferredColors.slice(0, 3).join(', ')}`;
  }
  
  confidenceHints.budget = `Typical budget range: ${averageBudget}`;
  confidenceHints.timeline = `Expected timeline: ${averageTimeline}`;
  
  return {
    stylePreselections: [...new Set([...sortedStyles, ...commonStyles])].slice(0, 3),
    colorSuggestions: preferredColors.slice(0, 3),
    budgetSuggestion: averageBudget,
    timelineSuggestion: averageTimeline,
    confidenceHints
  };
}

/**
 * Update industry defaults based on completed project
 */
export async function updateIndustryDefaults(
  industry: string,
  projectData: {
    styleData?: AdaptiveStyleData;
    colorPreferences?: any;
    budgetRange?: string;
    timeline?: string;
  }
): Promise<void> {
  const normalizedIndustry = normalizeIndustry(industry);
  
  try {
    const supabase = createClient(
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      process.env.NEXT_PUBLIC_SUPABASE_URL!
    );
    
    // Get current defaults
    const { data: current } = await supabase
      .from('industry_defaults')
      .select('*')
      .eq('industry', normalizedIndustry)
      .single();
    
    let updatedData: any;
    
    if (current) {
      // Update existing record with weighted average
      const weight = 1 / (current.sample_size + 1);
      const oldWeight = 1 - weight;
      
      updatedData = {
        sample_size: current.sample_size + 1,
        style_scores: projectData.styleData?.scores ? {
          modern_classic: current.style_scores.modern_classic * oldWeight + (projectData.styleData.scores.modern_classic || 0) * weight,
          bold_subtle: current.style_scores.bold_subtle * oldWeight + (projectData.styleData.scores.bold_subtle || 0) * weight,
          warm_cool: current.style_scores.warm_cool * oldWeight + (projectData.styleData.scores.warm_cool || 0) * weight,
          minimal_ornate: current.style_scores.minimal_ornate * oldWeight + (projectData.styleData.scores.minimal_ornate || 0) * weight,
          playful_serious: current.style_scores.playful_serious * oldWeight + (projectData.styleData.scores.playful_serious || 0) * weight,
          organic_geometric: current.style_scores.organic_geometric * oldWeight + (projectData.styleData.scores.organic_geometric || 0) * weight,
          light_heavy: current.style_scores.light_heavy * oldWeight + (projectData.styleData.scores.light_heavy || 0) * weight,
        } : current.style_scores,
        confidence_level: Math.min(1.0, current.confidence_level + 0.02), // Gradually increase confidence
        last_updated: new Date().toISOString()
      };
    } else {
      // Create new record
      updatedData = {
        industry: normalizedIndustry,
        sample_size: 1,
        style_scores: projectData.styleData?.scores || FALLBACK_DEFAULTS[normalizedIndustry].styleScores,
        common_styles: FALLBACK_DEFAULTS[normalizedIndustry].commonStyles || [],
        preferred_colors: FALLBACK_DEFAULTS[normalizedIndustry].preferredColors || [],
        common_typography: FALLBACK_DEFAULTS[normalizedIndustry].commonTypography || [],
        average_budget: projectData.budgetRange || FALLBACK_DEFAULTS[normalizedIndustry].averageBudget,
        average_timeline: projectData.timeline || FALLBACK_DEFAULTS[normalizedIndustry].averageTimeline,
        confidence_level: 0.1,
        last_updated: new Date().toISOString()
      };
    }
    
    await supabase
      .from('industry_defaults')
      .upsert(updatedData, { onConflict: 'industry' });
      
  } catch (error) {
    console.error('Failed to update industry defaults:', error);
  }
}

/**
 * Get comparative insights for an industry
 */
export function generateComparativeInsights(
  userIndustry: string,
  allDefaults: IndustryDefaults[]
): {
  similarIndustries: string[];
  uniqueAspects: string[];
  averageComparison: string;
} {
  const userDefaults = allDefaults.find(d => d.industry === normalizeIndustry(userIndustry));
  if (!userDefaults) {
    return {
      similarIndustries: [],
      uniqueAspects: [],
      averageComparison: "Insufficient data for comparison"
    };
  }
  
  // Find similar industries by calculating style distance
  const similarities = allDefaults
    .filter(d => d.industry !== userDefaults.industry)
    .map(other => {
      const distance = Object.keys(userDefaults.styleScores).reduce((sum, key) => {
        const diff = userDefaults.styleScores[key as keyof typeof userDefaults.styleScores] - 
                    other.styleScores[key as keyof typeof other.styleScores];
        return sum + (diff * diff);
      }, 0);
      
      return { industry: other.industry, distance: Math.sqrt(distance) };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);
  
  // Generate unique aspects
  const uniqueAspects: string[] = [];
  const strongScores = Object.entries(userDefaults.styleScores)
    .filter(([_, score]) => Math.abs(score) > 15)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 2);
  
  strongScores.forEach(([axis, score]) => {
    const [positive, negative] = axis.split('_');
    const direction = score > 0 ? positive : negative;
    uniqueAspects.push(`Strong preference for ${direction} aesthetics`);
  });
  
  return {
    similarIndustries: similarities.map(s => s.industry.replace('_', ' ')),
    uniqueAspects,
    averageComparison: `Compared to similar industries, shows ${uniqueAspects.length > 0 ? 'distinctive' : 'typical'} style preferences`
  };
}