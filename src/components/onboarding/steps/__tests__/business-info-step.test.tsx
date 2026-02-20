import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { BusinessInfoStep } from "../business-info-step";

const defaultProps = {
  projectId: "test-project-id",
  projectType: "branding" as const,
  data: undefined,
  onSave: vi.fn().mockResolvedValue(undefined),
  onNext: vi.fn(),
  onPrev: vi.fn(),
  isFirst: false,
  isLast: false,
  stepKey: "business_info" as const,
  designerName: "Test Designer",
  clientName: "Test Client",
};

describe("BusinessInfoStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the business info form", () => {
    render(<BusinessInfoStep {...defaultProps} />);
    expect(screen.getByTestId("business-info-step")).toBeTruthy();
    expect(screen.getByTestId("company-name-input")).toBeTruthy();
    expect(screen.getByTestId("industry-selector")).toBeTruthy();
    expect(screen.getByTestId("description-textarea")).toBeTruthy();
    expect(screen.getByTestId("audience-chips")).toBeTruthy();
    expect(screen.getByTestId("competitors-section")).toBeTruthy();
  });

  it("AC1: company name input with validation", async () => {
    render(<BusinessInfoStep {...defaultProps} />);
    // Try to proceed without company name
    fireEvent.click(screen.getByTestId("next-button"));
    await waitFor(() => {
      expect(screen.getByText("Company name is required")).toBeTruthy();
    });
    // Fill in company name
    fireEvent.change(screen.getByTestId("company-name-input"), {
      target: { value: "Acme Corp" },
    });
    expect(screen.getByTestId("company-name-input")).toHaveProperty("value", "Acme Corp");
  });

  it("AC2: industry selector with common options + custom", async () => {
    render(<BusinessInfoStep {...defaultProps} />);
    // Open dropdown
    fireEvent.click(screen.getByTestId("industry-selector"));
    const dropdown = screen.getByTestId("industry-dropdown");
    expect(dropdown).toBeTruthy();
    // Select Technology
    fireEvent.click(screen.getByText("Technology"));
    expect(screen.getByTestId("industry-selector").textContent).toContain("Technology");
    // Select Other for custom
    fireEvent.click(screen.getByTestId("industry-selector"));
    fireEvent.click(screen.getByText("Other (specify)"));
    expect(screen.getByTestId("custom-industry-input")).toBeTruthy();
  });

  it("AC3: business description textarea with max 300 chars", () => {
    render(<BusinessInfoStep {...defaultProps} />);
    const textarea = screen.getByTestId("description-textarea") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "A".repeat(300) } });
    expect(textarea.value.length).toBe(300);
    // Counter should show 300/300
    expect(screen.getByText("300/300")).toBeTruthy();
  });

  it("AC4: target audience multi-select with preset + custom tags", () => {
    render(<BusinessInfoStep {...defaultProps} />);
    // Select a preset audience
    const chip = screen.getByText("Students");
    fireEvent.click(chip);
    // Add custom audience
    const customInput = screen.getByTestId("custom-audience-input");
    fireEvent.change(customInput, { target: { value: "Gamers" } });
    fireEvent.keyDown(customInput, { key: "Enter" });
    expect(screen.getByText("Gamers")).toBeTruthy();
  });

  it("AC5: competitors inputs (up to 3) with optional URL", () => {
    render(<BusinessInfoStep {...defaultProps} />);
    // First competitor is shown by default
    expect(screen.getByTestId("competitor-name-0")).toBeTruthy();
    expect(screen.getByTestId("competitor-url-0")).toBeTruthy();
    // Add more
    fireEvent.click(screen.getByTestId("add-competitor-button"));
    expect(screen.getByTestId("competitor-name-1")).toBeTruthy();
    fireEvent.click(screen.getByTestId("add-competitor-button"));
    expect(screen.getByTestId("competitor-name-2")).toBeTruthy();
    // Should not show add button after 3
    expect(screen.queryByTestId("add-competitor-button")).toBeNull();
  });

  it("AC6: auto-save is wired up (debounced onSave call)", async () => {
    // The component uses a useEffect with 800ms debounce to call onSave
    // We verify the debounce timer and onSave are connected by checking
    // that onSave is called after data changes and timer fires
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { unmount } = render(<BusinessInfoStep {...defaultProps} onSave={onSave} />);
    fireEvent.change(screen.getByTestId("company-name-input"), {
      target: { value: "Test Co" },
    });
    // Wait for debounce (800ms) + some buffer
    await new Promise((r) => setTimeout(r, 1200));
    expect(onSave).toHaveBeenCalledWith(
      "business_info",
      expect.objectContaining({ companyName: "Test Co" })
    );
    unmount();
  }, 10000);

  it("AC7: data persists when navigating back (pre-filled from props)", () => {
    const existingData = {
      companyName: "Existing Corp",
      industry: "Healthcare",
      description: "We do health stuff and more text here",
      targetAudience: ["Students"],
      customAudiences: ["Gamers"],
      competitors: [{ name: "Rival Inc", url: "https://rival.com" }],
    };
    render(<BusinessInfoStep {...defaultProps} data={existingData} />);
    expect(screen.getByTestId("company-name-input")).toHaveProperty("value", "Existing Corp");
    expect(screen.getByTestId("industry-selector").textContent).toContain("Healthcare");
    expect(screen.getByTestId("description-textarea")).toHaveProperty("value", "We do health stuff and more text here");
    expect(screen.getByTestId("competitor-name-0")).toHaveProperty("value", "Rival Inc");
    expect(screen.getByTestId("competitor-url-0")).toHaveProperty("value", "https://rival.com");
  });

  it("validates all required fields before proceeding", async () => {
    const onNext = vi.fn();
    const { container } = render(<BusinessInfoStep {...defaultProps} onNext={onNext} />);
    // Click next with empty form
    const btn = screen.getByTestId("next-button");
    await act(async () => {
      fireEvent.click(btn);
    });
    // Should show validation error and NOT call onNext
    expect(container.textContent).toContain("Company name is required");
    expect(onNext).not.toHaveBeenCalled();
  }, 10000);

  it("calls onNext after valid submission", async () => {
    const data = {
      companyName: "Acme",
      industry: "Technology",
      description: "We build cool things for people",
      targetAudience: ["Students"],
      customAudiences: [],
      competitors: [{ name: "", url: "" }],
    };
    const onNext = vi.fn();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<BusinessInfoStep {...defaultProps} data={data} onNext={onNext} onSave={onSave} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId("next-button"));
    });
    expect(onNext).toHaveBeenCalled();
  }, 10000);
});
