import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Link a project to a newly created client account
 * Called after signup to associate anonymous projects with the client's account
 */
export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch the project to verify it matches the user's email
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("client_email, client_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Verify the project's email matches the user's email
    if (project.client_email !== user.email) {
      return NextResponse.json(
        { error: "Email mismatch - project email does not match your account" },
        { status: 403 }
      );
    }

    // Check if project is already linked to another account
    if (project.client_id && project.client_id !== user.id) {
      return NextResponse.json(
        { error: "Project is already linked to another account" },
        { status: 409 }
      );
    }

    // Link the project to the user's account
    const { error: updateError } = await supabase
      .from("projects")
      .update({ client_id: user.id })
      .eq("id", projectId);

    if (updateError) {
      console.error("Error linking project:", updateError);
      return NextResponse.json(
        { error: "Failed to link project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
