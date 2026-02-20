import { NextRequest, NextResponse } from "next/server";
import { 
  getIndustryDefaults, 
  generateSmartSuggestions,
  generateComparativeInsights,
  normalizeIndustry,
  type IndustryDefaults 
} from "@/lib/smart-defaults";

/**
 * GET /api/smart-defaults?industry=restaurant
 * 
 * Returns smart defaults and suggestions for a given industry
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry");
    
    if (!industry) {
      return NextResponse.json(
        { error: "Industry parameter is required" },
        { status: 400 }
      );
    }
    
    // Get defaults for the specified industry
    const defaults = await getIndustryDefaults(industry);
    const suggestions = generateSmartSuggestions(defaults);
    
    // Optionally get comparative insights if requested
    const includeComparisons = searchParams.get("include_comparisons") === "true";
    let comparativeInsights = null;
    
    if (includeComparisons) {
      // This would normally fetch all industries from the database
      // For now, we'll use a simplified version
      const allIndustries: IndustryDefaults[] = [defaults]; // In reality, fetch all
      comparativeInsights = generateComparativeInsights(industry, allIndustries);
    }
    
    const response = {
      industry: normalizeIndustry(industry),
      defaults,
      suggestions,
      comparativeInsights,
      metadata: {
        confidence: defaults.confidenceLevel,
        sampleSize: defaults.sampleSize,
        lastUpdated: defaults.lastUpdated,
        dataSource: defaults.sampleSize > 0 ? "aggregated_data" : "industry_heuristics"
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Smart defaults API error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch smart defaults",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/smart-defaults
 * 
 * Update industry defaults based on completed project data
 * (Called when a project is completed to improve future suggestions)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industry, projectData, token } = body;
    
    if (!industry || !projectData) {
      return NextResponse.json(
        { error: "Industry and projectData are required" },
        { status: 400 }
      );
    }
    
    // Verify this is a legitimate request (you might want to add authentication here)
    if (!token || token !== process.env.SMART_DEFAULTS_UPDATE_TOKEN) {
      return NextResponse.json(
        { error: "Invalid or missing authorization token" },
        { status: 401 }
      );
    }
    
    // Update industry defaults (this would be called after project completion)
    const { updateIndustryDefaults } = await import("@/lib/smart-defaults");
    await updateIndustryDefaults(industry, projectData);
    
    return NextResponse.json({ 
      success: true,
      message: "Industry defaults updated successfully"
    });
    
  } catch (error) {
    console.error("Smart defaults update error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to update smart defaults",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}