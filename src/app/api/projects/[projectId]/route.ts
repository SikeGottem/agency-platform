import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { sendNotification } from "@/lib/email-notifications";

interface ProjectRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * PATCH /api/projects/[projectId]
 * Update project fields (e.g. status). Sends email notification on status change.
 */
export async function PATCH(request: NextRequest, context: ProjectRouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // Fetch project with designer profile
    const admin = createAdminClient();
    const { data: project } = await admin
      .from("projects")
      .select("*, profiles:designer_id(email, full_name)")
      .eq("id", projectId)
      .eq("designer_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const oldStatus = project.status;

    // Update project
    const updateData: Record<string, unknown> = { status };
    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await admin
      .from("projects")
      .update(updateData)
      .eq("id", projectId);

    if (error) {
      return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }

    // Send email notification if status actually changed
    if (status !== oldStatus && project.client_email) {
      const designerProfile = project.profiles as unknown as {
        email: string;
        full_name: string | null;
      } | null;

      sendNotification({
        type: "project_status_change",
        projectId,
        projectType: project.project_type,
        clientName: project.client_name ?? project.client_email,
        clientEmail: project.client_email,
        designerName: designerProfile?.full_name ?? "Your Designer",
        designerEmail: designerProfile?.email ?? "",
        magicLinkToken: project.magic_link_token ?? undefined,
        newStatus: status,
      }).catch(() => {}); // fire-and-forget
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
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
