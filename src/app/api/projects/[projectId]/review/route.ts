import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * POST /api/projects/[projectId]/review
 * Client submits a star rating + optional comment.
 * Body: { rating: number (1-5), comment?: string, clientId?: string }
 */
export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const { projectId } = await ctx.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { rating, comment, clientId } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Verify project exists and is delivered
    const { data: project } = await admin
      .from("projects")
      .select("id, status")
      .eq("id", projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.status !== "delivered" && project.status !== "completed") {
      return NextResponse.json({ error: "Project must be delivered before reviewing" }, { status: 400 });
    }

    // Use authenticated user or provided clientId (for magic link clients)
    const reviewerId = user?.id || clientId;
    if (!reviewerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Upsert review (one per project)
    const { data, error } = await admin
      .from("project_reviews")
      .upsert(
        {
          project_id: projectId,
          client_id: reviewerId,
          rating,
          comment: comment || null,
        },
        { onConflict: "project_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Review insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mark project as completed after review
    await admin
      .from("projects")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", projectId);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/projects/[projectId]/review
 * Fetch the review for a project.
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { projectId } = await ctx.params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("project_reviews")
    .select("*")
    .eq("project_id", projectId)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || null);
}
