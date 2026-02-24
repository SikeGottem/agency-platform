import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { sendNotification } from "@/lib/email-notifications";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { projectId } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("messages")
    .select("id, sender_type, sender_id, content, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { projectId } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { content, senderType } = body;

  if (!content?.trim() || !["client", "designer"].includes(senderType)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("messages")
    .insert({
      project_id: projectId,
      sender_type: senderType,
      sender_id: user.id,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send email notification to the other party (fire-and-forget)
  try {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: project } = await (admin as any)
      .from("projects")
      .select("*, profiles:designer_id(email, full_name)")
      .eq("id", projectId)
      .single();

    if (project?.client_email) {
      const designerProfile = project.profiles as {
        email: string;
        full_name: string | null;
      } | null;

      sendNotification({
        type: "new_message",
        projectId,
        projectType: project.project_type,
        clientName: project.client_name ?? project.client_email,
        clientEmail: project.client_email,
        designerName: designerProfile?.full_name ?? "Your Designer",
        designerEmail: designerProfile?.email ?? "",
        magicLinkToken: project.magic_link_token ?? undefined,
        senderType: senderType as "designer" | "client",
        senderName:
          senderType === "designer"
            ? (designerProfile?.full_name ?? "Your Designer")
            : (project.client_name ?? project.client_email),
        messageContent: content.trim(),
      }).catch(() => {});
    }
  } catch (notifError) {
    console.error("[messages] Email notification failed:", notifError);
  }

  return NextResponse.json(data, { status: 201 });
}
