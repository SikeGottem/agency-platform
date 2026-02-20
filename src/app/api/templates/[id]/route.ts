import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateTemplate } from "@/lib/templates/builder";
import type { TemplateStep } from "@/lib/templates/defaults";
import type { Json } from "@/types/supabase";

// GET /api/templates/[id] - Get a specific template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the template
    let query = supabase
      .from("templates")
      .select("*")
      .eq("id", id);

    // If user is a designer, they can access their own templates or public templates
    // If user is a client, they can only access public templates
    if (user.user_metadata?.role === "client") {
      query = query.eq("is_public", true);
    } else {
      // Designer can access their own templates or public templates
      query = query.or(`designer_id.eq.${user.id},is_public.eq.true`);
    }

    const { data: template, error } = await query.single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }
      console.error("Error fetching template:", error);
      return NextResponse.json(
        { error: "Failed to fetch template" },
        { status: 500 }
      );
    }

    // Count projects using this template
    const { data: projectsData } = await supabase
      .from("projects")
      .select("id")
      .eq("template_id", id);

    const projectsUsingCount = projectsData?.length || 0;

    // Get designer info for public templates
    let designerInfo = null;
    if (template.is_public && template.designer_id !== user.id) {
      const { data: designer } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", template.designer_id)
        .single();
      
      if (designer) {
        designerInfo = {
          id: designer.id,
          name: designer.full_name,
          avatar: designer.avatar_url,
        };
      }
    }

    const responseData = {
      id: template.id,
      name: template.name,
      projectType: template.project_type,
      steps: template.questions as unknown as TemplateStep[],
      isDefault: template.is_default || false,
      isPublic: template.is_public || false,
      projectsUsing: projectsUsingCount,
      createdAt: template.created_at,
      updatedAt: template.updated_at,
      designerId: template.designer_id,
      isOwner: template.designer_id === user.id,
      shareDescription: template.share_description,
      shareCategory: template.share_category,
      shareTags: template.share_tags,
      sharedAt: template.shared_at,
      designer: designerInfo,
    };

    return NextResponse.json({ template: responseData });
  } catch (error) {
    console.error("Error in GET /api/templates/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/templates/[id] - Update a template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { name, steps, isPublic, shareDescription, shareCategory, shareTags } = body;

    // Validate the template if name and steps are provided
    if (name && steps) {
      const { data: existingTemplate } = await supabase
        .from("templates")
        .select("project_type")
        .eq("id", id)
        .eq("designer_id", user.id)
        .single();

      if (!existingTemplate) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }

      const validationErrors = validateTemplate(name, existingTemplate.project_type, steps);
      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: "Validation failed", details: validationErrors },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (steps !== undefined) updateData.questions = steps as unknown as Json;
    if (isPublic !== undefined) {
      updateData.is_public = isPublic;
      updateData.shared_at = isPublic ? new Date().toISOString() : null;
    }
    if (shareDescription !== undefined) updateData.share_description = shareDescription || null;
    if (shareCategory !== undefined) updateData.share_category = shareCategory || null;
    if (shareTags !== undefined) {
      updateData.share_tags = shareTags && shareTags.length > 0 ? shareTags : null;
    }

    // Update the template
    const { data: template, error } = await supabase
      .from("templates")
      .update(updateData)
      .eq("id", id)
      .eq("designer_id", user.id) // Ensure user owns the template
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }
      console.error("Error updating template:", error);
      return NextResponse.json(
        { error: "Failed to update template" },
        { status: 500 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error in PUT /api/templates/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id] - Delete a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if template exists and user owns it
    const { data: template, error: fetchError } = await supabase
      .from("templates")
      .select("id, name, is_default")
      .eq("id", id)
      .eq("designer_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }
      console.error("Error fetching template:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch template" },
        { status: 500 }
      );
    }

    // Prevent deletion of default templates
    if (template.is_default) {
      return NextResponse.json(
        { error: "Cannot delete default templates" },
        { status: 400 }
      );
    }

    // Check if template is being used by any projects
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id")
      .eq("template_id", id);

    if (projectsError) {
      console.error("Error checking template usage:", projectsError);
      return NextResponse.json(
        { error: "Failed to check template usage" },
        { status: 500 }
      );
    }

    if (projects && projects.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete template that is being used by projects",
          details: { projectsUsingCount: projects.length }
        },
        { status: 400 }
      );
    }

    // Delete the template
    const { error: deleteError } = await supabase
      .from("templates")
      .delete()
      .eq("id", id)
      .eq("designer_id", user.id);

    if (deleteError) {
      console.error("Error deleting template:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete template" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: "Template deleted successfully",
      templateId: id 
    });
  } catch (error) {
    console.error("Error in DELETE /api/templates/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}