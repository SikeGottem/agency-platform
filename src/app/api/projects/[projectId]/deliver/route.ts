import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { sendNotification } from "@/lib/email-notifications";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * POST /api/projects/[projectId]/deliver
 * Mark project as delivered with selected final deliverable IDs and optional notes.
 * Body: { deliverableIds: string[], additionalFiles?: string[], notes?: string }
 */
export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const { projectId } = await ctx.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { deliverableIds, notes } = body;

    if (!deliverableIds || !Array.isArray(deliverableIds) || deliverableIds.length === 0) {
      return NextResponse.json({ error: "At least one deliverable must be selected" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Verify project ownership
    const { data: project } = await admin
      .from("projects")
      .select("*, profiles:designer_id(email, full_name)")
      .eq("id", projectId)
      .eq("designer_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Mark selected deliverables as final
    await admin
      .from("deliverables")
      .update({ status: "final" })
      .eq("project_id", projectId)
      .in("id", deliverableIds);

    // Update project status to delivered
    const now = new Date().toISOString();
    await admin
      .from("projects")
      .update({
        status: "delivered",
        delivery_notes: notes || null,
        delivered_at: now,
      })
      .eq("id", projectId);

    // Send notification email
    if (project.client_email) {
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
        newStatus: "delivered",
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Deliver project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
