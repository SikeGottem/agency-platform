import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { StyleDirectionStep } from "../style-direction-step";

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

describe("StyleDirectionStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the style direction step", () => {
    render(<StyleDirectionStep {...defaultProps} />);
    expect(screen.getByTestId("style-direction-step")).toBeTruthy();
    expect(screen.getByTestId("style-cards-grid")).toBeTruthy();
    expect(screen.getByTestId("anti-inspiration-section")).toBeTruthy();
    expect(screen.getByTestId("brand-examples-section")).toBeTruthy();
  });

  it("renders all 8 style cards with data-testids", () => {
    render(<StyleDirectionStep {...defaultProps} />);
    const styles = ["minimalist", "bold", "playful", "elegant", "vintage", "modern", "organic", "geometric"];
    for (const style of styles) {
      expect(screen.getByTestId(`style-card-${style}`)).toBeTruthy();
    }
  });

  it("selects a style card and shows animated checkmark", () => {
    render(<StyleDirectionStep {...defaultProps} />);
    const card = screen.getByTestId("style-card-bold");
    fireEvent.click(card);
    const checkmark = screen.getByTestId("style-checkmark-bold");
    expect(checkmark.className).toContain("scale-100");
    expect(checkmark.className).toContain("opacity-100");
    expect(screen.getByTestId("style-count").textContent).toContain("1/5");
  });

  it("deselects a style card on second click", () => {
    render(<StyleDirectionStep {...defaultProps} />);
    fireEvent.click(screen.getByTestId("style-card-bold"));
    expect(screen.getByTestId("style-count").textContent).toContain("1/5");
    fireEvent.click(screen.getByTestId("style-card-bold"));
    expect(screen.getByTestId("style-count").textContent).toContain("0/5");
    const checkmark = screen.getByTestId("style-checkmark-bold");
    expect(checkmark.className).toContain("scale-0");
  });

  it("enforces max 5 style selections", () => {
    render(<StyleDirectionStep {...defaultProps} />);
    const styles = ["minimalist", "bold", "playful", "elegant", "vintage"];
    for (const s of styles) {
      fireEvent.click(screen.getByTestId(`style-card-${s}`));
    }
    expect(screen.getByTestId("style-count").textContent).toContain("5/5");
    // Attempt 6th
    fireEvent.click(screen.getByTestId("style-card-modern"));
    expect(screen.getByTestId("style-error").textContent).toContain("up to 5");
    expect(screen.getByTestId("style-count").textContent).toContain("5/5");
  });

  it("anti-inspiration: toggles styles to avoid", () => {
    render(<StyleDirectionStep {...defaultProps} />);
    const antiBtn = screen.getByTestId("anti-style-bold");
    fireEvent.click(antiBtn);
    expect(antiBtn.className).toContain("destructive");
    // Toggle off
    fireEvent.click(antiBtn);
    expect(antiBtn.className).not.toContain("text-destructive");
  });

  it("anti-inspiration: cannot mark a selected style as anti", () => {
    render(<StyleDirectionStep {...defaultProps} />);
    fireEvent.click(screen.getByTestId("style-card-bold"));
    const antiBtn = screen.getByTestId("anti-style-bold");
    expect(antiBtn).toHaveProperty("disabled", true);
  });

  it("brand examples: add and remove URLs", () => {
    render(<StyleDirectionStep {...defaultProps} />);
    expect(screen.getByTestId("brand-example-input-0")).toBeTruthy();
    fireEvent.change(screen.getByTestId("brand-example-input-0"), {
      target: { value: "https://example.com" },
    });
    // Add another
    fireEvent.click(screen.getByTestId("add-brand-example-button"));
    expect(screen.getByTestId("brand-example-input-1")).toBeTruthy();
    // Remove first
    fireEvent.click(screen.getByTestId("remove-brand-example-0"));
    expect(screen.queryByTestId("brand-example-input-1")).toBeNull();
  });

  it("auto-save fires after debounce on selection change", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { unmount } = render(<StyleDirectionStep {...defaultProps} onSave={onSave} />);
    fireEvent.click(screen.getByTestId("style-card-minimalist"));
    await new Promise((r) => setTimeout(r, 1200));
    expect(onSave).toHaveBeenCalledWith(
      "style_direction",
      expect.objectContaining({ selectedStyles: ["minimalist"] })
    );
    unmount();
  }, 10000);

  it("pre-fills data from props", () => {
    const existingData = {
      selectedStyles: ["bold", "modern"],
      antiInspiration: ["playful"],
      brandExamples: ["https://test.com"],
    };
    render(<StyleDirectionStep {...defaultProps} data={existingData} />);
    expect(screen.getByTestId("style-checkmark-bold").className).toContain("scale-100");
    expect(screen.getByTestId("style-checkmark-modern").className).toContain("scale-100");
    expect(screen.getByTestId("anti-style-playful").className).toContain("text-destructive");
    expect(screen.getByTestId("brand-example-input-0")).toHaveProperty("value", "https://test.com");
    expect(screen.getByTestId("style-count").textContent).toContain("2/5");
  });

  it("validates at least 1 style before proceeding", async () => {
    const onNext = vi.fn();
    render(<StyleDirectionStep {...defaultProps} onNext={onNext} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId("next-button"));
    });
    expect(screen.getByTestId("style-error")).toBeTruthy();
    expect(onNext).not.toHaveBeenCalled();
  });

  it("calls onNext after valid submission", async () => {
    const onNext = vi.fn();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<StyleDirectionStep {...defaultProps} onNext={onNext} onSave={onSave} />);
    fireEvent.click(screen.getByTestId("style-card-elegant"));
    await act(async () => {
      fireEvent.click(screen.getByTestId("next-button"));
    });
    expect(onNext).toHaveBeenCalled();
  });

  it("navigation: back button calls onPrev", () => {
    const onPrev = vi.fn();
    render(<StyleDirectionStep {...defaultProps} onPrev={onPrev} />);
    fireEvent.click(screen.getByTestId("back-button"));
    expect(onPrev).toHaveBeenCalled();
  });
});
