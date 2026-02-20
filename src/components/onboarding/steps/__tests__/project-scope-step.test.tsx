import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ProjectScopeStep } from "../project-scope-step";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: `https://storage.test/${path}` } }),
      }),
    },
  }),
}));

const defaultProps = {
  projectId: "test-project-id",
  projectType: "branding" as const,
  data: undefined,
  onSave: vi.fn().mockResolvedValue(undefined),
  onNext: vi.fn(),
  onPrev: vi.fn(),
  isFirst: false,
  isLast: false,
  stepKey: "project_scope" as const,
  designerName: "Test Designer",
  clientName: "Test Client",
};

describe("ProjectScopeStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the project scope step", () => {
    render(<ProjectScopeStep {...defaultProps} />);
    expect(screen.getByTestId("project-scope-step")).toBeTruthy();
    expect(screen.getByTestId("deliverables-grid")).toBeTruthy();
    expect(screen.getByTestId("usage-context-grid")).toBeTruthy();
  });

  it("AC1: shows deliverable cards specific to branding project type", () => {
    render(<ProjectScopeStep {...defaultProps} projectType="branding" />);
    expect(screen.getByTestId("deliverable-logo")).toBeTruthy();
    expect(screen.getByTestId("deliverable-brand_identity")).toBeTruthy();
    expect(screen.getByTestId("deliverable-brand_guidelines")).toBeTruthy();
    expect(screen.queryByTestId("deliverable-landing_page")).toBeNull();
  });

  it("AC1: shows deliverable cards specific to web project type", () => {
    render(<ProjectScopeStep {...defaultProps} projectType="web_design" />);
    expect(screen.getByTestId("deliverable-landing_page")).toBeTruthy();
    expect(screen.getByTestId("deliverable-full_website")).toBeTruthy();
    expect(screen.queryByTestId("deliverable-logo")).toBeNull();
  });

  it("AC1: deliverable cards toggle selection on click", () => {
    render(<ProjectScopeStep {...defaultProps} />);
    const logoCard = screen.getByTestId("deliverable-logo");
    fireEvent.click(logoCard);
    // Should now have selected styling (border-primary class)
    expect(logoCard.className).toContain("border-primary");
    // Click again to deselect
    fireEvent.click(logoCard);
    expect(logoCard.className).not.toContain("bg-primary/5");
  });

  it("AC2: usage context multi-select with all 6 options", () => {
    render(<ProjectScopeStep {...defaultProps} />);
    expect(screen.getByTestId("usage-web")).toBeTruthy();
    expect(screen.getByTestId("usage-print")).toBeTruthy();
    expect(screen.getByTestId("usage-signage")).toBeTruthy();
    expect(screen.getByTestId("usage-merch")).toBeTruthy();
    expect(screen.getByTestId("usage-social")).toBeTruthy();
    expect(screen.getByTestId("usage-packaging")).toBeTruthy();
  });

  it("AC2: usage context toggles on click", () => {
    render(<ProjectScopeStep {...defaultProps} />);
    const webBtn = screen.getByTestId("usage-web");
    fireEvent.click(webBtn);
    expect(webBtn.className).toContain("border-primary");
    fireEvent.click(webBtn);
    expect(webBtn.className).not.toContain("bg-primary/5");
  });

  it("AC3: file upload button exists", () => {
    render(<ProjectScopeStep {...defaultProps} />);
    expect(screen.getByTestId("upload-button")).toBeTruthy();
    expect(screen.getByTestId("file-input")).toBeTruthy();
  });

  it("AC4: uploaded files show preview thumbnails", () => {
    const dataWithAssets = {
      deliverables: ["logo"],
      usageContexts: ["web"],
      hasExistingAssets: true,
      uploadedAssets: [
        { name: "logo.png", url: "https://storage.test/logo.png", type: "image/png", size: 1024 },
        { name: "guide.pdf", url: "https://storage.test/guide.pdf", type: "application/pdf", size: 2048 },
      ],
    };
    render(<ProjectScopeStep {...defaultProps} data={dataWithAssets} />);
    const assetsGrid = screen.getByTestId("uploaded-assets");
    expect(assetsGrid).toBeTruthy();
    // Image preview
    const img = assetsGrid.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("alt")).toBe("logo.png");
    // File names shown
    expect(screen.getByText("logo.png")).toBeTruthy();
    expect(screen.getByText("guide.pdf")).toBeTruthy();
  });

  it("AC4: remove button on uploaded assets", () => {
    const dataWithAssets = {
      deliverables: ["logo"],
      usageContexts: ["web"],
      hasExistingAssets: true,
      uploadedAssets: [
        { name: "logo.png", url: "https://storage.test/logo.png", type: "image/png", size: 1024 },
      ],
    };
    render(<ProjectScopeStep {...defaultProps} data={dataWithAssets} />);
    expect(screen.getByTestId("remove-asset-0")).toBeTruthy();
    fireEvent.click(screen.getByTestId("remove-asset-0"));
    expect(screen.queryByTestId("uploaded-assets")).toBeNull();
  });

  it("AC5: auto-save triggers after selection changes", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<ProjectScopeStep {...defaultProps} onSave={onSave} />);
    fireEvent.click(screen.getByTestId("deliverable-logo"));
    fireEvent.click(screen.getByTestId("usage-web"));
    await new Promise((r) => setTimeout(r, 1200));
    expect(onSave).toHaveBeenCalledWith(
      "project_scope",
      expect.objectContaining({
        deliverables: ["logo"],
        usageContexts: ["web"],
      })
    );
  }, 10000);

  it("validates required fields before proceeding", async () => {
    const onNext = vi.fn();
    render(<ProjectScopeStep {...defaultProps} onNext={onNext} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId("next-button"));
    });
    expect(screen.getByText("Select at least one deliverable")).toBeTruthy();
    expect(screen.getByText("Select at least one usage context")).toBeTruthy();
    expect(onNext).not.toHaveBeenCalled();
  });

  it("calls onNext after valid selection", async () => {
    const onNext = vi.fn();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const data = {
      deliverables: ["logo"],
      usageContexts: ["web"],
      hasExistingAssets: false,
      uploadedAssets: [],
    };
    render(<ProjectScopeStep {...defaultProps} data={data} onNext={onNext} onSave={onSave} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId("next-button"));
    });
    expect(onNext).toHaveBeenCalled();
  });

  it("pre-fills data from props (persistence)", () => {
    const existingData = {
      deliverables: ["logo", "brand_identity"],
      usageContexts: ["web", "print"],
      hasExistingAssets: false,
      uploadedAssets: [],
    };
    render(<ProjectScopeStep {...defaultProps} data={existingData} />);
    expect(screen.getByTestId("deliverable-logo").className).toContain("border-primary");
    expect(screen.getByTestId("deliverable-brand_identity").className).toContain("border-primary");
    expect(screen.getByTestId("usage-web").className).toContain("border-primary");
    expect(screen.getByTestId("usage-print").className).toContain("border-primary");
  });
});
