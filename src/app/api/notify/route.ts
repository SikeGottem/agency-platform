import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { getBriefNotificationEmail } from "@/emails/brief-notification";

/**
 * POST /api/notify
 * Send email notification to designer when a brief is submitted.
 * Called internally or via webhook. Requires service-level auth.
 */
export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch project with designer info
    const { data: project, error } = await supabase
      .from("projects")
      .select(`
        *,
        profiles:designer_id (email, full_name)
      `)
      .eq("id", projectId)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const designer = project.profiles as unknown as {
      email: string;
      full_name: string | null;
    } | null;

    if (!designer?.email) {
      return NextResponse.json({ error: "Designer email not found" }, { status: 404 });
    }

    // Fetch responses for brief summary
    const { data: responses } = await supabase
      .from("responses")
      .select("step_key, answers")
      .eq("project_id", projectId);

    const responseMap: Record<string, unknown> = {};
    if (responses) {
      for (const r of responses) {
        responseMap[r.step_key] = r.answers;
      }
    }

    // Build brief summary
    const businessInfo = responseMap.business_info as Record<string, string> | undefined;
    const scope = responseMap.project_scope as Record<string, unknown> | undefined;
    const timeline = responseMap.timeline_budget as Record<string, string> | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proj = project as any;
    const summary = {
      clientName: proj.client_name ?? proj.client_email,
      projectType: proj.project_type?.replace(/_/g, " ") ?? "",
      businessName: businessInfo?.company_name ?? "",
      industry: businessInfo?.industry ?? "",
      timeline: timeline?.timeline ?? "",
      budget: timeline?.budget ?? "",
    };

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${projectId}`;

    const { subject, html, text } = getBriefNotificationEmail({
      designerName: designer.full_name ?? "Designer",
      summary,
      dashboardUrl,
    });

    await sendEmail({
      to: designer.email,
      subject,
      html,
      text,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[notify] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
