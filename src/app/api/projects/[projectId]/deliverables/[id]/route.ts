import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; id: string }> }
) {
  const { projectId, id: deliverableId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify deliverable belongs to project
  const { data: deliverable, error: delError } = await supabase
    .from("deliverables")
    .select("id, project_id, designer_id")
    .eq("id", deliverableId)
    .eq("project_id", projectId)
    .single();

  if (delError || !deliverable) {
    return NextResponse.json({ error: "Deliverable not found" }, { status: 404 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  // Status update
  if (body.status) {
    const validStatuses = ["awaiting_feedback", "feedback_given", "changes_addressed", "approved"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = body.status;
  }

  // Feedback addressed toggle (designer only)
  if (body.feedback_id && typeof body.addressed === "boolean") {
    if (deliverable.designer_id !== user.id) {
      return NextResponse.json({ error: "Only the designer can mark feedback as addressed" }, { status: 403 });
    }

    const { error: fbError } = await supabase
      .from("deliverable_feedback")
      .update({ addressed: body.addressed })
      .eq("id", body.feedback_id)
      .eq("deliverable_id", deliverableId);

    if (fbError) {
      return NextResponse.json({ error: fbError.message }, { status: 500 });
    }
  }

  // Update deliverable
  const { data: updated, error: updateError } = await supabase
    .from("deliverables")
    .update(updates)
    .eq("id", deliverableId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ deliverable: updated });
}
