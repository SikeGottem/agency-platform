import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { duplicateTemplate } from "@/lib/templates/builder";
import type { TemplateStep } from "@/lib/templates/defaults";
import type { Json } from "@/types/supabase";

// POST /api/templates/[id]/duplicate - Duplicate a template
export async function POST(
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
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Template name is required" },
        { status: 400 }
      );
    }

    // Get the original template
    let query = supabase
      .from("templates")
      .select("*")
      .eq("id", id);

    // Designer can duplicate their own templates or public templates
    // No restriction on accessing the template for duplication if it's public
    query = query.or(`designer_id.eq.${user.id},is_public.eq.true`);

    const { data: originalTemplate, error: fetchError } = await query.single();

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

    // Check if user already has a template with this name
    const { data: existingTemplate } = await supabase
      .from("templates")
      .select("id")
      .eq("designer_id", user.id)
      .eq("name", name.trim())
      .single();

    if (existingTemplate) {
      return NextResponse.json(
        { error: "You already have a template with this name" },
        { status: 400 }
      );
    }

    // Prepare the template data for duplication
    const templateData = {
      name: originalTemplate.name,
      projectType: originalTemplate.project_type,
      steps: originalTemplate.questions as unknown as TemplateStep[],
    };

    // Create the duplicated template with new name
    const duplicatedTemplate = duplicateTemplate(templateData, name.trim());

    // Insert the new template
    const { data: newTemplate, error: insertError } = await supabase
      .from("templates")
      .insert({
        designer_id: user.id,
        name: duplicatedTemplate.name,
        project_type: duplicatedTemplate.projectType,
        questions: duplicatedTemplate.steps as unknown as Json,
        is_default: false, // Duplicated templates are never default
        is_public: false, // Duplicated templates start as private
        share_description: null,
        share_category: null,
        share_tags: null,
        shared_at: null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating duplicated template:", insertError);
      return NextResponse.json(
        { error: "Failed to create duplicated template" },
        { status: 500 }
      );
    }

    // Format response data
    const responseData = {
      id: newTemplate.id,
      name: newTemplate.name,
      projectType: newTemplate.project_type,
      steps: newTemplate.questions as unknown as TemplateStep[],
      isDefault: false,
      isPublic: false,
      createdAt: newTemplate.created_at,
      updatedAt: newTemplate.updated_at,
      designerId: newTemplate.designer_id,
      originalTemplateId: id,
      originalTemplateName: originalTemplate.name,
    };

    return NextResponse.json({ 
      message: "Template duplicated successfully",
      template: responseData 
    }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/templates/[id]/duplicate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}