import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

interface ProjectRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * DELETE /api/projects/[projectId]
 * Delete a project and cascade delete responses, assets, and briefs.
 */
export async function DELETE(_request: NextRequest, context: ProjectRouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: project } = await supabase
      .from("projects")
      .select("id, designer_id")
      .eq("id", projectId)
      .eq("designer_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const admin = createAdminClient();

    // Delete assets from storage first
    const { data: assets } = await admin
      .from("assets")
      .select("storage_path")
      .eq("project_id", projectId);

    if (assets && assets.length > 0) {
      const paths = assets.map((a) => a.storage_path);
      await admin.storage.from("project-assets").remove(paths);
    }

    // Cascade delete in order: notifications, briefs, assets, responses, then project
    await admin.from("notifications").delete().eq("project_id", projectId);
    await admin.from("briefs").delete().eq("project_id", projectId);
    await admin.from("assets").delete().eq("project_id", projectId);
    await admin.from("responses").delete().eq("project_id", projectId);
    
    const { error } = await admin.from("projects").delete().eq("id", projectId);

    if (error) {
      console.error("Delete project error:", error);
      return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
