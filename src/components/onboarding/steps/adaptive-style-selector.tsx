"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Palette,
  BarChart3,
  Star,
  TrendingUp,
  TrendingDown,
  Info,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

// ===========================
// Data Types
// ===========================

export type Dimension = "modern_classic" | "bold_subtle" | "warm_cool" | "minimal_ornate" | "playful_serious" | "light_heavy" | "structured_organic";
export type Category = "typography" | "color" | "layout" | "imagery" | "texture" | "mood";

export interface ComparisonPair {
  id: string;
  category: Category;
  optionA: {
    label: string;
    image: string;
    dimensions: Partial<Record<Dimension, number>>;
  };
  optionB: {
    label: string;
    image: string;
    dimensions: Partial<Record<Dimension, number>>;
  };
}

export interface Choice {
  pairId: string;
  choice: "A" | "B";
  confidence: number; // 0.5, 0.8, or 1.0
  timestamp: Date;
}

export interface AdaptiveStyleData {
  choices: Choice[];
  scores: Record<Dimension, number>;
  reliability?: number;
  averageConfidence?: number;
}

// ===========================
// Comparison Pairs Data
// ===========================

const COMPARISON_PAIRS: ComparisonPair[] = [
  {
    id: "layout-1",
    category: "layout",
    optionA: {
      label: "Grid Structure",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&q=80",
      dimensions: {
        structured_organic: 1,
        minimal_ornate: 0.8
      }
    },
    optionB: {
      label: "Free Flow",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
      dimensions: {
        structured_organic: -0.8,
        playful_serious: -0.6
      }
    }
  },
  {
    id: "layout-2",
    category: "layout",
    optionA: {
      label: "Generous Whitespace",
      image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&h=300&fit=crop&q=80",
      dimensions: {
        minimal_ornate: 1,
        light_heavy: -0.7
      }
    },
    optionB: {
      label: "Dense & Rich",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&q=80",
      dimensions: {
        minimal_ornate: -0.8,
        light_heavy: 0.9
      }
    }
  },
  {
    id: "layout-3",
    category: "layout",
    optionA: {
      label: "Clear Hierarchy",
      image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=300&fit=crop&q=80",
      dimensions: {
        modern_classic: 0.6,
        playful_serious: 0.7
      }
    },
    optionB: {
      label: "Layered & Complex",
      image: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=400&h=300&fit=crop&q=80",
      dimensions: {
        modern_classic: -0.5,
        playful_serious: -0.6
      }
    }
  },
  {
    id: "layout-4",
    category: "layout",
    optionA: {
      label: "Connected Flow",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&q=80",
      dimensions: {
        warm_cool: 0.8,
        light_heavy: -0.4
      }
    },
    optionB: {
      label: "Distinct Modules",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&q=80",
      dimensions: {
        warm_cool: -0.6,
        light_heavy: 0.5
      }
    }
  },
  {
    id: "typography-1",
    category: "typography",
    optionA: {
      label: "Sans Serif Clean",
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop&q=80",
      dimensions: {
        modern_classic: 1,
        light_heavy: -0.5
      }
    },
    optionB: {
      label: "Serif Elegant",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&q=80",
      dimensions: {
        modern_classic: -0.7,
        warm_cool: 0.6
      }
    }
  },
  {
    id: "color-1",
    category: "color",
    optionA: {
      label: "Vibrant & Bold",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop&q=80",
      dimensions: {
        bold_subtle: 1,
        playful_serious: -0.8
      }
    },
    optionB: {
      label: "Muted & Refined",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop&q=80",
      dimensions: {
        bold_subtle: -0.9,
        playful_serious: 0.6
      }
    }
  }
];

// ===========================
// Dimension Explanations
// ===========================

const DIMENSION_EXPLANATIONS: Record<Dimension, { 
  name: string;
  description: string;
  leftLabel: string;
  rightLabel: string;
  designInsight: string;
}> = {
  modern_classic: {
    name: "Modern vs Classic",
    description: "Contemporary sleek designs versus timeless traditional approaches",
    leftLabel: "Classic",
    rightLabel: "Modern", 
    designInsight: "Classic styles use traditional typography and established layouts, while modern approaches favor clean lines and innovative structures."
  },
  bold_subtle: {
    name: "Bold vs Subtle",
    description: "High-impact striking elements versus understated refined touches",
    leftLabel: "Subtle",
    rightLabel: "Bold",
    designInsight: "Bold designs command attention with strong contrasts and vibrant colors, while subtle approaches rely on nuanced details and gentle emphasis."
  },
  warm_cool: {
    name: "Warm vs Cool",
    description: "Inviting cozy atmospheres versus crisp professional tones",
    leftLabel: "Cool",
    rightLabel: "Warm",
    designInsight: "Warm palettes create approachable, human connections using reds, oranges, and earth tones. Cool palettes convey professionalism with blues, grays, and crisp whites."
  },
  minimal_ornate: {
    name: "Minimal vs Ornate",
    description: "Clean simplified forms versus rich detailed embellishments",
    leftLabel: "Ornate",
    rightLabel: "Minimal",
    designInsight: "Minimal designs strip away non-essential elements for clarity and focus, while ornate styles embrace decorative details and rich textures."
  },
  playful_serious: {
    name: "Playful vs Serious",
    description: "Fun energetic expressions versus professional authoritative tones",
    leftLabel: "Serious",
    rightLabel: "Playful",
    designInsight: "Playful designs use dynamic shapes, bright colors, and casual typography to create joy. Serious designs build trust through structured layouts and professional aesthetics."
  },
  light_heavy: {
    name: "Light vs Heavy",
    description: "Airy spacious feelings versus dense substantial presence",
    leftLabel: "Heavy", 
    rightLabel: "Light",
    designInsight: "Light designs use whitespace and thin elements to create breathing room, while heavy designs pack information densely for comprehensive coverage."
  },
  structured_organic: {
    name: "Structured vs Organic",
    description: "Systematic organized grids versus flowing natural forms",
    leftLabel: "Organic",
    rightLabel: "Structured",
    designInsight: "Structured designs follow systematic grids and predictable patterns, while organic approaches embrace natural flows and asymmetrical balance."
  }
};

// ===========================
// Helper Functions
// ===========================

function calculateScores(choices: Choice[]): Record<Dimension, number> {
  const scores: Record<Dimension, number> = {
    modern_classic: 0,
    bold_subtle: 0,
    warm_cool: 0,
    minimal_ornate: 0,
    playful_serious: 0,
    light_heavy: 0,
    structured_organic: 0
  };

  if (choices.length === 0) return scores;

  // Process each choice with exponential recency weighting and confidence
  choices.forEach((choice, index) => {
    const pair = COMPARISON_PAIRS.find(p => p.id === choice.pairId);
    if (!pair) return;

    const selectedOption = choice.choice === "A" ? pair.optionA : pair.optionB;
    const normalizedPosition = index / Math.max(choices.length - 1, 1);
    const recencyWeight = Math.pow(1.6, normalizedPosition * 2);
    const confidenceWeight = 0.3 + (choice.confidence * 0.7);
    const totalWeight = recencyWeight * confidenceWeight;

    Object.entries(selectedOption.dimensions).forEach(([dim, value]) => {
      if (dim in scores) {
        scores[dim as Dimension] += value * totalWeight;
      }
    });
  });

  // Normalize scores to -1 to 1 range
  const maxWeight = choices.length > 0 ? Math.pow(1.6, 2) : 1;
  Object.keys(scores).forEach(dim => {
    scores[dim as Dimension] = Math.max(-1, Math.min(1, scores[dim as Dimension] / maxWeight));
  });

  return scores;
}

function calculateReliability(choices: Choice[]): number {
  if (choices.length === 0) return 0;
  
  const completeness = Math.min(choices.length / 10, 1);
  const avgConfidence = choices.reduce((sum, c) => sum + c.confidence, 0) / choices.length;
  return (completeness * 0.4) + (avgConfidence * 0.6);
}

function getReliabilityLabel(reliability: number): { label: string; color: string } {
  if (reliability >= 0.8) return { label: "High", color: "text-green-600" };
  if (reliability >= 0.6) return { label: "Good", color: "text-blue-600" };  
  if (reliability >= 0.4) return { label: "Moderate", color: "text-yellow-600" };
  return { label: "Low", color: "text-red-600" };
}

function getStrongestPreferences(scores: Record<Dimension, number>): Array<{ dimension: Dimension; score: number; percentage: number }> {
  return Object.entries(scores)
    .map(([dim, score]) => ({
      dimension: dim as Dimension,
      score,
      percentage: Math.round(((score + 1) / 2) * 100)
    }))
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    .slice(0, 3);
}

function getWeakestPreferences(scores: Record<Dimension, number>): Array<{ dimension: Dimension; score: number; percentage: number }> {
  return Object.entries(scores)
    .map(([dim, score]) => ({
      dimension: dim as Dimension, 
      score,
      percentage: Math.round(((score + 1) / 2) * 100)
    }))
    .sort((a, b) => Math.abs(a.score) - Math.abs(b.score))
    .slice(0, 3);
}

// ===========================
// Main Component
// ===========================

export function AdaptiveStyleSelector({ data, onSave, onNext, onPrev }: StepProps) {
  const existingData = data as AdaptiveStyleData | undefined;
  const [choices, setChoices] = useState<Choice[]>(existingData?.choices ?? []);
  const [scores, setScores] = useState<Record<Dimension, number>>(existingData?.scores ?? calculateScores([]));
  const [showingConfidence, setShowingConfidence] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<{ pairId: string; choice: "A" | "B" } | null>(null);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [showResults, setShowResults] = useState(choices.length >= 10);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save with debounce
  const autoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const reliability = calculateReliability(choices);
      const averageConfidence = choices.length > 0 ? choices.reduce((sum, c) => sum + c.confidence, 0) / choices.length : 0;
      
      onSave("adaptive_style", {
        choices,
        scores,
        reliability,
        averageConfidence
      });
    }, 800);
  }, [choices, scores, onSave]);

  useEffect(() => {
    if (choices.length > 0) {
      const newScores = calculateScores(choices);
      setScores(newScores);
      autoSave();
    }
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [choices, autoSave]);

  const handleChoice = (choice: "A" | "B") => {
    const currentPair = COMPARISON_PAIRS[currentPairIndex];
    setPendingChoice({ pairId: currentPair.id, choice });
    setShowingConfidence(true);
  };

  const handleConfidenceSelect = (confidence: number) => {
    if (!pendingChoice) return;

    const newChoice: Choice = {
      ...pendingChoice,
      confidence,
      timestamp: new Date()
    };

    setChoices(prev => [...prev, newChoice]);
    setShowingConfidence(false);
    setPendingChoice(null);

    if (choices.length + 1 >= 10) {
      setShowResults(true);
    } else {
      setCurrentPairIndex(prev => (prev + 1) % COMPARISON_PAIRS.length);
    }
  };

  const handleNext = async () => {
    await onSave("adaptive_style", {
      choices,
      scores,
      reliability: calculateReliability(choices),
      averageConfidence: choices.length > 0 ? choices.reduce((sum, c) => sum + c.confidence, 0) / choices.length : 0
    });
    onNext();
  };

  if (showResults) {
    return <SummaryScreen 
      scores={scores}
      choices={choices}
      reliability={calculateReliability(choices)}
      averageConfidence={choices.length > 0 ? choices.reduce((sum, c) => sum + c.confidence, 0) / choices.length : 0}
      onNext={handleNext}
      onPrev={onPrev}
    />;
  }

  const currentPair = COMPARISON_PAIRS[currentPairIndex];
  const progress = (choices.length / 10) * 100;

  return (
    <div className="space-y-8 max-w-4xl mx-auto" data-testid="adaptive-style-selector">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-white mb-2">
          <Palette className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Style Preferences</h2>
        <p className="text-muted-foreground">
          Choose the style that feels more appealing to you
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2" data-testid="progress-section">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{choices.length}/10 comparisons</span>
        </div>
        <Progress value={progress} className="h-2" data-testid="progress-bar" />
      </div>

      {showingConfidence ? (
        <ConfidenceSelector 
          onConfidenceSelect={handleConfidenceSelect}
          onBack={() => setShowingConfidence(false)}
        />
      ) : (
        <ComparisonView 
          pair={currentPair}
          onChoice={handleChoice}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrev} 
          className="h-12 px-6"
          data-testid="back-button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {choices.length >= 10 && (
          <Button 
            type="button" 
            onClick={() => setShowResults(true)} 
            className="h-12 px-8"
            data-testid="view-results-button"
          >
            View Results <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ===========================
// Sub-Components
// ===========================

function ComparisonView({ pair, onChoice }: { 
  pair: ComparisonPair; 
  onChoice: (choice: "A" | "B") => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="comparison-view">
      {/* Option A */}
      <button
        onClick={() => onChoice("A")}
        className="group relative overflow-hidden rounded-2xl border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-lg"
        data-testid="option-a"
      >
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={pair.optionA.image}
            alt={pair.optionA.label}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-4 text-center">
          <h3 className="font-semibold text-lg">{pair.optionA.label}</h3>
        </div>
      </button>

      {/* Option B */}
      <button
        onClick={() => onChoice("B")}
        className="group relative overflow-hidden rounded-2xl border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-lg"
        data-testid="option-b"
      >
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={pair.optionB.image}
            alt={pair.optionB.label}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-4 text-center">
          <h3 className="font-semibold text-lg">{pair.optionB.label}</h3>
        </div>
      </button>
    </div>
  );
}

function ConfidenceSelector({ 
  onConfidenceSelect, 
  onBack 
}: { 
  onConfidenceSelect: (confidence: number) => void;
  onBack: () => void;
}) {
  return (
    <div className="text-center space-y-6" data-testid="confidence-selector">
      <h3 className="text-xl font-semibold">How confident are you in this choice?</h3>
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => onConfidenceSelect(0.5)}
          variant="outline"
          size="lg"
          className="px-8"
          data-testid="confidence-low"
        >
          Somewhat Sure
        </Button>
        <Button
          onClick={() => onConfidenceSelect(0.8)}
          variant="outline"
          size="lg"
          className="px-8"
          data-testid="confidence-medium"
        >
          Pretty Sure
        </Button>
        <Button
          onClick={() => onConfidenceSelect(1.0)}
          variant="default"
          size="lg"
          className="px-8"
          data-testid="confidence-high"
        >
          Very Sure
        </Button>
      </div>
      <Button variant="ghost" onClick={onBack} className="text-sm">
        ← Go back to choice
      </Button>
    </div>
  );
}

// ===========================
// Enhanced Summary Screen (US-007)
// ===========================

function SummaryScreen({ 
  scores, 
  choices, 
  reliability,
  averageConfidence,
  onNext, 
  onPrev 
}: {
  scores: Record<Dimension, number>;
  choices: Choice[];
  reliability: number;
  averageConfidence: number;
  onNext: () => void;
  onPrev: () => void;
}) {
  const reliabilityInfo = getReliabilityLabel(reliability);
  const strongest = getStrongestPreferences(scores);
  const weakest = getWeakestPreferences(scores);
  const overallConfidence = Math.round(reliability * 100);

  return (
    <div className="space-y-8 max-w-4xl mx-auto" data-testid="summary-screen">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 text-white mb-2">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Your Style Profile</h2>
        <div className="flex items-center justify-center gap-2">
          <span className="text-muted-foreground">Overall Confidence:</span>
          <span className={cn("font-semibold text-lg", reliabilityInfo.color)} data-testid="overall-confidence">
            {overallConfidence}% ({reliabilityInfo.label})
          </span>
        </div>
      </div>

      {/* Dimension Breakdown */}
      <div className="space-y-4" data-testid="dimension-breakdown">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Style Dimensions Breakdown
        </h3>
        <div className="grid gap-4">
          {Object.entries(scores).map(([dim, score]) => {
            const dimension = dim as Dimension;
            const info = DIMENSION_EXPLANATIONS[dimension];
            const percentage = Math.round(((score + 1) / 2) * 100);
            const isLeftLeaning = score < 0;
            
            return (
              <div 
                key={dimension} 
                className="border rounded-lg p-4 space-y-3"
                data-testid={`dimension-${dimension}`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{info.name}</h4>
                  <span className="text-sm font-semibold" data-testid={`percentage-${dimension}`}>
                    {percentage}%
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground min-w-[60px] text-left">
                    {info.leftLabel}
                  </span>
                  <div className="flex-1 relative">
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className={cn(
                          "h-3 rounded-full transition-all duration-500",
                          isLeftLeaning 
                            ? "bg-gradient-to-r from-orange-500 to-red-500"
                            : "bg-gradient-to-r from-blue-500 to-purple-500"
                        )}
                        style={{ 
                          width: `${Math.abs(score) * 50}%`,
                          marginLeft: isLeftLeaning ? `${(1 + score) * 50}%` : "50%"
                        }}
                      />
                    </div>
                    <div className="absolute top-0 left-1/2 w-0.5 h-3 bg-border transform -translate-x-0.5" />
                  </div>
                  <span className="text-sm text-muted-foreground min-w-[60px] text-right">
                    {info.rightLabel}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground">{info.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strongest Preferences */}
      <div className="space-y-4" data-testid="strongest-preferences">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Top 3 Strongest Preferences
        </h3>
        <div className="grid gap-3">
          {strongest.map((pref, index) => {
            const info = DIMENSION_EXPLANATIONS[pref.dimension];
            const isLeftLeaning = pref.score < 0;
            return (
              <div 
                key={pref.dimension} 
                className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-900/20"
                data-testid={`strongest-${index}`}
              >
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-600" />
                  <span className="font-medium">
                    {isLeftLeaning ? info.leftLabel : info.rightLabel} {info.name.split(' vs ')[0]}
                  </span>
                </div>
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {pref.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weakest Preferences */}
      <div className="space-y-4" data-testid="weakest-preferences">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-blue-600" />
          Top 3 Areas for Exploration
        </h3>
        <div className="grid gap-3">
          {weakest.map((pref, index) => {
            const info = DIMENSION_EXPLANATIONS[pref.dimension];
            return (
              <div 
                key={pref.dimension} 
                className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20"
                data-testid={`weakest-${index}`}
              >
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{info.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Neutral preference
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Design Insights */}
      <div className="space-y-4" data-testid="design-insights">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-600" />
          Actionable Design Insights
        </h3>
        <div className="grid gap-4">
          {strongest.slice(0, 2).map((pref, index) => {
            const info = DIMENSION_EXPLANATIONS[pref.dimension];
            return (
              <div 
                key={pref.dimension} 
                className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/20"
                data-testid={`insight-${index}`}
              >
                <h4 className="font-medium text-amber-800 dark:text-amber-400 mb-2">
                  {info.name} Focus
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {info.designInsight}
                </p>
              </div>
            );
          })}
          
          <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <h4 className="font-medium text-purple-800 dark:text-purple-400 mb-2">
              Confidence Level Recommendation
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {overallConfidence >= 80 
                ? "Your style preferences are very clear. Designers can confidently focus on these key dimensions in your brand development."
                : overallConfidence >= 60
                ? "You have good style clarity. Consider exploring a few more comparisons to strengthen weak preference areas."
                : "Your preferences show some uncertainty. This gives designers flexibility to present diverse concepts for your feedback."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrev} 
          className="h-12 px-6"
          data-testid="back-button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Questions
        </Button>
        <Button 
          type="button" 
          onClick={onNext} 
          className="h-12 px-8"
          data-testid="next-button"
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}