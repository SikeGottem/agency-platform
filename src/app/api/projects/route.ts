import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createProjectSchema } from "@/lib/validations";
import { sendOnboardingLink } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    const magicLinkToken = crypto.randomBytes(32).toString("hex");

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        designer_id: user.id,
        client_email: validated.clientEmail,
        client_name: validated.clientName,
        project_type: validated.projectType,
        template_id: validated.templateId ?? null,
        magic_link_token: magicLinkToken,
        status: "draft",
      })
      .select()
      .returns<{ id: string }[]>()
      .single();

    if (error) {
      console.error("Create project error:", error);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }

    // Send onboarding email to client with magic link
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, business_name")
      .eq("id", user.id)
      .single();

    const designerName =
      profile?.full_name ?? profile?.business_name ?? "Your Designer";
    const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL}/brief/t/${magicLinkToken}`;

    try {
      if (process.env.RESEND_API_KEY) {
        await sendOnboardingLink({
          clientEmail: validated.clientEmail,
          clientName: validated.clientName || validated.clientEmail,
          designerName,
          projectUrl: magicLinkUrl,
        });

        // Update status to "sent" since email was dispatched
        await supabase
          .from("projects")
          .update({ status: "sent" })
          .eq("id", project.id);
      } else {
        console.warn(
          "RESEND_API_KEY not configured — skipping onboarding email.",
          "Magic link URL:",
          magicLinkUrl
        );
      }
    } catch (emailError) {
      console.error("Failed to send onboarding email:", emailError);
      // Don't fail project creation if email fails
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error },
        { status: 400 }
      );
    }
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
