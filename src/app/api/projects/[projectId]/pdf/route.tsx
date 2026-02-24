import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { BriefPDF } from "@/lib/pdf/brief-template";
import { renderToBuffer } from "@react-pdf/renderer";
import type { Database } from "@/types/supabase";

type BriefRow = Database["public"]["Tables"]["briefs"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

interface PDFRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * GET /api/projects/[projectId]/pdf
 * Authenticated designer access — generates PDF on the fly
 */
export async function GET(
  _request: NextRequest,
  context: PDFRouteContext
) {
  const { projectId } = await context.params;
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
    const buffer = await renderToBuffer(
      <BriefPDF content={briefContent as Parameters<typeof BriefPDF>[0]["content"]} />
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

/**
 * POST /api/projects/[projectId]/pdf
 * Admin access — generates PDF, caches to storage
 */
export async function POST(_request: NextRequest, context: PDFRouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = createAdminClient();

    // Fetch the brief
    const { data: brief, error: briefError } = await supabase
      .from("briefs")
      .select("*")
      .eq("project_id", projectId)
      .returns<BriefRow[]>()
      .single();

    if (briefError || !brief) {
      return NextResponse.json(
        { error: "Brief not found" },
        { status: 404 }
      );
    }

    // Check if PDF already exists
    if (brief.pdf_storage_path) {
      const { data: signedUrlData } = await supabase.storage
        .from("brief-exports")
        .createSignedUrl(brief.pdf_storage_path, 3600);

      if (signedUrlData?.signedUrl) {
        return NextResponse.json({
          url: signedUrlData.signedUrl,
          cached: true,
        });
      }
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <BriefPDF content={brief.content as never} />
    );

    // Try to upload to Supabase Storage, but fall back to direct response
    const fileName = `brief-v${brief.version}.pdf`;
    const storagePath = `${projectId}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("brief-exports")
        .upload(storagePath, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (!uploadError) {
        await supabase
          .from("briefs")
          .update({ pdf_storage_path: storagePath })
          .eq("id", brief.id);

        const { data: signedUrlData } = await supabase.storage
          .from("brief-exports")
          .createSignedUrl(storagePath, 3600);

        if (signedUrlData?.signedUrl) {
          return NextResponse.json({
            url: signedUrlData.signedUrl,
            cached: false,
          });
        }
      }

      console.warn("Storage upload failed, returning PDF directly:", uploadError);
    } catch (storageError) {
      console.warn("Storage unavailable, returning PDF directly:", storageError);
    }

    // Fallback: return the PDF directly
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
