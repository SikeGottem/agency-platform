/**
 * Style Intelligence Engine
 * 
 * The brain of Briefed's Akinator-like style system.
 * Takes all questionnaire responses and computes a live, evolving style profile.
 * Uses Bayesian-style updating where strong signals weight more than weak ones.
 */

// ============================================
// Core Types
// ============================================

export interface StyleAxes {
  modern_classic: number;    // -1 (classic) to 1 (modern)
  bold_subtle: number;       // -1 (subtle) to 1 (bold)
  warm_cool: number;         // -1 (cool) to 1 (warm)
  minimal_ornate: number;    // -1 (ornate) to 1 (minimal)
  playful_serious: number;   // -1 (serious) to 1 (playful)
  geometric_organic: number; // -1 (organic) to 1 (geometric)
  luxury_accessible: number; // -1 (accessible) to 1 (luxury)
}

export const AXIS_KEYS: (keyof StyleAxes)[] = [
  'modern_classic', 'bold_subtle', 'warm_cool', 'minimal_ornate',
  'playful_serious', 'geometric_organic', 'luxury_accessible',
];

export const AXIS_LABELS: Record<keyof StyleAxes, [string, string]> = {
  modern_classic: ['Classic', 'Modern'],
  bold_subtle: ['Subtle', 'Bold'],
  warm_cool: ['Cool', 'Warm'],
  minimal_ornate: ['Ornate', 'Minimal'],
  playful_serious: ['Serious', 'Playful'],
  geometric_organic: ['Organic', 'Geometric'],
  luxury_accessible: ['Accessible', 'Luxury'],
};

export interface FontRecommendation {
  name: string;
  category: string;
  googleFontsFamily: string;
  reason: string;
  score: number; // 0-1 match score
}

export interface PaletteRecommendation {
  name: string;
  colors: string[];
  reason: string;
  score: number;
  mood: string;
}

export interface BrandArchetype {
  name: string;
  matchScore: number; // 0-100
  axes: Partial<StyleAxes>;
  description: string;
  website?: string;
  personality: string[];
}

export interface StyleProfile {
  axes: StyleAxes;
  confidence: Record<keyof StyleAxes, number>;
  recommendations: {
    fonts: FontRecommendation[];
    colorPalettes: PaletteRecommendation[];
    layoutStyle: string;
    imageryStyle: string;
    brandPersonality: string[];
  };
  archetypes: BrandArchetype[];
  signalCount: number;
}

// ============================================
// Signal System
// ============================================

interface StyleSignal {
  source: string;
  axisDeltas: Partial<StyleAxes>;
  weight: number; // 0-1, how much to trust this signal
}

// ============================================
// Brand Archetypes Database
// ============================================

const BRAND_ARCHETYPES: BrandArchetype[] = [
  {
    name: 'Stripe',
    matchScore: 0,
    axes: { modern_classic: 0.9, bold_subtle: 0.3, warm_cool: -0.3, minimal_ornate: 0.8, playful_serious: -0.2, geometric_organic: 0.7, luxury_accessible: 0.5 },
    description: 'Technical elegance with gradient accents and pristine typography',
    website: 'https://stripe.com',
    personality: ['Precise', 'Premium', 'Technical', 'Clean'],
  },
  {
    name: 'Linear',
    matchScore: 0,
    axes: { modern_classic: 0.95, bold_subtle: 0.2, warm_cool: -0.5, minimal_ornate: 0.9, playful_serious: -0.3, geometric_organic: 0.8, luxury_accessible: 0.6 },
    description: 'Ultra-minimal dark interfaces with subtle depth',
    website: 'https://linear.app',
    personality: ['Focused', 'Minimal', 'Dark', 'Efficient'],
  },
  {
    name: 'Notion',
    matchScore: 0,
    axes: { modern_classic: 0.7, bold_subtle: -0.3, warm_cool: 0.2, minimal_ornate: 0.7, playful_serious: 0.3, geometric_organic: 0.2, luxury_accessible: -0.3 },
    description: 'Friendly minimalism with playful illustrations',
    website: 'https://notion.so',
    personality: ['Approachable', 'Clean', 'Playful', 'Flexible'],
  },
  {
    name: 'Apple',
    matchScore: 0,
    axes: { modern_classic: 0.8, bold_subtle: 0.5, warm_cool: -0.2, minimal_ornate: 0.9, playful_serious: -0.2, geometric_organic: 0.6, luxury_accessible: 0.9 },
    description: 'Premium minimalism with cinematic product focus',
    website: 'https://apple.com',
    personality: ['Premium', 'Minimal', 'Innovative', 'Aspirational'],
  },
  {
    name: 'Mailchimp',
    matchScore: 0,
    axes: { modern_classic: 0.5, bold_subtle: 0.6, warm_cool: 0.7, minimal_ornate: -0.2, playful_serious: 0.9, geometric_organic: -0.4, luxury_accessible: -0.5 },
    description: 'Playful illustrations with warm, friendly energy',
    website: 'https://mailchimp.com',
    personality: ['Fun', 'Friendly', 'Quirky', 'Warm'],
  },
  {
    name: 'Chanel',
    matchScore: 0,
    axes: { modern_classic: -0.5, bold_subtle: 0.4, warm_cool: -0.4, minimal_ornate: 0.3, playful_serious: -0.8, geometric_organic: 0.3, luxury_accessible: 0.95 },
    description: 'Timeless luxury with black, white, and gold',
    website: 'https://chanel.com',
    personality: ['Luxurious', 'Timeless', 'Elegant', 'Exclusive'],
  },
  {
    name: 'Spotify',
    matchScore: 0,
    axes: { modern_classic: 0.7, bold_subtle: 0.8, warm_cool: 0.3, minimal_ornate: 0.4, playful_serious: 0.5, geometric_organic: -0.2, luxury_accessible: -0.4 },
    description: 'Bold duotones with energetic gradients',
    website: 'https://spotify.com',
    personality: ['Energetic', 'Bold', 'Youthful', 'Expressive'],
  },
  {
    name: 'Aesop',
    matchScore: 0,
    axes: { modern_classic: -0.2, bold_subtle: -0.5, warm_cool: 0.6, minimal_ornate: 0.5, playful_serious: -0.6, geometric_organic: -0.5, luxury_accessible: 0.7 },
    description: 'Refined simplicity with warm, natural tones',
    website: 'https://aesop.com',
    personality: ['Refined', 'Natural', 'Understated', 'Artisanal'],
  },
  {
    name: 'Nike',
    matchScore: 0,
    axes: { modern_classic: 0.6, bold_subtle: 0.95, warm_cool: 0.1, minimal_ornate: 0.3, playful_serious: 0.2, geometric_organic: 0.2, luxury_accessible: 0.3 },
    description: 'Maximum impact with bold typography and high contrast',
    website: 'https://nike.com',
    personality: ['Bold', 'Powerful', 'Inspiring', 'Athletic'],
  },
  {
    name: 'Muji',
    matchScore: 0,
    axes: { modern_classic: 0.3, bold_subtle: -0.8, warm_cool: 0.3, minimal_ornate: 0.95, playful_serious: -0.4, geometric_organic: 0.1, luxury_accessible: -0.2 },
    description: 'Japanese minimalism — nothing unnecessary',
    website: 'https://muji.com',
    personality: ['Minimal', 'Calm', 'Natural', 'Essential'],
  },
  {
    name: 'Glossier',
    matchScore: 0,
    axes: { modern_classic: 0.5, bold_subtle: 0.1, warm_cool: 0.7, minimal_ornate: 0.4, playful_serious: 0.5, geometric_organic: -0.3, luxury_accessible: 0.2 },
    description: 'Soft pinks, dewy aesthetics, millennial-friendly',
    website: 'https://glossier.com',
    personality: ['Fresh', 'Approachable', 'Feminine', 'Modern'],
  },
  {
    name: 'IBM',
    matchScore: 0,
    axes: { modern_classic: 0.3, bold_subtle: 0.2, warm_cool: -0.6, minimal_ornate: 0.6, playful_serious: -0.7, geometric_organic: 0.8, luxury_accessible: 0.3 },
    description: 'Structured design system with corporate precision',
    website: 'https://ibm.com',
    personality: ['Corporate', 'Structured', 'Reliable', 'Systematic'],
  },
  {
    name: 'Figma',
    matchScore: 0,
    axes: { modern_classic: 0.8, bold_subtle: 0.5, warm_cool: 0.2, minimal_ornate: 0.5, playful_serious: 0.6, geometric_organic: 0.4, luxury_accessible: -0.3 },
    description: 'Vibrant gradients with clean, collaborative energy',
    website: 'https://figma.com',
    personality: ['Creative', 'Collaborative', 'Vibrant', 'Modern'],
  },
  {
    name: 'Patagonia',
    matchScore: 0,
    axes: { modern_classic: -0.1, bold_subtle: 0.3, warm_cool: 0.5, minimal_ornate: 0.2, playful_serious: -0.1, geometric_organic: -0.7, luxury_accessible: -0.3 },
    description: 'Rugged outdoor authenticity with earthy tones',
    website: 'https://patagonia.com',
    personality: ['Authentic', 'Rugged', 'Earthy', 'Purpose-driven'],
  },
  {
    name: 'Airbnb',
    matchScore: 0,
    axes: { modern_classic: 0.6, bold_subtle: 0.3, warm_cool: 0.8, minimal_ornate: 0.3, playful_serious: 0.4, geometric_organic: -0.2, luxury_accessible: -0.2 },
    description: 'Warm coral tones with human-centered photography',
    website: 'https://airbnb.com',
    personality: ['Welcoming', 'Human', 'Warm', 'Adventurous'],
  },
];

// ============================================
// Industry Signal Mappings
// ============================================

const INDUSTRY_SIGNALS: Record<string, Partial<StyleAxes>> = {
  'Technology': { modern_classic: 0.6, minimal_ornate: 0.5, geometric_organic: 0.4, luxury_accessible: 0.1 },
  'Healthcare': { modern_classic: 0.3, bold_subtle: -0.3, warm_cool: 0.1, minimal_ornate: 0.4, playful_serious: -0.5, luxury_accessible: -0.2 },
  'Fashion & Apparel': { bold_subtle: 0.4, warm_cool: 0.1, luxury_accessible: 0.5, playful_serious: 0.1 },
  'Food & Beverage': { warm_cool: 0.6, playful_serious: 0.3, geometric_organic: -0.3 },
  'Finance & Banking': { modern_classic: 0.2, bold_subtle: -0.3, warm_cool: -0.3, minimal_ornate: 0.5, playful_serious: -0.7, geometric_organic: 0.4, luxury_accessible: 0.3 },
  'Fitness & Wellness': { modern_classic: 0.4, bold_subtle: 0.7, warm_cool: 0.2, playful_serious: 0.3 },
  'Real Estate': { warm_cool: 0.3, playful_serious: -0.3, luxury_accessible: 0.4 },
  'Education': { warm_cool: 0.4, playful_serious: 0.4, luxury_accessible: -0.4 },
  'Creative & Design': { modern_classic: 0.5, bold_subtle: 0.5, playful_serious: 0.4, geometric_organic: 0.1 },
  'Consulting': { modern_classic: 0.3, minimal_ornate: 0.5, playful_serious: -0.5, geometric_organic: 0.3, luxury_accessible: 0.2 },
  'Beauty & Cosmetics': { warm_cool: 0.4, luxury_accessible: 0.4, geometric_organic: -0.3, playful_serious: 0.2 },
  'Nonprofit': { warm_cool: 0.5, playful_serious: 0.2, luxury_accessible: -0.5 },
  'Retail & E-commerce': { bold_subtle: 0.3, warm_cool: 0.2, playful_serious: 0.3 },
  'Legal': { modern_classic: -0.3, bold_subtle: -0.3, playful_serious: -0.8, geometric_organic: 0.3, luxury_accessible: 0.3 },
};

// ============================================
// Font Recommendation Database
// ============================================

interface FontProfile {
  name: string;
  category: string;
  googleFontsFamily: string;
  axes: Partial<StyleAxes>;
}

const FONT_DATABASE: FontProfile[] = [
  { name: 'Inter', category: 'sans-serif', googleFontsFamily: 'Inter', axes: { modern_classic: 0.7, minimal_ornate: 0.7, geometric_organic: 0.5 } },
  { name: 'Space Grotesk', category: 'sans-serif', googleFontsFamily: 'Space+Grotesk', axes: { modern_classic: 0.9, geometric_organic: 0.8, playful_serious: 0.1 } },
  { name: 'DM Sans', category: 'sans-serif', googleFontsFamily: 'DM+Sans', axes: { modern_classic: 0.6, minimal_ornate: 0.6, geometric_organic: 0.4 } },
  { name: 'Outfit', category: 'sans-serif', googleFontsFamily: 'Outfit', axes: { modern_classic: 0.8, geometric_organic: 0.6, playful_serious: 0.2 } },
  { name: 'Sora', category: 'sans-serif', googleFontsFamily: 'Sora', axes: { modern_classic: 0.8, bold_subtle: 0.3, geometric_organic: 0.7 } },
  { name: 'Plus Jakarta Sans', category: 'sans-serif', googleFontsFamily: 'Plus+Jakarta+Sans', axes: { modern_classic: 0.7, warm_cool: 0.2, geometric_organic: 0.3 } },
  { name: 'Playfair Display', category: 'serif', googleFontsFamily: 'Playfair+Display', axes: { modern_classic: -0.4, luxury_accessible: 0.7, bold_subtle: 0.3 } },
  { name: 'Lora', category: 'serif', googleFontsFamily: 'Lora', axes: { modern_classic: -0.2, warm_cool: 0.4, luxury_accessible: 0.3 } },
  { name: 'Fraunces', category: 'serif', googleFontsFamily: 'Fraunces', axes: { modern_classic: -0.1, playful_serious: 0.4, geometric_organic: -0.3, warm_cool: 0.3 } },
  { name: 'Cormorant Garamond', category: 'serif', googleFontsFamily: 'Cormorant+Garamond', axes: { modern_classic: -0.6, luxury_accessible: 0.8, minimal_ornate: -0.2 } },
  { name: 'Source Serif 4', category: 'serif', googleFontsFamily: 'Source+Serif+4', axes: { modern_classic: -0.1, playful_serious: -0.3, luxury_accessible: 0.2 } },
  { name: 'JetBrains Mono', category: 'monospace', googleFontsFamily: 'JetBrains+Mono', axes: { modern_classic: 0.8, geometric_organic: 0.9, playful_serious: -0.2 } },
  { name: 'Space Mono', category: 'monospace', googleFontsFamily: 'Space+Mono', axes: { modern_classic: 0.7, geometric_organic: 0.7, playful_serious: 0.1 } },
  { name: 'Caveat', category: 'handwriting', googleFontsFamily: 'Caveat', axes: { modern_classic: -0.3, playful_serious: 0.8, geometric_organic: -0.8, warm_cool: 0.5 } },
  { name: 'Archivo', category: 'sans-serif', googleFontsFamily: 'Archivo', axes: { modern_classic: 0.6, bold_subtle: 0.5, geometric_organic: 0.5 } },
  { name: 'Bricolage Grotesque', category: 'sans-serif', googleFontsFamily: 'Bricolage+Grotesque', axes: { modern_classic: 0.5, playful_serious: 0.3, geometric_organic: -0.2, warm_cool: 0.2 } },
  { name: 'Instrument Serif', category: 'serif', googleFontsFamily: 'Instrument+Serif', axes: { modern_classic: 0.2, luxury_accessible: 0.5, minimal_ornate: 0.3 } },
  { name: 'Bebas Neue', category: 'display', googleFontsFamily: 'Bebas+Neue', axes: { bold_subtle: 0.9, modern_classic: 0.4, geometric_organic: 0.6 } },
  { name: 'Righteous', category: 'display', googleFontsFamily: 'Righteous', axes: { bold_subtle: 0.6, playful_serious: 0.5, geometric_organic: 0.3 } },
  { name: 'Merriweather', category: 'serif', googleFontsFamily: 'Merriweather', axes: { modern_classic: -0.3, playful_serious: -0.2, warm_cool: 0.2 } },
];

// ============================================
// Palette Recommendation Database
// ============================================

interface PaletteProfile {
  name: string;
  colors: string[];
  mood: string;
  axes: Partial<StyleAxes>;
}

const PALETTE_DATABASE: PaletteProfile[] = [
  { name: 'Midnight Tech', colors: ['#0F172A', '#1E293B', '#3B82F6', '#60A5FA', '#F8FAFC'], mood: 'Technical & Premium', axes: { modern_classic: 0.8, warm_cool: -0.6, luxury_accessible: 0.5, minimal_ornate: 0.6 } },
  { name: 'Warm Terracotta', colors: ['#92400E', '#C2410C', '#F59E0B', '#FEF3C7', '#FFFBEB'], mood: 'Earthy & Inviting', axes: { warm_cool: 0.9, modern_classic: -0.2, geometric_organic: -0.4, luxury_accessible: 0.1 } },
  { name: 'Sage & Stone', colors: ['#1C1917', '#57534E', '#84CC16', '#A3E635', '#F5F5F4'], mood: 'Natural & Calm', axes: { warm_cool: 0.4, minimal_ornate: 0.6, geometric_organic: -0.5, playful_serious: -0.2 } },
  { name: 'Electric Violet', colors: ['#2E1065', '#7C3AED', '#A78BFA', '#C4B5FD', '#EDE9FE'], mood: 'Creative & Bold', axes: { bold_subtle: 0.7, modern_classic: 0.6, playful_serious: 0.3, luxury_accessible: 0.3 } },
  { name: 'Coral Breeze', colors: ['#FF6B6B', '#FFA07A', '#FFD4A8', '#FFF5EE', '#FFFFFF'], mood: 'Warm & Friendly', axes: { warm_cool: 0.8, playful_serious: 0.5, bold_subtle: 0.3, luxury_accessible: -0.3 } },
  { name: 'Monochrome Pro', colors: ['#09090B', '#27272A', '#52525B', '#A1A1AA', '#FAFAFA'], mood: 'Serious & Professional', axes: { minimal_ornate: 0.8, playful_serious: -0.6, modern_classic: 0.5, luxury_accessible: 0.3 } },
  { name: 'Ocean Depth', colors: ['#0C4A6E', '#0369A1', '#0EA5E9', '#7DD3FC', '#F0F9FF'], mood: 'Trustworthy & Clean', axes: { warm_cool: -0.5, playful_serious: -0.3, modern_classic: 0.3, luxury_accessible: -0.1 } },
  { name: 'Forest Luxe', colors: ['#14532D', '#166534', '#22C55E', '#BBF7D0', '#FEF9C3'], mood: 'Natural & Premium', axes: { warm_cool: 0.3, geometric_organic: -0.6, luxury_accessible: 0.4, playful_serious: -0.1 } },
  { name: 'Blush & Navy', colors: ['#1E3A5F', '#2563EB', '#F9A8D4', '#FDF2F8', '#FFFFFF'], mood: 'Sophisticated & Fresh', axes: { modern_classic: 0.4, luxury_accessible: 0.4, warm_cool: 0.2, bold_subtle: 0.2 } },
  { name: 'Neon Minimal', colors: ['#000000', '#1A1A1A', '#00FF87', '#ECFDF5', '#FFFFFF'], mood: 'Edgy & Modern', axes: { modern_classic: 0.9, bold_subtle: 0.6, minimal_ornate: 0.7, playful_serious: 0.2 } },
  { name: 'Sunset Gradient', colors: ['#FF6B35', '#F7C59F', '#EFEFD0', '#004E89', '#1A1A2E'], mood: 'Energetic & Warm', axes: { warm_cool: 0.7, bold_subtle: 0.6, playful_serious: 0.4, luxury_accessible: -0.1 } },
  { name: 'Lavender Dream', colors: ['#4C1D95', '#6D28D9', '#8B5CF6', '#DDD6FE', '#FAF5FF'], mood: 'Soft & Creative', axes: { playful_serious: 0.2, warm_cool: 0.1, bold_subtle: 0.1, luxury_accessible: 0.2 } },
  { name: 'Gold Standard', colors: ['#1C1917', '#44403C', '#CA8A04', '#FDE68A', '#FFFBEB'], mood: 'Luxurious & Classic', axes: { luxury_accessible: 0.9, modern_classic: -0.4, bold_subtle: 0.3, playful_serious: -0.5 } },
  { name: 'Fresh Mint', colors: ['#064E3B', '#059669', '#34D399', '#A7F3D0', '#ECFDF5'], mood: 'Fresh & Approachable', axes: { warm_cool: -0.1, playful_serious: 0.3, modern_classic: 0.3, luxury_accessible: -0.3 } },
];

// ============================================
// Core Engine
// ============================================

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function emptyAxes(): StyleAxes {
  return { modern_classic: 0, bold_subtle: 0, warm_cool: 0, minimal_ornate: 0, playful_serious: 0, geometric_organic: 0, luxury_accessible: 0 };
}

function emptyConfidence(): Record<keyof StyleAxes, number> {
  return { modern_classic: 0, bold_subtle: 0, warm_cool: 0, minimal_ornate: 0, playful_serious: 0, geometric_organic: 0, luxury_accessible: 0 };
}

/**
 * Extract signals from all questionnaire responses
 */
function extractSignals(allResponses: Record<string, unknown>): StyleSignal[] {
  const signals: StyleSignal[] = [];

  // 1. Business info signals (weak - industry defaults)
  const businessInfo = allResponses.business_info as Record<string, unknown> | undefined;
  if (businessInfo?.industry && typeof businessInfo.industry === 'string') {
    const industryAxes = INDUSTRY_SIGNALS[businessInfo.industry];
    if (industryAxes) {
      signals.push({ source: 'industry', axisDeltas: industryAxes, weight: 0.3 });
    }
  }

  // Business description keywords
  if (businessInfo?.description && typeof businessInfo.description === 'string') {
    const desc = businessInfo.description.toLowerCase();
    const keywordSignals: Record<string, Partial<StyleAxes>> = {
      'luxury': { luxury_accessible: 0.5 },
      'premium': { luxury_accessible: 0.4, bold_subtle: 0.2 },
      'affordable': { luxury_accessible: -0.5 },
      'fun': { playful_serious: 0.5, warm_cool: 0.2 },
      'professional': { playful_serious: -0.4, minimal_ornate: 0.2 },
      'innovative': { modern_classic: 0.5, geometric_organic: 0.2 },
      'traditional': { modern_classic: -0.5 },
      'startup': { modern_classic: 0.4, minimal_ornate: 0.3 },
      'enterprise': { playful_serious: -0.4, luxury_accessible: 0.2 },
      'creative': { playful_serious: 0.3, bold_subtle: 0.3 },
      'minimal': { minimal_ornate: 0.5 },
      'bold': { bold_subtle: 0.5 },
      'elegant': { luxury_accessible: 0.4, bold_subtle: -0.2 },
      'friendly': { playful_serious: 0.3, warm_cool: 0.3 },
      'modern': { modern_classic: 0.4 },
      'natural': { geometric_organic: -0.4, warm_cool: 0.3 },
      'tech': { modern_classic: 0.4, geometric_organic: 0.3 },
    };

    for (const [keyword, axes] of Object.entries(keywordSignals)) {
      if (desc.includes(keyword)) {
        signals.push({ source: `keyword:${keyword}`, axisDeltas: axes, weight: 0.15 });
      }
    }
  }

  // 2. Project scope signals (weak)
  const projectScope = allResponses.project_scope as Record<string, unknown> | undefined;
  if (projectScope?.deliverables && Array.isArray(projectScope.deliverables)) {
    const deliverables = projectScope.deliverables as string[];
    if (deliverables.includes('brand_strategy')) {
      signals.push({ source: 'deliverable:strategy', axisDeltas: { playful_serious: -0.2, luxury_accessible: 0.2 }, weight: 0.15 });
    }
    if (deliverables.includes('social_templates') || deliverables.includes('story_templates')) {
      signals.push({ source: 'deliverable:social', axisDeltas: { playful_serious: 0.2, modern_classic: 0.2 }, weight: 0.15 });
    }
    if (deliverables.includes('ecommerce')) {
      signals.push({ source: 'deliverable:ecommerce', axisDeltas: { modern_classic: 0.2, bold_subtle: 0.1 }, weight: 0.15 });
    }
  }

  // 3. Adaptive style A/B choices (STRONG signal)
  const styleDirection = allResponses.style_direction as Record<string, unknown> | undefined;
  if (styleDirection?.choices && Array.isArray(styleDirection.choices)) {
    const choices = styleDirection.choices as Array<{
      pairId: string;
      picked: 'A' | 'B';
      confidence: number;
    }>;

    for (const choice of choices) {
      // Map the old-style scores to our new axes
      // These come from the adaptive-style-selector's internal scoring
      // We just treat the entire choice set as a strong composite signal
      const conf = choice.confidence || 0.8;
      signals.push({
        source: `ab_choice:${choice.pairId}`,
        axisDeltas: {}, // Handled via scores below
        weight: 0.7 * conf,
      });
    }

    // Use the aggregated scores from adaptive style selector
    if (styleDirection.scores && typeof styleDirection.scores === 'object') {
      const scores = styleDirection.scores as Record<string, number>;
      const axisMap: Partial<StyleAxes> = {};
      // Map old axis names to new ones (normalize from -25/25 range to -1/1)
      if (scores.modern_classic !== undefined) axisMap.modern_classic = scores.modern_classic / 25;
      if (scores.bold_subtle !== undefined) axisMap.bold_subtle = scores.bold_subtle / 25;
      if (scores.warm_cool !== undefined) axisMap.warm_cool = scores.warm_cool / 25;
      if (scores.minimal_ornate !== undefined) axisMap.minimal_ornate = scores.minimal_ornate / 25;
      if (scores.playful_serious !== undefined) axisMap.playful_serious = scores.playful_serious / 25;
      if (scores.organic_geometric !== undefined) axisMap.geometric_organic = scores.organic_geometric / 25;
      if (scores.light_heavy !== undefined) {
        // light_heavy maps partially to minimal_ornate and bold_subtle
        axisMap.minimal_ornate = (axisMap.minimal_ornate || 0) + (scores.light_heavy / 50);
        axisMap.bold_subtle = (axisMap.bold_subtle || 0) - (scores.light_heavy / 50);
      }

      const avgConf = typeof styleDirection.averageConfidence === 'number' ? styleDirection.averageConfidence : 0.8;
      signals.push({ source: 'ab_aggregate', axisDeltas: axisMap, weight: 0.85 * avgConf });
    }
  }

  // Old-style style_direction data (selectedStyles array)
  if (styleDirection?.selectedStyles && Array.isArray(styleDirection.selectedStyles)) {
    const styleMap: Record<string, Partial<StyleAxes>> = {
      minimalist: { minimal_ornate: 0.7, modern_classic: 0.3, bold_subtle: -0.2 },
      bold: { bold_subtle: 0.7, minimal_ornate: -0.2 },
      playful: { playful_serious: 0.7, warm_cool: 0.3 },
      elegant: { luxury_accessible: 0.6, bold_subtle: -0.1, playful_serious: -0.3 },
      vintage: { modern_classic: -0.7, warm_cool: 0.2 },
      modern: { modern_classic: 0.7, geometric_organic: 0.3 },
      organic: { geometric_organic: -0.7, warm_cool: 0.3 },
      geometric: { geometric_organic: 0.7, modern_classic: 0.3 },
    };
    for (const style of styleDirection.selectedStyles as string[]) {
      if (styleMap[style]) {
        signals.push({ source: `style_pick:${style}`, axisDeltas: styleMap[style], weight: 0.6 });
      }
    }
  }

  // 4. Color preferences (medium signal)
  const colorPrefs = allResponses.color_preferences as Record<string, unknown> | undefined;
  if (colorPrefs?.selectedPalettes && Array.isArray(colorPrefs.selectedPalettes)) {
    const paletteAxes: Record<string, Partial<StyleAxes>> = {
      'Ocean': { warm_cool: -0.5, modern_classic: 0.2, playful_serious: -0.1 },
      'Sunset': { warm_cool: 0.7, bold_subtle: 0.3, playful_serious: 0.2 },
      'Forest': { warm_cool: 0.3, geometric_organic: -0.5, luxury_accessible: 0.1 },
      'Midnight': { warm_cool: -0.4, bold_subtle: 0.4, luxury_accessible: 0.3, modern_classic: 0.3 },
      'Coral': { warm_cool: 0.6, playful_serious: 0.3, bold_subtle: 0.1 },
      'Monochrome': { minimal_ornate: 0.6, playful_serious: -0.4, modern_classic: 0.3 },
      'Lavender': { playful_serious: 0.2, warm_cool: 0.1, luxury_accessible: 0.2 },
      'Earth': { warm_cool: 0.5, geometric_organic: -0.4, modern_classic: -0.2 },
    };
    for (const palette of colorPrefs.selectedPalettes as string[]) {
      if (paletteAxes[palette]) {
        signals.push({ source: `palette:${palette}`, axisDeltas: paletteAxes[palette], weight: 0.45 });
      }
    }
  }

  // 5. Typography (medium signal)
  const typo = allResponses.typography_feel as Record<string, unknown> | undefined;
  if (typo?.fontStyles && Array.isArray(typo.fontStyles)) {
    const fontAxes: Record<string, Partial<StyleAxes>> = {
      'serif': { modern_classic: -0.4, luxury_accessible: 0.3 },
      'sans-serif': { modern_classic: 0.4, minimal_ornate: 0.2 },
      'display': { bold_subtle: 0.5, playful_serious: 0.2 },
      'script': { luxury_accessible: 0.3, geometric_organic: -0.4, warm_cool: 0.2 },
      'monospace': { modern_classic: 0.5, geometric_organic: 0.6 },
      'handwritten': { playful_serious: 0.5, geometric_organic: -0.5, warm_cool: 0.3 },
    };
    for (const style of typo.fontStyles as string[]) {
      if (fontAxes[style]) {
        signals.push({ source: `font:${style}`, axisDeltas: fontAxes[style], weight: 0.5 });
      }
    }
  }
  if (typo?.fontWeight && typeof typo.fontWeight === 'string') {
    const weightAxes: Record<string, Partial<StyleAxes>> = {
      'light': { bold_subtle: -0.4, minimal_ornate: 0.3, luxury_accessible: 0.2 },
      'regular': {},
      'bold': { bold_subtle: 0.4, minimal_ornate: -0.1 },
    };
    if (weightAxes[typo.fontWeight]) {
      signals.push({ source: 'font_weight', axisDeltas: weightAxes[typo.fontWeight], weight: 0.35 });
    }
  }

  return signals;
}

/**
 * Apply signals using weighted Bayesian-style updating
 */
function applySignals(signals: StyleSignal[]): { axes: StyleAxes; confidence: Record<keyof StyleAxes, number>; signalCount: number } {
  const axes = emptyAxes();
  const confidence = emptyConfidence();
  const totalWeight: Record<keyof StyleAxes, number> = emptyConfidence();

  let signalCount = 0;

  for (const signal of signals) {
    for (const [axisKey, delta] of Object.entries(signal.axisDeltas)) {
      const key = axisKey as keyof StyleAxes;
      if (AXIS_KEYS.includes(key) && typeof delta === 'number') {
        const weightedDelta = delta * signal.weight;
        axes[key] += weightedDelta;
        totalWeight[key] += signal.weight;
        signalCount++;
      }
    }
  }

  // Normalize axes to [-1, 1] and compute confidence
  for (const key of AXIS_KEYS) {
    if (totalWeight[key] > 0) {
      // Normalize by total weight (weighted average behavior)
      axes[key] = clamp(axes[key] / Math.max(totalWeight[key], 0.5), -1, 1);
      // Confidence = how much data we have, diminishing returns
      confidence[key] = clamp(1 - Math.exp(-totalWeight[key] * 1.5), 0, 1);
    }
  }

  return { axes, confidence, signalCount };
}

/**
 * Generate font recommendations from the current profile
 */
function generateFontRecommendations(axes: StyleAxes, confidence: Record<keyof StyleAxes, number>): FontRecommendation[] {
  const scored = FONT_DATABASE.map(font => {
    let score = 0;
    let reasonParts: string[] = [];

    for (const [axisKey, fontValue] of Object.entries(font.axes)) {
      const key = axisKey as keyof StyleAxes;
      const profileValue = axes[key];
      const conf = confidence[key];
      // Similarity: positive product = aligned
      const alignment = fontValue * profileValue;
      score += alignment * conf;

      if (alignment > 0.15 && conf > 0.3) {
        const [neg, pos] = AXIS_LABELS[key];
        const direction = profileValue > 0 ? pos.toLowerCase() : neg.toLowerCase();
        reasonParts.push(direction);
      }
    }

    const reason = reasonParts.length > 0
      ? `Matches your ${reasonParts.slice(0, 2).join(' + ')} preference`
      : `A versatile ${font.category} option`;

    return {
      name: font.name,
      category: font.category,
      googleFontsFamily: font.googleFontsFamily,
      reason,
      score: clamp((score + 1) / 2, 0, 1), // normalize to 0-1
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Generate palette recommendations from the current profile
 */
function generatePaletteRecommendations(axes: StyleAxes, confidence: Record<keyof StyleAxes, number>): PaletteRecommendation[] {
  const scored = PALETTE_DATABASE.map(palette => {
    let score = 0;
    let reasonParts: string[] = [];

    for (const [axisKey, palValue] of Object.entries(palette.axes)) {
      const key = axisKey as keyof StyleAxes;
      const profileValue = axes[key];
      const conf = confidence[key];
      const alignment = (palValue as number) * profileValue;
      score += alignment * conf;

      if (alignment > 0.15 && conf > 0.3) {
        const [neg, pos] = AXIS_LABELS[key];
        const direction = profileValue > 0 ? pos.toLowerCase() : neg.toLowerCase();
        reasonParts.push(direction);
      }
    }

    const reason = reasonParts.length > 0
      ? `Complements your ${reasonParts.slice(0, 2).join(' + ')} style`
      : `A versatile palette for your brand`;

    return {
      name: palette.name,
      colors: palette.colors,
      reason,
      score: clamp((score + 1) / 2, 0, 1),
      mood: palette.mood,
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Match brand archetypes
 */
function matchArchetypes(axes: StyleAxes, confidence: Record<keyof StyleAxes, number>): BrandArchetype[] {
  return BRAND_ARCHETYPES.map(arch => {
    let totalDist = 0;
    let weightSum = 0;

    for (const key of AXIS_KEYS) {
      const archValue = arch.axes[key] ?? 0;
      const profileValue = axes[key];
      const conf = confidence[key];
      const diff = Math.abs(archValue - profileValue);
      totalDist += diff * diff * conf;
      weightSum += conf;
    }

    const avgDist = weightSum > 0 ? Math.sqrt(totalDist / weightSum) : 2;
    const matchScore = Math.round(clamp((1 - avgDist / 2) * 100, 0, 100));

    return { ...arch, matchScore };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Derive layout & imagery style
 */
function deriveLayoutStyle(axes: StyleAxes): string {
  if (axes.minimal_ornate > 0.5) return 'Spacious single-column with generous whitespace';
  if (axes.bold_subtle > 0.5) return 'Full-bleed hero sections with bold typography';
  if (axes.geometric_organic > 0.5) return 'Grid-based layout with structured sections';
  if (axes.geometric_organic < -0.5) return 'Flowing asymmetric layout with organic shapes';
  if (axes.luxury_accessible > 0.5) return 'Centered editorial layout with dramatic spacing';
  return 'Balanced two-column layout with clear hierarchy';
}

function deriveImageryStyle(axes: StyleAxes): string {
  if (axes.minimal_ornate > 0.5 && axes.modern_classic > 0.3) return 'Product-focused with clean backgrounds';
  if (axes.warm_cool > 0.5) return 'Warm lifestyle photography with natural light';
  if (axes.warm_cool < -0.5) return 'High-contrast studio photography with cool tones';
  if (axes.playful_serious > 0.5) return 'Colorful illustrations and candid photography';
  if (axes.luxury_accessible > 0.5) return 'Cinematic editorial photography';
  if (axes.geometric_organic < -0.5) return 'Textural close-ups and nature photography';
  return 'Mixed photography with consistent color grading';
}

function deriveBrandPersonality(axes: StyleAxes): string[] {
  const words: string[] = [];
  if (axes.modern_classic > 0.3) words.push('Modern');
  if (axes.modern_classic < -0.3) words.push('Classic');
  if (axes.bold_subtle > 0.3) words.push('Bold');
  if (axes.bold_subtle < -0.3) words.push('Refined');
  if (axes.warm_cool > 0.3) words.push('Warm');
  if (axes.warm_cool < -0.3) words.push('Cool');
  if (axes.minimal_ornate > 0.3) words.push('Clean');
  if (axes.minimal_ornate < -0.3) words.push('Rich');
  if (axes.playful_serious > 0.3) words.push('Friendly');
  if (axes.playful_serious < -0.3) words.push('Professional');
  if (axes.geometric_organic > 0.3) words.push('Precise');
  if (axes.geometric_organic < -0.3) words.push('Natural');
  if (axes.luxury_accessible > 0.3) words.push('Premium');
  if (axes.luxury_accessible < -0.3) words.push('Approachable');

  return words.length > 0 ? words.slice(0, 5) : ['Versatile', 'Balanced'];
}

// ============================================
// Public API
// ============================================

/**
 * Compute a complete StyleProfile from all questionnaire responses.
 * Call this whenever responses change.
 */
export function computeStyleProfile(allResponses: Record<string, unknown>): StyleProfile {
  const signals = extractSignals(allResponses);
  const { axes, confidence, signalCount } = applySignals(signals);

  const fonts = generateFontRecommendations(axes, confidence);
  const colorPalettes = generatePaletteRecommendations(axes, confidence);
  const archetypes = matchArchetypes(axes, confidence);

  return {
    axes,
    confidence,
    recommendations: {
      fonts,
      colorPalettes,
      layoutStyle: deriveLayoutStyle(axes),
      imageryStyle: deriveImageryStyle(axes),
      brandPersonality: deriveBrandPersonality(axes),
    },
    archetypes,
    signalCount,
  };
}

/**
 * Get the lowest-confidence axis (for the Akinator pair selection)
 */
export function getLowestConfidenceAxis(profile: StyleProfile): keyof StyleAxes {
  let minKey: keyof StyleAxes = 'modern_classic';
  let minConf = 1;
  for (const key of AXIS_KEYS) {
    if (profile.confidence[key] < minConf) {
      minConf = profile.confidence[key];
      minKey = key;
    }
  }
  return minKey;
}

/**
 * Get a "surprise me" font — one that's slightly outside the profile but interesting
 */
export function getSurpriseFont(profile: StyleProfile): FontRecommendation {
  const fonts = profile.recommendations.fonts;
  // Pick something from the middle of the pack — not the best match, not the worst
  const midIndex = Math.floor(fonts.length * 0.6);
  const font = fonts[midIndex] || fonts[0];
  return {
    ...font,
    reason: 'A curveball pick — slightly outside your profile but could add an interesting twist',
  };
}

export { FONT_DATABASE, PALETTE_DATABASE, BRAND_ARCHETYPES };
