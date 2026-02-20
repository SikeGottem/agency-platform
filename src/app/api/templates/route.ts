import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateTemplate } from "@/lib/templates/builder";
import type { ProjectType } from "@/types";
import type { TemplateStep } from "@/lib/templates/defaults";
import type { Json } from "@/types/supabase";

// GET /api/templates - List templates for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.user_metadata?.role === "client") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectType = searchParams.get("project_type");
    const isPublic = searchParams.get("public");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (isPublic === "true") {
      // Get public templates from all users
      query = query.eq("is_public", true);
    } else {
      // Get user's own templates
      query = query.eq("designer_id", user.id);
    }

    if (projectType) {
      query = query.eq("project_type", projectType);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error("Error fetching templates:", error);
      return NextResponse.json(
        { error: "Failed to fetch templates" },
        { status: 500 }
      );
    }

    // Count projects using each template
    const templateIds = templates?.map(t => t.id) || [];
    let projectCounts: Record<string, number> = {};

    if (templateIds.length > 0) {
      const { data: projectsData } = await supabase
        .from("projects")
        .select("template_id")
        .in("template_id", templateIds)
        .not("template_id", "is", null);

      projectCounts = {};
      for (const project of projectsData || []) {
        if (project.template_id) {
          projectCounts[project.template_id] = (projectCounts[project.template_id] || 0) + 1;
        }
      }
    }

    const templatesWithStats = (templates || []).map(template => ({
      id: template.id,
      name: template.name,
      projectType: template.project_type,
      isDefault: template.is_default || false,
      isPublic: template.is_public || false,
      stepsCount: Array.isArray(template.questions)
        ? (template.questions as unknown[]).length
        : 0,
      projectsUsing: projectCounts[template.id] || 0,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
      designerId: template.designer_id,
      shareDescription: template.share_description,
      shareCategory: template.share_category,
      shareTags: template.share_tags,
      sharedAt: template.shared_at,
    }));

    return NextResponse.json({ templates: templatesWithStats });
  } catch (error) {
    console.error("Error in GET /api/templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.user_metadata?.role === "client") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, projectType, steps } = body;

    // Validate the template
    const validationErrors = validateTemplate(name, projectType, steps);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }

    // Create the template
    const { data: template, error } = await supabase
      .from("templates")
      .insert({
        designer_id: user.id,
        name: name.trim(),
        project_type: projectType,
        questions: steps as unknown as Json,
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating template:", error);
      return NextResponse.json(
        { error: "Failed to create template" },
        { status: 500 }
      );
    }

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/templates - Bulk update templates (for reordering, etc.)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.user_metadata?.role === "client") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Updates must be an array" },
        { status: 400 }
      );
    }

    // Process each update
    const results = [];
    for (const update of updates) {
      const { id, ...changes } = update;
      
      if (!id) {
        results.push({ id: null, error: "Template ID is required" });
        continue;
      }

      const { data, error } = await supabase
        .from("templates")
        .update(changes)
        .eq("id", id)
        .eq("designer_id", user.id) // Ensure user owns the template
        .select()
        .single();

      if (error) {
        results.push({ id, error: error.message });
      } else {
        results.push({ id, data });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error in PUT /api/templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}