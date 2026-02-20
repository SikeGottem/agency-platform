import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

interface ShareRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * POST — Enable sharing for a project (generates share_token if not set)
 * DELETE — Disable sharing (removes share_token)
 */
export async function POST(_request: NextRequest, context: ShareRouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check project ownership
    const { data: project } = await supabase
      .from("projects")
      .select("id, share_token, designer_id")
      .eq("id", projectId)
      .eq("designer_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // If already has share_token, return existing URL
    if (project.share_token) {
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${projectId}`;
      return NextResponse.json({ shareUrl, shareToken: project.share_token });
    }

    // Generate a new share token
    const shareToken = randomUUID();
    const { error } = await supabase
      .from("projects")
      .update({ share_token: shareToken })
      .eq("id", projectId);

    if (error) {
      console.error("Enable sharing error:", error);
      return NextResponse.json({ error: "Failed to enable sharing" }, { status: 500 });
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${projectId}`;
    return NextResponse.json({ shareUrl, shareToken });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: ShareRouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("projects")
      .update({ share_token: null })
      .eq("id", projectId)
      .eq("designer_id", user.id);

    if (error) {
      return NextResponse.json({ error: "Failed to disable sharing" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
