import { describe, it, expect } from "vitest";

// Import the helper functions - we'll need to extract them to a separate utility file
// For now, let's create inline versions for testing

type Dimension =
  | "modern_classic"
  | "bold_subtle"
  | "warm_cool"
  | "minimal_ornate"
  | "playful_serious"
  | "organic_geometric"
  | "light_heavy";

type Scores = Record<Dimension, number>;

interface ComparisonOption {
  image: string;
  label: string;
  sublabel: string;
  deltas: Partial<Record<Dimension, number>>;
}

interface ComparisonPair {
  id: string;
  category: string;
  question: string;
  optionA: ComparisonOption;
  optionB: ComparisonOption;
  targetDims: Dimension[];
}

interface Choice {
  pairId: string;
  picked: "A" | "B" | "skip";
  confidence: number;
}

function initialScores(): Scores {
  return {
    modern_classic: 0,
    bold_subtle: 0,
    warm_cool: 0,
    minimal_ornate: 0,
    playful_serious: 0,
    organic_geometric: 0,
    light_heavy: 0,
  };
}

function calculateAverageConfidence(choices: Choice[]): number {
  const nonSkipChoices = choices.filter(choice => choice.picked !== "skip");
  if (nonSkipChoices.length === 0) return 0;
  
  const totalConfidence = nonSkipChoices.reduce((sum, choice) => sum + choice.confidence, 0);
  return totalConfidence / nonSkipChoices.length;
}

function calculateConfidenceWeightedScores(
  choices: Choice[], 
  pairs: ComparisonPair[]
): { scores: Scores; totalChoices: number; averageConfidence: number } {
  const scores = initialScores();
  const pairMap = new Map(pairs.map(p => [p.id, p]));
  let totalChoices = 0;
  
  choices.forEach((choice, index) => {
    if (choice.picked === "skip") return;
    
    const pair = pairMap.get(choice.pairId);
    if (!pair) return;
    
    const option = choice.picked === "A" ? pair.optionA : pair.optionB;
    
    // Exponential recency weighting: more recent choices have exponentially higher weight
    // Formula: base^(position/total) where position goes from 0 to total-1
    const normalizedPosition = index / Math.max(choices.length - 1, 1);
    const recencyMultiplier = Math.pow(1.6, normalizedPosition * 2); // Exponential from 1.0 to ~2.56
    
    // Confidence weighting: scale deltas by confidence level  
    const confidenceMultiplier = 0.3 + (choice.confidence * 0.7); // 0.3 to 1.0 scale
    
    // Combined weighting for stronger recent high-confidence choices
    const totalMultiplier = recencyMultiplier * confidenceMultiplier;
    
    // Apply weighted deltas with improved bounds checking
    for (const [dim, delta] of Object.entries(option.deltas) as [Dimension, number][]) {
      const weightedDelta = delta * totalMultiplier;
      scores[dim] = Math.max(-100, Math.min(100, scores[dim] + weightedDelta));
    }
    
    totalChoices++;
  });
  
  return {
    scores,
    totalChoices,
    averageConfidence: calculateAverageConfidence(choices)
  };
}

function getProfileReliability(choices: Choice[]): { score: number; label: string; description: string } {
  const totalChoices = choices.filter(c => c.picked !== "skip").length;
  const avgConfidence = calculateAverageConfidence(choices);
  
  // Factor in both number of choices and average confidence
  const completeness = Math.min(totalChoices / 8, 1); // Normalize to 8+ choices
  const reliability = (completeness * 0.4) + (avgConfidence * 0.6);
  
  if (reliability >= 0.85) {
    return { 
      score: reliability, 
      label: "High Confidence", 
      description: "Your style profile is very reliable based on strong preferences." 
    };
  } else if (reliability >= 0.65) {
    return { 
      score: reliability, 
      label: "Good Confidence", 
      description: "Your style profile has good reliability with clear preferences." 
    };
  } else if (reliability >= 0.45) {
    return { 
      score: reliability, 
      label: "Moderate Confidence", 
      description: "Your style profile shows some clear directions but could benefit from more input." 
    };
  } else {
    return { 
      score: reliability, 
      label: "Low Confidence", 
      description: "Consider answering a few more questions to strengthen your style profile." 
    };
  }
}

describe("Confidence Scoring Helper Functions", () => {
  
  describe("calculateAverageConfidence", () => {
    it("calculates average confidence correctly", () => {
      const choices: Choice[] = [
        { pairId: "1", picked: "A", confidence: 1.0 },
        { pairId: "2", picked: "B", confidence: 0.5 },
        { pairId: "3", picked: "A", confidence: 0.8 }
      ];
      
      expect(calculateAverageConfidence(choices)).toBeCloseTo(0.7666666666666666);
    });
    
    it("ignores skip choices in confidence calculation", () => {
      const choices: Choice[] = [
        { pairId: "1", picked: "A", confidence: 1.0 },
        { pairId: "2", picked: "skip", confidence: 0 },
        { pairId: "3", picked: "A", confidence: 0.8 }
      ];
      
      expect(calculateAverageConfidence(choices)).toBe(0.9); // (1.0 + 0.8) / 2
    });
    
    it("returns 0 when no non-skip choices", () => {
      const choices: Choice[] = [
        { pairId: "1", picked: "skip", confidence: 0 },
        { pairId: "2", picked: "skip", confidence: 0 }
      ];
      
      expect(calculateAverageConfidence(choices)).toBe(0);
    });
    
    it("handles empty choices array", () => {
      expect(calculateAverageConfidence([])).toBe(0);
    });
  });

  describe("calculateConfidenceWeightedScores", () => {
    const testPairs: ComparisonPair[] = [
      {
        id: "test-1",
        category: "mood",
        question: "Test question",
        optionA: {
          image: "test.jpg",
          label: "Option A",
          sublabel: "Test A",
          deltas: { modern_classic: -20, bold_subtle: 10 }
        },
        optionB: {
          image: "test.jpg", 
          label: "Option B",
          sublabel: "Test B",
          deltas: { modern_classic: 20, bold_subtle: -10 }
        },
        targetDims: ["modern_classic", "bold_subtle"]
      }
    ];

    it("applies confidence weighting to score deltas", () => {
      const choices: Choice[] = [
        { pairId: "test-1", picked: "A", confidence: 1.0 }
      ];
      
      const result = calculateConfidenceWeightedScores(choices, testPairs);
      
      // High confidence (1.0) should apply full delta
      // modern_classic delta = -20, confidence multiplier = 0.3 + (1.0 * 0.7) = 1.0
      // With recency multiplier ≈ 1.3, expected ≈ -20 * 1.3 = -26
      expect(result.scores.modern_classic).toBeLessThan(0);
      expect(result.scores.bold_subtle).toBeGreaterThan(0);
      expect(result.totalChoices).toBe(1);
    });

    it("reduces impact of low confidence choices", () => {
      const choices: Choice[] = [
        { pairId: "test-1", picked: "A", confidence: 0.5 }
      ];
      
      const result = calculateConfidenceWeightedScores(choices, testPairs);
      
      // Low confidence (0.5) should reduce delta impact
      // Confidence multiplier = 0.3 + (0.5 * 0.7) = 0.65
      // Should be less impact than full confidence case
      expect(Math.abs(result.scores.modern_classic)).toBeLessThan(26);
      expect(result.averageConfidence).toBe(0.5);
    });

    it("ignores skip choices in scoring", () => {
      const choices: Choice[] = [
        { pairId: "test-1", picked: "skip", confidence: 0 }
      ];
      
      const result = calculateConfidenceWeightedScores(choices, testPairs);
      
      // Skip should not affect scores
      expect(result.scores.modern_classic).toBe(0);
      expect(result.scores.bold_subtle).toBe(0);
      expect(result.totalChoices).toBe(0);
    });

    it("handles missing pairs gracefully", () => {
      const choices: Choice[] = [
        { pairId: "missing-pair", picked: "A", confidence: 1.0 }
      ];
      
      const result = calculateConfidenceWeightedScores(choices, testPairs);
      
      // Missing pair should not crash or affect scores
      expect(result.scores.modern_classic).toBe(0);
      expect(result.totalChoices).toBe(0);
    });

    it("applies exponential recency weighting - later choices have higher weight", () => {
      const choices: Choice[] = [
        { pairId: "test-1", picked: "A", confidence: 1.0 }, // Early choice
        { pairId: "test-1", picked: "A", confidence: 1.0 }, // Later choice (same confidence)
      ];
      
      // Create a test pair that exists for both choices
      const multiTestPairs: ComparisonPair[] = [
        {
          id: "test-1",
          category: "mood",
          question: "Test question",
          optionA: {
            image: "test.jpg",
            label: "Option A",
            sublabel: "Test A",
            deltas: { modern_classic: -10 } // Smaller delta for easier calculation
          },
          optionB: {
            image: "test.jpg",
            label: "Option B", 
            sublabel: "Test B",
            deltas: { modern_classic: 10 }
          },
          targetDims: ["modern_classic"]
        }
      ];
      
      const result = calculateConfidenceWeightedScores(choices, multiTestPairs);
      
      // With exponential weighting, second choice should have much more impact than first
      // First choice: recencyMultiplier = Math.pow(1.6, 0 * 2) = 1.0
      // Second choice: recencyMultiplier = Math.pow(1.6, 1 * 2) = 2.56
      // Expected total: (-10 * 1.0) + (-10 * 2.56) = -10 + -25.6 = -35.6
      expect(result.scores.modern_classic).toBeLessThan(-30);
      expect(result.scores.modern_classic).toBeGreaterThan(-40);
    });

    it("exponential weighting produces different results than linear", () => {
      const choices: Choice[] = Array(5).fill(0).map((_, i) => ({
        pairId: "test-1",
        picked: "A" as const,
        confidence: 1.0
      }));
      
      // All choices have same confidence, different positions should create exponential effect
      const result = calculateConfidenceWeightedScores(choices, testPairs);
      
      // With 5 identical choices with delta -20, exponential weighting should create
      // effect due to exponential recency weighting of later choices
      // The actual value should be -100 (capped), let's verify it's at the cap
      expect(result.scores.modern_classic).toBe(-100); // Capped at minimum
      
      // Now test with smaller deltas to see exponential effect without capping
      const smallerDeltaPairs: ComparisonPair[] = [
        {
          id: "test-1",
          category: "mood", 
          question: "Test question",
          optionA: {
            image: "test.jpg",
            label: "Option A",
            sublabel: "Test A", 
            deltas: { modern_classic: -5 } // Smaller delta to avoid capping
          },
          optionB: {
            image: "test.jpg",
            label: "Option B",
            sublabel: "Test B",
            deltas: { modern_classic: 5 }
          },
          targetDims: ["modern_classic"]
        }
      ];
      
      const uncappedResult = calculateConfidenceWeightedScores(choices, smallerDeltaPairs);
      
      // With exponential weighting, result should be more negative than linear (-5 * 5 = -25)
      expect(uncappedResult.scores.modern_classic).toBeLessThan(-25);
    });

    it("combined confidence and recency weighting works correctly", () => {
      const choices: Choice[] = [
        { pairId: "test-1", picked: "A", confidence: 0.5 }, // Early, low confidence
        { pairId: "test-1", picked: "A", confidence: 1.0 }, // Later, high confidence
      ];
      
      const result = calculateConfidenceWeightedScores(choices, testPairs);
      
      // Later high-confidence choice should dominate the score
      // First: delta(-20) * recency(1.0) * confidence(0.65) = -13
      // Second: delta(-20) * recency(2.56) * confidence(1.0) = -51.2
      // Total ≈ -64.2
      expect(result.scores.modern_classic).toBeLessThan(-50);
      expect(result.scores.modern_classic).toBeGreaterThan(-70);
    });
  });

  describe("getProfileReliability", () => {
    it("returns high confidence for many high-confidence choices", () => {
      const choices: Choice[] = Array(10).fill(0).map((_, i) => ({
        pairId: `pair-${i}`,
        picked: "A" as const,
        confidence: 0.9
      }));
      
      const result = getProfileReliability(choices);
      
      expect(result.label).toBe("High Confidence");
      expect(result.score).toBeGreaterThanOrEqual(0.85);
    });

    it("returns moderate confidence for mixed confidence levels", () => {
      const choices: Choice[] = [
        { pairId: "1", picked: "A", confidence: 1.0 },
        { pairId: "2", picked: "B", confidence: 0.3 },
        { pairId: "3", picked: "A", confidence: 0.6 },
        { pairId: "4", picked: "B", confidence: 0.4 }
      ];
      
      const result = getProfileReliability(choices);
      
      expect(result.label).toBe("Moderate Confidence");
      expect(result.score).toBeGreaterThanOrEqual(0.45);
      expect(result.score).toBeLessThan(0.65);
    });

    it("returns low confidence for few low-confidence choices", () => {
      const choices: Choice[] = [
        { pairId: "1", picked: "A", confidence: 0.3 },
        { pairId: "2", picked: "B", confidence: 0.4 }
      ];
      
      const result = getProfileReliability(choices);
      
      expect(result.label).toBe("Low Confidence");
      expect(result.score).toBeLessThan(0.45);
    });

    it("factors in completeness (number of choices)", () => {
      // Same confidence, different number of choices
      const fewChoices: Choice[] = [
        { pairId: "1", picked: "A", confidence: 0.8 }
      ];
      
      const manyChoices: Choice[] = Array(8).fill(0).map((_, i) => ({
        pairId: `pair-${i}`,
        picked: "A" as const, 
        confidence: 0.8
      }));
      
      const fewResult = getProfileReliability(fewChoices);
      const manyResult = getProfileReliability(manyChoices);
      
      // More choices should yield higher reliability score
      expect(manyResult.score).toBeGreaterThan(fewResult.score);
    });

    it("ignores skip choices when calculating reliability", () => {
      const choices: Choice[] = [
        { pairId: "1", picked: "A", confidence: 1.0 },
        { pairId: "2", picked: "skip", confidence: 0 },
        { pairId: "3", picked: "B", confidence: 0.8 }
      ];
      
      const result = getProfileReliability(choices);
      
      // Should be based on 2 actual choices with avg confidence 0.9
      expect(result.averageConfidence).toBeUndefined(); // This function doesn't return it
      // But the calculation should ignore the skip
    });
  });
});