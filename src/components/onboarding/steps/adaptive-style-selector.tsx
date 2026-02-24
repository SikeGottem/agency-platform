"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Palette, 
  BarChart3,
  Trophy,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

// ============================================
// Types & Interfaces
// ============================================

export interface AdaptiveStyleData {
  choices: Array<{
    pairId: string;
    picked: "A" | "B";
    confidence: number;
    timestamp: string;
  }>;
  scores: {
    modern_classic: number;
    bold_subtle: number;
    warm_cool: number;
    minimal_ornate: number;
    playful_serious: number;
    organic_geometric: number;
    light_heavy: number;
  };
  profile: {
    id: string;
    label: string;
    description: string;
  };
  tags: string[];
  brandExamples: string[];
  averageConfidence: number;
}

interface StylePair {
  id: string;
  optionA: {
    id: string;
    label: string;
    image: string;
    description: string;
    scores: Record<string, number>;
  };
  optionB: {
    id: string;
    label: string;
    image: string;
    description: string;
    scores: Record<string, number>;
  };
  weight: number; // For adaptive selection
}

// ============================================
// Style Pairs Data
// ============================================

const INITIAL_PAIRS: StylePair[] = [
  {
    id: "mood-1",
    optionA: {
      id: "clean-minimal",
      label: "Clean & Minimal",
      image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&h=300&fit=crop&q=80",
      description: "Lots of whitespace, simple forms",
      scores: { minimal_ornate: 20, modern_classic: 15, light_heavy: 15 }
    },
    optionB: {
      id: "rich-layered",
      label: "Rich & Layered",
      image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop&q=80",
      description: "Textures, depth, visual complexity",
      scores: { minimal_ornate: -20, warm_cool: 10, organic_geometric: -10 }
    },
    weight: 1.0
  },
  {
    id: "color-1",
    optionA: {
      id: "bold-vibrant",
      label: "Bold & Vibrant",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop&q=80",
      description: "High contrast, energetic colors",
      scores: { bold_subtle: 20, playful_serious: 15, warm_cool: 10 }
    },
    optionB: {
      id: "soft-muted",
      label: "Soft & Muted",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop&q=80",
      description: "Gentle tones, understated elegance",
      scores: { bold_subtle: -15, playful_serious: -10, warm_cool: -5 }
    },
    weight: 1.0
  },
  {
    id: "structure-1",
    optionA: {
      id: "geometric-precise",
      label: "Geometric & Precise",
      image: "https://images.unsplash.com/photo-1509537257950-20f875b03669?w=400&h=300&fit=crop&q=80",
      description: "Sharp lines, mathematical forms",
      scores: { organic_geometric: 20, modern_classic: 10, bold_subtle: 10 }
    },
    optionB: {
      id: "organic-flowing",
      label: "Organic & Flowing",
      image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=300&fit=crop&q=80",
      description: "Natural curves, hand-drawn feel",
      scores: { organic_geometric: -20, warm_cool: 15, playful_serious: 5 }
    },
    weight: 1.0
  },
  {
    id: "mood-2",
    optionA: {
      id: "serious-professional",
      label: "Serious & Professional",
      image: "https://images.unsplash.com/photo-1545239351-ef35f43d514b?w=400&h=300&fit=crop&q=80",
      description: "Corporate, trustworthy, refined",
      scores: { playful_serious: -20, modern_classic: -5, bold_subtle: -10 }
    },
    optionB: {
      id: "playful-approachable",
      label: "Playful & Approachable",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop&q=80",
      description: "Fun, friendly, conversational",
      scores: { playful_serious: 20, warm_cool: 10, organic_geometric: -5 }
    },
    weight: 1.0
  }
];

const ADAPTIVE_PAIRS: StylePair[] = [
  // === Depth 2: Minimal variations ===
  {
    id: "minimal-depth-1",
    optionA: {
      id: "ultra-minimal",
      label: "Ultra Minimal",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&q=80",
      description: "Almost nothing, maximum whitespace",
      scores: { minimal_ornate: 25, light_heavy: 20, modern_classic: 15 }
    },
    optionB: {
      id: "minimal-warmth",
      label: "Minimal + Warmth",
      image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=300&fit=crop&q=80",
      description: "Simple but inviting, subtle textures",
      scores: { minimal_ornate: 15, warm_cool: 15, light_heavy: 10 }
    },
    weight: 1.0
  },
  {
    id: "minimal-depth-2",
    optionA: {
      id: "japanese-minimal",
      label: "Japanese Minimal",
      image: "https://images.unsplash.com/photo-1545083036-b175dd155a1d?w=400&h=300&fit=crop&q=80",
      description: "Wabi-sabi, intentional imperfection, zen calm",
      scores: { minimal_ornate: 20, organic_geometric: -10, warm_cool: 5 }
    },
    optionB: {
      id: "scandinavian-minimal",
      label: "Scandinavian Minimal",
      image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=300&fit=crop&q=80",
      description: "Functional beauty, light wood, cozy simplicity",
      scores: { minimal_ornate: 18, warm_cool: 12, organic_geometric: -5 }
    },
    weight: 1.0
  },
  {
    id: "minimal-depth-3",
    optionA: {
      id: "brutalist-minimal",
      label: "Brutalist",
      image: "https://images.unsplash.com/photo-1520575733529-2b3b2f3fb4ff?w=400&h=300&fit=crop&q=80",
      description: "Raw, honest, deliberately unpolished",
      scores: { minimal_ornate: 10, bold_subtle: 15, modern_classic: 20, organic_geometric: 10 }
    },
    optionB: {
      id: "swiss-minimal",
      label: "Swiss Design",
      image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&h=300&fit=crop&q=80",
      description: "Grid-based perfection, typographic hierarchy",
      scores: { minimal_ornate: 18, organic_geometric: 22, modern_classic: 12 }
    },
    weight: 1.0
  },

  // === Depth 2: Bold variations ===
  {
    id: "bold-depth-1",
    optionA: {
      id: "maximum-impact",
      label: "Maximum Impact",
      image: "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400&h=300&fit=crop&q=80",
      description: "Loud, attention-grabbing, dramatic",
      scores: { bold_subtle: 25, light_heavy: 15, playful_serious: 10 }
    },
    optionB: {
      id: "bold-sophisticated",
      label: "Bold + Sophisticated",
      image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=300&fit=crop&q=80",
      description: "Strong but refined, controlled power",
      scores: { bold_subtle: 20, playful_serious: -10, modern_classic: 10 }
    },
    weight: 1.0
  },
  {
    id: "bold-depth-2",
    optionA: {
      id: "neon-bold",
      label: "Neon & Electric",
      image: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=400&h=300&fit=crop&q=80",
      description: "Glowing accents, dark backgrounds, cyberpunk energy",
      scores: { bold_subtle: 22, modern_classic: 18, warm_cool: -10 }
    },
    optionB: {
      id: "editorial-bold",
      label: "Editorial Bold",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=300&fit=crop&q=80",
      description: "Magazine-style drama, oversized type, intentional contrast",
      scores: { bold_subtle: 20, modern_classic: -5, light_heavy: -10 }
    },
    weight: 1.0
  },

  // === Depth 2: Warm variations ===
  {
    id: "warm-depth-1",
    optionA: {
      id: "cozy-warm",
      label: "Cozy & Handcrafted",
      image: "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&h=300&fit=crop&q=80",
      description: "Hand-drawn elements, natural textures, artisanal",
      scores: { warm_cool: 20, organic_geometric: -15, playful_serious: 10 }
    },
    optionB: {
      id: "warm-luxury",
      label: "Warm Luxury",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop&q=80",
      description: "Rich materials, amber tones, inviting opulence",
      scores: { warm_cool: 18, light_heavy: -10, playful_serious: -12 }
    },
    weight: 1.0
  },

  // === Depth 2: Cool variations ===
  {
    id: "cool-depth-1",
    optionA: {
      id: "tech-cool",
      label: "Tech Cool",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop&q=80",
      description: "Blue-steel, data-driven, precise interfaces",
      scores: { warm_cool: -18, modern_classic: 15, organic_geometric: 12 }
    },
    optionB: {
      id: "icy-elegant",
      label: "Icy Elegance",
      image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=400&h=300&fit=crop&q=80",
      description: "Cool grays, silver accents, quiet sophistication",
      scores: { warm_cool: -20, light_heavy: 10, playful_serious: -12 }
    },
    weight: 1.0
  },

  // === Depth 2: Typography focus ===
  {
    id: "type-depth-1",
    optionA: {
      id: "type-forward",
      label: "Type-Forward",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop&q=80",
      description: "Typography IS the design, words are art",
      scores: { bold_subtle: 15, modern_classic: 10, organic_geometric: 5 }
    },
    optionB: {
      id: "image-forward",
      label: "Image-Forward",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
      description: "Photography-led, visuals tell the story",
      scores: { bold_subtle: 10, warm_cool: 8, organic_geometric: -8 }
    },
    weight: 1.0
  },

  // === Depth 2: Playful variations ===
  {
    id: "playful-depth-1",
    optionA: {
      id: "quirky-illustration",
      label: "Quirky & Illustrated",
      image: "https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=400&h=300&fit=crop&q=80",
      description: "Custom illustrations, character-driven, storybook feel",
      scores: { playful_serious: 22, organic_geometric: -12, warm_cool: 10 }
    },
    optionB: {
      id: "vibrant-modern",
      label: "Vibrant Modern",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop&q=80",
      description: "Bright gradients, geometric play, tech-playful",
      scores: { playful_serious: 18, modern_classic: 15, organic_geometric: 10 }
    },
    weight: 1.0
  },

  // === Depth 2: Luxury variations ===
  {
    id: "luxury-depth-1",
    optionA: {
      id: "old-money",
      label: "Old Money",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop&q=80",
      description: "Heritage, timelessness, understated wealth",
      scores: { modern_classic: -15, light_heavy: -10, playful_serious: -18 }
    },
    optionB: {
      id: "new-luxury",
      label: "New Luxury",
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=300&fit=crop&q=80",
      description: "Contemporary premium, clean lines, refined innovation",
      scores: { modern_classic: 18, light_heavy: 12, playful_serious: -8 }
    },
    weight: 1.0
  },

  // === Cross-cutting pairs ===
  {
    id: "texture-1",
    optionA: {
      id: "flat-digital",
      label: "Flat & Digital",
      image: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=400&h=300&fit=crop&q=80",
      description: "Crisp vectors, solid colors, screen-native",
      scores: { modern_classic: 15, organic_geometric: 12, minimal_ornate: 8 }
    },
    optionB: {
      id: "textured-tactile",
      label: "Textured & Tactile",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop&q=80",
      description: "Paper grain, emboss effects, physical feel",
      scores: { modern_classic: -12, organic_geometric: -10, warm_cool: 8 }
    },
    weight: 1.0
  },
  {
    id: "density-1",
    optionA: {
      id: "breathing-room",
      label: "Breathing Room",
      image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&h=300&fit=crop&q=80",
      description: "Generous margins, one idea per screen",
      scores: { minimal_ornate: 18, light_heavy: 15, bold_subtle: -8 }
    },
    optionB: {
      id: "content-rich",
      label: "Content Rich",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=400&h=300&fit=crop&q=80",
      description: "Dense information, dashboards, data-forward",
      scores: { minimal_ornate: -15, modern_classic: 8, organic_geometric: 10 }
    },
    weight: 1.0
  },
];

// Style profiles based on scores
const STYLE_PROFILES = {
  "minimal-modern": { label: "Minimal Modern", description: "Clean, contemporary, and focused" },
  "bold-creative": { label: "Bold Creative", description: "Strong, expressive, and impactful" },
  "warm-organic": { label: "Warm Organic", description: "Natural, inviting, and human" },
  "geometric-precision": { label: "Geometric Precision", description: "Structured, mathematical, and precise" },
  "playful-approachable": { label: "Playful Approachable", description: "Fun, friendly, and accessible" },
  "classic-refined": { label: "Classic Refined", description: "Timeless, elegant, and sophisticated" },
  "eclectic-experimental": { label: "Eclectic Experimental", description: "Unique, boundary-pushing, and innovative" }
};

// ============================================
// Helper Functions
// ============================================

function calculateStyleProfile(scores: AdaptiveStyleData["scores"]) {
  // Simple heuristic to determine dominant profile
  const { modern_classic, bold_subtle, warm_cool, minimal_ornate, playful_serious, organic_geometric } = scores;
  
  if (minimal_ornate > 15 && modern_classic > 10) return "minimal-modern";
  if (bold_subtle > 15) return "bold-creative";
  if (warm_cool > 10 && organic_geometric < -5) return "warm-organic";
  if (organic_geometric > 15) return "geometric-precision";
  if (playful_serious > 15) return "playful-approachable";
  if (modern_classic < -10) return "classic-refined";
  return "eclectic-experimental";
}

function getAdaptivePairs(scores: AdaptiveStyleData["scores"], choices: AdaptiveStyleData["choices"]): StylePair[] {
  const usedIds = new Set(choices.map(c => c.pairId));
  
  // Score each pair by information gain — prioritize pairs that inform our LEAST confident axes
  // and that match our current direction (depth pairs)
  const scored = ADAPTIVE_PAIRS
    .filter(pair => !usedIds.has(pair.id))
    .map(pair => {
      let relevanceScore = 0;
      
      // Check if this pair fits the client's emerging direction
      const directions: Record<string, number> = {
        'minimal': scores.minimal_ornate,
        'bold': scores.bold_subtle,
        'warm': scores.warm_cool,
        'cool': -scores.warm_cool,
        'playful': scores.playful_serious,
        'luxury': -scores.light_heavy, // Approximation
        'type': 0, // Always relevant
        'texture': 0,
        'density': 0,
      };
      
      for (const [keyword, bias] of Object.entries(directions)) {
        if (pair.id.includes(keyword) && bias > 5) {
          relevanceScore += bias * 0.5; // Reward pairs that go deeper in client's direction
        }
      }
      
      // Bonus for cross-cutting pairs when we have many choices already
      if (choices.length >= 4 && (pair.id.includes('texture') || pair.id.includes('density') || pair.id.includes('type'))) {
        relevanceScore += 10;
      }
      
      // Bonus for depth-2 pairs after initial broad questions
      if (choices.length >= 3 && pair.id.includes('depth')) {
        relevanceScore += 5;
      }
      
      return { pair, score: relevanceScore };
    })
    .sort((a, b) => b.score - a.score);
  
  return scored.map(s => s.pair);
}

function generateTags(scores: AdaptiveStyleData["scores"]): string[] {
  const tags: string[] = [];
  const { modern_classic, bold_subtle, warm_cool, minimal_ornate, playful_serious, organic_geometric } = scores;
  
  if (minimal_ornate > 15) tags.push("minimalist");
  if (bold_subtle > 15) tags.push("high-contrast");
  if (warm_cool > 10) tags.push("inviting");
  if (organic_geometric > 15) tags.push("structured");
  if (playful_serious > 15) tags.push("friendly");
  if (modern_classic < -10) tags.push("retro");
  if (Math.abs(warm_cool) < 5 && Math.abs(bold_subtle) < 5) tags.push("balanced");
  
  return tags;
}

// ============================================
// Radar Chart Component
// ============================================

const RadarChart: React.FC<{ scores: AdaptiveStyleData["scores"]; className?: string }> = ({ scores, className }) => {
  const dimensions = [
    { key: "modern_classic", label: "Modern", value: scores.modern_classic },
    { key: "bold_subtle", label: "Bold", value: scores.bold_subtle },
    { key: "warm_cool", label: "Warm", value: scores.warm_cool },
    { key: "minimal_ornate", label: "Minimal", value: scores.minimal_ornate },
    { key: "playful_serious", label: "Playful", value: scores.playful_serious },
    { key: "organic_geometric", label: "Organic", value: scores.organic_geometric },
  ];
  
  const size = 120;
  const center = size / 2;
  const maxRadius = 40;
  
  // Calculate points for polygon
  const points = dimensions.map((dim, i) => {
    const angle = (i * Math.PI * 2) / dimensions.length - Math.PI / 2;
    const value = Math.max(-25, Math.min(25, dim.value)); // Clamp to -25 to 25
    const radius = ((value + 25) / 50) * maxRadius; // Convert to 0-maxRadius
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className={cn("relative", className)}>
      <svg width={size} height={size} className="transition-all duration-700">
        {/* Background circles */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={maxRadius * scale}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-muted-foreground/20"
          />
        ))}
        
        {/* Dimension lines */}
        {dimensions.map((_, i) => {
          const angle = (i * Math.PI * 2) / dimensions.length - Math.PI / 2;
          const x2 = center + Math.cos(angle) * maxRadius;
          const y2 = center + Math.sin(angle) * maxRadius;
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted-foreground/30"
            />
          );
        })}
        
        {/* Data polygon */}
        <polygon
          points={points}
          fill="hsl(var(--primary))"
          fillOpacity="0.2"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          className="animate-in fade-in duration-700"
        />
        
        {/* Data points */}
        {dimensions.map((dim, i) => {
          const angle = (i * Math.PI * 2) / dimensions.length - Math.PI / 2;
          const value = Math.max(-25, Math.min(25, dim.value));
          const radius = ((value + 25) / 50) * maxRadius;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="hsl(var(--primary))"
              className="animate-in zoom-in duration-700"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          );
        })}
      </svg>
      
      {/* Labels */}
      <div className="absolute inset-0 pointer-events-none">
        {dimensions.map((dim, i) => {
          const angle = (i * Math.PI * 2) / dimensions.length - Math.PI / 2;
          const labelRadius = maxRadius + 15;
          const x = center + Math.cos(angle) * labelRadius;
          const y = center + Math.sin(angle) * labelRadius;
          
          return (
            <div
              key={i}
              className="absolute text-xs font-medium text-muted-foreground transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: x, top: y }}
            >
              {dim.label}
            </div>
          );
        })}
      </div>
      
      <img 
        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PC9zdmc+"
        alt="Style profile radar chart"
        aria-label="Style profile radar chart"
        className="sr-only"
      />
    </div>
  );
};

// ============================================
// Main Component
// ============================================

export function AdaptiveStyleSelector({ 
  data, 
  onSave, 
  onNext, 
  onPrev, 
  isFirst, 
  isLast,
  projectId,
  projectType 
}: StepProps) {
  const existingData = data as AdaptiveStyleData | undefined;
  
  // State
  const [currentData, setCurrentData] = useState<AdaptiveStyleData>(() => ({
    choices: existingData?.choices || [],
    scores: existingData?.scores || {
      modern_classic: 0,
      bold_subtle: 0,
      warm_cool: 0,
      minimal_ornate: 0,
      playful_serious: 0,
      organic_geometric: 0,
      light_heavy: 0,
    },
    profile: existingData?.profile || { id: "", label: "", description: "" },
    tags: existingData?.tags || [],
    brandExamples: existingData?.brandExamples || [],
    averageConfidence: existingData?.averageConfidence || 0.8,
  }));
  
  const [currentPairIndex, setCurrentPairIndex] = useState(() => {
    return existingData?.choices.length || 0;
  });
  
  const [showingConfidence, setShowingConfidence] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<{
    pairId: string;
    picked: "A" | "B";
  } | null>(null);
  const [confidence, setConfidence] = useState(80);
  const [transitioning, setTransitioning] = useState(false);
  
  // Auto-save timer
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Determine which pairs to show
  const availablePairs = useMemo(() => {
    const initial = INITIAL_PAIRS.slice();
    const adaptive = getAdaptivePairs(currentData.scores, currentData.choices);
    return [...initial, ...adaptive];
  }, [currentData.scores, currentData.choices]);
  
  const currentPair = availablePairs[currentPairIndex];
  const isComplete = currentPairIndex >= Math.min(12, availablePairs.length); // Max 12 questions
  
  // Auto-save function
  const autoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onSave("style_direction", currentData);
    }, 500);
  }, [currentData, onSave]);
  
  useEffect(() => {
    if (currentData.choices.length > 0) {
      autoSave();
    }
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [currentData, autoSave]);
  
  // Handle choice selection
  const handleChoiceSelection = useCallback((picked: "A" | "B") => {
    if (!currentPair) return;
    
    setPendingChoice({ pairId: currentPair.id, picked });
    setShowingConfidence(true);
  }, [currentPair]);
  
  // Confirm choice with confidence
  const confirmChoice = useCallback(() => {
    if (!pendingChoice || !currentPair) return;
    
    const selectedOption = pendingChoice.picked === "A" ? currentPair.optionA : currentPair.optionB;
    const confidenceDecimal = confidence / 100;
    
    // Create new choice
    const newChoice = {
      pairId: pendingChoice.pairId,
      picked: pendingChoice.picked,
      confidence: confidenceDecimal,
      timestamp: new Date().toISOString(),
    };
    
    // Update scores based on selection and confidence
    const newScores = { ...currentData.scores };
    Object.entries(selectedOption.scores).forEach(([axis, value]) => {
      newScores[axis as keyof typeof newScores] += value * confidenceDecimal;
    });
    
    // Update choices
    const newChoices = [...currentData.choices, newChoice];
    const newAverageConfidence = newChoices.reduce((sum, c) => sum + c.confidence, 0) / newChoices.length;
    
    // Calculate new profile
    const profileId = calculateStyleProfile(newScores);
    const profile = {
      id: profileId,
      label: STYLE_PROFILES[profileId as keyof typeof STYLE_PROFILES]?.label || "Custom Style",
      description: STYLE_PROFILES[profileId as keyof typeof STYLE_PROFILES]?.description || "A unique style profile"
    };
    
    const newTags = generateTags(newScores);
    
    // Transition to next question
    setTransitioning(true);
    setTimeout(() => {
      setCurrentData({
        choices: newChoices,
        scores: newScores,
        profile,
        tags: newTags,
        brandExamples: currentData.brandExamples,
        averageConfidence: newAverageConfidence,
      });
      
      setCurrentPairIndex(prev => prev + 1);
      setShowingConfidence(false);
      setPendingChoice(null);
      setConfidence(80);
      setTransitioning(false);
    }, 200);
  }, [pendingChoice, confidence, currentPair, currentData]);
  
  // Handle navigation
  const handleNext = useCallback(async () => {
    await onSave("style_direction", currentData);
    onNext();
  }, [currentData, onSave, onNext]);
  
  // Confidence UI helpers
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return "text-green-600";
    if (conf >= 60) return "text-yellow-600"; 
    return "text-orange-600";
  };
  
  const getConfidenceLabel = (conf: number) => {
    if (conf >= 90) return "Completely sure";
    if (conf >= 70) return "Strongly prefer";
    if (conf >= 50) return "Moderately prefer";
    return "Slightly prefer";
  };
  
  // Render confidence selector
  const renderConfidenceSelector = () => {
    if (!showingConfidence || !pendingChoice || !currentPair) return null;
    
    const selectedOption = pendingChoice.picked === "A" ? currentPair.optionA : currentPair.optionB;
    
    return (
      <div 
        className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300"
        data-testid="confidence-selector"
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">How confident are you in this choice?</h3>
          <p className="text-muted-foreground text-sm">
            You chose: <strong>{selectedOption.label}</strong>
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Large confidence display */}
          <div className="text-center">
            <div 
              className={cn("text-4xl font-bold", getConfidenceColor(confidence))}
              data-testid="confidence-display"
            >
              {confidence}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {getConfidenceLabel(confidence)}
            </p>
          </div>
          
          {/* Quick select buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 30, label: "30%", desc: "Slightly prefer" },
              { value: 60, label: "60%", desc: "Moderately prefer" },
              { value: 80, label: "80%", desc: "Strongly prefer" },
              { value: 100, label: "100%", desc: "Completely sure" },
            ].map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => setConfidence(value)}
                data-testid={`quick-confidence-${value / 100}`}
                className={cn(
                  "p-3 rounded-lg text-xs font-medium border transition-all min-h-[44px] touch-manipulation",
                  "hover:scale-105 active:scale-95",
                  confidence === value
                    ? "bg-[#E05252]/10 border-[#E05252] text-[#E05252] ring-2 ring-[#E05252]/40"
                    : "bg-muted/30 border-muted-foreground/20 hover:border-muted-foreground/40"
                )}
              >
                <div className="font-bold">{label}</div>
                <div className="text-[10px] opacity-80 mt-1">{desc}</div>
              </button>
            ))}
          </div>
          
          {/* Precision slider */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Fine-tune:</label>
            <Slider
              value={[confidence]}
              onValueChange={(values) => setConfidence(values[0])}
              max={100}
              min={10}
              step={5}
              className="touch-manipulation"
              data-testid="confidence-slider"
            />
          </div>
          
          {/* Confirm button */}
          <Button
            onClick={confirmChoice}
            className="w-full min-h-[44px] touch-manipulation bg-[#E05252] hover:bg-[#E05252]/90"
            data-testid="confirm-confidence"
          >
            Continue with {confidence}% confidence
          </Button>
        </div>
      </div>
    );
  };
  
  // Render completed results
  const renderResults = () => {
    const profileInfo = STYLE_PROFILES[currentData.profile.id as keyof typeof STYLE_PROFILES];
    const confidencePercentage = Math.round(currentData.averageConfidence * 100);
    
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-4 animate-bounce">
            <Trophy className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Your Style Profile</h2>
          <p className="text-muted-foreground">
            Based on {currentData.choices.length} carefully considered choices
          </p>
        </div>
        
        {/* Main profile card */}
        <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl p-6 space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-primary" data-testid="current-profile-label">
              {currentData.profile.label}
            </h3>
            <p className="text-muted-foreground">
              {currentData.profile.description}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>Confidence: <strong className={getConfidenceColor(confidencePercentage)}>{confidencePercentage}%</strong></span>
            </div>
          </div>
          
          {/* Radar chart */}
          <div className="flex justify-center">
            <RadarChart scores={currentData.scores} className="w-48 h-48 sm:w-60 sm:h-60" />
          </div>
        </div>
        
        {/* Style dimensions breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Style Dimensions
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(currentData.scores).map(([axis, value]) => {
              const [positive, negative] = axis.split('_');
              const intensity = Math.abs(value);
              const direction = value > 0 ? positive : negative;
              const percentage = Math.min(100, (intensity / 25) * 100);
              
              return (
                <div key={axis} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize font-medium">{direction}</span>
                    <span className="text-muted-foreground">{Math.round(percentage)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Style tags */}
        {currentData.tags.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Your Style Tags</h4>
            <div className="flex flex-wrap gap-2">
              {currentData.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={onPrev}
            className="h-11 px-6 active:scale-95 transition-transform min-h-[44px] touch-manipulation"
            data-testid="back-button"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={handleNext}
            className="h-11 px-8 active:scale-95 transition-transform min-h-[44px] touch-manipulation min-w-[100px]"
            data-testid="next-button"
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };
  
  // Render comparison UI
  const renderComparison = () => {
    if (!currentPair) return renderResults();
    
    return (
      <div className="space-y-8" data-testid="style-direction-step">
        {/* Header with progress */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-white mb-2">
            <Palette className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Style Preferences</h2>
          <p className="text-muted-foreground">
            Pick the option that better represents your vision
          </p>
          
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentPairIndex + 1} of {Math.min(12, availablePairs.length)}</span>
              <span>~{Math.max(1, 12 - currentPairIndex)} min remaining</span>
            </div>
            <Progress 
              value={((currentPairIndex + 1) / Math.min(12, availablePairs.length)) * 100} 
              className="h-2"
            />
          </div>
        </div>
        
        {/* Show emerging profile after 2+ choices */}
        {currentData.choices.length >= 2 && (
          <div className="bg-muted/30 rounded-xl p-4 space-y-3 animate-in fade-in duration-500">
            <h3 className="text-sm font-semibold">Your emerging style</h3>
            <div className="flex items-center gap-3">
              <RadarChart scores={currentData.scores} className="w-16 h-16 flex-shrink-0" />
              <div>
                <p className="font-medium" data-testid="current-profile-label">{currentData.profile.label}</p>
                <p className="text-sm text-muted-foreground">{Math.round(currentData.averageConfidence * 100)}% confidence</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Option cards */}
        <div 
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-300",
            transitioning && "opacity-50 scale-95"
          )}
        >
          {[
            { key: "A", option: currentPair.optionA },
            { key: "B", option: currentPair.optionB },
          ].map(({ key, option }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleChoiceSelection(key as "A" | "B")}
              className={cn(
                "group relative rounded-2xl overflow-hidden transition-all duration-300",
                "hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg",
                "min-h-[240px] min-w-[280px] touch-manipulation",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
              disabled={transitioning}
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-muted">
                <img
                  src={option.image}
                  alt={`${option.label} design style`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  sizes="(max-width: 640px) 90vw, 45vw"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-bold text-lg mb-1">{option.label}</h3>
                <p className="text-sm opacity-90">{option.description}</p>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
          ))}
        </div>
        
        {/* Confidence selector or skip option */}
        {showingConfidence ? renderConfidenceSelector() : (
          <div className="text-center mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPairIndex(prev => prev + 1)}
              className="text-muted-foreground hover:text-foreground min-h-[44px] touch-manipulation border-dashed"
            >
              I don&apos;t have a preference — skip this one
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Totally fine! Skipping helps us focus on what matters to you.
            </p>
          </div>
        )}
      </div>
    );
  };
  
  // Main render logic
  return isComplete ? renderResults() : renderComparison();
}