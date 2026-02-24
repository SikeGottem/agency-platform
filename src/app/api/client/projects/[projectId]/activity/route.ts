import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/client/projects/[projectId]/activity
 * 
 * Builds an activity feed from messages metadata + project events.
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

  // Verify access
  const { data: project } = await supabase
    .from("projects")
    .select("id, client_id, client_email, status, created_at, completed_at")
    .eq("id", projectId)
    .single();

  if (
    !project ||
    (project.client_email !== user.email && project.client_id !== user.id)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events: any[] = [];

  // Project creation
  events.push({
    id: `created-${project.id}`,
    type: "default",
    description: "Project created",
    timestamp: project.created_at,
  });

  // Brief submitted
  if (project.completed_at) {
    events.push({
      id: `submitted-${project.id}`,
      type: "default",
      description: "Brief submitted",
      timestamp: project.completed_at,
    });
  }

  // Fetch messages with metadata (approvals, feedback, revisions)
  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, sender_type, created_at, metadata")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  for (const msg of messages ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (msg as any).metadata as Record<string, unknown> | null;
    if (meta?.type === "approval") {
      events.push({
        id: msg.id,
        type: "approval",
        description:
          meta.action === "approved"
            ? "You approved the project"
            : "You requested changes",
        timestamp: msg.created_at,
      });
    } else if (meta?.categories) {
      events.push({
        id: msg.id,
        type: "feedback",
        description: "You submitted feedback",
        timestamp: msg.created_at,
      });
    } else if (msg.sender_type === "designer") {
      // Skip regular designer messages from activity (they're in the thread)
    }
  }

  // Fetch revision requests
  const { data: revisions } = await supabase
    .from("revision_requests")
    .select("id, status, created_at, responded_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  for (const rev of revisions ?? []) {
    events.push({
      id: `rev-${rev.id}`,
      type: "revision",
      description: "Designer requested revisions to your brief",
      timestamp: rev.created_at,
    });
    if (rev.responded_at) {
      events.push({
        id: `rev-resp-${rev.id}`,
        type: "default",
        description: "You responded to revision request",
        timestamp: rev.responded_at,
      });
    }
  }

  // Project approved
  if (project.status === "reviewed") {
    events.push({
      id: `reviewed-${project.id}`,
      type: "approval",
      description: "Project marked as complete",
      timestamp: project.completed_at || project.created_at,
    });
  }

  // Sort by timestamp desc
  events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return NextResponse.json({ events });
}
