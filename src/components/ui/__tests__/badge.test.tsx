import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Badge } from "../badge";

describe("Badge", () => {
  it("renders badge with default variant", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText("New");
    expect(badge).toBeTruthy();
    expect(badge.className).toContain("bg-primary");
    expect(badge.className).toContain("text-primary-foreground");
  });

  it("applies hover states with transition classes", () => {
    render(<Badge>Hover me</Badge>);
    const badge = screen.getByText("Hover me");
    expect(badge.className).toContain("hover:bg-primary/90");
    expect(badge.className).toContain("transition-[color,box-shadow,background-color,transform]");
    expect(badge.className).toContain("duration-200");
    expect(badge.className).toContain("ease-out");
  });

  it("applies active states with scale effect", () => {
    render(<Badge>Active me</Badge>);
    const badge = screen.getByText("Active me");
    expect(badge.className).toContain("active:bg-primary/80");
    expect(badge.className).toContain("active:scale-95");
  });

  it("respects prefers-reduced-motion", () => {
    render(<Badge>Motion reduced</Badge>);
    const badge = screen.getByText("Motion reduced");
    expect(badge.className).toContain("motion-reduce:transition-none");
  });

  it("applies focus-visible states", () => {
    render(<Badge>Focus me</Badge>);
    const badge = screen.getByText("Focus me");
    expect(badge.className).toContain("focus-visible:border-ring");
    expect(badge.className).toContain("focus-visible:ring-ring/50");
    expect(badge.className).toContain("focus-visible:ring-[3px]");
  });

  it("handles secondary variant with active states", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");
    expect(badge.className).toContain("bg-secondary");
    expect(badge.className).toContain("hover:bg-secondary/90");
    expect(badge.className).toContain("active:bg-secondary/80");
    expect(badge.className).toContain("active:scale-95");
  });

  it("handles destructive variant with active states", () => {
    render(<Badge variant="destructive">Error</Badge>);
    const badge = screen.getByText("Error");
    expect(badge.className).toContain("bg-destructive");
    expect(badge.className).toContain("hover:bg-destructive/90");
    expect(badge.className).toContain("active:bg-destructive/80");
    expect(badge.className).toContain("active:scale-95");
  });

  it("handles outline variant with active states", () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText("Outline");
    expect(badge.className).toContain("border-border");
    expect(badge.className).toContain("hover:bg-accent");
    expect(badge.className).toContain("active:bg-accent/80");
    expect(badge.className).toContain("active:scale-95");
  });

  it("handles ghost variant with active states", () => {
    render(<Badge variant="ghost">Ghost</Badge>);
    const badge = screen.getByText("Ghost");
    expect(badge.className).toContain("hover:bg-accent");
    expect(badge.className).toContain("active:bg-accent/80");
    expect(badge.className).toContain("active:scale-95");
  });

  it("handles link variant with active states", () => {
    render(<Badge variant="link">Link</Badge>);
    const badge = screen.getByText("Link");
    expect(badge.className).toContain("hover:underline");
    expect(badge.className).toContain("active:text-primary/80");
  });

  it("shows cursor pointer for interactive badges", () => {
    render(<Badge>Interactive</Badge>);
    const badge = screen.getByText("Interactive");
    expect(badge.className).toContain("[button&]:cursor-pointer");
  });

  it("supports asChild prop with button", () => {
    render(
      <Badge asChild>
        <button type="button">Button Badge</button>
      </Badge>
    );
    const button = screen.getByRole("button");
    expect(button).toBeTruthy();
    expect(button).toHaveTextContent("Button Badge");
    expect(button.className).toContain("bg-primary");
  });

  it("can handle click events when used as button", () => {
    const handleClick = vi.fn();
    render(
      <Badge asChild>
        <button onClick={handleClick}>Clickable</button>
      </Badge>
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("renders with custom className", () => {
    render(<Badge className="custom-class">Custom</Badge>);
    const badge = screen.getByText("Custom");
    expect(badge.className).toContain("custom-class");
  });

  it("supports SVG icons", () => {
    render(
      <Badge>
        <svg data-testid="icon" width="12" height="12" />
        With Icon
      </Badge>
    );
    const icon = screen.getByTestId("icon");
    expect(icon).toBeTruthy();
    const badge = screen.getByText("With Icon");
    expect(badge.className).toContain("[&>svg]:size-3");
    expect(badge.className).toContain("gap-1");
  });
});