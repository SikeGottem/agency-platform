import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/client/projects/[projectId]/deliverables
 * 
 * Returns deliverables that the designer has marked as "shared" (visible to client).
 * Uses the assets table with metadata.shared_with_client = true.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the user has access to this project
  const { data: project } = await supabase
    .from("projects")
    .select("id, client_id, client_email")
    .eq("id", projectId)
    .single();

  if (
    !project ||
    (project.client_email !== user.email && project.client_id !== user.id)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch assets marked as shared with client
  // The assets table stores file uploads; we filter by metadata
  const { data: assets, error } = await supabase
    .from("assets")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  // Filter to only shared deliverables (designer must explicitly share)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sharedAssets = (assets ?? []).filter((a: any) => {
    const meta = typeof a.metadata === "object" ? a.metadata : {};
    return meta?.shared_with_client === true;
  });

  const deliverables = sharedAssets.map((a: Record<string, unknown>) => ({
    id: a.id,
    title: (a as { metadata?: { title?: string } }).metadata?.title || a.file_name || "Untitled",
    description: (a as { metadata?: { description?: string } }).metadata?.description || null,
    file_url: a.file_url || a.url || "",
    file_type: a.content_type || a.mime_type || "application/octet-stream",
    version: (a as { metadata?: { version?: number } }).metadata?.version || 1,
    round: (a as { metadata?: { round?: number } }).metadata?.round || 1,
    created_at: a.created_at,
  }));

  return NextResponse.json({ deliverables });
}
