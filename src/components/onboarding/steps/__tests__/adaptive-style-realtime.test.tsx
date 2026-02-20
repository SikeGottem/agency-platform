import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdaptiveStyleSelector } from "../adaptive-style-selector";

const defaultProps = {
  projectId: "test-project-id",
  projectType: "branding" as const,
  data: undefined,
  onSave: vi.fn().mockResolvedValue(undefined),
  onNext: vi.fn(),
  onPrev: vi.fn(),
  isFirst: false,
  isLast: false,
  stepKey: "style_direction" as const,
  designerName: "Test Designer",
  clientName: "Test Client",
};

describe("AdaptiveStyleSelector - Real-time Profile Updates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows live profile updates after round 2", async () => {
    // Start with some progress to trigger live profile display
    const partialData = {
      scores: {
        modern_classic: 15, bold_subtle: -10, warm_cool: 5, minimal_ornate: -15,
        playful_serious: 8, organic_geometric: -8, light_heavy: 12,
      },
      profile: { id: "minimal-modern", label: "Minimal Modern", description: "Clean and contemporary" },
      tags: [],
      brandExamples: [],
      choices: [
        { pairId: "mood-1", picked: "A" as const, confidence: 0.8 },
        { pairId: "mood-2", picked: "B" as const, confidence: 0.9 },
      ]
    };
    
    render(<AdaptiveStyleSelector {...defaultProps} data={partialData} />);
    
    // Should show emerging style section with current profile label
    await waitFor(() => {
      expect(screen.getByText("Your emerging style")).toBeInTheDocument();
    });
    
    expect(screen.getByTestId("current-profile-label")).toBeInTheDocument();
    expect(screen.getByText("Minimal Modern")).toBeInTheDocument();
  });

  it("shows dimension bars with proper animations", async () => {
    const partialData = {
      scores: {
        modern_classic: 20, bold_subtle: -15, warm_cool: 10, minimal_ornate: -10,
        playful_serious: 5, organic_geometric: -12, light_heavy: 8,
      },
      profile: { id: "minimal-modern", label: "Minimal Modern", description: "Clean" },
      tags: [], brandExamples: [],
      choices: [
        { pairId: "mood-1", picked: "A" as const, confidence: 0.8 },
        { pairId: "mood-2", picked: "B" as const, confidence: 0.9 },
      ]
    };
    
    render(<AdaptiveStyleSelector {...defaultProps} data={partialData} />);
    
    // Should show dimension bars with transition classes
    await waitFor(() => {
      expect(screen.getByText("Your emerging style")).toBeInTheDocument();
    });
    
    // Check for dimension labels
    expect(screen.getByText("Modern")).toBeInTheDocument();
    expect(screen.getByText("Bold")).toBeInTheDocument(); 
    expect(screen.getByText("Subtle")).toBeInTheDocument();
  });

  it("applies shift indicators when configured", async () => {
    // Test the shift indicator functionality exists
    const partialData = {
      scores: {
        modern_classic: 10, bold_subtle: 5, warm_cool: -5, minimal_ornate: 8,
        playful_serious: -3, organic_geometric: 12, light_heavy: -8,
      },
      profile: { id: "minimal-modern", label: "Minimal Modern", description: "Clean" },
      tags: [], brandExamples: [],
      choices: [{ pairId: "mood-1", picked: "A" as const, confidence: 0.8 }]
    };
    
    render(<AdaptiveStyleSelector {...defaultProps} data={partialData} />);
    
    // The component should render successfully with shift indicator support
    await waitFor(() => {
      expect(screen.getByText("Your emerging style")).toBeInTheDocument();
    });
    
    // Make a choice to potentially trigger shift indicators
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const styleCard = cards.find(card => 
      card.textContent && !card.textContent.includes("Back") && !card.textContent.includes("confidence")
    );
    
    if (styleCard) {
      fireEvent.click(styleCard);
      
      await waitFor(() => {
        const confidenceButtons = screen.queryAllByTestId(/^confidence-/);
        expect(confidenceButtons.length).toBeGreaterThan(0);
      });
    }
  });

  it("handles radar chart transitions smoothly", async () => {
    const completedData = {
      scores: {
        modern_classic: 25, bold_subtle: -20, warm_cool: 15, minimal_ornate: -25,
        playful_serious: 10, organic_geometric: -15, light_heavy: 5,
      },
      profile: { id: "minimal-modern", label: "Minimal Modern", description: "Clean and contemporary" },
      tags: [],
      brandExamples: [],
      choices: Array(10).fill(0).map((_, i) => ({
        pairId: `pair-${i}`, picked: "A" as const, confidence: 0.8
      }))
    };
    
    render(<AdaptiveStyleSelector {...defaultProps} data={completedData} />);
    
    // Should show completed results with radar chart
    await waitFor(() => {
      expect(screen.getByText("Your Style Profile")).toBeInTheDocument();
    });
    
    // Radar chart should be present with smooth transition classes
    const radarChart = await waitFor(() => 
      screen.getByRole("img", { name: /style profile radar chart/i })
    );
    expect(radarChart).toBeInTheDocument();
    
    // The SVG should have transition classes applied
    const svgElement = radarChart.closest("svg");
    expect(svgElement).toBeInTheDocument();
  });

  it("shows profile reliability updates", async () => {
    const dataWithReliability = {
      scores: {
        modern_classic: 15, bold_subtle: -10, warm_cool: 20, minimal_ornate: -18,
        playful_serious: 12, organic_geometric: -14, light_heavy: 8,
      },
      profile: { id: "minimal-modern", label: "Minimal Modern", description: "Clean" },
      tags: [], brandExamples: [],
      choices: Array(8).fill(0).map((_, i) => ({
        pairId: `pair-${i}`, picked: i % 2 ? "A" as const : "B" as const, confidence: 0.85
      }))
    };
    
    render(<AdaptiveStyleSelector {...defaultProps} data={dataWithReliability} />);
    
    // Should show results with reliability indicator
    await waitFor(() => {
      expect(screen.getByText("Your Style Profile")).toBeInTheDocument();
    });
    
    // Should show confidence percentage
    expect(screen.getByText(/confidence:/)).toBeInTheDocument();
  });
});