import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../button";

describe("Button", () => {
  it("renders button with default variant", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeTruthy();
    expect(button).toHaveTextContent("Click me");
  });

  it("applies hover states with transition classes", () => {
    render(<Button>Hover me</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("hover:bg-primary/90");
    expect(button.className).toContain("transition-all");
    expect(button.className).toContain("duration-200");
    expect(button.className).toContain("ease-out");
  });

  it("applies active states with scale effect", () => {
    render(<Button>Active me</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("active:bg-primary/80");
    expect(button.className).toContain("active:scale-[0.98]");
  });

  it("respects prefers-reduced-motion", () => {
    render(<Button>Motion reduced</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("motion-reduce:transition-none");
  });

  it("applies focus-visible states", () => {
    render(<Button>Focus me</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("focus-visible:border-ring");
    expect(button.className).toContain("focus-visible:ring-ring/50");
    expect(button.className).toContain("focus-visible:ring-[3px]");
  });

  it("handles destructive variant with active states", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-destructive");
    expect(button.className).toContain("hover:bg-destructive/90");
    expect(button.className).toContain("active:bg-destructive/80");
    expect(button.className).toContain("active:scale-[0.98]");
  });

  it("handles outline variant with active states", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("hover:bg-accent");
    expect(button.className).toContain("active:bg-accent/80");
    expect(button.className).toContain("active:scale-[0.98]");
  });

  it("handles ghost variant with active states", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("hover:bg-accent");
    expect(button.className).toContain("active:bg-accent/80");
    expect(button.className).toContain("active:scale-[0.98]");
  });

  it("handles link variant with active states", () => {
    render(<Button variant="link">Link</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("hover:underline");
    expect(button.className).toContain("active:text-primary/80");
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button.className).toContain("disabled:pointer-events-none");
    expect(button.className).toContain("disabled:opacity-50");
  });

  it("applies correct size classes", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("h-10");
    expect(button.className).toContain("px-6");
  });

  it("supports asChild prop with Slot", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.getByRole("link");
    expect(link).toBeTruthy();
    expect(link).toHaveTextContent("Link Button");
    expect(link).toHaveAttribute("href", "/test");
  });
});