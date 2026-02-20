import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { BriefPDF } from "@/lib/pdf/brief-template";
import { renderToBuffer } from "@react-pdf/renderer";
import type { Database } from "@/types/supabase";

type BriefRow = Database["public"]["Tables"]["briefs"]["Row"];

interface PDFRouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * Generate PDF for a completed brief
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
        .createSignedUrl(brief.pdf_storage_path, 3600); // 1 hour expiry

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
        // Update brief with PDF path
        await supabase
          .from("briefs")
          .update({ pdf_storage_path: storagePath })
          .eq("id", brief.id);

        // Generate signed URL
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

    // Fallback: return the PDF directly as a binary response
    return new NextResponse(pdfBuffer, {
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
