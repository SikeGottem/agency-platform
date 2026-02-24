import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project_id, step_key, started_at, completed_at, duration_seconds, skipped } = body;

    if (!project_id || !step_key) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("questionnaire_analytics").insert({
      project_id,
      step_key,
      started_at: started_at || new Date().toISOString(),
      completed_at: completed_at || null,
      duration_seconds: duration_seconds || null,
      skipped: skipped || false,
    });

    if (error) {
      console.error("Analytics insert error:", error);
      return NextResponse.json({ error: "Failed to record analytics" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Analytics route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get analytics for all projects owned by this designer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("questionnaire_analytics")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }

  return NextResponse.json({ data });
}
