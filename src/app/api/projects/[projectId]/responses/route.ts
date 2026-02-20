import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

interface ResponseRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * Save/update a questionnaire step response (auto-save)
 */
export async function POST(request: NextRequest, context: ResponseRouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = createAdminClient();
    const body = await request.json();

    const { stepKey, answers } = body;

    if (!stepKey || !answers) {
      return NextResponse.json(
        { error: "stepKey and answers are required" },
        { status: 400 }
      );
    }

    // Validate magic link token for anonymous access
    const magicToken = request.headers.get("x-magic-token");
    if (magicToken) {
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .eq("magic_link_token", magicToken)
        .single();

      if (!project) {
        return NextResponse.json(
          { error: "Invalid magic link token" },
          { status: 403 }
        );
      }
    }
    // TODO: Add authentication check for logged-in users

    // Upsert: insert or update the response for this step
    const { data, error } = await supabase
      .from("responses")
      .upsert(
        {
          project_id: projectId,
          step_key: stepKey,
          answers,
        },
        {
          onConflict: "project_id,step_key",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Save response error:", error);
      return NextResponse.json(
        { error: "Failed to save response" },
        { status: 500 }
      );
    }

    // Update project status to in_progress if it was sent/draft
    await supabase
      .from("projects")
      .update({ status: "in_progress" })
      .eq("id", projectId)
      .in("status", ["draft", "sent"]);

    return NextResponse.json({ response: data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Get all responses for a project
 */
export async function GET(_request: NextRequest, context: ResponseRouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = createAdminClient();

    const { data: responses, error } = await supabase
      .from("responses")
      .select("*")
      .eq("project_id", projectId);

    if (error) {
      console.error("Get responses error:", error);
      return NextResponse.json(
        { error: "Failed to fetch responses" },
        { status: 500 }
      );
    }

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
