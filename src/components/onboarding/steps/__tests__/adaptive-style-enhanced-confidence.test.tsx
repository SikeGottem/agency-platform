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

describe("AdaptiveStyleSelector - Enhanced Confidence Rating UI (US-005)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows enhanced confidence selector after picking a style", async () => {
    render(<AdaptiveStyleSelector {...defaultProps} />);
    
    // Wait for component to render and find the first comparison card
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const styleCard = cards.find(card => 
      card.textContent?.includes("Clean & Minimal") || 
      card.textContent?.includes("Rich & Layered")
    );
    
    expect(styleCard).toBeTruthy();
    
    // Click on a style option
    fireEvent.click(styleCard!);
    
    // Should show enhanced confidence selector with all new elements
    await waitFor(() => {
      expect(screen.getByTestId("confidence-selector")).toBeInTheDocument();
    });
    
    expect(screen.getByText("How confident are you in this choice?")).toBeInTheDocument();
    expect(screen.getByTestId("confidence-display")).toBeInTheDocument();
    expect(screen.getByTestId("confidence-slider")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-confidence")).toBeInTheDocument();
  });

  it("defaults to 80% confidence level", async () => {
    render(<AdaptiveStyleSelector {...defaultProps} />);
    
    // Find and click a style card
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const styleCard = cards.find(card => 
      card.textContent?.includes("Clean & Minimal") || 
      card.textContent?.includes("Rich & Layered")
    );
    
    fireEvent.click(styleCard!);
    
    // Wait for confidence selector
    await waitFor(() => {
      expect(screen.getByTestId("confidence-display")).toBeInTheDocument();
    });
    
    // Should display 80% by default
    expect(screen.getByTestId("confidence-display")).toHaveTextContent("80%");
    expect(screen.getByTestId("confirm-confidence")).toHaveTextContent("Continue with 80% confidence");
  });

  it("allows users to adjust confidence with slider", async () => {
    render(<AdaptiveStyleSelector {...defaultProps} />);
    
    // Find and click a style card
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const styleCard = cards.find(card => 
      card.textContent?.includes("Clean & Minimal") || 
      card.textContent?.includes("Rich & Layered")
    );
    
    fireEvent.click(styleCard!);
    
    // Wait for confidence selector
    const slider = await waitFor(() => screen.getByTestId("confidence-slider"));
    
    // Change slider value to 60%
    fireEvent.change(slider, { target: { value: "60" } });
    
    // Should update display and button text
    expect(screen.getByTestId("confidence-display")).toHaveTextContent("60%");
    expect(screen.getByTestId("confirm-confidence")).toHaveTextContent("Continue with 60% confidence");
  });

  it("provides quick select buttons for common confidence levels", async () => {
    render(<AdaptiveStyleSelector {...defaultProps} />);
    
    // Find and click a style card
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const styleCard = cards.find(card => 
      card.textContent?.includes("Clean & Minimal") || 
      card.textContent?.includes("Rich & Layered")
    );
    
    fireEvent.click(styleCard!);
    
    // Wait for confidence selector
    await waitFor(() => {
      expect(screen.getByTestId("confidence-selector")).toBeInTheDocument();
    });
    
    // Should have quick select buttons
    expect(screen.getByTestId("quick-confidence-0.3")).toBeInTheDocument();
    expect(screen.getByTestId("quick-confidence-0.6")).toBeInTheDocument();
    expect(screen.getByTestId("quick-confidence-0.8")).toBeInTheDocument();
    expect(screen.getByTestId("quick-confidence-1")).toBeInTheDocument();
    
    // Should show correct labels and descriptions
    // Check quick select buttons have the correct labels
    const button30 = screen.getByTestId("quick-confidence-0.3");
    const button60 = screen.getByTestId("quick-confidence-0.6");
    const button80 = screen.getByTestId("quick-confidence-0.8");
    const button100 = screen.getByTestId("quick-confidence-1");
    
    expect(button30).toHaveTextContent("30%");
    expect(button60).toHaveTextContent("60%");
    expect(button80).toHaveTextContent("80%");
    expect(button100).toHaveTextContent("100%");
    
    expect(screen.getByText("Slightly prefer")).toBeInTheDocument();
    expect(screen.getByText("Moderately prefer")).toBeInTheDocument();
    expect(screen.getByText("Strongly prefer")).toBeInTheDocument();
    expect(screen.getByText("Completely sure")).toBeInTheDocument();
  });

  it("updates display when quick select buttons are clicked", async () => {
    render(<AdaptiveStyleSelector {...defaultProps} />);
    
    // Find and click a style card
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const styleCard = cards.find(card => 
      card.textContent?.includes("Clean & Minimal") || 
      card.textContent?.includes("Rich & Layered")
    );
    
    fireEvent.click(styleCard!);
    
    // Wait for confidence selector
    await waitFor(() => {
      expect(screen.getByTestId("confidence-selector")).toBeInTheDocument();
    });
    
    // Click 100% button
    fireEvent.click(screen.getByTestId("quick-confidence-1"));
    
    // Should update display
    expect(screen.getByTestId("confidence-display")).toHaveTextContent("100%");
    expect(screen.getByTestId("confirm-confidence")).toHaveTextContent("Continue with 100% confidence");
    
    // Click 30% button
    fireEvent.click(screen.getByTestId("quick-confidence-0.3"));
    
    // Should update display again
    expect(screen.getByTestId("confidence-display")).toHaveTextContent("30%");
    expect(screen.getByTestId("confirm-confidence")).toHaveTextContent("Continue with 30% confidence");
  });

  it("records precise confidence values when confirmed", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<AdaptiveStyleSelector {...defaultProps} onSave={onSave} />);
    
    // Find and click a style card
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const styleCard = cards.find(card => 
      card.textContent?.includes("Clean & Minimal") || 
      card.textContent?.includes("Rich & Layered")
    );
    
    fireEvent.click(styleCard!);
    
    // Wait for confidence selector and adjust to 45%
    const slider = await waitFor(() => screen.getByTestId("confidence-slider"));
    fireEvent.change(slider, { target: { value: "45" } });
    
    // Confirm the selection
    fireEvent.click(screen.getByTestId("confirm-confidence"));
    
    // Wait for auto-save to trigger
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    }, { timeout: 2000 });
    
    // Check that the saved data includes precise confidence
    const saveCall = onSave.mock.calls.find(call => call[0] === "style_direction");
    expect(saveCall).toBeTruthy();
    
    const savedData = saveCall[1];
    expect(savedData.choices).toBeDefined();
    expect(savedData.choices.length).toBeGreaterThan(0);
    expect(savedData.choices[0].confidence).toBe(0.45); // Precise 45% = 0.45
  });

  it("handles slider minimum and maximum bounds correctly", async () => {
    render(<AdaptiveStyleSelector {...defaultProps} />);
    
    // Find and click a style card
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const styleCard = cards.find(card => 
      card.textContent?.includes("Clean & Minimal") || 
      card.textContent?.includes("Rich & Layered")
    );
    
    fireEvent.click(styleCard!);
    
    // Wait for confidence selector
    const slider = await waitFor(() => screen.getByTestId("confidence-slider"));
    
    // Test minimum value (10%)
    fireEvent.change(slider, { target: { value: "10" } });
    expect(screen.getByTestId("confidence-display")).toHaveTextContent("10%");
    
    // Test maximum value (100%)
    fireEvent.change(slider, { target: { value: "100" } });
    expect(screen.getByTestId("confidence-display")).toHaveTextContent("100%");
    
    // Test mid-range value with 5% steps
    fireEvent.change(slider, { target: { value: "75" } });
    expect(screen.getByTestId("confidence-display")).toHaveTextContent("75%");
  });

  it("shows visual feedback for selected quick buttons", async () => {
    render(<AdaptiveStyleSelector {...defaultProps} />);
    
    // Find and click a style card
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const styleCard = cards.find(card => 
      card.textContent?.includes("Clean & Minimal") || 
      card.textContent?.includes("Rich & Layered")
    );
    
    fireEvent.click(styleCard!);
    
    // Wait for confidence selector
    await waitFor(() => {
      expect(screen.getByTestId("confidence-selector")).toBeInTheDocument();
    });
    
    // Initially 80% should be selected (default)
    const button80 = screen.getByTestId("quick-confidence-0.8");
    expect(button80).toHaveClass("ring-2", "ring-[#E05252]/40");
    
    // Click 60% button
    fireEvent.click(screen.getByTestId("quick-confidence-0.6"));
    
    // 60% button should now be selected, 80% should not
    const button60 = screen.getByTestId("quick-confidence-0.6");
    expect(button60).toHaveClass("ring-2", "ring-[#E05252]/40");
    expect(button80).not.toHaveClass("ring-2", "ring-[#E05252]/40");
  });

  it("maintains smooth transitions and doesn't slow down questionnaire flow", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<AdaptiveStyleSelector {...defaultProps} onSave={onSave} />);
    
    // Find and click a style card
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const styleCard = cards.find(card => 
      card.textContent?.includes("Clean & Minimal") || 
      card.textContent?.includes("Rich & Layered")
    );
    
    fireEvent.click(styleCard!);
    
    // Wait for confidence selector
    await waitFor(() => {
      expect(screen.getByTestId("confidence-selector")).toBeInTheDocument();
    });
    
    // Quickly use default (no adjustment needed) and confirm
    const start = Date.now();
    fireEvent.click(screen.getByTestId("confirm-confidence"));
    
    // Should proceed to next question quickly
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    }, { timeout: 1000 });
    
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(1000); // Should be fast, not slow down flow
  });

  it("has appropriate mobile touch targets", async () => {
    render(<AdaptiveStyleSelector {...defaultProps} />);
    
    // Find and click a style card
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const styleCard = cards.find(card => 
      card.textContent?.includes("Clean & Minimal") || 
      card.textContent?.includes("Rich & Layered")
    );
    
    fireEvent.click(styleCard!);
    
    // Wait for confidence selector
    await waitFor(() => {
      expect(screen.getByTestId("confidence-selector")).toBeInTheDocument();
    });
    
    // Check that interactive elements meet minimum touch target size (44px)
    const quickButtons = [
      screen.getByTestId("quick-confidence-0.3"),
      screen.getByTestId("quick-confidence-0.6"),
      screen.getByTestId("quick-confidence-0.8"),
      screen.getByTestId("quick-confidence-1"),
    ];
    
    quickButtons.forEach(button => {
      expect(button).toHaveClass("min-h-[44px]");
    });
    
    const confirmButton = screen.getByTestId("confirm-confidence");
    expect(confirmButton).toHaveClass("min-h-[44px]");
  });

  it("integrates with existing confidence tracking data structure", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<AdaptiveStyleSelector {...defaultProps} onSave={onSave} />);
    
    // Complete one confidence selection with a specific value
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const styleCard = cards.find(card => 
      card.textContent?.includes("Clean & Minimal") || 
      card.textContent?.includes("Rich & Layered")
    );
    
    fireEvent.click(styleCard!);
    
    // Wait for confidence selector and set custom 35% via slider
    const slider = await waitFor(() => screen.getByTestId("confidence-slider"));
    fireEvent.change(slider, { target: { value: "35" } });
    
    fireEvent.click(screen.getByTestId("confirm-confidence"));
    
    // Wait for save to complete
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    }, { timeout: 2000 });
    
    // Check that the choice was recorded with correct confidence value
    const saveCall = onSave.mock.calls.find(call => call[0] === "style_direction");
    expect(saveCall).toBeTruthy();
    
    const savedData = saveCall[1];
    expect(savedData.choices.length).toBeGreaterThan(0);
    
    // Verify confidence value is preserved as decimal
    expect(savedData.choices[0].confidence).toBe(0.35); // 35%
    
    // Verify average confidence calculation
    expect(savedData.averageConfidence).toBe(0.35);
  });

  it("maintains visual consistency with existing design system", async () => {
    render(<AdaptiveStyleSelector {...defaultProps} />);
    
    // Find and click a style card
    const cards = await waitFor(() => screen.getAllByRole("button"));
    const styleCard = cards.find(card => 
      card.textContent?.includes("Clean & Minimal") || 
      card.textContent?.includes("Rich & Layered")
    );
    
    fireEvent.click(styleCard!);
    
    // Wait for confidence selector
    await waitFor(() => {
      expect(screen.getByTestId("confidence-selector")).toBeInTheDocument();
    });
    
    // Check that key elements are present and functioning
    const confidenceDisplay = screen.getByTestId("confidence-display");
    expect(confidenceDisplay).toBeInTheDocument();
    expect(confidenceDisplay).toHaveTextContent("80%");
    
    const confirmButton = screen.getByTestId("confirm-confidence");
    expect(confirmButton).toBeInTheDocument();
    expect(confirmButton).toHaveTextContent("Continue with 80% confidence");
    
    // Check that container is properly styled
    const selector = screen.getByTestId("confidence-selector");
    expect(selector).toBeInTheDocument();
    
    // Verify brand color elements are present (brand color is #E05252)
    expect(confirmButton.className).toContain("E05252");
    
    // Quick buttons should be present with brand styling
    const quickButtons = [
      screen.getByTestId("quick-confidence-0.3"),
      screen.getByTestId("quick-confidence-0.6"),
      screen.getByTestId("quick-confidence-0.8"),
      screen.getByTestId("quick-confidence-1"),
    ];
    
    quickButtons.forEach(button => {
      expect(button).toBeInTheDocument();
    });
  });
});