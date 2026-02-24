import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

/**
 * GET /api/projects/[projectId]/files/download
 * Returns a ZIP of all final deliverable files for the project.
 */
export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { projectId } = await ctx.params;
    const admin = createAdminClient();

    // Verify project exists
    const { data: project } = await admin
      .from("projects")
      .select("id, project_type, client_name, status")
      .eq("id", projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get final deliverables
    const { data: deliverables } = await admin
      .from("deliverables")
      .select("*")
      .eq("project_id", projectId)
      .eq("status", "final")
      .order("created_at", { ascending: true });

    if (!deliverables || deliverables.length === 0) {
      return NextResponse.json({ error: "No final deliverables found" }, { status: 404 });
    }

    const zip = new JSZip();

    // Download each file and add to zip
    for (const deliverable of deliverables) {
      if (!deliverable.file_url) continue;

      try {
        // If it's a Supabase storage URL, download via storage API
        if (deliverable.file_url.includes("supabase")) {
          const storagePath = deliverable.file_url.split("/object/public/")[1] ||
            deliverable.file_url.split("/object/sign/")[1]?.split("?")[0];

          if (storagePath) {
            const [bucket, ...pathParts] = storagePath.split("/");
            const { data } = await admin.storage
              .from(bucket)
              .download(pathParts.join("/"));

            if (data) {
              const arrayBuffer = await data.arrayBuffer();
              const ext = deliverable.file_type ? `.${deliverable.file_type}` : "";
              const filename = `${deliverable.title}${ext}`;
              zip.file(filename, arrayBuffer);
              continue;
            }
          }
        }

        // Fallback: fetch from URL directly
        const response = await fetch(deliverable.file_url);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const ext = deliverable.file_type ? `.${deliverable.file_type}` : "";
          const filename = `${deliverable.title}${ext}`;
          zip.file(filename, arrayBuffer);
        }
      } catch (err) {
        console.error(`Failed to download file for deliverable ${deliverable.id}:`, err);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });
    const projectName = (project.project_type || "project").replace(/\s+/g, "-").toLowerCase();
    const clientName = (project.client_name || "client").replace(/\s+/g, "-").toLowerCase();

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${projectName}-${clientName}-final.zip"`,
      },
    });
  } catch (error) {
    console.error("Download ZIP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
