import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

// GET — list deliverables for a project
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { projectId } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("deliverables")
    .select("*")
    .eq("project_id", projectId)
    .order("round_number", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — create a new deliverable
export async function POST(req: NextRequest, ctx: RouteContext) {
  const { projectId } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, file_url, file_type, version, round_number } = body;

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("deliverables")
    .insert({
      project_id: projectId,
      designer_id: user.id,
      title,
      description: description || null,
      file_url: file_url || null,
      file_type: file_type || null,
      version: version || 1,
      round_number: round_number || 1,
      status: "draft",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH — update a deliverable (status, title, description, etc.)
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { projectId } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "Deliverable id is required" }, { status: 400 });

  // If sharing, set shared_at
  if (updates.status === "shared" && !updates.shared_at) {
    updates.shared_at = new Date().toISOString();
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("deliverables")
    .update(updates)
    .eq("id", id)
    .eq("project_id", projectId)
    .eq("designer_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — remove a deliverable
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { projectId } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Deliverable id is required" }, { status: 400 });

  const { error } = await supabase
    .from("deliverables")
    .delete()
    .eq("id", id)
    .eq("project_id", projectId)
    .eq("designer_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
