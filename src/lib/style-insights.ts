/**
 * Style Insights Engine
 * 
 * Generates rich, actionable insights for designers from the computed StyleProfile.
 * Detects conflicts, highlights areas of certainty/uncertainty, and provides recommendations.
 */

import type { StyleProfile, StyleAxes } from './style-intelligence';
import { AXIS_KEYS, AXIS_LABELS } from './style-intelligence';

export interface DesignerInsight {
  type: 'confidence' | 'conflict' | 'recommendation' | 'risk' | 'opportunity';
  severity: 'info' | 'warning' | 'important';
  title: string;
  description: string;
  relatedAxes?: (keyof StyleAxes)[];
}

export interface StyleInsightsReport {
  insights: DesignerInsight[];
  summary: string;
  strongAreas: string[];
  uncertainAreas: string[];
  conflicts: DesignerInsight[];
  overallClarity: number; // 0-100
}

/**
 * Generate comprehensive designer insights from a style profile
 */
export function generateStyleInsights(profile: StyleProfile, allResponses: Record<string, unknown>): StyleInsightsReport {
  const insights: DesignerInsight[] = [];

  // 1. Confidence analysis
  const highConfAxes = AXIS_KEYS.filter(k => profile.confidence[k] >= 0.7);
  const lowConfAxes = AXIS_KEYS.filter(k => profile.confidence[k] < 0.35);
  const midConfAxes = AXIS_KEYS.filter(k => profile.confidence[k] >= 0.35 && profile.confidence[k] < 0.7);

  if (highConfAxes.length > 0) {
    const labels = highConfAxes.map(k => {
      const val = profile.axes[k];
      const [neg, pos] = AXIS_LABELS[k];
      return val > 0 ? pos.toLowerCase() : neg.toLowerCase();
    });
    insights.push({
      type: 'confidence',
      severity: 'info',
      title: `Strong opinions on ${labels.slice(0, 3).join(', ')}`,
      description: `This client feels strongly about their ${labels.join(', ')} preferences (confidence: ${Math.round(Math.max(...highConfAxes.map(k => profile.confidence[k])) * 100)}%). Respect these choices closely in your design.`,
      relatedAxes: highConfAxes,
    });
  }

  if (lowConfAxes.length > 0) {
    const labels = lowConfAxes.map(k => {
      const [neg, pos] = AXIS_LABELS[k];
      return `${neg}/${pos}`;
    });
    insights.push({
      type: 'confidence',
      severity: 'warning',
      title: `Uncertain about ${labels.slice(0, 2).join(' and ')}`,
      description: `The client hasn't expressed strong preferences here — present 2-3 options in these areas and guide them through the decision.`,
      relatedAxes: lowConfAxes,
    });
  }

  // 2. Conflict detection
  // Warm colors + cool/modern layout
  if (profile.axes.warm_cool > 0.3 && profile.axes.modern_classic > 0.5) {
    insights.push({
      type: 'conflict',
      severity: 'warning',
      title: 'Warm tones with ultra-modern layout',
      description: 'Their color preferences lean warm/inviting, but their layout preference is very modern/technical. This can work beautifully (think Airbnb) but needs careful balancing. Consider warm accent colors within a clean modern structure.',
      relatedAxes: ['warm_cool', 'modern_classic'],
    });
  }

  // Playful but luxury
  if (profile.axes.playful_serious > 0.3 && profile.axes.luxury_accessible > 0.5) {
    insights.push({
      type: 'conflict',
      severity: 'warning',
      title: 'Playful personality with luxury positioning',
      description: 'The client wants to feel premium but also approachable. This is a sophisticated balance — think Glossier or Away. Avoid being either too corporate or too casual.',
      relatedAxes: ['playful_serious', 'luxury_accessible'],
    });
  }

  // Bold + minimal
  if (profile.axes.bold_subtle > 0.4 && profile.axes.minimal_ornate > 0.5) {
    insights.push({
      type: 'opportunity',
      severity: 'info',
      title: 'Bold minimalism — a powerful combo',
      description: 'They want bold impact through simplicity, not complexity. Think one strong typeface, dramatic whitespace, and a single accent color. Less is more, but what\'s there should punch.',
      relatedAxes: ['bold_subtle', 'minimal_ornate'],
    });
  }

  // Classic + geometric
  if (profile.axes.modern_classic < -0.3 && profile.axes.geometric_organic > 0.4) {
    insights.push({
      type: 'conflict',
      severity: 'info',
      title: 'Classic style with geometric precision',
      description: 'They lean traditional but want structured geometry. Consider Art Deco-inspired approaches that bridge both worlds — geometric patterns with classic serif typography.',
      relatedAxes: ['modern_classic', 'geometric_organic'],
    });
  }

  // 3. Archetype-based recommendations
  const topArch = profile.archetypes[0];
  if (topArch && topArch.matchScore > 70) {
    insights.push({
      type: 'recommendation',
      severity: 'info',
      title: `Reference: ${topArch.name} (${topArch.matchScore}% match)`,
      description: `${topArch.description}. Study their approach for tone and execution, but create something original. Key traits: ${topArch.personality.join(', ')}.`,
    });
  }

  // If top archetypes are close, flag the blend
  if (profile.archetypes.length >= 2) {
    const [first, second] = profile.archetypes;
    if (first.matchScore - second.matchScore < 10 && first.matchScore > 60) {
      insights.push({
        type: 'recommendation',
        severity: 'info',
        title: `Blended reference: ${first.name} meets ${second.name}`,
        description: `This client sits between ${first.name} and ${second.name}. Consider blending elements from both — ${first.personality.slice(0, 2).join(', ')} from ${first.name} with ${second.personality.slice(0, 2).join(', ')} from ${second.name}.`,
      });
    }
  }

  // 4. Color-typography alignment check
  const colorPrefs = allResponses.color_preferences as Record<string, unknown> | undefined;
  const typoPrefs = allResponses.typography_feel as Record<string, unknown> | undefined;
  
  if (colorPrefs?.selectedPalettes && typoPrefs?.fontStyles) {
    const palettes = colorPrefs.selectedPalettes as string[];
    const fonts = typoPrefs.fontStyles as string[];
    
    // Serif + neon/bold colors = tension
    if (fonts.includes('serif') && palettes.some(p => ['Midnight', 'Coral'].includes(p))) {
      insights.push({
        type: 'conflict',
        severity: 'warning',
        title: 'Serif typography with bold color palette',
        description: 'Classic serif fonts paired with vibrant/dramatic colors creates tension. This can be intentional and striking (editorial style) or feel disjointed. Clarify if they want editorial contrast or harmonious elegance.',
        relatedAxes: ['modern_classic', 'bold_subtle'],
      });
    }

    // Handwritten + monochrome = unlikely pairing
    if (fonts.includes('handwritten') && palettes.includes('Monochrome')) {
      insights.push({
        type: 'risk',
        severity: 'warning',
        title: 'Handwritten style with monochrome palette',
        description: 'Handwritten fonts typically pair with warm, colorful palettes. The monochrome choice may make handwriting feel cold. Consider adding a warm accent color to bridge this gap.',
      });
    }
  }

  // 5. Signal density insights
  if (profile.signalCount < 5) {
    insights.push({
      type: 'confidence',
      severity: 'warning',
      title: 'Limited data — early in the questionnaire',
      description: 'The style profile is still forming. Current recommendations are based on limited signals. As the client answers more questions, the profile will sharpen significantly.',
    });
  } else if (profile.signalCount > 15) {
    insights.push({
      type: 'confidence',
      severity: 'info',
      title: 'Rich profile data available',
      description: `Built from ${profile.signalCount} data points. This is a well-informed profile — trust the recommendations and use them as a strong starting point.`,
    });
  }

  // 6. Personality summary
  const personality = profile.recommendations.brandPersonality;
  if (personality.length >= 3) {
    insights.push({
      type: 'recommendation',
      severity: 'info',
      title: `Brand personality: ${personality.join(', ')}`,
      description: `Every design decision should feel ${personality.slice(0, 3).join(', ').toLowerCase()}. Use this as a gut-check: if a design element doesn't feel like these words, reconsider.`,
    });
  }

  // Compute overall clarity
  const avgConfidence = AXIS_KEYS.reduce((sum, k) => sum + profile.confidence[k], 0) / AXIS_KEYS.length;
  const overallClarity = Math.round(avgConfidence * 100);

  const conflicts = insights.filter(i => i.type === 'conflict');
  const strongAreas = highConfAxes.map(k => {
    const val = profile.axes[k];
    const [neg, pos] = AXIS_LABELS[k];
    return val > 0 ? pos : neg;
  });
  const uncertainAreas = lowConfAxes.map(k => {
    const [neg, pos] = AXIS_LABELS[k];
    return `${neg}/${pos}`;
  });

  // Build summary
  const summaryParts: string[] = [];
  if (overallClarity >= 70) {
    summaryParts.push('This client has a clear design vision.');
  } else if (overallClarity >= 40) {
    summaryParts.push('This client has moderate clarity on their style preferences.');
  } else {
    summaryParts.push('This client needs guidance — their style preferences are still forming.');
  }
  if (conflicts.length > 0) {
    summaryParts.push(`There ${conflicts.length === 1 ? 'is 1 tension' : `are ${conflicts.length} tensions`} in their choices worth exploring.`);
  }
  if (topArch && topArch.matchScore > 70) {
    summaryParts.push(`Closest reference: ${topArch.name}.`);
  }

  return {
    insights: insights.sort((a, b) => {
      const severityOrder = { important: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }),
    summary: summaryParts.join(' '),
    strongAreas,
    uncertainAreas,
    conflicts,
    overallClarity,
  };
}
