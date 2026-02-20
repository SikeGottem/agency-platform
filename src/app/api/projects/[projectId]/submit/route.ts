import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { sendClientReceipt } from "@/lib/email";
import { sendEmail } from "@/lib/email";
import { getBriefNotificationEmail } from "@/emails/brief-notification";
import { timingSafeTokenCompare } from "@/lib/utils";
import { generateStructuredBrief } from "@/lib/brief-generator";
import type { Database } from "@/types/supabase";
import type { Json } from "@/types/supabase";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectWithDesigner = ProjectRow & {
  profiles: { email: string; full_name: string | null } | null;
};

interface SubmitRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * Submit the completed questionnaire and generate a brief.
 * Uses admin client to bypass RLS since clients may not have accounts.
 * Access is validated via magic_link_token.
 */
export async function POST(request: NextRequest, context: SubmitRouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = createAdminClient();

    // Validate access via token (header preferred, fallback to query param)
    const token =
      request.headers.get("x-magic-token") ??
      new URL(request.url).searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Access token required" },
        { status: 401 }
      );
    }

    // Fetch the project and verify token
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select(`
        *,
        profiles:designer_id (email, full_name)
      `)
      .eq("id", projectId)
      .returns<ProjectWithDesigner[]>()
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (!project.magic_link_token || !timingSafeTokenCompare(project.magic_link_token, token)) {
      return NextResponse.json(
        { error: "Invalid access token" },
        { status: 403 }
      );
    }

    // Prevent double submission
    if (project.status === "completed" || project.status === "reviewed") {
      return NextResponse.json(
        { error: "This brief has already been submitted" },
        { status: 409 }
      );
    }

    // Fetch all responses
    const { data: responses } = await supabase
      .from("responses")
      .select("step_key, answers")
      .eq("project_id", projectId);

    // Build structured brief content from responses
    const responseMap = responses?.reduce<Record<string, unknown>>(
      (acc, r) => ({ ...acc, [r.step_key]: r.answers }),
      {}
    ) ?? {};

    const structuredBrief = generateStructuredBrief({
      projectType: project.project_type,
      clientName: project.client_name ?? project.client_email,
      clientEmail: project.client_email,
      responses: responseMap,
    });

    // Create the brief with structured content
    const { error: briefError } = await supabase.from("briefs").insert({
      project_id: projectId,
      content: structuredBrief as unknown as Json,
      version: structuredBrief.version,
    });

    if (briefError) {
      console.error("Create brief error:", briefError);
      return NextResponse.json(
        { error: "Failed to generate brief" },
        { status: 500 }
      );
    }

    // Update project status
    await supabase
      .from("projects")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    // Send email notification to designer
    const designerProfile = project.profiles as unknown as {
      email: string;
      full_name: string | null;
    } | null;

    if (designerProfile?.email) {
      try {
        // Build brief summary from responses
        const businessInfo = responseMap.business_info as Record<string, string> | undefined;
        const timeline = responseMap.timeline_budget as Record<string, string> | undefined;

        const { subject, html, text } = getBriefNotificationEmail({
          designerName: designerProfile.full_name ?? "Designer",
          summary: {
            clientName: project.client_name ?? project.client_email,
            projectType: project.project_type.replace(/_/g, " "),
            businessName: businessInfo?.company_name ?? "",
            industry: businessInfo?.industry ?? "",
            timeline: timeline?.timeline ?? "",
            budget: timeline?.budget ?? "",
          },
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${projectId}`,
        });

        await sendEmail({
          to: designerProfile.email,
          subject,
          html,
          text,
        });
      } catch (emailError) {
        // Don't fail the submission if email fails
        console.error("Email notification failed:", emailError);
      }
    }

    // Create in-app notification for the designer
    try {
      await supabase
        .from("notifications")
        .insert({
          user_id: project.designer_id,
          type: "brief_submitted",
          title: "Brief submitted",
          message: `${project.client_name ?? project.client_email} completed their ${project.project_type.replace("_", " ")} questionnaire.`,
          project_id: projectId,
        });
    } catch (notifError) {
      console.error("[submit] In-app notification failed:", notifError);
    }

    // Send receipt confirmation to client
    try {
      await sendClientReceipt({
        clientEmail: project.client_email,
        clientName: project.client_name ?? project.client_email,
        designerName: designerProfile?.full_name ?? "Your Designer",
        projectType: project.project_type,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/brief/${project.id}?token=${token}`,
      });
    } catch (emailError) {
      // Don't fail the submission if email fails
      console.error("Client receipt email failed:", emailError);
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
