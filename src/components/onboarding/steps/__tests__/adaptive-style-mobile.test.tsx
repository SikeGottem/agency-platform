import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

// Mock window.matchMedia for mobile viewport tests
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe("AdaptiveStyleSelector - Mobile Responsiveness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders comparison cards that stack properly on mobile", async () => {
    // Mock mobile viewport
    mockMatchMedia(true);
    
    render(<AdaptiveStyleSelector {...defaultProps} />);
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByTestId("style-direction-step")).toBeInTheDocument();
    });

    // Find the cards container
    const cards = screen.getAllByRole("button").filter(button => 
      button.textContent?.includes("Clean & Minimal") || 
      button.textContent?.includes("Rich & Layered")
    );
    
    expect(cards).toHaveLength(2);
    
    // Check that cards have mobile-optimized classes
    cards.forEach(card => {
      // Should have minimum mobile height
      expect(card.className).toContain("min-h-[240px]");
      // Should have minimum mobile width
      expect(card.className).toContain("min-w-[280px]");
      // Should have touch-manipulation
      expect(card.className).toContain("touch-manipulation");
    });
  });

  it("has minimum 44px touch targets for all interactive elements", async () => {
    render(<AdaptiveStyleSelector {...defaultProps} />);
    
    // Click a style card to show confidence selector
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const styleCard = cards.find(card => 
      card.textContent?.includes("Clean & Minimal") || 
      card.textContent?.includes("Rich & Layered")
    );
    
    fireEvent.click(styleCard!);
    
    // Check confidence buttons have minimum touch targets
    await waitFor(() => {
      const confidenceButtons = [
        screen.getByTestId("confidence-0.5"),
        screen.getByTestId("confidence-0.8"),
        screen.getByTestId("confidence-1"),
      ];
      
      confidenceButtons.forEach(button => {
        expect(button.className).toContain("min-h-[44px]");
        expect(button.className).toContain("touch-manipulation");
      });
    });
  });

  it("optimizes images for mobile loading", async () => {
    render(<AdaptiveStyleSelector {...defaultProps} />);
    
    // Find image elements
    const images = await waitFor(() => screen.getAllByRole("img"));
    
    // Should have images from comparison cards
    const comparisonImages = images.filter(img => 
      img.getAttribute("src")?.includes("unsplash.com")
    );
    
    expect(comparisonImages.length).toBeGreaterThan(0);
    
    comparisonImages.forEach(img => {
      // Should have lazy loading
      expect(img.getAttribute("loading")).toBe("lazy");
      // Should have responsive sizes attribute
      expect(img.getAttribute("sizes")).toBe("(max-width: 640px) 90vw, 45vw");
      // Should have fetchPriority for mobile optimization
      expect(img.getAttribute("fetchPriority")).toBe("high");
    });
  });

  it("displays radar chart appropriately on mobile screens", async () => {
    // Complete questionnaire to show results with radar chart
    const completedData = {
      scores: {
        modern_classic: 20,
        bold_subtle: -10,
        warm_cool: 15,
        minimal_ornate: -20,
        playful_serious: 10,
        organic_geometric: -15,
        light_heavy: 5,
      },
      profile: { id: "minimal-modern", label: "Minimal Modern", description: "Clean and contemporary" },
      tags: [],
      brandExamples: [],
      choices: Array(10).fill(0).map((_, i) => ({
        pairId: `pair-${i}`,
        picked: "A" as const,
        confidence: 0.8,
      }))
    };

    render(<AdaptiveStyleSelector {...defaultProps} data={completedData} />);
    
    // Should show radar chart
    const radarChart = await waitFor(() => screen.getByRole("img", { name: /style profile radar chart/i }));
    expect(radarChart).toBeInTheDocument();
    
    // Check mobile-specific radar chart sizing
    const radarContainer = radarChart.closest("div");
    expect(radarContainer?.className).toContain("w-32 h-32");
    expect(radarContainer?.className).toContain("sm:w-48 sm:h-48");
  });

  it("ensures all interactive elements work with touch gestures", async () => {
    render(<AdaptiveStyleSelector {...defaultProps} />);
    
    // Test touch interaction on comparison card
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const styleCard = cards.find(card => 
      card.textContent?.includes("Clean & Minimal") || 
      card.textContent?.includes("Rich & Layered")
    );
    
    // Should have touch-manipulation class
    expect(styleCard?.className).toContain("touch-manipulation");
    
    // Should respond to touch events
    fireEvent.click(styleCard!);
    
    await waitFor(() => {
      expect(screen.getByText("How confident are you in this choice?")).toBeInTheDocument();
    });
    
    // Test skip button touch target
    const skipButton = screen.queryByText("Not sure, skip");
    if (skipButton) {
      expect(skipButton.className).toContain("min-h-[44px]");
      expect(skipButton.className).toContain("touch-manipulation");
    }
  });

  it("handles mobile-specific UI states correctly", async () => {
    render(<AdaptiveStyleSelector {...defaultProps} />);
    
    // Click a style card
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const styleCard = cards.find(card => 
      card.textContent?.includes("Clean & Minimal") || 
      card.textContent?.includes("Rich & Layered")
    );
    
    fireEvent.click(styleCard!);
    
    // Confidence selector should show with mobile-optimized layout
    await waitFor(() => {
      const confidenceContainer = screen.getByText("How confident are you in this choice?").closest("div");
      
      // Should have mobile gap spacing
      const buttonContainer = confidenceContainer?.querySelector(".flex");
      expect(buttonContainer?.className).toContain("gap-3");
      expect(buttonContainer?.className).toContain("sm:gap-2");
    });
  });

  it("maintains proper spacing and layout on small screens", async () => {
    render(<AdaptiveStyleSelector {...defaultProps} />);
    
    // Check main container spacing
    const mainContainer = screen.getByTestId("style-direction-step");
    expect(mainContainer.className).toContain("space-y-8");
    
    // Check cards container has proper mobile spacing
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const firstCard = cards.find(card => 
      card.textContent?.includes("Clean & Minimal") || 
      card.textContent?.includes("Rich & Layered")
    );
    
    const cardsContainer = firstCard?.parentElement;
    expect(cardsContainer?.className).toContain("gap-4");
  });

  it("shows appropriate mobile navigation button sizes", async () => {
    const completedData = {
      scores: {
        modern_classic: 0, bold_subtle: 0, warm_cool: 0,
        minimal_ornate: 0, playful_serious: 0, organic_geometric: 0, light_heavy: 0,
      },
      profile: { id: "test", label: "Test Style", description: "Test" },
      tags: [], brandExamples: [],
      choices: Array(10).fill(0).map((_, i) => ({ pairId: `pair-${i}`, picked: "A" as const, confidence: 0.8 }))
    };

    render(<AdaptiveStyleSelector {...defaultProps} data={completedData} />);
    
    // Should show navigation buttons with proper touch targets
    const backButton = await waitFor(() => screen.getByTestId("back-button"));
    const nextButton = screen.getByTestId("next-button");
    
    [backButton, nextButton].forEach(button => {
      expect(button.className).toContain("min-h-[44px]");
      expect(button.className).toContain("min-w-[100px]");
      expect(button.className).toContain("touch-manipulation");
    });
  });

  it("handles tag selection with appropriate mobile touch targets", async () => {
    // Show results with tags
    const completedData = {
      scores: {
        modern_classic: 0, bold_subtle: 0, warm_cool: 0,
        minimal_ornate: 0, playful_serious: 0, organic_geometric: 0, light_heavy: 0,
      },
      profile: { id: "test", label: "Test Style", description: "Test" },
      tags: [], brandExamples: [],
      choices: Array(10).fill(0).map((_, i) => ({ pairId: `pair-${i}`, picked: "A" as const, confidence: 0.8 }))
    };

    render(<AdaptiveStyleSelector {...defaultProps} data={completedData} />);
    
    // Find tag buttons
    const tagButtons = await waitFor(() => 
      screen.getAllByRole("button").filter(btn => 
        ["minimalist", "retro", "brutalist"].some(tag => btn.textContent?.includes(tag))
      )
    );
    
    expect(tagButtons.length).toBeGreaterThan(0);
    
    // Check mobile touch targets for tags
    tagButtons.slice(0, 3).forEach(button => {
      expect(button.className).toContain("min-h-[44px]");
      expect(button.className).toContain("touch-manipulation");
    });
    
    // Test tag selection
    fireEvent.click(tagButtons[0]);
    
    // Should update selection (visual feedback)
    expect(tagButtons[0].className).toContain("bg-[#E05252]/10");
  });

  it("provides accessible mobile experience", async () => {
    render(<AdaptiveStyleSelector {...defaultProps} />);
    
    // Check comparison cards have proper alt text
    const images = await waitFor(() => screen.getAllByRole("img"));
    const comparisonImages = images.filter(img => 
      img.getAttribute("src")?.includes("unsplash.com")
    );
    
    comparisonImages.forEach(img => {
      expect(img.getAttribute("alt")).toBeTruthy();
      expect(img.getAttribute("alt")).not.toBe("");
    });
    
    // Complete questionnaire to check radar chart accessibility
    const completedData = {
      scores: { modern_classic: 0, bold_subtle: 0, warm_cool: 0, minimal_ornate: 0, playful_serious: 0, organic_geometric: 0, light_heavy: 0 },
      profile: { id: "test", label: "Test Style", description: "Test" },
      tags: [], brandExamples: [],
      choices: Array(10).fill(0).map((_, i) => ({ pairId: `pair-${i}`, picked: "A" as const, confidence: 0.8 }))
    };

    render(<AdaptiveStyleSelector {...defaultProps} data={completedData} />);
    
    // Radar chart should have proper aria-label
    const radarChart = await waitFor(() => screen.getByRole("img", { name: /style profile radar chart/i }));
    expect(radarChart).toHaveAttribute("aria-label", "Style profile radar chart");
  });
});