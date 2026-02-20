import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdaptiveStyleSelector } from "../adaptive-style-selector";
import type { AdaptiveStyleData } from "../adaptive-style-selector";

const defaultProps = {
  projectId: "test-project-id",
  projectType: "branding" as const,
  data: undefined,
  onSave: vi.fn().mockResolvedValue(undefined),
  onNext: vi.fn(),
  onPrev: vi.fn(),
  isFirst: false,
  isLast: false,
  stepKey: "adaptive_style" as const,
  designerName: "Test Designer",
  clientName: "Test Client",
};

// Sample test data with 10+ choices to trigger summary screen
const mockAdaptiveStyleData: AdaptiveStyleData = {
  choices: [
    { pairId: "layout-1", choice: "A", confidence: 1.0, timestamp: new Date("2024-01-01T10:00:00Z") },
    { pairId: "layout-2", choice: "B", confidence: 0.8, timestamp: new Date("2024-01-01T10:01:00Z") },
    { pairId: "layout-3", choice: "A", confidence: 0.5, timestamp: new Date("2024-01-01T10:02:00Z") },
    { pairId: "layout-4", choice: "B", confidence: 1.0, timestamp: new Date("2024-01-01T10:03:00Z") },
    { pairId: "typography-1", choice: "A", confidence: 0.8, timestamp: new Date("2024-01-01T10:04:00Z") },
    { pairId: "color-1", choice: "B", confidence: 1.0, timestamp: new Date("2024-01-01T10:05:00Z") },
    { pairId: "layout-1", choice: "A", confidence: 0.8, timestamp: new Date("2024-01-01T10:06:00Z") },
    { pairId: "layout-2", choice: "A", confidence: 1.0, timestamp: new Date("2024-01-01T10:07:00Z") },
    { pairId: "typography-1", choice: "B", confidence: 0.5, timestamp: new Date("2024-01-01T10:08:00Z") },
    { pairId: "color-1", choice: "A", confidence: 0.8, timestamp: new Date("2024-01-01T10:09:00Z") }
  ],
  scores: {
    modern_classic: 0.6,
    bold_subtle: -0.4,
    warm_cool: 0.3,
    minimal_ornate: 0.7,
    playful_serious: -0.2,
    light_heavy: -0.1,
    structured_organic: 0.5
  },
  reliability: 0.75,
  averageConfidence: 0.8
};

describe("AdaptiveStyleSelector - Enhanced Summary Screen (US-007)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Summary Screen Display", () => {
    it("renders summary screen with 10+ choices", () => {
      render(<AdaptiveStyleSelector {...defaultProps} data={mockAdaptiveStyleData} />);
      
      expect(screen.getByTestId("summary-screen")).toBeTruthy();
      expect(screen.getByText("Your Style Profile")).toBeTruthy();
      expect(screen.getByTestId("overall-confidence")).toBeTruthy();
    });

    it("shows overall confidence score with correct percentage", () => {
      render(<AdaptiveStyleSelector {...defaultProps} data={mockAdaptiveStyleData} />);
      
      const confidenceElement = screen.getByTestId("overall-confidence");
      expect(confidenceElement.textContent).toContain("75%"); // reliability * 100
      expect(confidenceElement.textContent).toContain("Good"); // reliability label
    });

    it("displays confidence levels with correct color coding", () => {
      const highConfidenceData = { ...mockAdaptiveStyleData, reliability: 0.85 };
      render(<AdaptiveStyleSelector {...defaultProps} data={highConfidenceData} />);
      
      const confidenceElement = screen.getByTestId("overall-confidence");
      expect(confidenceElement.textContent).toContain("High");
      expect(confidenceElement.className).toContain("text-green-600");
    });
  });

  describe("Acceptance Criteria 1: Percentage breakdown for all 7 dimensions", () => {
    it("displays all 7 dimensions with percentage breakdowns", () => {
      render(<AdaptiveStyleSelector {...defaultProps} data={mockAdaptiveStyleData} />);
      
      const dimensionBreakdown = screen.getByTestId("dimension-breakdown");
      expect(dimensionBreakdown).toBeTruthy();

      // Check all 7 dimensions are present
      const dimensions = [
        "modern_classic", "bold_subtle", "warm_cool", 
        "minimal_ornate", "playful_serious", "light_heavy", "structured_organic"
      ];
      
      dimensions.forEach(dimension => {
        expect(screen.getByTestId(`dimension-${dimension}`)).toBeTruthy();
        expect(screen.getByTestId(`percentage-${dimension}`)).toBeTruthy();
      });
    });

    it("calculates percentages correctly from scores", () => {
      render(<AdaptiveStyleSelector {...defaultProps} data={mockAdaptiveStyleData} />);
      
      // modern_classic: 0.6 -> ((0.6 + 1) / 2) * 100 = 80%
      const modernClassicPercentage = screen.getByTestId("percentage-modern_classic");
      expect(modernClassicPercentage.textContent).toBe("80%");
      
      // bold_subtle: -0.4 -> ((-0.4 + 1) / 2) * 100 = 30%  
      const boldSubtlePercentage = screen.getByTestId("percentage-bold_subtle");
      expect(boldSubtlePercentage.textContent).toBe("30%");
      
      // minimal_ornate: 0.7 -> ((0.7 + 1) / 2) * 100 = 85%
      const minimalOrnatePercentage = screen.getByTestId("percentage-minimal_ornate");
      expect(minimalOrnatePercentage.textContent).toBe("85%");
    });

    it("shows visual progress bars for each dimension", () => {
      render(<AdaptiveStyleSelector {...defaultProps} data={mockAdaptiveStyleData} />);
      
      // Check that progress bars are rendered for each dimension
      const dimensions = ["modern_classic", "bold_subtle", "warm_cool"];
      dimensions.forEach(dimension => {
        const dimensionElement = screen.getByTestId(`dimension-${dimension}`);
        const progressBar = dimensionElement.querySelector('.rounded-full.h-3');
        expect(progressBar).toBeTruthy();
      });
    });
  });

  describe("Acceptance Criteria 2: Top 3 strongest and weakest preferences", () => {
    it("identifies and displays top 3 strongest preferences", () => {
      render(<AdaptiveStyleSelector {...defaultProps} data={mockAdaptiveStyleData} />);
      
      const strongestSection = screen.getByTestId("strongest-preferences");
      expect(strongestSection).toBeTruthy();
      
      // Should have exactly 3 strongest preference items
      const strongestItems = [
        screen.getByTestId("strongest-0"),
        screen.getByTestId("strongest-1"), 
        screen.getByTestId("strongest-2")
      ];
      
      strongestItems.forEach(item => {
        expect(item).toBeTruthy();
        expect(item.textContent).toMatch(/\d+%/); // Should show percentage
      });
    });

    it("identifies and displays top 3 weakest preferences", () => {
      render(<AdaptiveStyleSelector {...defaultProps} data={mockAdaptiveStyleData} />);
      
      const weakestSection = screen.getByTestId("weakest-preferences");
      expect(weakestSection).toBeTruthy();
      
      // Should have exactly 3 weakest preference items
      const weakestItems = [
        screen.getByTestId("weakest-0"),
        screen.getByTestId("weakest-1"),
        screen.getByTestId("weakest-2")
      ];
      
      weakestItems.forEach(item => {
        expect(item).toBeTruthy();
        expect(item.textContent).toContain("Neutral preference");
      });
    });

    it("sorts strongest preferences by absolute score value", () => {
      // Create data where minimal_ornate (0.7) should be first, modern_classic (0.6) second, structured_organic (0.5) third
      const testData = {
        ...mockAdaptiveStyleData,
        scores: {
          modern_classic: 0.6,   // Should be 2nd strongest
          bold_subtle: -0.4,     // 4th strongest (abs = 0.4)
          warm_cool: 0.3,        // 5th strongest
          minimal_ornate: 0.7,   // Should be 1st strongest
          playful_serious: -0.2, // 6th strongest 
          light_heavy: -0.1,     // 7th strongest (weakest)
          structured_organic: 0.5 // Should be 3rd strongest
        }
      };
      
      render(<AdaptiveStyleSelector {...defaultProps} data={testData} />);
      
      const strongest0 = screen.getByTestId("strongest-0");
      const strongest1 = screen.getByTestId("strongest-1");
      const strongest2 = screen.getByTestId("strongest-2");
      
      // minimal_ornate (0.7 = 85%) should be first
      expect(strongest0.textContent).toContain("85%");
      // modern_classic (0.6 = 80%) should be second  
      expect(strongest1.textContent).toContain("80%");
      // structured_organic (0.5 = 75%) should be third
      expect(strongest2.textContent).toContain("75%");
    });
  });

  describe("Acceptance Criteria 4: Helpful explanations of dimensions", () => {
    it("shows descriptive text for each dimension", () => {
      render(<AdaptiveStyleSelector {...defaultProps} data={mockAdaptiveStyleData} />);
      
      // Check that dimension descriptions are present
      expect(screen.getByText("Contemporary sleek designs versus timeless traditional approaches")).toBeTruthy();
      expect(screen.getByText("High-impact striking elements versus understated refined touches")).toBeTruthy();
      expect(screen.getByText("Clean simplified forms versus rich detailed embellishments")).toBeTruthy();
    });

    it("displays correct left and right labels for each dimension", () => {
      render(<AdaptiveStyleSelector {...defaultProps} data={mockAdaptiveStyleData} />);
      
      // Check some key label pairs
      expect(screen.getByText("Classic")).toBeTruthy();
      expect(screen.getByText("Modern")).toBeTruthy();
      expect(screen.getByText("Subtle")).toBeTruthy();
      expect(screen.getByText("Bold")).toBeTruthy();
      expect(screen.getByText("Ornate")).toBeTruthy();
      expect(screen.getByText("Minimal")).toBeTruthy();
    });
  });

  describe("Acceptance Criteria 5: Actionable insights for design applications", () => {
    it("displays design insights section", () => {
      render(<AdaptiveStyleSelector {...defaultProps} data={mockAdaptiveStyleData} />);
      
      const insightsSection = screen.getByTestId("design-insights");
      expect(insightsSection).toBeTruthy();
      expect(screen.getByText("Actionable Design Insights")).toBeTruthy();
    });

    it("provides specific design insights for top preferences", () => {
      render(<AdaptiveStyleSelector {...defaultProps} data={mockAdaptiveStyleData} />);
      
      // Should have at least 2 specific insights plus confidence recommendation
      const insight0 = screen.getByTestId("insight-0");
      const insight1 = screen.getByTestId("insight-1");
      
      expect(insight0).toBeTruthy();
      expect(insight1).toBeTruthy();
      
      // Should contain actionable design guidance text
      expect(insight0.textContent).toMatch(/Classic|Modern|Minimal|Ornate|Structured|Organic/);
      expect(insight1.textContent).toMatch(/Classic|Modern|Minimal|Ornate|Structured|Organic/);
    });

    it("provides confidence-based recommendations", () => {
      render(<AdaptiveStyleSelector {...defaultProps} data={mockAdaptiveStyleData} />);
      
      expect(screen.getByText("Confidence Level Recommendation")).toBeTruthy();
      expect(screen.getByText(/style preferences.*clear.*designers can confidently/i)).toBeTruthy();
    });

    it("adapts confidence recommendations based on reliability score", () => {
      const lowConfidenceData = { ...mockAdaptiveStyleData, reliability: 0.45 };
      render(<AdaptiveStyleSelector {...defaultProps} data={lowConfidenceData} />);
      
      expect(screen.getByText(/preferences show some uncertainty.*flexibility.*diverse concepts/i)).toBeTruthy();
    });
  });

  describe("Navigation and Interaction", () => {
    it("provides back to questions navigation", () => {
      render(<AdaptiveStyleSelector {...defaultProps} data={mockAdaptiveStyleData} />);
      
      const backButton = screen.getByTestId("back-button");
      expect(backButton.textContent).toContain("Back to Questions");
      
      fireEvent.click(backButton);
      expect(defaultProps.onPrev).toHaveBeenCalled();
    });

    it("provides continue navigation", () => {
      const onNext = vi.fn();
      const onSave = vi.fn().mockResolvedValue(undefined);
      
      render(<AdaptiveStyleSelector {...defaultProps} onNext={onNext} onSave={onSave} data={mockAdaptiveStyleData} />);
      
      const nextButton = screen.getByTestId("next-button");
      expect(nextButton.textContent).toContain("Continue");
      
      fireEvent.click(nextButton);
      expect(onNext).toHaveBeenCalled();
    });
  });

  describe("Data Integration", () => {
    it("correctly calculates reliability from choices", () => {
      const testData = {
        choices: [
          { pairId: "test-1", choice: "A" as const, confidence: 1.0, timestamp: new Date() },
          { pairId: "test-2", choice: "B" as const, confidence: 0.8, timestamp: new Date() }
        ],
        scores: mockAdaptiveStyleData.scores
      };
      
      render(<AdaptiveStyleSelector {...defaultProps} data={testData} />);
      
      // With 2 choices: completeness = 2/10 = 0.2, avgConfidence = 0.9
      // reliability = (0.2 * 0.4) + (0.9 * 0.6) = 0.08 + 0.54 = 0.62 = 62%
      const confidenceElement = screen.getByTestId("overall-confidence");
      expect(confidenceElement.textContent).toContain("62%");
    });

    it("handles empty or minimal data gracefully", () => {
      const emptyData = { choices: [], scores: mockAdaptiveStyleData.scores };
      render(<AdaptiveStyleSelector {...defaultProps} data={emptyData} />);
      
      const confidenceElement = screen.getByTestId("overall-confidence");
      expect(confidenceElement.textContent).toContain("0%");
      expect(confidenceElement.textContent).toContain("Low");
    });
  });

  describe("Responsive Design and Accessibility", () => {
    it("includes proper data-testids for testing", () => {
      render(<AdaptiveStyleSelector {...defaultProps} data={mockAdaptiveStyleData} />);
      
      // Key elements should have testids
      expect(screen.getByTestId("summary-screen")).toBeTruthy();
      expect(screen.getByTestId("overall-confidence")).toBeTruthy();
      expect(screen.getByTestId("dimension-breakdown")).toBeTruthy();
      expect(screen.getByTestId("strongest-preferences")).toBeTruthy();
      expect(screen.getByTestId("weakest-preferences")).toBeTruthy();
      expect(screen.getByTestId("design-insights")).toBeTruthy();
    });

    it("uses semantic icons for different sections", () => {
      render(<AdaptiveStyleSelector {...defaultProps} data={mockAdaptiveStyleData} />);
      
      // Icons should be present in headers - check by class or SVG presence
      const strongestSection = screen.getByTestId("strongest-preferences");
      const weakestSection = screen.getByTestId("weakest-preferences");
      const insightsSection = screen.getByTestId("design-insights");
      
      expect(strongestSection.querySelector('svg')).toBeTruthy();
      expect(weakestSection.querySelector('svg')).toBeTruthy();
      expect(insightsSection.querySelector('svg')).toBeTruthy();
    });
  });
});

describe("Component Integration with Main Flow", () => {
  it("auto-saves data when summary screen is displayed", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<AdaptiveStyleSelector {...defaultProps} onSave={onSave} data={mockAdaptiveStyleData} />);
    
    // Summary screen should trigger auto-save
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        "adaptive_style",
        expect.objectContaining({
          choices: mockAdaptiveStyleData.choices,
          scores: expect.any(Object),
          reliability: expect.any(Number),
          averageConfidence: expect.any(Number)
        })
      );
    }, { timeout: 1000 });
  });

  it("maintains data consistency between calculation and display", () => {
    render(<AdaptiveStyleSelector {...defaultProps} data={mockAdaptiveStyleData} />);
    
    // Verify that displayed percentages match the score calculations
    // modern_classic: 0.6 -> 80%
    const modernClassicPercentage = screen.getByTestId("percentage-modern_classic");
    expect(modernClassicPercentage.textContent).toBe("80%");
    
    // Verify that the reliability calculation is consistent
    const overallConfidence = screen.getByTestId("overall-confidence");
    expect(overallConfidence.textContent).toContain("75%"); // reliability * 100
  });
});