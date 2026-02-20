import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { timingSafeTokenCompare } from "@/lib/utils";

// GET: Fetch revision requests for a project
// Designers: authenticated via session
// Clients: validated via ?token= query param
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (token) {
    // Client access via token
    const supabase = createAdminClient();
    const { data: project } = await supabase
      .from("projects")
      .select("magic_link_token")
      .eq("id", projectId)
      .single();

    if (!project || !project.magic_link_token || !timingSafeTokenCompare(project.magic_link_token, token)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const { data: revisions } = await supabase
      .from("revision_requests")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    return NextResponse.json({ revisions: revisions ?? [] });
  }

  // Designer access via session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: revisions } = await supabase
    .from("revision_requests")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ revisions: revisions ?? [] });
}

// POST: Designer creates a new revision request
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { stepKey, fieldKey, message } = body;

  if (!stepKey || !message) {
    return NextResponse.json(
      { error: "stepKey and message are required" },
      { status: 400 }
    );
  }

  const { data: revision, error } = await supabase
    .from("revision_requests")
    .insert({
      project_id: projectId,
      designer_id: user.id,
      step_key: stepKey,
      field_key: fieldKey ?? null,
      message,
    })
    .select()
    .single();

  if (error) {
    console.error("Revision request error:", error);
    return NextResponse.json(
      { error: "Failed to create revision request" },
      { status: 500 }
    );
  }

  return NextResponse.json({ revision });
}

// PATCH: Client responds to a revision request
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Validate token
  const { data: project } = await supabase
    .from("projects")
    .select("magic_link_token, designer_id")
    .eq("id", projectId)
    .single();

  if (!project || !project.magic_link_token || !timingSafeTokenCompare(project.magic_link_token, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const body = await request.json();
  const { revisionId, response } = body;

  if (!revisionId || typeof revisionId !== "string" || !/^[0-9a-f-]{36}$/i.test(revisionId)) {
    return NextResponse.json(
      { error: "Invalid revisionId" },
      { status: 400 }
    );
  }

  if (!response || typeof response !== "string" || response.length > 5000) {
    return NextResponse.json(
      { error: "Invalid response (max 5000 characters)" },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from("revision_requests")
    .update({
      response,
      status: "responded",
      responded_at: new Date().toISOString(),
    })
    .eq("id", revisionId)
    .eq("project_id", projectId);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update revision" },
      { status: 500 }
    );
  }

  // Create notification for the designer
  await supabase
    .from("notifications")
    .insert({
      user_id: project.designer_id,
      type: "revision_response",
      title: "Revision response received",
      message: `Your client responded to a clarification request.`,
      project_id: projectId,
    });

  return NextResponse.json({ success: true });
}
