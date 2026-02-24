import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
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
    .select("id, project_id, status")
    .eq("id", deliverableId)
    .eq("project_id", projectId)
    .single();

  if (delError || !deliverable) {
    return NextResponse.json({ error: "Deliverable not found" }, { status: 404 });
  }

  const body = await request.json();
  const { overall_rating, category_ratings, comments } = body;

  if (!overall_rating || !["approve", "changes", "neutral"].includes(overall_rating)) {
    return NextResponse.json({ error: "Invalid overall_rating" }, { status: 400 });
  }

  // Insert feedback
  const { data: feedback, error: fbError } = await supabase
    .from("deliverable_feedback")
    .insert({
      deliverable_id: deliverableId,
      client_id: user.id,
      overall_rating,
      category_ratings: category_ratings || {},
      comments: comments || null,
    })
    .select()
    .single();

  if (fbError) {
    return NextResponse.json({ error: fbError.message }, { status: 500 });
  }

  // Update deliverable status
  const newStatus = overall_rating === "approve" ? "approved" : "feedback_given";
  await supabase
    .from("deliverables")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", deliverableId);

  return NextResponse.json({ feedback }, { status: 201 });
}
