import { createClient } from "@/lib/supabase/server";
import { sendOnboardingLink } from "@/lib/email";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import type { Database } from "@/types/supabase";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectWithDesigner = ProjectRow & {
  profiles: { full_name: string | null } | null;
};

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const supabase = await createClient();

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 3 resends per minute per user
  if (!rateLimit(`resend:${user.id}`, 3, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  // Fetch the project (RLS ensures it belongs to this designer)
  const { data: project, error } = await supabase
    .from("projects")
    .select("*, profiles!projects_designer_id_fkey(full_name)")
    .eq("id", projectId)
    .returns<ProjectWithDesigner[]>()
    .single();

  if (error || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const clientUrl = `${process.env.NEXT_PUBLIC_APP_URL}/brief/${project.id}?token=${project.magic_link_token}`;

  const designerProfile = project.profiles as unknown as { full_name: string | null } | null;

  try {
    await sendOnboardingLink({
      clientEmail: project.client_email,
      clientName: project.client_name ?? "there",
      designerName: designerProfile?.full_name ?? "Your designer",
      projectUrl: clientUrl,
    });

    return NextResponse.json({ success: true });
  } catch (emailError) {
    console.error("Resend link email error:", emailError);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
