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
  // For users leaning minimal
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
  // For users leaning bold
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
  }
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
  const pairs = [...ADAPTIVE_PAIRS];
  
  // Filter pairs based on current direction
  return pairs.filter(pair => {
    if (scores.minimal_ornate > 10) return pair.id.includes("minimal");
    if (scores.bold_subtle > 10) return pair.id.includes("bold");
    return true; // Show all for balanced scores
  });
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
  const isComplete = currentPairIndex >= Math.min(10, availablePairs.length); // Max 10 questions
  
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
              <span>Question {currentPairIndex + 1} of {Math.min(10, availablePairs.length)}</span>
              <span>~{Math.max(1, 10 - currentPairIndex)} min remaining</span>
            </div>
            <Progress 
              value={((currentPairIndex + 1) / Math.min(10, availablePairs.length)) * 100} 
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
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setCurrentPairIndex(prev => prev + 1)}
              className="text-muted-foreground hover:text-foreground min-h-[44px] touch-manipulation"
            >
              Not sure, skip this one
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  // Main render logic
  return isComplete ? renderResults() : renderComparison();
}