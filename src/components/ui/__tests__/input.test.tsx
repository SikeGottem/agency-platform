import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "../input";

describe("Input", () => {
  it("renders input element", () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByRole("textbox");
    expect(input).toBeTruthy();
    expect(input).toHaveAttribute("placeholder", "Enter text");
  });

  it("applies hover states with transition classes", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("hover:border-ring/40");
    expect(input.className).toContain("transition-[color,box-shadow,border-color]");
    expect(input.className).toContain("duration-200");
    expect(input.className).toContain("ease-out");
  });

  it("respects prefers-reduced-motion", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("motion-reduce:transition-none");
  });

  it("applies focus-visible states", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("focus-visible:border-ring");
    expect(input.className).toContain("focus-visible:ring-ring/50");
    expect(input.className).toContain("focus-visible:ring-[3px]");
  });

  it("handles focus interactions", () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    render(<Input data-testid="test-input" onFocus={handleFocus} onBlur={handleBlur} />);
    const input = screen.getByTestId("test-input");
    
    // Focus the input
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalled();
    
    // Blur the input
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });

  it("handles input value changes", () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    
    fireEvent.change(input, { target: { value: "test value" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("supports different input types", () => {
    render(<Input type="email" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");
  });

  it("supports password type", () => {
    render(<Input type="password" data-testid="password-input" />);
    const input = screen.getByTestId("password-input");
    expect(input).toHaveAttribute("type", "password");
  });

  it("can be disabled", () => {
    render(<Input disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
    expect(input.className).toContain("disabled:pointer-events-none");
    expect(input.className).toContain("disabled:cursor-not-allowed");
    expect(input.className).toContain("disabled:opacity-50");
  });

  it("handles aria-invalid state", () => {
    render(<Input aria-invalid />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("aria-invalid:ring-destructive/20");
    expect(input.className).toContain("aria-invalid:border-destructive");
  });

  it("supports file input type", () => {
    render(<Input type="file" />);
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
    expect(input?.className).toContain("file:inline-flex");
    expect(input?.className).toContain("file:h-7");
    expect(input?.className).toContain("file:border-0");
  });

  it("renders with custom className", () => {
    render(<Input className="custom-input" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("custom-input");
  });

  it("supports controlled value", () => {
    render(<Input value="controlled value" readOnly />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("controlled value");
  });

  it("has proper default styling", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("h-9");
    expect(input.className).toContain("w-full");
    expect(input.className).toContain("rounded-md");
    expect(input.className).toContain("border");
    expect(input.className).toContain("px-3");
    expect(input.className).toContain("py-1");
    expect(input.className).toContain("shadow-xs");
  });

  it("supports placeholder styling", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("placeholder:text-muted-foreground");
  });

  it("supports text selection styling", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("selection:bg-primary");
    expect(input.className).toContain("selection:text-primary-foreground");
  });
});