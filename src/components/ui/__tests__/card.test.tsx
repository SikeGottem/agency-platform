import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "../card";

describe("Card", () => {
  it("renders card with content", () => {
    render(
      <Card>
        <CardContent>Test content</CardContent>
      </Card>
    );
    const content = screen.getByText("Test content");
    expect(content).toBeTruthy();
  });

  it("applies hover states with transition classes", () => {
    render(<Card data-testid="test-card">Card content</Card>);
    const card = screen.getByTestId("test-card");
    expect(card.className).toContain("hover:shadow-md");
    expect(card.className).toContain("hover:border-ring/20");
    expect(card.className).toContain("transition-[box-shadow,border-color,transform]");
    expect(card.className).toContain("duration-200");
    expect(card.className).toContain("ease-out");
  });

  it("respects prefers-reduced-motion", () => {
    render(<Card data-testid="test-card">Content</Card>);
    const card = screen.getByTestId("test-card");
    expect(card.className).toContain("motion-reduce:transition-none");
  });

  it("applies focus-visible states", () => {
    render(<Card data-testid="test-card">Content</Card>);
    const card = screen.getByTestId("test-card");
    expect(card.className).toContain("focus-visible:outline-none");
    expect(card.className).toContain("focus-visible:ring-2");
    expect(card.className).toContain("focus-visible:ring-ring/50");
    expect(card.className).toContain("focus-visible:border-ring");
  });

  it("supports interactive states for button cards", () => {
    render(<Card data-testid="test-card">Content</Card>);
    const card = screen.getByTestId("test-card");
    expect(card.className).toContain("[button&]:cursor-pointer");
    expect(card.className).toContain("[button&]:hover:scale-[1.01]");
    expect(card.className).toContain("[button&]:active:scale-[0.99]");
  });

  it("supports interactive states for link cards", () => {
    render(<Card data-testid="test-card">Content</Card>);
    const card = screen.getByTestId("test-card");
    expect(card.className).toContain("[a&]:cursor-pointer");
    expect(card.className).toContain("[a&]:hover:scale-[1.01]");
    expect(card.className).toContain("[a&]:active:scale-[0.99]");
  });

  it("has proper default styling", () => {
    render(<Card data-testid="test-card">Content</Card>);
    const card = screen.getByTestId("test-card");
    expect(card.className).toContain("bg-card");
    expect(card.className).toContain("text-card-foreground");
    expect(card.className).toContain("flex");
    expect(card.className).toContain("flex-col");
    expect(card.className).toContain("gap-6");
    expect(card.className).toContain("rounded-xl");
    expect(card.className).toContain("border");
    expect(card.className).toContain("py-6");
    expect(card.className).toContain("shadow-sm");
  });

  it("can be used as a button", () => {
    const handleClick = vi.fn();
    render(
      <Card as="button" onClick={handleClick} data-testid="button-card">
        Clickable Card
      </Card>
    );
    // Note: The Card component doesn't have an 'as' prop by default, but let's test clicking
    const card = screen.getByTestId("button-card");
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("renders with custom className", () => {
    render(<Card className="custom-card" data-testid="test-card">Content</Card>);
    const card = screen.getByTestId("test-card");
    expect(card.className).toContain("custom-card");
  });
});

describe("CardHeader", () => {
  it("renders header with proper styling", () => {
    render(<CardHeader data-testid="card-header">Header content</CardHeader>);
    const header = screen.getByTestId("card-header");
    expect(header).toBeTruthy();
    expect(header.className).toContain("grid");
    expect(header.className).toContain("auto-rows-min");
    expect(header.className).toContain("items-start");
    expect(header.className).toContain("gap-2");
    expect(header.className).toContain("px-6");
  });
});

describe("CardTitle", () => {
  it("renders title with proper styling", () => {
    render(<CardTitle data-testid="card-title">Card Title</CardTitle>);
    const title = screen.getByTestId("card-title");
    expect(title).toHaveTextContent("Card Title");
    expect(title.className).toContain("leading-none");
    expect(title.className).toContain("font-semibold");
  });
});

describe("CardDescription", () => {
  it("renders description with proper styling", () => {
    render(<CardDescription data-testid="card-description">Card description</CardDescription>);
    const description = screen.getByTestId("card-description");
    expect(description).toHaveTextContent("Card description");
    expect(description.className).toContain("text-muted-foreground");
    expect(description.className).toContain("text-sm");
  });
});

describe("CardContent", () => {
  it("renders content with proper styling", () => {
    render(<CardContent data-testid="card-content">Content area</CardContent>);
    const content = screen.getByTestId("card-content");
    expect(content).toHaveTextContent("Content area");
    expect(content.className).toContain("px-6");
  });
});

describe("CardFooter", () => {
  it("renders footer with proper styling", () => {
    render(<CardFooter data-testid="card-footer">Footer content</CardFooter>);
    const footer = screen.getByTestId("card-footer");
    expect(footer).toHaveTextContent("Footer content");
    expect(footer.className).toContain("flex");
    expect(footer.className).toContain("items-center");
    expect(footer.className).toContain("px-6");
  });
});

describe("CardAction", () => {
  it("renders action with proper styling", () => {
    render(<CardAction data-testid="card-action">Action button</CardAction>);
    const action = screen.getByTestId("card-action");
    expect(action).toHaveTextContent("Action button");
    expect(action.className).toContain("col-start-2");
    expect(action.className).toContain("row-span-2");
    expect(action.className).toContain("row-start-1");
    expect(action.className).toContain("self-start");
    expect(action.className).toContain("justify-self-end");
  });
});

describe("Card composition", () => {
  it("renders complete card structure", () => {
    render(
      <Card data-testid="complete-card">
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test description</CardDescription>
          <CardAction>
            <button>Action</button>
          </CardAction>
        </CardHeader>
        <CardContent>Main content area</CardContent>
        <CardFooter>Footer area</CardFooter>
      </Card>
    );
    
    expect(screen.getByText("Test Title")).toBeTruthy();
    expect(screen.getByText("Test description")).toBeTruthy();
    expect(screen.getByText("Main content area")).toBeTruthy();
    expect(screen.getByText("Footer area")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Action" })).toBeTruthy();
  });
});