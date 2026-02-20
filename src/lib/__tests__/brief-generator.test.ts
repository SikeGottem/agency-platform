import { describe, it, expect } from "vitest";
import { generateStructuredBrief, StructuredBrief } from "../brief-generator";

describe("generateStructuredBrief", () => {
  const baseParams = {
    projectType: "web_design",
    clientName: "Acme Corp",
    clientEmail: "client@acme.com",
    responses: {} as Record<string, unknown>,
  };

  it("returns version 1", () => {
    const brief = generateStructuredBrief(baseParams);
    expect(brief.version).toBe(1);
  });

  it("includes all named sections", () => {
    const brief = generateStructuredBrief(baseParams);
    const sectionKeys = Object.keys(brief.sections);
    expect(sectionKeys).toContain("business");
    expect(sectionKeys).toContain("scope");
    expect(sectionKeys).toContain("style");
    expect(sectionKeys).toContain("colors");
    expect(sectionKeys).toContain("typography");
    expect(sectionKeys).toContain("inspiration");
    expect(sectionKeys).toContain("timeline");
    expect(sectionKeys).toContain("additional");
  });

  it("generates a human-readable summary", () => {
    const brief = generateStructuredBrief(baseParams);
    expect(brief.summary).toBeTruthy();
    expect(brief.summary).toContain("Acme Corp");
    expect(brief.summary).toContain("web design");
  });

  it("populates business section from business_info responses", () => {
    const brief = generateStructuredBrief({
      ...baseParams,
      responses: {
        business_info: {
          company_name: "Acme Corp",
          industry: "Technology",
          target_audience: ["Developers", "Designers"],
        },
      },
    });
    expect(brief.sections.business.title).toBe("Business Context");
    expect(brief.sections.business.summary).toContain("Acme Corp");
    expect(brief.sections.business.summary).toContain("Technology");
    expect(brief.sections.business.data).toHaveProperty("company_name", "Acme Corp");
  });

  it("populates style section from style_direction responses", () => {
    const brief = generateStructuredBrief({
      ...baseParams,
      responses: {
        style_direction: {
          selected_styles: ["Minimalist", "Modern"],
        },
      },
    });
    expect(brief.sections.style.summary).toContain("Minimalist, Modern");
  });

  it("handles missing responses gracefully", () => {
    const brief = generateStructuredBrief({
      ...baseParams,
      responses: {},
    });
    // Should not throw, sections should have defaults
    expect(brief.sections.business.summary).toContain("Not provided");
  });

  it("preserves raw responses", () => {
    const responses = { business_info: { company_name: "Test" } };
    const brief = generateStructuredBrief({ ...baseParams, responses });
    expect(brief.rawResponses).toEqual(responses);
  });

  it("sets generatedAt timestamp", () => {
    const before = new Date().toISOString();
    const brief = generateStructuredBrief(baseParams);
    expect(brief.generatedAt).toBeTruthy();
    expect(brief.generatedAt >= before).toBe(true);
  });

  it("counts inspiration uploads correctly", () => {
    const brief = generateStructuredBrief({
      ...baseParams,
      responses: {
        inspiration_upload: {
          images: ["url1", "url2", "url3"],
        },
      },
    });
    expect(brief.sections.inspiration.summary).toContain("3 inspiration reference(s)");
  });
});
