import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { BriefPDF } from "@/components/brief/brief-pdf";
import type { Database } from "@/types/supabase";
import React from "react";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export async function GET(
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

  // Fetch the project (RLS-protected)
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .returns<ProjectRow[]>()
    .single();

  if (error || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch brief
  const { data: brief } = await supabase
    .from("briefs")
    .select("content")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!brief) {
    return NextResponse.json({ error: "No brief found for this project" }, { status: 404 });
  }

  const briefContent = brief.content as Record<string, unknown>;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(
      React.createElement(BriefPDF, { briefContent: briefContent as Parameters<typeof BriefPDF>[0]["briefContent"] }) as any
    );

    const fileName = `brief-${project.client_name ?? project.client_email}-${project.project_type}.pdf`
      .replace(/[^a-zA-Z0-9.-]/g, "_");

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (pdfError) {
    console.error("PDF generation error:", pdfError);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
