import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WelcomeStep } from "../welcome-step";
import type { StepProps } from "@/components/onboarding/questionnaire-wizard";

function makeProps(overrides: Partial<StepProps> = {}): StepProps {
  return {
    projectId: "test-id",
    projectType: "branding",
    data: null,
    onSave: vi.fn(),
    onNext: vi.fn(),
    onPrev: vi.fn(),
    isFirst: true,
    isLast: false,
    ...overrides,
  };
}

describe("WelcomeStep", () => {
  it("renders designer name in greeting", () => {
    render(<WelcomeStep {...makeProps({ designerName: "Alice" })} />);
    expect(screen.getByText(/Alice/)).toBeTruthy();
  });

  it("renders client name in personalized greeting", () => {
    render(<WelcomeStep {...makeProps({ clientName: "Bob" })} />);
    expect(screen.getByText("Hi Bob!")).toBeTruthy();
  });

  it("shows fallback greeting without client name", () => {
    render(<WelcomeStep {...makeProps()} />);
    expect(screen.getByText("Welcome!")).toBeTruthy();
  });

  it("shows fallback designer text without designer name", () => {
    render(<WelcomeStep {...makeProps()} />);
    expect(screen.getByText(/your designer/)).toBeTruthy();
  });

  it("displays estimated time ~15 minutes", () => {
    render(<WelcomeStep {...makeProps()} />);
    expect(screen.getByText(/~15 minutes/)).toBeTruthy();
  });

  it("explains the 3-step process", () => {
    render(<WelcomeStep {...makeProps()} />);
    expect(screen.getByText("Answer Questions")).toBeTruthy();
    expect(screen.getByText("Review Your Brief")).toBeTruthy();
    expect(screen.getByText("Designer Receives Brief")).toBeTruthy();
  });

  it("has a Get Started button that calls onNext", () => {
    const onNext = vi.fn();
    render(<WelcomeStep {...makeProps({ onNext })} />);
    const btn = screen.getByRole("button", { name: /get started/i });
    fireEvent.click(btn);
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("shows project type label", () => {
    render(<WelcomeStep {...makeProps({ projectType: "branding" })} />);
    expect(screen.getByText(/Branding/i)).toBeTruthy();
  });

  it("shows auto-save note", () => {
    render(<WelcomeStep {...makeProps()} />);
    expect(screen.getByText(/saved automatically/)).toBeTruthy();
  });
});
