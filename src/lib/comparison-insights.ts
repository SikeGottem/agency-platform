/**
 * Comparison Insights System
 * 
 * Compares client style profiles against designer's past clients
 * to provide contextual insights and project recommendations.
 */

import type { AdaptiveStyleData } from "@/components/onboarding/steps/adaptive-style-selector";

export interface ProjectComparison {
  projectId: string;
  clientName: string;
  projectType: string;
  similarity: number; // 0-1 score
  completedAt: string;
  keyMatches: string[];
  differences: string[];
}

export interface DesignerInsights {
  clientProfile: string;
  uniqueness: "typical" | "unusual" | "unique";
  uniquenessDescription: string;
  similarProjects: ProjectComparison[];
  recommendations: string[];
  warningFlags: string[];
  strengths: string[];
}

export interface StyleProfile {
  id: string;
  scores: AdaptiveStyleData["scores"];
  tags: string[];
  averageConfidence: number;
  projectCount?: number;
  clientName?: string;
  projectType?: string;
  completedAt?: string;
}

/**
 * Calculate style similarity between two profiles using cosine similarity
 */
export function calculateStyleSimilarity(profile1: StyleProfile, profile2: StyleProfile): number {
  const scores1 = profile1.scores;
  const scores2 = profile2.scores;
  
  // Calculate vectors
  const vector1 = Object.values(scores1);
  const vector2 = Object.values(scores2);
  
  // Cosine similarity calculation
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
    norm1 += vector1[i] * vector1[i];
    norm2 += vector2[i] * vector2[i];
  }
  
  const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Calculate uniqueness of a profile compared to a set of profiles
 */
export function calculateProfileUniqueness(
  targetProfile: StyleProfile, 
  historicalProfiles: StyleProfile[]
): { uniqueness: "typical" | "unusual" | "unique"; score: number; description: string } {
  if (historicalProfiles.length === 0) {
    return {
      uniqueness: "unique",
      score: 1.0,
      description: "This is your first project with this style profile"
    };
  }
  
  const similarities = historicalProfiles.map(p => calculateStyleSimilarity(targetProfile, p));
  const averageSimilarity = similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
  const maxSimilarity = Math.max(...similarities);
  
  let uniqueness: "typical" | "unusual" | "unique";
  let description: string;
  
  if (maxSimilarity > 0.8) {
    uniqueness = "typical";
    description = `Very similar to ${Math.round(similarities.filter(s => s > 0.7).length / similarities.length * 100)}% of your past clients`;
  } else if (maxSimilarity > 0.5) {
    uniqueness = "unusual";
    description = "Shows some unique preferences compared to your typical clients";
  } else {
    uniqueness = "unique";
    description = "Significantly different from your previous clients - new territory!";
  }
  
  return { uniqueness, score: 1 - averageSimilarity, description };
}

/**
 * Find key style dimension matches and differences
 */
export function analyzeStyleMatches(profile1: StyleProfile, profile2: StyleProfile): {
  matches: string[];
  differences: string[];
} {
  const matches: string[] = [];
  const differences: string[] = [];
  
  const dimensionLabels: Record<string, [string, string]> = {
    modern_classic: ["Modern", "Classic"],
    bold_subtle: ["Bold", "Subtle"],
    warm_cool: ["Warm", "Cool"],
    minimal_ornate: ["Minimal", "Ornate"],
    playful_serious: ["Playful", "Serious"],
    organic_geometric: ["Organic", "Geometric"],
    light_heavy: ["Light", "Heavy"]
  };
  
  Object.entries(profile1.scores).forEach(([axis, score1]) => {
    const score2 = profile2.scores[axis as keyof typeof profile2.scores];
    const [positiveLabel, negativeLabel] = dimensionLabels[axis] || [axis, axis];
    
    const direction1 = score1 > 5 ? positiveLabel : score1 < -5 ? negativeLabel : null;
    const direction2 = score2 > 5 ? positiveLabel : score2 < -5 ? negativeLabel : null;
    
    if (direction1 && direction2) {
      if (direction1 === direction2) {
        matches.push(`Both prefer ${direction1.toLowerCase()} aesthetics`);
      } else {
        differences.push(`${direction1} vs ${direction2} preference`);
      }
    }
  });
  
  return { matches, differences };
}

/**
 * Generate comparison insights for a client profile
 */
export function generateComparisonInsights(
  currentProfile: StyleProfile,
  historicalProfiles: StyleProfile[]
): DesignerInsights {
  const uniquenessData = calculateProfileUniqueness(currentProfile, historicalProfiles);
  
  // Find most similar projects
  const projectComparisons: ProjectComparison[] = historicalProfiles
    .map(profile => {
      const similarity = calculateStyleSimilarity(currentProfile, profile);
      const analysis = analyzeStyleMatches(currentProfile, profile);
      
      return {
        projectId: profile.id,
        clientName: profile.clientName || "Previous Client",
        projectType: profile.projectType || "Project",
        similarity,
        completedAt: profile.completedAt || new Date().toISOString(),
        keyMatches: analysis.matches,
        differences: analysis.differences
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3); // Top 3 most similar
  
  // Generate recommendations based on analysis
  const recommendations: string[] = [];
  const warningFlags: string[] = [];
  const strengths: string[] = [];
  
  // Confidence-based recommendations
  if (currentProfile.averageConfidence >= 0.8) {
    strengths.push("Client has strong, clear preferences");
    recommendations.push("Focus on precise execution of their vision");
  } else if (currentProfile.averageConfidence < 0.5) {
    warningFlags.push("Client shows uncertainty in style preferences");
    recommendations.push("Consider presenting multiple concept directions");
  }
  
  // Uniqueness-based recommendations
  if (uniquenessData.uniqueness === "unique") {
    recommendations.push("This client's style is unlike your previous work - embrace the creative challenge");
    warningFlags.push("New territory - allow extra time for exploration and iteration");
  } else if (uniquenessData.uniqueness === "typical") {
    const mostSimilar = projectComparisons[0];
    if (mostSimilar && mostSimilar.similarity > 0.8) {
      recommendations.push(`This client's preferences are very similar to ${mostSimilar.clientName} — you could reference that successful approach`);
      strengths.push("Leverageable past experience");
    }
  }
  
  // Style-specific insights
  const dominantTraits = Object.entries(currentProfile.scores)
    .filter(([_, score]) => Math.abs(score) > 15)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 2);
  
  if (dominantTraits.length > 0) {
    const [axis, score] = dominantTraits[0];
    const [positive, negative] = axis.split('_');
    const direction = score > 0 ? positive : negative;
    
    if (Math.abs(score) > 20) {
      strengths.push(`Very strong ${direction} preference`);
      recommendations.push(`Lean heavily into ${direction} aesthetic choices`);
    }
  }
  
  // Tag-based insights
  const commonTags = currentProfile.tags.filter(tag => 
    historicalProfiles.some(p => p.tags.includes(tag))
  );
  
  if (commonTags.length > 0) {
    strengths.push(`Familiar style tags: ${commonTags.join(', ')}`);
  }
  
  // Generate profile description
  const profileDescription = generateProfileDescription(currentProfile);
  
  return {
    clientProfile: profileDescription,
    uniqueness: uniquenessData.uniqueness,
    uniquenessDescription: uniquenessData.description,
    similarProjects: projectComparisons,
    recommendations,
    warningFlags,
    strengths
  };
}

/**
 * Generate a human-readable profile description
 */
function generateProfileDescription(profile: StyleProfile): string {
  const strongestDimensions = Object.entries(profile.scores)
    .filter(([_, score]) => Math.abs(score) > 10)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3);
  
  if (strongestDimensions.length === 0) {
    return "Balanced aesthetic preferences";
  }
  
  const traits = strongestDimensions.map(([axis, score]) => {
    const [positive, negative] = axis.split('_');
    return score > 0 ? positive : negative;
  });
  
  const confidence = Math.round(profile.averageConfidence * 100);
  
  return `${traits.join(', ')} aesthetic with ${confidence}% confidence`;
}

/**
 * Export utility function to fetch historical profiles (would integrate with Supabase)
 */
export async function fetchHistoricalProfiles(designerId: string): Promise<StyleProfile[]> {
  // This would connect to your database to fetch completed projects
  // For now, returning empty array as placeholder
  
  try {
    // Example implementation:
    /*
    const { data, error } = await supabase
      .from('project_analytics')
      .select('*')
      .eq('designer_id', designerId)
      .not('style_scores', 'is', null);
    
    return data?.map(project => ({
      id: project.project_id,
      scores: project.style_scores,
      tags: project.tags || [],
      averageConfidence: project.average_confidence,
      clientName: project.client_name,
      projectType: project.project_type,
      completedAt: project.completed_at
    })) || [];
    */
    
    return [];
  } catch (error) {
    console.error('Failed to fetch historical profiles:', error);
    return [];
  }
}

/**
 * Cache insights to avoid recalculating for the same data
 */
const insightsCache = new Map<string, DesignerInsights>();

export function getCachedInsights(cacheKey: string): DesignerInsights | null {
  return insightsCache.get(cacheKey) || null;
}

export function setCachedInsights(cacheKey: string, insights: DesignerInsights): void {
  insightsCache.set(cacheKey, insights);
  
  // Simple cache cleanup - keep only last 100 entries
  if (insightsCache.size > 100) {
    const firstKey = insightsCache.keys().next().value;
    insightsCache.delete(firstKey);
  }
}