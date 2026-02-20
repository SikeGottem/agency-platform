// Supabase Edge Function to send resume reminders for abandoned projects
// Run this daily via Supabase cron: https://supabase.com/docs/guides/functions/schedule-functions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@3.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
const appUrl = Deno.env.get("APP_URL") || "http://localhost:3000";
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@briefed.co";

interface Project {
  id: string;
  magic_link_token: string;
  client_email: string;
  client_name: string | null;
  project_type: string;
  updated_at: string;
  profiles: {
    full_name: string | null;
    business_name: string | null;
  } | null;
}

interface Response {
  step_key: string;
}

Deno.serve(async (req) => {
  try {
    // Initialize clients
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Find projects that are in_progress and haven't been updated in 3+ days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: staleProjects, error: projectsError } = await supabase
      .from("projects")
      .select(`
        id,
        magic_link_token,
        client_email,
        client_name,
        project_type,
        updated_at,
        profiles:designer_id (full_name, business_name)
      `)
      .eq("status", "in_progress")
      .lt("updated_at", threeDaysAgo.toISOString())
      .returns<Project[]>();

    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
      return new Response(JSON.stringify({ error: projectsError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!staleProjects || staleProjects.length === 0) {
      console.log("No stale projects found");
      return new Response(
        JSON.stringify({ message: "No stale projects found", count: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${staleProjects.length} stale projects`);

    // For each stale project, calculate progress and send reminder
    const results = await Promise.allSettled(
      staleProjects.map(async (project) => {
        // Get responses to calculate progress
        const { data: responses } = await supabase
          .from("responses")
          .select("step_key")
          .eq("project_id", project.id)
          .returns<Response[]>();

        // Estimate total steps (9-10 depending on project type)
        const totalSteps = project.project_type === "branding" ? 10 : 10;
        const completedSteps = responses?.length || 0;
        const progressPercentage = Math.round(
          (completedSteps / totalSteps) * 100
        );

        // Don't send if they haven't started (0%) or are almost done (>80%)
        if (progressPercentage === 0 || progressPercentage > 80) {
          console.log(
            `Skipping project ${project.id}: progress ${progressPercentage}%`
          );
          return { skipped: true, projectId: project.id, progressPercentage };
        }

        const resumeUrl = `${appUrl}/brief/t/${project.magic_link_token}`;
        const designerName =
          project.profiles?.full_name ||
          project.profiles?.business_name ||
          "Your Designer";
        const clientName = project.client_name || project.client_email;

        // Format last updated date
        const lastUpdated = new Date(project.updated_at).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }
        );

        // Send reminder email
        const { error: emailError } = await resend.emails.send({
          from: `Briefed <${fromEmail}>`,
          to: project.client_email,
          subject: `👋 Your ${project.project_type.replace("_", " ")} brief is ${progressPercentage}% complete`,
          html: generateReminderEmail({
            clientName,
            designerName,
            projectType: project.project_type,
            resumeUrl,
            progressPercentage,
            lastUpdated,
          }),
        });

        if (emailError) {
          console.error(
            `Email error for project ${project.id}:`,
            emailError
          );
          throw emailError;
        }

        console.log(`Sent reminder to ${project.client_email}`);
        return { sent: true, projectId: project.id, progressPercentage };
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return new Response(
      JSON.stringify({
        message: `Processed ${staleProjects.length} projects`,
        successful,
        failed,
        results: results.map((r, i) => ({
          projectId: staleProjects[i].id,
          status: r.status,
          ...("value" in r ? r.value : { error: r.reason?.message }),
        })),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

function generateReminderEmail({
  clientName,
  designerName,
  projectType,
  resumeUrl,
  progressPercentage,
  lastUpdated,
}: {
  clientName: string;
  designerName: string;
  projectType: string;
  resumeUrl: string;
  progressPercentage: number;
  lastUpdated: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Almost There! 🎯</h1>
  </div>

  <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${clientName}! 👋</p>

    <p style="font-size: 16px; line-height: 1.8;">
      You're <strong>${progressPercentage}% done</strong> with your ${projectType.replace("_", " ")} brief for ${designerName}!
    </p>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <div style="background: #e5e7eb; height: 8px; border-radius: 999px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; width: ${progressPercentage}%;"></div>
      </div>
      <p style="text-align: center; margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
        ${progressPercentage}% Complete
      </p>
    </div>

    <p style="font-size: 16px;">
      It only takes <strong>~10 more minutes</strong> to finish. Your responses will help ${designerName} create exactly what you're envisioning!
    </p>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${resumeUrl}" style="display: inline-block; background: #667eea; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
        Continue Where You Left Off →
      </a>
    </div>

    <p style="margin-top: 30px; font-size: 14px; color: #9ca3af; text-align: center;">
      Last updated: ${lastUpdated}
    </p>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-top: 30px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>💡 Pro tip:</strong> All your answers are auto-saved, so you can pick up right where you left off!
      </p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>Powered by <strong>Briefed</strong> — Better creative briefs in minutes</p>
    <p style="margin-top: 5px;">Not interested? You can ignore this email.</p>
  </div>
</body>
</html>
  `;
}
